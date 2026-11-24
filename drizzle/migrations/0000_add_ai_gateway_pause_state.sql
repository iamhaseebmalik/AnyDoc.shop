CREATE TABLE public.ai_gateway_control (
  state_key text PRIMARY KEY CHECK (state_key = 'global'),
  paused boolean NOT NULL DEFAULT true,
  http_status integer,
  safe_message text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ai_gateway_control_pause_details_check CHECK (
    (paused = true AND http_status IN (402, 403) AND safe_message IS NOT NULL)
    OR paused = false
  )
);
GRANT ALL ON public.ai_gateway_control TO service_role;
ALTER TABLE public.ai_gateway_control ENABLE ROW LEVEL SECURITY;