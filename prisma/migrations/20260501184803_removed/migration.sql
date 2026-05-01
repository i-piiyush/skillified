/*
  Warnings:

  - You are about to drop the column `skill_id` on the `Question` table. All the data in the column will be lost.
  - The `options` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `skillId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Question_skill_id_idx";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "skill_id",
ADD COLUMN     "skillId" TEXT NOT NULL,
DROP COLUMN "options",
ADD COLUMN     "options" TEXT[];
