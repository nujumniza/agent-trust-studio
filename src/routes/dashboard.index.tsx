import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { DashboardView } from "@/components/dashboard-view";
import { Panel } from "@/components/site-chrome";
import { loadRuns, type EvalRun } from "@/lib/trustai";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Evaluation dashboard — TRUST-AI" },
      {
        name: "description",
        content:
          "Latest TRUST-AI evaluation: overall trust index, eight dimension scores and the evidence trace behind each one.",
      },
      { property: "og:title", content: "Evaluation dashboard — TRUST-AI" },
      {
        property: "og:description",
        content:
          "Overall trust index, eight dimension scores and the evidence trace behind each score.",
      },
    ],
  }),
  component: DashboardIndex,
});

function DashboardIndex() {
  const [run, setRun] = useState<EvalRun | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRun(loadRuns()[0] ?? null);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <p className="font-mono text-xs text-muted">Loading run…</p>
      </main>
    );
  }

  if (!run) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <Panel>
          <p className="text-sm text-muted">No evaluation runs yet.</p>
          <Link to="/run" className="mt-3 inline-block font-mono text-xs text-primary hover:underline">
            Configure your first run →
          </Link>
        </Panel>
      </main>
    );
  }

  return <DashboardView run={run} />;
}
