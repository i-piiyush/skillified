-- CreateEnum
CREATE TYPE "RoleReadyness" AS ENUM ('ready', 'not_ready', 'borderline');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastTested" TIMESTAMP(3),
ADD COLUMN     "latestScore" INTEGER,
ADD COLUMN     "roleReadyness" "RoleReadyness",
ADD COLUMN     "weakTopics" TEXT[] DEFAULT ARRAY[]::TEXT[];
