-- Add optional personal details on Resume contact
ALTER TABLE "Resume" ADD COLUMN IF NOT EXISTS "currentAddress" TEXT,
ADD COLUMN IF NOT EXISTS "dateOfBirth" TEXT,
ADD COLUMN IF NOT EXISTS "gender" TEXT;
