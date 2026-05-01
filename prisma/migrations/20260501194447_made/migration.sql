/*
  Warnings:

  - You are about to drop the column `correct_answer` on the `Question` table. All the data in the column will be lost.
  - Added the required column `correctAnswer` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "correct_answer",
ADD COLUMN     "code" TEXT,
ADD COLUMN     "correctAnswer" TEXT NOT NULL;
