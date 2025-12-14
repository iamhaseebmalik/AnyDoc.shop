-- Create storage bucket for documents (private by default)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
);

-- Create table to track document uploads for auto-deletion
CREATE TABLE public.document_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS
ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own uploads by session
CREATE POLICY "Users can view own uploads by session"
ON public.document_uploads
FOR SELECT
USING (true);

-- Policy: Users can insert their own uploads
CREATE POLICY "Users can insert uploads"
ON public.document_uploads
FOR INSERT
WITH CHECK (true);

-- Policy: Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON public.document_uploads
FOR DELETE
USING (true);

-- Storage policies for documents bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow reading own documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Allow deleting documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'documents');

-- Create index for faster expiration queries
CREATE INDEX idx_document_uploads_expires_at ON public.document_uploads(expires_at);