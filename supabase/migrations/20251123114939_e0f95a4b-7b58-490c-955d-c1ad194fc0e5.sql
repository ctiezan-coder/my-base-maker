-- Create table for imputation attachments
CREATE TABLE IF NOT EXISTS public.imputation_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imputation_id uuid NOT NULL REFERENCES public.imputations(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  file_type text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.imputation_attachments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view attachments from their direction
CREATE POLICY "Users can view imputation attachments with access"
  ON public.imputation_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.imputations i
      WHERE i.id = imputation_id
      AND (
        i.direction_id IS NULL 
        OR user_has_direction_access(auth.uid(), i.direction_id)
        OR has_role(auth.uid(), 'admin')
      )
    )
  );

-- Policy: Users can upload attachments
CREATE POLICY "Users can upload imputation attachments"
  ON public.imputation_attachments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.imputations i
      WHERE i.id = imputation_id
      AND (
        user_has_direction_access(auth.uid(), i.direction_id)
        OR has_role(auth.uid(), 'admin')
        OR has_role(auth.uid(), 'manager')
      )
    )
  );

-- Policy: Managers can delete attachments
CREATE POLICY "Managers can delete imputation attachments"
  ON public.imputation_attachments
  FOR DELETE
  USING (
    has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'manager')
  );

-- Add trigger for updated_at
CREATE TRIGGER update_imputation_attachments_updated_at
  BEFORE UPDATE ON public.imputation_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_imputation_attachments_imputation_id 
  ON public.imputation_attachments(imputation_id);

-- Storage policy for imputation files (using existing documents bucket)
CREATE POLICY "Users can upload imputation files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = 'imputations'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view imputation files with access"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = 'imputations'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Managers can delete imputation files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = 'imputations'
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  );