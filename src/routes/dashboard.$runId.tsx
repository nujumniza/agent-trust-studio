import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { DashboardView } from "@/components/dashboard-view";
import { RealDashboardView } from "@/components/real-dashboard-view";
import { Panel } from "@/components/site-chrome";
import { getRealRun } from "@/lib/real-eval/eval.functions";
import { getOwnerKey } from "@/lib/real-eval/owner-key";
import { isRealRunId, type RealRun } from "@/lib/real-eval/types";
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
  const fetchReal = useServerFn(getRealRun);
  const [run, setRun] = useState<EvalRun | null>(null);
  const [real, setReal] = useState<RealRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    setError(null);
    if (isRealRunId(runId)) {
      fetchReal({ data: { ownerKey: getOwnerKey(), id: runId } })
        .then((r) => setReal(r ? (JSON.parse(r.json) as RealRun) : null))
        .catch((e) => setError((e as Error).message || "Could not load run."))
        .finally(() => setReady(true));
    } else {
      setRun(getRun(runId) ?? null);
      setReady(true);
    }
  }, [runId, fetchReal]);

  if (!ready) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <p className="font-mono text-xs text-muted">Loading {runId}…</p>
      </main>
    );
  }

  if (real) return <RealDashboardView run={real} />;
  if (run) return <DashboardView run={run} />;

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <Panel>
        <p className="text-sm text-muted">
          {error ?? `No run with ID ${runId} is available to this browser.`}
        </p>
        <Link to="/history" className="mt-3 inline-block font-mono text-xs text-primary hover:underline">
          Back to history →
        </Link>
      </Panel>
    </main>
  );
}
