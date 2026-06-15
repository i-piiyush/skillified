/*
  Warnings:

  - You are about to drop the column `assesmentCompleted` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "assesmentCompleted",
ADD COLUMN     "userOnboarded" BOOLEAN NOT NULL DEFAULT false;
