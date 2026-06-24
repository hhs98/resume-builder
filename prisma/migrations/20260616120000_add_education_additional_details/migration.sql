-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "description" TEXT,
ADD COLUMN     "projectUrl" TEXT,
ADD COLUMN     "gpa" TEXT,
ADD COLUMN     "awards" JSONB NOT NULL DEFAULT '[]';
