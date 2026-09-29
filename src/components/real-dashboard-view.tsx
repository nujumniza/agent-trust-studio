import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Panel, SectionLabel } from "@/components/site-chrome";
import { submitRealFeedback } from "@/lib/real-eval/eval.functions";
import { getOwnerKey } from "@/lib/real-eval/owner-key";
import type { RealRun, TraceEvent } from "@/lib/real-eval/types";
import { DIMENSIONS, formatDate, type DimensionId } from "@/lib/trustai";

const short = (v: unknown) => {
  if (v === null || v === undefined) return "";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > 220 ? s.slice(0, 220) + "…" : s;
};

export function ModeBadge({ real }: { real: boolean }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
        real ? "border-primary/40 bg-primary-soft/50 text-primary" : "border-border text-muted"
      }`}
    >
      {real ? "Real" : "Demo"}
    </span>
  );
}

export function RealDashboardView({ run }: { run: RealRun }) {
  const byDim = new Map(run.results.map((r) => [r.dimension, r]));
  const ok = run.status === "completed";

  return (
    <main className="mx-auto max-w-7xl px-6 pb-4 pt-10">
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>(b) Results dashboard</SectionLabel>
            <h1 className="flex items-center gap-3 font-display text-2xl font-semibold tracking-tight">
              Eight dimensions, one trace <ModeBadge real />
            </h1>
          </div>
          <span className="font-mono text-[11px] text-muted">
            agent: {run.agentName} · status: {run.status} · {formatDate(run.createdAt)}
          </span>
        </div>

        {!ok && (
          <Panel className="mb-5 border-accent/40">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent">
              Run {run.status}
            </p>
            <p className="mt-2 text-sm">{run.error ?? "The run did not complete."}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              No scores were generated. The partial trace below is shown as recorded.
            </p>
          </Panel>
        )}

        <div className="grid gap-5 lg:grid-cols-12">
          <Panel className="lg:col-span-7">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
                Overall trust index
              </span>
              <span className="font-mono text-[11px] text-primary">{run.id.slice(0, 8)}</span>
            </div>
            <div className="flex items-end gap-6">
              <div>
                <div className="font-display text-5xl font-bold leading-none tracking-tight">
                  {run.overall === null ? "—" : run.overall.toFixed(1)}
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted">
                  WEIGHTED / 100 · evaluated dimensions only
                </div>
              </div>
              <div className="flex-1 pb-1">
                <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className="animate-grow h-full origin-left rounded-full bg-primary"
                    style={{ width: `${run.overall ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted">
              task: {run.taskPrompt}
            </p>
            {run.finalAnswer && (
              <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted">
                final answer: {run.finalAnswer}
              </p>
            )}
            <div className="mt-5 space-y-3 border-t border-border pt-5">
              {DIMENSIONS.map((dim) => {
                const r = byDim.get(dim.id);
                const s = r?.score ?? null;
                return (
                  <div key={dim.id} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 font-mono text-xs">{dim.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/10">
                      {s !== null && (
                        <div
                          className="animate-grow h-full origin-left rounded-full bg-primary"
                          style={{ width: `${s * 100}%` }}
                        />
                      )}
                    </div>
                    <span className="w-12 text-right font-mono text-xs text-muted">
                      {s === null ? "n/e" : s.toFixed(2)}
                    </span>
                  </div>
                );
              })}
              <p className="font-mono text-[10px] text-faint">n/e = not evaluated from available evidence</p>
            </div>
          </Panel>

          <Panel className="lg:col-span-5" delay={160}>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
                Evidence / trace
              </span>
              <span className="font-mono text-[11px] text-faint">{run.trace.length} events</span>
            </div>
            <div className="space-y-2">
              {DIMENSIONS.map((dim, i) => {
                const r = byDim.get(dim.id);
                if (!r) return null;
                return (
                  <details key={dim.id} className="group rounded-lg border border-border bg-surface/50" open={i === 0}>
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5">
                      <span className="flex-1 text-xs">{dim.label}</span>
                      <span className="font-mono text-[11px] text-muted">
                        {r.score === null ? "n/e" : r.score.toFixed(2)}
                      </span>
                      <span className="font-mono text-[10px] text-faint transition-transform group-open:rotate-90">&gt;</span>
                    </summary>
                    <div className="border-t border-border px-3 pb-3 pt-2">
                      <p className="font-mono text-[11px] leading-relaxed text-muted">{r.reasoning}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {r.evidence.map((n) => (
                          <a key={n} href={`#ev-${n}`} className="rounded bg-foreground/5 px-2 py-0.5 font-mono text-[10px] text-primary">
                            event #{n}
                          </a>
                        ))}
                      </div>
                    </div>
                  </details>
                );
              })}
              {run.results.length === 0 && (
                <p className="font-mono text-xs text-muted">No evaluation results for this run.</p>
              )}
            </div>
          </Panel>
        </div>
      </section>

      <section className="pt-8">
        <Panel>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            Recorded trace events
          </span>
          <ol className="mt-3 divide-y divide-border">
            {run.trace.map((e) => (
              <TraceRow key={e.seq} e={e} />
            ))}
          </ol>
        </Panel>
      </section>

      <section className="py-10">
        <RealFeedbackForm runId={run.id} />
      </section>

      <p className="pb-6 font-mono text-[11px] text-faint">
        Real run: a live model acted against deterministic mock tools; scores are rule-based
        and derived only from the recorded trace. Experimental, not validated.{" "}
        <Link to="/methodology" className="text-primary hover:underline">How scoring works</Link>
      </p>
    </main>
  );
}

