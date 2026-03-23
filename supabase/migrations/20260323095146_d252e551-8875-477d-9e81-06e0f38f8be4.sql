CREATE POLICY "Allow anonymous inserts for PME registration"
ON public.companies
FOR INSERT
TO anon
WITH CHECK (true);