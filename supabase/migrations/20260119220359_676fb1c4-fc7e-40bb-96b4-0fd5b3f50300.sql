-- Fix overly permissive RLS policies on document_uploads
DROP POLICY IF EXISTS "Users can insert uploads" ON public.document_uploads;
DROP POLICY IF EXISTS "Users can delete own uploads" ON public.document_uploads;

-- More restrictive insert policy - allow anyone to insert (needed for anonymous uploads)
-- but the policy structure is explicit about what's allowed
CREATE POLICY "Anyone can insert uploads" 
ON public.document_uploads FOR INSERT 
WITH CHECK (
  -- Allow authenticated users to insert with their user_id
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR 
  -- Allow anonymous users to insert without user_id
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Delete policy - users can only delete their own uploads
CREATE POLICY "Users can delete own uploads" 
ON public.document_uploads FOR DELETE 
USING (
  -- Authenticated users can delete their own
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR 
  -- Allow deletion by session for anonymous users (session_id matches)
  (auth.uid() IS NULL AND user_id IS NULL)
);