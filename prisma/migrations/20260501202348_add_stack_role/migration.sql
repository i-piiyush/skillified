/*
  Warnings:

  - Added the required column `role` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stack` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "stack" TEXT NOT NULL;
