CREATE TABLE public.evaluation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id text NOT NULL,
  task_name text NOT NULL,
  task_prompt text NOT NULL,
  agent_name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed','timeout')),
  error text,
  final_answer text,
  owner_key_hash text NOT NULL,
  owner_user_id uuid,
  started_at timestamptz,
  completed_at timestamptz,
  overall_score numeric(5,1),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX evaluation_runs_owner_idx ON public.evaluation_runs(owner_key_hash, created_at DESC);

CREATE TABLE public.trace_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.evaluation_runs(id) ON DELETE CASCADE,
  sequence_number integer NOT NULL,
  event_type text NOT NULL,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  actor text NOT NULL,
  tool_name text,
  input jsonb,
  output jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, sequence_number)
);
CREATE INDEX trace_events_run_idx ON public.trace_events(run_id, sequence_number);

CREATE TABLE public.evaluation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.evaluation_runs(id) ON DELETE CASCADE,
  dimension text NOT NULL,
  score numeric(4,2),
  status text NOT NULL DEFAULT 'evaluated' CHECK (status IN ('evaluated','not_evaluated')),
  reasoning text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, dimension)
);
CREATE INDEX evaluation_results_run_idx ON public.evaluation_results(run_id);

CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.evaluation_runs(id) ON DELETE CASCADE,
  dimension text NOT NULL,
  feedback_type text NOT NULL,
  comment text NOT NULL CHECK (char_length(comment) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX feedback_run_idx ON public.feedback(run_id);

-- Access only through server functions (service role). No browser access.
GRANT ALL ON public.evaluation_runs TO service_role;
GRANT ALL ON public.trace_events TO service_role;
GRANT ALL ON public.evaluation_results TO service_role;
GRANT ALL ON public.feedback TO service_role;

ALTER TABLE public.evaluation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trace_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;