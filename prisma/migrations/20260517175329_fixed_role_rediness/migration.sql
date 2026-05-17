/*
  Warnings:

  - You are about to drop the column `roleReadyness` on the `users` table. All the data in the column will be lost.
  - Changed the type of `role` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RoleReadiness" AS ENUM ('ready', 'not_ready', 'borderline');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Internship', 'SDE1', 'SDE2', 'SDE3');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "roleReadyness",
ADD COLUMN     "roleReadiness" "RoleReadiness",
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- DropEnum
DROP TYPE "RoleReadyness";
