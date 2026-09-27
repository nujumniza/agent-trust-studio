import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/run", label: "Run Evaluation" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
  { to: "/methodology", label: "Methodology" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 glass border-b border-border">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid size-7 place-items-center rounded-md bg-foreground font-display text-sm font-bold text-background">
            T
          </div>
          <span className="font-display font-semibold tracking-tight">TRUST-AI</span>
          <span className="rounded border border-primary/30 bg-primary-soft/50 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-primary">
            Experimental
          </span>
        </Link>
        <nav className="hidden items-center gap-6 font-mono text-xs text-muted md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-foreground" }}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[11px] text-faint sm:inline">v0.3.1</span>
          <Link
            to="/run"
            className="rounded-md bg-foreground px-3 py-1.5 font-mono text-xs text-background transition-opacity hover:opacity-90"
          >
            New Run
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-6 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="grid size-5 place-items-center rounded bg-foreground font-display text-[10px] font-bold text-background">
            T
          </div>
          <span className="font-mono text-xs text-muted">
            TRUST-AI · experimental research framework
          </span>
        </div>
        <p className="font-mono text-[11px] text-faint">
          Synthetic tasks only · no sensitive data collected
        </p>
      </div>
    </footer>
  );
}

export function Ambient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute -left-24 -top-32 size-[520px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute right-[-8rem] top-1/3 size-[460px] rounded-full bg-primary-soft blur-3xl" />
      <div className="absolute bottom-0 left-1/3 size-[420px] rounded-full bg-accent/[0.06] blur-3xl" />
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">{children}</p>
  );
}

export function Panel({
  children,
  className = "",
  delay,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`glass animate-rise rounded-xl border border-border p-5 ${className}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`glass-2 flex items-start gap-3 rounded-lg border border-border px-4 py-3 ${className}`}
    >
      <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
        Disclaimer
      </span>
      <p className="text-pretty text-xs leading-relaxed text-muted">
        TRUST-AI is an <strong className="font-semibold text-foreground">experimental research framework</strong>.
        Scores are not scientifically validated and do not constitute an industry standard. It uses
        synthetic tasks only and collects no sensitive personal data.
      </p>
    </div>
  );
}
