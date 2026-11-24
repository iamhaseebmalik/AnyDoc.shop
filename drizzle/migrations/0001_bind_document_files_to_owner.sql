DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow reading own documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow deleting documents" ON storage.objects;
CREATE POLICY "Owners can upload documents" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = (select auth.uid()::text));
CREATE POLICY "Owners can read documents" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = (select auth.uid()::text));
CREATE POLICY "Owners can delete documents" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = (select auth.uid()::text));