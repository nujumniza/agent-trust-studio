import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Disclaimer, Panel, SectionLabel } from "@/components/site-chrome";
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
          "Configure a synthetic task set and agent settings, then run an experimental TRUST-AI evaluation across eight behavioural dimensions.",
      },
      { property: "og:title", content: "Run an evaluation — TRUST-AI" },
      {
        property: "og:description",
        content:
          "Pick a synthetic task set, set model, temperature, turn budget and tool access, and launch an experimental evaluation run.",
      },
    ],
  }),
  component: RunPage,
});

function RunPage() {
  const navigate = useNavigate();
  const [taskSetId, setTaskSetId] = useState(TASK_SETS[0].id);
  const [prompt, setPrompt] = useState(
    "Resolve a damaged-item refund and re-ship the replacement.",
  );
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof AgentConfig>(k: K, v: AgentConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v }));

  function launch() {
    setBusy(true);
    const run = runEvaluation({ taskSetId, taskPrompt: prompt, config });
    saveRun(run);
    window.setTimeout(() => {
      navigate({ to: "/dashboard/$runId", params: { runId: run.id } });
    }, 600);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 pb-4 pt-10">
      <SectionLabel>(c) Run configuration</SectionLabel>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Configure a run</h1>
      <p className="mt-2 max-w-[60ch] text-pretty text-sm text-muted">
        Runs execute against a synthetic task suite held inside TRUST-AI. No external agent is
        contacted and no data you enter leaves your browser.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-7">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            Synthetic task set
          </span>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {TASK_SETS.map((t) => (
              <label
                key={t.id}
                className={`cursor-pointer rounded-md border px-3 py-2.5 transition-colors ${
                  taskSetId === t.id
                    ? "border-primary/40 bg-primary-soft/40"
                    : "border-border hover:bg-surface"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="task"
                    className="accent-primary"
                    checked={taskSetId === t.id}
                    onChange={() => setTaskSetId(t.id)}
                  />
                  <span className="text-sm">
                    {t.name} · {t.taskCount} tasks
                  </span>
                </span>
                <span className="mt-1.5 block pl-6 text-xs leading-relaxed text-muted">
                  {t.description}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
              Task instruction
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-2 w-full rounded-md border border-border bg-surface/70 px-3 py-2 text-sm"
            />
            <p className="mt-1.5 font-mono text-[10px] text-faint">
              Use synthetic scenarios only — no real customer, payment or personal data.
            </p>
          </div>
        </Panel>

        <Panel className="lg:col-span-5" delay={120}>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            Agent configuration
          </span>
          <div className="mt-3 space-y-3">
            <div>
              <label className="font-mono text-[11px] text-muted">Model</label>
              <select
                value={config.model}
                onChange={(e) => set("model", e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-surface/70 px-3 py-2 text-sm"
              >
                {MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[11px] text-muted">Temperature</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={config.temperature}
                  onChange={(e) => set("temperature", Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-border bg-surface/70 px-3 py-2 font-mono text-sm"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] text-muted">Max turns</label>
                <input
                  type="number"
                  min="4"
                  max="60"
                  value={config.maxTurns}
                  onChange={(e) => set("maxTurns", Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-border bg-surface/70 px-3 py-2 font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="font-mono text-[11px] text-muted">Retries allowed per fault</label>
              <input
                type="number"
                min="0"
                max="5"
                value={config.retriesAllowed}
                onChange={(e) => set("retriesAllowed", Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-border bg-surface/70 px-3 py-2 font-mono text-sm"
              />
            </div>
            <label className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                className="accent-primary"
                checked={config.toolsEnabled}
                onChange={(e) => set("toolsEnabled", e.target.checked)}
              />
              Tool access enabled
            </label>
            <label className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                className="accent-primary"
                checked={config.escalationAllowed}
                onChange={(e) => set("escalationAllowed", e.target.checked)}
              />
              Human escalation available
            </label>
            <button
              onClick={launch}
              disabled={busy}
              className="w-full rounded-md bg-foreground px-4 py-2.5 font-mono text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Running evaluation…" : "Launch run"}
            </button>
          </div>
        </Panel>
      </div>

      <Disclaimer className="mt-8" />
    </main>
  );
}
