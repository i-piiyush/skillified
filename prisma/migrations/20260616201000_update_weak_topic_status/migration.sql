/*
  Warnings:

  - The `weakTopicsStatus` column on the `TestSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "WeakTopicStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "TestSession" DROP COLUMN "weakTopicsStatus",
ADD COLUMN     "weakTopicsStatus" "WeakTopicStatus" NOT NULL DEFAULT 'PROCESSING';
