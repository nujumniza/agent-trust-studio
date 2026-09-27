import { DIMENSIONS, type EvalRun } from "@/lib/trustai";

export function ScoreMatrix({ run }: { run: EvalRun }) {
  return (
    <div className="space-y-3">
      {DIMENSIONS.map((dim) => (
        <div key={dim.id} className="flex items-center gap-3">
          <span className="w-40 shrink-0 font-mono text-xs text-foreground">{dim.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/10">
            <div
              className="animate-grow h-full origin-left rounded-full bg-primary"
              style={{ width: `${run.scores[dim.id] * 100}%` }}
            />
          </div>
          <span className="w-12 text-right font-mono text-xs">
            {run.scores[dim.id].toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function EvidenceTrace({ run }: { run: EvalRun }) {
  return (
    <div className="space-y-2">
      {run.evidence.map((span, i) => {
        const dim = DIMENSIONS.find((d) => d.id === span.dimension)!;
        return (
          <details
            key={span.id}
            className="group rounded-lg border border-border bg-surface/50"
            open={i === 0}
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5">
              <span className="font-mono text-[11px] text-primary">{span.id}</span>
              <span className="flex-1 text-xs text-foreground">{dim.label}</span>
              <span className="font-mono text-[11px] text-muted">
                {run.scores[span.dimension].toFixed(2)}
              </span>
              <span className="font-mono text-[10px] text-faint transition-transform group-open:rotate-90">
                &gt;
              </span>
            </summary>
            <div className="border-t border-border px-3 pb-3 pt-2">
              <p className="font-mono text-[11px] leading-relaxed text-muted">
                span {span.window} · {span.summary}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {span.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-foreground/5 px-2 py-0.5 font-mono text-[10px] text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}

export function OverallCard({ run }: { run: EvalRun }) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
          Overall trust index
        </span>
        <span className="font-mono text-[11px] text-primary">{run.id}</span>
      </div>
      <div className="flex items-end gap-6">
        <div>
          <div className="font-display text-5xl font-bold leading-none tracking-tight">
            {run.overall.toFixed(1)}
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted">WEIGHTED / 100</div>
        </div>
        <div className="flex-1 pb-1">
          <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
            <div
              className="animate-grow h-full origin-left rounded-full bg-primary"
              style={{ width: `${run.overall}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[10px] text-faint">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </>
  );
}
