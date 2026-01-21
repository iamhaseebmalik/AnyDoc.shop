-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert uploads" ON public.document_uploads;

-- Create a new policy that allows anonymous uploads (session-based)
CREATE POLICY "Anyone can insert uploads" 
ON public.document_uploads 
FOR INSERT 
WITH CHECK (
  -- Authenticated users must set their user_id
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Anonymous users can insert with null user_id and any session_id
  (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);

-- Also update the SELECT policy to properly handle anonymous users by session_id
DROP POLICY IF EXISTS "Users can view own uploads" ON public.document_uploads;

CREATE POLICY "Users can view own uploads"
ON public.document_uploads
FOR SELECT
USING (
  -- Authenticated users can view their own uploads
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- Anonymous users can view uploads with matching session_id
  (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);

-- Update DELETE policy for consistency
DROP POLICY IF EXISTS "Users can delete own uploads" ON public.document_uploads;

CREATE POLICY "Users can delete own uploads"
ON public.document_uploads
FOR DELETE
USING (
  -- Authenticated users can delete their own uploads
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- Anonymous users can delete their session uploads
  (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);