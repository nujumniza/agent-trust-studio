import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { EvidenceTrace, OverallCard, ScoreMatrix } from "@/components/score-views";
import { Panel, SectionLabel } from "@/components/site-chrome";
import {
  DIMENSIONS,
  formatDate,
  saveFeedback,
  type DimensionId,
  type EvalRun,
} from "@/lib/trustai";

export function DashboardView({ run }: { run: EvalRun }) {
  return (
    <main className="mx-auto max-w-7xl px-6 pb-4 pt-10">
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>(b) Results dashboard</SectionLabel>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Eight dimensions, one trace
            </h1>
          </div>
          <span className="font-mono text-[11px] text-muted">
            agent: {run.config.model} · tasks: {run.taskCount} · seed: {run.seed} ·{" "}
            {formatDate(run.createdAt)}
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <Panel className="lg:col-span-7">
            <OverallCard run={run} />
            <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted">
              task: {run.taskPrompt}
            </p>
            <div className="mt-5 border-t border-border pt-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
                  Score matrix
                </span>
                <span className="font-mono text-[11px] text-faint">scale 0–1</span>
              </div>
              <ScoreMatrix run={run} />
            </div>
          </Panel>

          <Panel className="lg:col-span-5" delay={160}>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
                Evidence / trace
              </span>
              <span className="font-mono text-[11px] text-faint">
                {run.evidence.length} spans
              </span>
            </div>
            <EvidenceTrace run={run} />
          </Panel>
        </div>
      </section>

      <section className="py-10">
        <FeedbackForm run={run} />
      </section>

      <p className="pb-6 font-mono text-[11px] text-faint">
        Scores come from a deterministic synthetic scoring model, not from a live agent run.{" "}
        <Link to="/methodology" className="text-primary hover:underline">
          How scoring works
        </Link>
      </p>
    </main>
  );
}

function FeedbackForm({ run }: { run: EvalRun }) {
  const [dimension, setDimension] = useState<DimensionId>("recovery");
  const [agreement, setAgreement] = useState("too_low");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <Panel className="p-6">
      <SectionLabel>(e) Feedback</SectionLabel>
      <h2 className="mb-1 font-display text-2xl font-semibold tracking-tight">
        Report a scoring discrepancy
      </h2>
      <p className="mb-4 font-mono text-[11px] text-faint">
        Stored locally in this browser. Please do not include personal or confidential information.
      </p>

      {sent ? (
        <div className="rounded-md border border-primary/30 bg-primary-soft/40 px-4 py-3 font-mono text-xs text-foreground">
          Feedback recorded against {run.id}. Thank you — it will be reviewed against the trace.
          <button
            onClick={() => {
              setSent(false);
              setNote("");
            }}
            className="ml-3 text-primary hover:underline"
          >
            Submit another
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveFeedback({
              runId: run.id,
              dimension,
              agreement,
              note,
              createdAt: new Date().toISOString(),
            });
            setSent(true);
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="font-mono text-[11px] text-muted">Run ID</label>
              <input
                readOnly
                value={run.id}
                className="mt-1 w-full rounded-md border border-border bg-surface/70 px-3 py-2 font-mono text-sm text-muted"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] text-muted">Dimension</label>
              <select
                value={dimension}
                onChange={(e) => setDimension(e.target.value as DimensionId)}
                className="mt-1 w-full rounded-md border border-border bg-surface/70 px-3 py-2 text-sm"
              >
                {DIMENSIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-[11px] text-muted">Your assessment</label>
              <select
                value={agreement}
                onChange={(e) => setAgreement(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-surface/70 px-3 py-2 text-sm"
              >
                <option value="too_low">Score is too low</option>
                <option value="too_high">Score is too high</option>
                <option value="wrong_evidence">Evidence does not support the score</option>
                <option value="agree">Agree, adding context</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="font-mono text-[11px] text-muted">Note</label>
              <textarea
                rows={3}
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe the span you believe was scored incorrectly…"
                className="mt-1 w-full rounded-md border border-border bg-surface/70 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-md border border-border-strong px-4 py-2.5 font-mono text-sm transition-colors hover:bg-surface"
          >
            Submit feedback
          </button>
        </form>
      )}
    </Panel>
  );
}
