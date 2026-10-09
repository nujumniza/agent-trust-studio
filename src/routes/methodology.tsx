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
  "Demo mode does not execute an agent: its scores and evidence come from a deterministic synthetic formula and are illustrative only.",
  "Real mode runs one scenario per run against simulated, in-memory mock tools — not real commerce or production systems.",
  "Only two hand-authored scenarios exist (refund_reship_v1, safety_incident_escalation_v1); they are not a representative sample of real deployments.",
  "Consistency and robustness are not evaluated: repeated runs and task variants are not yet implemented.",
  "Fault injection covers a single fault type (a first-call 503-style inventory error).",
  "Each real run is a single sample; no repeated-run statistics or confidence intervals are produced.",
  "Dimension weights and partial-credit values are working assumptions, not empirically derived results.",
  "No statistical validation, human-agreement study, production benchmarking or industry validation has been conducted.",
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
        TRUST-AI has two modes. <strong className="text-foreground">Demo / simulation</strong>{" "}
        generates scores and evidence from a deterministic synthetic formula so the interface can be
        explored; it does not execute an agent or run the listed number of tasks.{" "}
        <strong className="text-foreground">Real evaluation</strong> executes one selected scenario
        per run with a live language model against deterministic, in-memory mock tools, records
        every step as a trace, and scores dimensions from that trace with fixed rules rather than
        from the agent's own account of what it did.
      </p>

      <Disclaimer className="mt-6 max-w-[62ch]" />

      <section className="py-10">
        <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight">Procedure</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              step: "01",
              title: "Task construction",
              body: "Real mode currently supports two synthetic scenarios: refund_reship_v1 and safety_incident_escalation_v1. Each declares a goal state, a reference tool-call count, two ordering rules, a forbidden tool and a ground-truth escalation flag. The order, inventory and business environment are simulated.",
            },
            {
              step: "02",
              title: "Execution & fault injection",
              body: "Each real run executes the selected scenario once with a live model. When fault injection is enabled, the first inventory check returns a 503-style error. Repeated runs and paraphrase, typo, distractor or prompt-injection variants are not run; they are possible future work.",
            },
            {
              step: "03",
              title: "Trace scoring",
              body: "Real-mode scores are assigned deterministically from the recorded trace — no model judges the result. Each score cites the trace events it used. Consistency and robustness are marked not evaluated rather than scored.",
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
          Overall index = Σ (score × weight) ÷ Σ (weight), over evaluated dimensions only, × 100.
          Weights sum to 1.00; not-evaluated dimensions are excluded, so overall values are not
          directly comparable when different dimensions were evaluated.
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
            Demo runs and their feedback are stored only in local browser storage. Real evaluations
            send the task text to the AI model on the server, and store the run, trace, scores and
            feedback in the app's database, accessible only from the browser that created them. Do
            not enter personal, customer, health, financial or otherwise sensitive information — the
            framework is designed for synthetic scenarios only.
          </p>
        </Panel>
      </section>
    </main>
  );
}
