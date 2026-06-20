/*
  Warnings:

  - Made the column `weakTopicsStatus` on table `TestSession` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TestSession" ALTER COLUMN "weakTopicsStatus" SET NOT NULL,
ALTER COLUMN "weakTopicsStatus" SET DEFAULT 'NOT_STARTED';
