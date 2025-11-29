-- Drop existing SELECT policies for documents
DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view documents with module permission" ON public.documents;

-- Create new SELECT policy: users can only view their own documents, admins can view all
CREATE POLICY "Users can view own documents"
ON public.documents
FOR SELECT
USING (
  auth.uid() = uploaded_by OR has_role(auth.uid(), 'admin'::app_role)
);