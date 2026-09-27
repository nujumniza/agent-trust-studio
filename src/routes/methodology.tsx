import { createFileRoute } from "@tanstack/react-router";

import { Disclaimer, Panel, SectionLabel } from "@/components/site-chrome";
import { DIMENSIONS } from "@/lib/trustai";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Research methodology — TRUST-AI" },
      {
        name: "description",
        content:
          "How the experimental TRUST-AI framework constructs synthetic tasks, scores eight dimensions, weights the overall index, and where it is known to be limited.",
      },
      { property: "og:title", content: "Research methodology — TRUST-AI" },
      {
        property: "og:description",
        content:
          "Scoring procedure, weighting, evidence traces and known limitations of the experimental TRUST-AI framework.",
      },
    ],
  }),
  component: MethodologyPage,
});

const LIMITATIONS = [
  "Scores are produced by a deterministic synthetic model, not by executing a live agent against production systems.",
  "The task suite is small and hand-authored; it is not a representative sample of real deployments.",
  "Dimension weights are a working assumption, not an empirically derived result.",
  "No inter-rater reliability study has been conducted on the evidence annotations.",
  "Results should not be used to certify, rank or market an agent.",
];

function MethodologyPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 pb-4 pt-10">
      <SectionLabel>(f) Research methodology</SectionLabel>
      <h1 className="max-w-[24ch] text-balance font-display text-3xl font-bold tracking-tight">
        How TRUST-AI arrives at a number
      </h1>
      <p className="mt-4 max-w-[62ch] text-pretty text-base leading-relaxed text-muted">
        TRUST-AI treats an agent as an instrument under test. A fixed suite of synthetic tasks is
        replayed against it, faults are injected at known points, and each behavioural dimension is
        scored from the resulting trace rather than from the agent's own account of what it did.
      </p>

      <Disclaimer className="mt-6 max-w-[62ch]" />

      <section className="py-10">
        <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight">Procedure</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              step: "01",
              title: "Task construction",
              body: "Every task declares a goal state, a reference solution path, an ordering constraint graph over tools, and ground-truth escalation points. All tasks are synthetic.",
            },
            {
              step: "02",
              title: "Execution & perturbation",
              body: "Each task is replayed five times, plus paraphrase, typo, distractor and prompt-injection variants. Faults are injected at fixed steps so recovery is comparable across agents.",
            },
            {
              step: "03",
              title: "Trace scoring",
              body: "Scores are assigned from the recorded trace. Each score links to the spans that produced it, so a disputed number can be traced back to the behaviour behind it.",
            },
          ].map((s, i) => (
            <Panel key={s.step} delay={80 * (i + 1)}>
              <span className="font-mono text-[11px] text-faint">{s.step}</span>
              <h3 className="mt-1 font-display text-base font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">{s.body}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section className="py-10">
        <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight">
          Dimensions and weights
        </h2>
        <div className="glass overflow-hidden rounded-xl border border-border">
          <div className="divide-y divide-border">
            {DIMENSIONS.map((dim) => (
              <div key={dim.id} className="px-4 py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-mono text-xs text-foreground">{dim.label}</h3>
                  <span className="font-mono text-[11px] text-primary">
                    weight {dim.weight.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1.5 text-pretty text-sm text-muted">{dim.method}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 font-mono text-[11px] text-faint">
          Overall trust index = Σ (dimension score × weight) × 100. Weights sum to 1.00.
        </p>
      </section>

      <section className="py-10">
        <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight">
          Known limitations
        </h2>
        <Panel>
          <ul className="space-y-3">
            {LIMITATIONS.map((l) => (
              <li key={l} className="flex gap-3 text-sm leading-relaxed text-muted">
                <span className="mt-1 font-mono text-[10px] text-accent">▲</span>
                <span className="text-pretty">{l}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="pb-10">
        <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight">Data handling</h2>
        <Panel>
          <p className="max-w-[62ch] text-pretty text-sm leading-relaxed text-muted">
            TRUST-AI runs entirely in your browser. Task instructions, run configurations, results
            and feedback are stored in local browser storage and are never transmitted. Do not enter
            personal, customer, health, financial or otherwise sensitive information — the framework
            is designed for synthetic scenarios only.
          </p>
        </Panel>
      </section>
    </main>
  );
}
