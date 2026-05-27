/*
  Warnings:

  - You are about to drop the column `code` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "code",
DROP COLUMN "type";

-- DropEnum
DROP TYPE "QuestionType";