function TraceRow({ e }: { e: TraceEvent }) {
  const summary = (e.metadata["summary"] as string | undefined) ?? "";
  return (
    <li id={`ev-${e.seq}`} className="grid gap-1 py-2 font-mono text-[11px] sm:grid-cols-[3rem_9rem_1fr]">
      <span className="text-primary">#{e.seq}</span>
      <span className={e.type === "tool_error" || e.type === "run_error" ? "text-accent" : "text-foreground"}>
        {e.type}
        {e.toolName ? ` · ${e.toolName}` : ""}
      </span>
      <span className="break-all text-muted">
        {summary || short(e.input) || short(e.output)}
        {summary && e.output ? ` → ${short(e.output)}` : ""}
        {e.metadata["injected_fault"] ? " [injected fault]" : ""}
      </span>
    </li>
  );
}

function RealFeedbackForm({ runId }: { runId: string }) {
  const submit = useServerFn(submitRealFeedback);
  const [dimension, setDimension] = useState<DimensionId>("recovery");
  const [type, setType] = useState<"too_low" | "too_high" | "wrong_evidence" | "agree">("too_low");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | string>("idle");

  return (
    <Panel className="p-6">
      <SectionLabel>(e) Feedback</SectionLabel>
      <h2 className="mb-1 font-display text-2xl font-semibold tracking-tight">Report a scoring discrepancy</h2>
      <p className="mb-4 font-mono text-[11px] text-faint">
        Saved with this run. Please do not include personal or confidential information.
      </p>
      {state === "sent" ? (
        <div className="rounded-md border border-primary/30 bg-primary-soft/40 px-4 py-3 font-mono text-xs">
          Feedback recorded.{" "}
          <button onClick={() => { setState("idle"); setNote(""); }} className="ml-3 text-primary hover:underline">
            Submit another
          </button>
        </div>
      ) : (
        <form
          onSubmit={async (ev) => {
            ev.preventDefault();
            setState("busy");
            try {
              await submit({ data: { ownerKey: getOwnerKey(), runId, dimension, feedbackType: type, comment: note } });
              setState("sent");
            } catch (e) {
              setState((e as Error).message || "Could not save feedback.");
            }
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="font-mono text-[11px] text-muted">Dimension</label>
              <select value={dimension} onChange={(e) => setDimension(e.target.value as DimensionId)} className="mt-1 w-full rounded-md border border-border bg-surface/70 px-3 py-2 text-sm">
                {DIMENSIONS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-[11px] text-muted">Your assessment</label>
              <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="mt-1 w-full rounded-md border border-border bg-surface/70 px-3 py-2 text-sm">
                <option value="too_low">Score is too low</option>
                <option value="too_high">Score is too high</option>
                <option value="wrong_evidence">Evidence does not support the score</option>
                <option value="agree">Agree, adding context</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="font-mono text-[11px] text-muted">Note</label>
              <textarea rows={3} required maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-surface/70 px-3 py-2 text-sm" />
            </div>
          </div>
          {state !== "idle" && state !== "busy" && (
            <p className="mt-2 font-mono text-[11px] text-accent">{state}</p>
          )}
          <button type="submit" disabled={state === "busy"} className="mt-4 rounded-md border border-border-strong px-4 py-2.5 font-mono text-sm transition-colors hover:bg-surface disabled:opacity-60">
            {state === "busy" ? "Saving…" : "Submit feedback"}
          </button>
        </form>
      )}
    </Panel>
  );
}
