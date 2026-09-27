import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Disclaimer, Panel, SectionLabel } from "@/components/site-chrome";
import { OverallCard } from "@/components/score-views";
import { DIMENSIONS, loadRuns, type EvalRun } from "@/lib/trustai";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TRUST-AI — Measure what an AI agent actually does" },
      {
        name: "description",
        content:
          "An experimental research framework that runs synthetic tasks against an AI agent and scores eight behavioural dimensions with a full evidence trace.",
      },
      { property: "og:title", content: "TRUST-AI — Measure what an AI agent actually does" },
      {
        property: "og:description",
        content:
          "Experimental evaluation of AI agents across task success, tool use, recovery, consistency, robustness, safety, escalation and efficiency.",
      },
    ],
  }),
  component: Index,
});

const PROBLEMS = [
  {
    title: "Demos are not evidence",
    body: "A single successful transcript says nothing about what happens on the fortieth task, or the first one that goes wrong.",
  },
  {
    title: "A pass/fail score hides the failure mode",
    body: "Two agents at 80% can fail in opposite ways: one stalls on errors, the other quietly takes an unsafe shortcut.",
  },
  {
    title: "Scores without traces cannot be argued with",
    body: "If you cannot see the span that produced a number, you cannot tell whether the evaluation is wrong or the agent is.",
  },
];

function Index() {
  const [latest, setLatest] = useState<EvalRun | null>(null);
  useEffect(() => {
    setLatest(loadRuns()[0] ?? null);
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6">
      <section className="grid gap-8 pb-10 pt-14 lg:grid-cols-12">
        <div className="animate-rise lg:col-span-7">
          <SectionLabel>(a) Instrumentation for agent behaviour</SectionLabel>
          <h1 className="max-w-[16ch] text-balance font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            Measure what an agent actually does, not what it claims.
          </h1>
          <p className="mt-5 max-w-[52ch] text-pretty text-base text-muted">
            TRUST-AI runs synthetic tasks against a target agent and scores eight behavioural
            dimensions — from tool-use correctness to human escalation — with a full trace of the
            evidence behind every number.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/run"
              className="rounded-md bg-foreground px-4 py-2.5 font-mono text-sm text-background transition-opacity hover:opacity-90"
            >
              Start an evaluation
            </Link>
            <Link
              to="/methodology"
              className="rounded-md border border-border-strong px-4 py-2.5 font-mono text-sm text-foreground transition-colors hover:bg-surface"
            >
              Read the methodology
            </Link>
          </div>
          <Disclaimer className="mt-8" />
        </div>

        <div className="animate-rise lg:col-span-5" style={{ animationDelay: "120ms" }}>
          <Panel>
            {latest ? (
              <>
                <OverallCard run={latest} />
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {DIMENSIONS.slice(0, 4).map((dim) => (
                    <div
                      key={dim.id}
                      className="rounded-md border border-border bg-surface/60 px-3 py-2"
                    >
                      <div className="font-mono text-[10px] uppercase text-faint">{dim.short}</div>
                      <div className="font-mono text-lg font-medium">
                        {latest.scores[dim.id].toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/dashboard/$runId"
                  params={{ runId: latest.id }}
                  className="mt-4 inline-block font-mono text-xs text-primary hover:underline"
                >
                  Open full dashboard →
                </Link>
              </>
            ) : (
              <p className="font-mono text-xs text-muted">Loading latest run…</p>
            )}
          </Panel>
        </div>
      </section>

      <section className="py-10">
        <SectionLabel>(b) The problem</SectionLabel>
        <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight">
          Agents are shipped on vibes
        </h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <Panel key={p.title} delay={80 * (i + 1)}>
              <h3 className="font-display text-base font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">{p.body}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section className="py-10">
        <SectionLabel>(c) What gets measured</SectionLabel>
        <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight">
          Eight behavioural dimensions
        </h2>
        <div className="glass animate-rise overflow-hidden rounded-xl border border-border">
          <div className="divide-y divide-border">
            {DIMENSIONS.map((dim, i) => (
              <div key={dim.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-5">
                <span className="w-8 shrink-0 font-mono text-[11px] text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="w-48 shrink-0 font-mono text-xs text-foreground">{dim.label}</span>
                <span className="text-pretty text-sm text-muted">{dim.question}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
