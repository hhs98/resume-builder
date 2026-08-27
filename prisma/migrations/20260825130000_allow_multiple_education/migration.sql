-- Allow multiple education entries per resume (max enforced in app)
DROP INDEX IF EXISTS "Education_resumeId_key";

CREATE INDEX IF NOT EXISTS "Education_resumeId_idx" ON "Education"("resumeId");
