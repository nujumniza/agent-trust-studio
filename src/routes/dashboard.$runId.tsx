import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { DashboardView } from "@/components/dashboard-view";
import { Panel } from "@/components/site-chrome";
import { getRun, type EvalRun } from "@/lib/trustai";

export const Route = createFileRoute("/dashboard/$runId")({
  head: () => ({
    meta: [
      { title: "Run results — TRUST-AI" },
      {
        name: "description",
        content:
          "Full TRUST-AI results for a single evaluation run: dimension scores and the evidence spans that justify each one.",
      },
      { property: "og:title", content: "Run results — TRUST-AI" },
      {
        property: "og:description",
        content: "Dimension scores and the evidence spans that justify each one.",
      },
    ],
  }),
  component: RunDashboard,
});

function RunDashboard() {
  const { runId } = useParams({ from: "/dashboard/$runId" });
  const [run, setRun] = useState<EvalRun | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRun(getRun(runId) ?? null);
    setReady(true);
  }, [runId]);

  if (!ready) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <p className="font-mono text-xs text-muted">Loading {runId}…</p>
      </main>
    );
  }

  if (!run) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <Panel>
          <p className="text-sm text-muted">No run stored with ID {runId} in this browser.</p>
          <Link
            to="/history"
            className="mt-3 inline-block font-mono text-xs text-primary hover:underline"
          >
            Back to history →
          </Link>
        </Panel>
      </main>
    );
  }

  return <DashboardView run={run} />;
}
