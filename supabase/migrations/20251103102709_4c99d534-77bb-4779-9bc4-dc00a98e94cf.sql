-- Add missing values to the existing document_category enum
-- Note: We check if the value exists before adding to avoid errors

DO $$ 
BEGIN
    -- Add 'Rapport' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Rapport' AND enumtypid = 'document_category'::regtype) THEN
        ALTER TYPE document_category ADD VALUE 'Rapport';
    END IF;
    
    -- Add 'Contrat' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Contrat' AND enumtypid = 'document_category'::regtype) THEN
        ALTER TYPE document_category ADD VALUE 'Contrat';
    END IF;
    
    -- Add 'Note' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Note' AND enumtypid = 'document_category'::regtype) THEN
        ALTER TYPE document_category ADD VALUE 'Note';
    END IF;
    
    -- Add 'Présentation' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Présentation' AND enumtypid = 'document_category'::regtype) THEN
        ALTER TYPE document_category ADD VALUE 'Présentation';
    END IF;
    
    -- Add 'Autre' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Autre' AND enumtypid = 'document_category'::regtype) THEN
        ALTER TYPE document_category ADD VALUE 'Autre';
    END IF;
END $$;