-- Lock down the private 'reports' bucket at the storage layer with explicit
-- deny policies for anon/authenticated. All legitimate access goes through
-- the server-side service-role client (signed URLs created in server functions).
-- This is defense-in-depth so the bucket cannot be read/written by client
-- roles even if bucket public-flag drifts.

-- SELECT: only service_role may read objects in 'reports'
DROP POLICY IF EXISTS "reports bucket: deny client select" ON storage.objects;
CREATE POLICY "reports bucket: deny client select"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id <> 'reports');

-- INSERT: only service_role may write to 'reports'
DROP POLICY IF EXISTS "reports bucket: deny client insert" ON storage.objects;
CREATE POLICY "reports bucket: deny client insert"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id <> 'reports');

-- UPDATE: only service_role may update 'reports'
DROP POLICY IF EXISTS "reports bucket: deny client update" ON storage.objects;
CREATE POLICY "reports bucket: deny client update"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id <> 'reports')
WITH CHECK (bucket_id <> 'reports');

-- DELETE: only service_role may delete from 'reports'
DROP POLICY IF EXISTS "reports bucket: deny client delete" ON storage.objects;
CREATE POLICY "reports bucket: deny client delete"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id <> 'reports');
