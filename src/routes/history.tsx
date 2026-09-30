import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { ModeBadge } from "@/components/real-dashboard-view";
import { SectionLabel } from "@/components/site-chrome";
import { listRealRuns } from "@/lib/real-eval/eval.functions";
import { getOwnerKey } from "@/lib/real-eval/owner-key";
import type { RealRunSummary } from "@/lib/real-eval/types";
import { formatDate, loadRuns, type EvalRun } from "@/lib/trustai";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Evaluation history — TRUST-AI" },
      {
        name: "description",
        content:
          "Real and demo TRUST-AI evaluation runs, with scenario, agent, status, overall index and date.",
      },
      { property: "og:title", content: "Evaluation history — TRUST-AI" },
      {
        property: "og:description",
        content: "Past experimental evaluation runs with task set, agent, overall index and date.",
      },
    ],
  }),
  component: HistoryPage,
});

const th = "px-4 py-3 font-medium";

function HistoryPage() {
  const fetchReal = useServerFn(listRealRuns);
  const [runs, setRuns] = useState<EvalRun[]>([]);
  const [real, setReal] = useState<RealRunSummary[] | null>(null);
  const [realError, setRealError] = useState<string | null>(null);

  useEffect(() => {
    setRuns(loadRuns());
    fetchReal({ data: { ownerKey: getOwnerKey() } })
      .then(setReal)
      .catch((e) => setRealError((e as Error).message || "Backend unavailable."));
  }, [fetchReal]);

  return (
    <main className="mx-auto max-w-7xl px-6 pb-4 pt-10">
      <SectionLabel>(d) Run history</SectionLabel>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Recorded runs</h1>

      <h2 className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
        Real evaluations <ModeBadge real />
      </h2>
      <p className="mt-1 text-sm text-muted">Stored on the server; visible only to this browser.</p>
      <div className="glass animate-rise mt-3 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
              <th className={th}>Run</th>
              <th className={th}>Scenario</th>
              <th className={th}>Agent</th>
              <th className={th}>Status</th>
              <th className={`${th} text-right`}>Overall</th>
              <th className={`${th} text-right`}>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(real ?? []).map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-surface/60">
                <td className="px-4 py-3 font-mono text-xs text-primary">
                  <Link to="/dashboard/$runId" params={{ runId: r.id }} className="hover:underline">{r.id.slice(0, 8)}</Link>
                </td>
                <td className="px-4 py-3">{r.taskName}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.agentName}</td>
                <td className={`px-4 py-3 font-mono text-xs ${r.status === "completed" ? "text-muted" : "text-accent"}`}>{r.status}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{r.overall === null ? "—" : r.overall.toFixed(1)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-muted">{formatDate(r.createdAt)}</td>
              </tr>
            ))}
            {(real === null || real.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center font-mono text-xs text-muted">
                  {realError ? `Could not load real runs: ${realError}` : real === null ? "Loading…" : "No real runs yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
        Demo runs <ModeBadge real={false} />
      </h2>
      <p className="mt-1 text-sm text-muted">
        Simulated; stored locally in this browser only. Clearing site data removes them.
      </p>
      <div className="glass animate-rise mt-3 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
              <th className={th}>Run</th>
              <th className={th}>Task set</th>
              <th className={th}>Agent</th>
              <th className={`${th} text-right`}>Temp</th>
              <th className={`${th} text-right`}>Overall</th>
              <th className={`${th} text-right`}>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {runs.map((run) => (
              <tr key={run.id} className="transition-colors hover:bg-surface/60">
                <td className="px-4 py-3 font-mono text-xs text-primary">
                  <Link to="/dashboard/$runId" params={{ runId: run.id }} className="hover:underline">{run.id}</Link>
                </td>
                <td className="px-4 py-3">{run.taskSetName}</td>
                <td className="px-4 py-3 font-mono text-xs">{run.config.model}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-muted">{run.config.temperature.toFixed(1)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{run.overall.toFixed(1)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-muted">{formatDate(run.createdAt)}</td>
              </tr>
            ))}
            {runs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center font-mono text-xs text-muted">No demo runs recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
