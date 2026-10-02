import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Disclaimer, Panel, SectionLabel } from "@/components/site-chrome";
import { startEvaluation } from "@/lib/real-eval/eval.functions";
import { getOwnerKey } from "@/lib/real-eval/owner-key";
import {
  DEFAULT_REAL_CONFIG,
  REAL_AGENT_MODEL,
  REAL_SCENARIO,
  REAL_SCENARIOS,
  type RealAgentConfig,
} from "@/lib/real-eval/types";
import {
  DEFAULT_CONFIG,
  MODELS,
  TASK_SETS,
  runEvaluation,
  saveRun,
  type AgentConfig,
} from "@/lib/trustai";

export const Route = createFileRoute("/run")({
  head: () => ({
    meta: [
      { title: "Run an evaluation — TRUST-AI" },
      {
        name: "description",
        content:
          "Configure a task and agent settings, then run an experimental TRUST-AI evaluation in demo or real mode across eight behavioural dimensions.",
      },
      { property: "og:title", content: "Run an evaluation — TRUST-AI" },
      {
        property: "og:description",
        content:
          "Run a simulated demo evaluation or a real model against deterministic mock tools, and inspect the recorded trace.",
      },
    ],
  }),
  component: RunPage,
});

const inputCls = "mt-1 w-full rounded-md border border-border bg-surface/70 px-3 py-2 text-sm";
const labelCls = "font-mono text-[11px] text-muted";

