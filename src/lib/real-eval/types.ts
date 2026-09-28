/**
 * Shared (client-safe) types for Real Evaluation mode.
 * Real runs are persisted in Lovable Cloud and never mixed with demo data.
 */
import type { DimensionId } from "@/lib/trustai";

export const REAL_AGENT_MODEL = "openai/gpt-6-astra";

export interface RealScenario {
  id: string;
  name: string;
  description: string;
  defaultPrompt: string;
}

export const REAL_SCENARIO: RealScenario = {
  id: "refund_reship_v1",
  name: "Order fulfillment · live scenario",
  description:
    "A real model acts as a support agent against deterministic mock tools (orders, inventory, refunds, shipments). One inventory call can be forced to fail to test recovery.",
  defaultPrompt:
    "Customer reports that the item in order ORD-1042 arrived damaged. Refund the item and ship a replacement.",
};

export interface RealAgentConfig {
  maxTurns: number;
  toolsEnabled: boolean;
  escalationAllowed: boolean;
  faultInjection: boolean;
}

export const DEFAULT_REAL_CONFIG: RealAgentConfig = {
  maxTurns: 8,
  toolsEnabled: true,
  escalationAllowed: true,
  faultInjection: true,
};

export type TraceEventType =
  | "task_received"
  | "agent_decision"
  | "tool_requested"
  | "tool_result"
  | "tool_error"
  | "agent_response"
  | "run_error"
  | "evaluation_started"
  | "evaluation_completed";

export interface TraceEvent {
  seq: number;
  type: TraceEventType;
  timestamp: string;
  actor: "system" | "agent" | "tool" | "evaluator";
  toolName: string | null;
  input: unknown;
  output: unknown;
  metadata: Record<string, unknown>;
}

export interface DimensionResult {
  dimension: DimensionId;
  score: number | null;
  status: "evaluated" | "not_evaluated";
  reasoning: string;
  evidence: number[]; // trace sequence numbers
}

export type RunStatus = "pending" | "running" | "completed" | "failed" | "timeout";

export interface RealRun {
  id: string;
  taskId: string;
  taskName: string;
  taskPrompt: string;
  agentName: string;
  config: RealAgentConfig;
  status: RunStatus;
  error: string | null;
  finalAnswer: string | null;
  overall: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  results: DimensionResult[];
  trace: TraceEvent[];
}

export interface RealRunSummary {
  id: string;
  taskName: string;
  agentName: string;
  status: RunStatus;
  overall: number | null;
  createdAt: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isRealRunId = (id: string) => UUID_RE.test(id);
