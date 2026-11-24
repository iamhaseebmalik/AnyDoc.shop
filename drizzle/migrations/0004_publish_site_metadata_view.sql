CREATE OR REPLACE VIEW public.website_metadata WITH (security_invoker = false) AS SELECT title, description FROM public.website_settings WHERE id = true;
GRANT SELECT ON public.website_metadata TO anon, authenticated;
REVOKE SELECT ON public.website_settings FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "Public metadata" ON public.website_settings;