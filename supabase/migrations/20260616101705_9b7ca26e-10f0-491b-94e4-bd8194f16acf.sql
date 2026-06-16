
CREATE POLICY "public read song files" ON storage.objects FOR SELECT USING (bucket_id = 'songs');
CREATE POLICY "public insert song files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'songs');
CREATE POLICY "public update song files" ON storage.objects FOR UPDATE USING (bucket_id = 'songs') WITH CHECK (bucket_id = 'songs');
CREATE POLICY "public delete song files" ON storage.objects FOR DELETE USING (bucket_id = 'songs');
