DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'visualReading'
    ) THEN
        ALTER TABLE public."visualReading"
        ADD COLUMN IF NOT EXISTS email text UNIQUE;
    END IF;
END $$;
