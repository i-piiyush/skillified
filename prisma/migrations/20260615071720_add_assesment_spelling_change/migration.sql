/*
  Warnings:

  - You are about to drop the column `assessmentCompleted` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `jwks` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "assessmentCompleted",
ADD COLUMN     "assesmentCompleted" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "jwks";
