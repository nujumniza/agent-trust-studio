import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SectionLabel } from "@/components/site-chrome";
import { formatDate, loadRuns, type EvalRun } from "@/lib/trustai";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Evaluation history — TRUST-AI" },
      {
        name: "description",
        content:
          "Every TRUST-AI evaluation run recorded in this browser, with task set, agent, overall index and date.",
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

function HistoryPage() {
  const [runs, setRuns] = useState<EvalRun[]>([]);
  useEffect(() => {
    setRuns(loadRuns());
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 pb-4 pt-10">
      <SectionLabel>(d) Run history</SectionLabel>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Recorded runs</h1>
      <p className="mt-2 max-w-[60ch] text-sm text-muted">
        History is stored locally in this browser only. Clearing site data removes it.
      </p>

      <div className="glass animate-rise mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
              <th className="px-4 py-3 font-medium">Run</th>
              <th className="px-4 py-3 font-medium">Task set</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium text-right">Temp</th>
              <th className="px-4 py-3 font-medium text-right">Overall</th>
              <th className="px-4 py-3 font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {runs.map((run) => (
              <tr key={run.id} className="transition-colors hover:bg-surface/60">
                <td className="px-4 py-3 font-mono text-xs text-primary">
                  <Link to="/dashboard/$runId" params={{ runId: run.id }} className="hover:underline">
                    {run.id}
                  </Link>
                </td>
                <td className="px-4 py-3">{run.taskSetName}</td>
                <td className="px-4 py-3 font-mono text-xs">{run.config.model}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-muted">
                  {run.config.temperature.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs">{run.overall.toFixed(1)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-muted">
                  {formatDate(run.createdAt)}
                </td>
              </tr>
            ))}
            {runs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center font-mono text-xs text-muted">
                  No runs recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
