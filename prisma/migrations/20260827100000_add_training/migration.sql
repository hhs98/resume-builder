-- Create Training table for courses/certificates
CREATE TABLE IF NOT EXISTS "Training" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "courseType" TEXT NOT NULL,
    "instituteName" TEXT NOT NULL,
    "achievementMonth" TEXT NOT NULL,
    "achievementYear" TEXT NOT NULL,
    "certificateFileName" TEXT,
    "certificatePdfDataUrl" TEXT,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Training_resumeId_idx" ON "Training"("resumeId");

ALTER TABLE "Training" DROP CONSTRAINT IF EXISTS "Training_resumeId_fkey";
ALTER TABLE "Training" ADD CONSTRAINT "Training_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