function RunPage() {
  const navigate = useNavigate();
  const start = useServerFn(startEvaluation);
  const [mode, setMode] = useState<"demo" | "real">("demo");
  const [taskSetId, setTaskSetId] = useState(TASK_SETS[0]!.id);
  const [prompt, setPrompt] = useState(
    "Resolve a damaged-item refund and re-ship the replacement.",
  );
  const [scenarioId, setScenarioId] = useState(REAL_SCENARIO.id);
  const [realPrompt, setRealPrompt] = useState(REAL_SCENARIO.defaultPrompt);
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG);
  const [realConfig, setRealConfig] = useState<RealAgentConfig>(DEFAULT_REAL_CONFIG);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof AgentConfig>(k: K, v: AgentConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v }));
  const setR = <K extends keyof RealAgentConfig>(k: K, v: RealAgentConfig[K]) =>
    setRealConfig((c) => ({ ...c, [k]: v }));

  async function launch() {
    setError(null);
    if (mode === "demo") {
      setBusy(true);
      const run = runEvaluation({ taskSetId, taskPrompt: prompt, config });
      saveRun(run);
      window.setTimeout(() => {
        navigate({ to: "/dashboard/$runId", params: { runId: run.id } });
      }, 600);
      return;
    }
    const text = realPrompt.trim();
    if (text.length < 10 || text.length > 1000) {
      setError("Task instruction must be between 10 and 1000 characters.");
      return;
    }
    setBusy(true);
    try {
      const res = await start({ data: { ownerKey: getOwnerKey(), scenarioId, taskPrompt: text, config: realConfig } });
      navigate({ to: "/dashboard/$runId", params: { runId: res.id } });
    } catch (e) {
      const msg = (e as Error).message ?? "";
      setError(
        msg.startsWith("[") || msg.includes("Task must")
          ? "Invalid task input — check the instruction and settings."
          : msg || "The evaluation could not be started. Please try again.",
      );
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 pb-4 pt-10">
      <SectionLabel>(c) Run configuration</SectionLabel>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Configure a run</h1>

      <div className="mt-4 inline-flex rounded-md border border-border p-0.5 font-mono text-xs">
        {(["demo", "real"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null); }}
            className={`rounded px-3 py-1.5 transition-colors ${mode === m ? "bg-foreground text-background" : "text-muted hover:text-foreground"}`}
          >
            {m === "demo" ? "Demo / simulation" : "Real evaluation"}
          </button>
        ))}
      </div>

      <p className="mt-3 max-w-[70ch] text-pretty text-sm text-muted">
        {mode === "demo"
          ? "Demo runs use a deterministic synthetic scoring model inside your browser. No agent is contacted and nothing leaves your browser."
          : "Real runs send your task to a live model on the server, which acts against deterministic mock tools. Every step is recorded and scored from the trace. Takes up to two minutes."}
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-7">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            {mode === "demo" ? "Synthetic task set" : "Evaluation scenario"}
          </span>
          {mode === "demo" ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {TASK_SETS.map((t) => (
                <label
                  key={t.id}
                  className={`cursor-pointer rounded-md border px-3 py-2.5 transition-colors ${
                    taskSetId === t.id ? "border-primary/40 bg-primary-soft/40" : "border-border hover:bg-surface"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <input type="radio" name="task" className="accent-primary" checked={taskSetId === t.id} onChange={() => setTaskSetId(t.id)} />
                    <span className="text-sm">{t.name} · {t.taskCount} tasks</span>
                  </span>
                  <span className="mt-1.5 block pl-6 text-xs leading-relaxed text-muted">{t.description}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {REAL_SCENARIOS.map((t) => (
                <label
                  key={t.id}
                  className={`cursor-pointer rounded-md border px-3 py-2.5 transition-colors ${
                    scenarioId === t.id ? "border-primary/40 bg-primary-soft/40" : "border-border hover:bg-surface"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <input type="radio" name="scenario" className="accent-primary" checked={scenarioId === t.id} onChange={() => { setScenarioId(t.id); setRealPrompt(t.defaultPrompt); }} />
                    <span className="text-sm">{t.name}</span>
                  </span>
                  <span className="mt-1.5 block pl-6 text-xs leading-relaxed text-muted">{t.description}</span>
                </label>
              ))}
            </div>
          )}

          <div className="mt-5 border-t border-border pt-5">
            <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">Task instruction</label>
            <textarea
              rows={3}
              maxLength={1000}
              value={mode === "demo" ? prompt : realPrompt}
              onChange={(e) => (mode === "demo" ? setPrompt(e.target.value) : setRealPrompt(e.target.value))}
              className="mt-2 w-full rounded-md border border-border bg-surface/70 px-3 py-2 text-sm"
            />
            <p className="mt-1.5 font-mono text-[10px] text-faint">
              Use synthetic scenarios only — no real customer, payment or personal data.
            </p>
          </div>
        </Panel>

        <Panel className="lg:col-span-5" delay={120}>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">Agent configuration</span>
          {mode === "demo" ? (
            <div className="mt-3 space-y-3">
              <div>
                <label className={labelCls}>Model (simulated label)</label>
                <select value={config.model} onChange={(e) => set("model", e.target.value)} className={inputCls}>
                  {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Temperature</label>
                  <input type="number" step="0.1" min="0" max="1" value={config.temperature} onChange={(e) => set("temperature", Number(e.target.value))} className={`${inputCls} font-mono`} />
                </div>
                <div>
                  <label className={labelCls}>Max turns</label>
                  <input type="number" min="4" max="60" value={config.maxTurns} onChange={(e) => set("maxTurns", Number(e.target.value))} className={`${inputCls} font-mono`} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Retries allowed per fault</label>
                <input type="number" min="0" max="5" value={config.retriesAllowed} onChange={(e) => set("retriesAllowed", Number(e.target.value))} className={`${inputCls} font-mono`} />
              </div>
              <Check label="Tool access enabled" checked={config.toolsEnabled} onChange={(v) => set("toolsEnabled", v)} />
              <Check label="Human escalation available" checked={config.escalationAllowed} onChange={(v) => set("escalationAllowed", v)} />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <div>
                <label className={labelCls}>Model</label>
                <input readOnly value={`${REAL_AGENT_MODEL} (via Lovable AI)`} className={`${inputCls} font-mono text-muted`} />
              </div>
              <div>
                <label className={labelCls}>Max turns (2–12)</label>
                <input type="number" min="2" max="12" value={realConfig.maxTurns} onChange={(e) => setR("maxTurns", Math.max(2, Math.min(12, Number(e.target.value) || 2)))} className={`${inputCls} font-mono`} />
              </div>
              <Check label="Tool access enabled" checked={realConfig.toolsEnabled} onChange={(v) => setR("toolsEnabled", v)} />
              <Check label="Human escalation available" checked={realConfig.escalationAllowed} onChange={(v) => setR("escalationAllowed", v)} />
              <Check label="Inject a fault (first inventory call fails)" checked={realConfig.faultInjection} onChange={(v) => setR("faultInjection", v)} />
            </div>
          )}
          {error && (
            <p className="mt-3 rounded-md border border-accent/40 px-3 py-2 font-mono text-[11px] text-accent">{error}</p>
          )}
          <button
            onClick={launch}
            disabled={busy}
            className="mt-3 w-full rounded-md bg-foreground px-4 py-2.5 font-mono text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? (mode === "real" ? "Agent running… this can take a minute" : "Running evaluation…") : mode === "real" ? "Launch real run" : "Launch demo run"}
          </button>
        </Panel>
      </div>

      <Disclaimer className="mt-8" />
    </main>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2.5 text-sm">
      <input type="checkbox" className="accent-primary" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
