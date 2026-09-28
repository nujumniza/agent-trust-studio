import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { DimensionResult, RealRun, RealRunSummary, TraceEvent } from "./types";

const ownerKey = z.string().min(32).max(128);
const RUN_TIME_BUDGET_MS = 120_000;

async function hashKey(key: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/* ------------------------------------------------------------ start + execute */

export const startEvaluation = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        ownerKey,
        taskPrompt: z.string().trim().min(10, "Task must be at least 10 characters").max(1000),
        config: z.object({
          maxTurns: z.number().int().min(2).max(12),
          toolsEnabled: z.boolean(),
          escalationAllowed: z.boolean(),
          faultInjection: z.boolean(),
        }),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ id: string; status: string; error: string | null }> => {
    const { REAL_AGENT_MODEL, REAL_SCENARIO } = await import("./types");
    const { runAgent } = await import("./agent.server");
    const { scoreTrace } = await import("./scoring.server");
    const db = await admin();
    const apiKey = process.env["LOVABLE_API_KEY"];

    // 1. create run record
    const { data: run, error: insErr } = await db
      .from("evaluation_runs")
      .insert({
        task_id: REAL_SCENARIO.id,
        task_name: REAL_SCENARIO.name,
        task_prompt: data.taskPrompt,
        agent_name: REAL_AGENT_MODEL,
        config: data.config,
        status: "running",
        owner_key_hash: await hashKey(data.ownerKey),
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (insErr || !run) {
      console.error("create run failed", insErr);
      throw new Error("Could not create the evaluation run (database error).");
    }

    const fail = async (status: "failed" | "timeout", message: string) => {
      await db
        .from("evaluation_runs")
        .update({ status, error: message, completed_at: new Date().toISOString() })
        .eq("id", run.id);
      return { id: run.id, status, error: message };
    };

    if (!apiKey) return fail("failed", "AI service is not configured on the server.");

    // 2. execute agent
    const agent = await runAgent({
      apiKey,
      taskPrompt: data.taskPrompt,
      config: data.config,
      deadlineMs: Date.now() + RUN_TIME_BUDGET_MS,
    });
    const trace = agent.trace;

    // 3. evaluation (only on a complete trace)
    let results: DimensionResult[] = [];
    let overall: number | null = null;
    const complete = !agent.error && trace.some((e) => e.type === "agent_response");
    if (complete) {
      const at = () => new Date().toISOString();
      trace.push({ seq: trace.length + 1, type: "evaluation_started", timestamp: at(), actor: "evaluator", toolName: null, input: null, output: null, metadata: {} });
      try {
        const scored = scoreTrace(trace, data.config, agent.toolValidity);
        results = scored.results;
        overall = scored.overall;
        trace.push({ seq: trace.length + 1, type: "evaluation_completed", timestamp: at(), actor: "evaluator", toolName: null, input: null, output: { overall, evaluated: results.filter((r) => r.score !== null).length }, metadata: {} });
      } catch (e) {
        console.error("scoring failed", e);
        agent.error = null;
        await persistTrace(db, run.id, trace);
        return fail("failed", "Evaluation failed while scoring the trace.");
      }
    }

    // 4. persist trace + results
    const traceErr = await persistTrace(db, run.id, trace);
    if (traceErr) return fail("failed", "Trace could not be saved (database error).");

    if (agent.error) {
      return fail(agent.error.kind === "timeout" ? "timeout" : "failed", agent.error.message);
    }
    if (!complete) return fail("failed", "Incomplete trace: the agent never produced a final response.");

    const { error: resErr } = await db.from("evaluation_results").insert(
      results.map((r) => ({
        run_id: run.id,
        dimension: r.dimension,
        score: r.score,
        status: r.status,
        reasoning: r.reasoning,
        evidence: r.evidence,
      })),
    );
    if (resErr) {
      console.error(resErr);
      return fail("failed", "Evaluation results could not be saved (database error).");
    }

    await db
      .from("evaluation_runs")
      .update({
        status: "completed",
        overall_score: overall,
        final_answer: agent.finalAnswer,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    return { id: run.id, status: "completed", error: null };
  });

async function persistTrace(
  db: Awaited<ReturnType<typeof admin>>,
  runId: string,
  trace: TraceEvent[],
) {
  if (trace.length === 0) return null;
  const { error } = await db.from("trace_events").insert(
    trace.map((e) => ({
      run_id: runId,
      sequence_number: e.seq,
      event_type: e.type,
      timestamp: e.timestamp,
      actor: e.actor,
      tool_name: e.toolName,
      input: e.input as never,
      output: e.output as never,
      metadata: e.metadata as never,
    })),
  );
  if (error) console.error("trace insert failed", error);
  return error;
}

/* ----------------------------------------------------------------- reads */

export const getRealRun = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ ownerKey, id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<RealRun | null> => {
    const db = await admin();
    const { data: run, error } = await db
      .from("evaluation_runs")
      .select("*")
      .eq("id", data.id)
      .eq("owner_key_hash", await hashKey(data.ownerKey))
      .maybeSingle();
    if (error) throw new Error("Could not load the run (database error).");
    if (!run) return null;
    const [{ data: events }, { data: results }] = await Promise.all([
      db.from("trace_events").select("*").eq("run_id", run.id).order("sequence_number"),
      db.from("evaluation_results").select("*").eq("run_id", run.id),
    ]);
    return {
      id: run.id,
      taskId: run.task_id,
      taskName: run.task_name,
      taskPrompt: run.task_prompt,
      agentName: run.agent_name,
      config: run.config as unknown as RealRun["config"],
      status: run.status as RealRun["status"],
      error: run.error,
      finalAnswer: run.final_answer,
      overall: run.overall_score === null ? null : Number(run.overall_score),
      startedAt: run.started_at,
      completedAt: run.completed_at,
      createdAt: run.created_at,
      results: (results ?? []).map((r) => ({
        dimension: r.dimension as DimensionResult["dimension"],
        score: r.score === null ? null : Number(r.score),
        status: r.status as DimensionResult["status"],
        reasoning: r.reasoning,
        evidence: (r.evidence as number[]) ?? [],
      })),
      trace: (events ?? []).map((e) => ({
        seq: e.sequence_number,
        type: e.event_type as TraceEvent["type"],
        timestamp: e.timestamp,
        actor: e.actor as TraceEvent["actor"],
        toolName: e.tool_name,
        input: e.input,
        output: e.output,
        metadata: (e.metadata as Record<string, unknown>) ?? {},
      })),
    };
  });

export const listRealRuns = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ ownerKey }).parse(d))
  .handler(async ({ data }): Promise<RealRunSummary[]> => {
    const db = await admin();
    const { data: rows, error } = await db
      .from("evaluation_runs")
      .select("id, task_name, agent_name, status, overall_score, created_at")
      .eq("owner_key_hash", await hashKey(data.ownerKey))
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error("Could not load run history (database error).");
    return (rows ?? []).map((r) => ({
      id: r.id,
      taskName: r.task_name,
      agentName: r.agent_name,
      status: r.status as RealRunSummary["status"],
      overall: r.overall_score === null ? null : Number(r.overall_score),
      createdAt: r.created_at,
    }));
  });

export const submitRealFeedback = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        ownerKey,
        runId: z.string().uuid(),
        dimension: z.string().max(40),
        feedbackType: z.enum(["too_low", "too_high", "wrong_evidence", "agree"]),
        comment: z.string().trim().min(1).max(2000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: run } = await db
      .from("evaluation_runs")
      .select("id")
      .eq("id", data.runId)
      .eq("owner_key_hash", await hashKey(data.ownerKey))
      .maybeSingle();
    if (!run) throw new Error("Run not found.");
    const { error } = await db.from("feedback").insert({
      run_id: data.runId,
      dimension: data.dimension,
      feedback_type: data.feedbackType,
      comment: data.comment,
    });
    if (error) throw new Error("Feedback could not be saved (database error).");
    return { ok: true };
  });
