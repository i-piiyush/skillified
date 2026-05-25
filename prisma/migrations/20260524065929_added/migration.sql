/*
  Warnings:

  - You are about to drop the column `weakTopics` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "weakTopics",
ADD COLUMN     "weakTopicNames" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "WeakTopic" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "whyYouNeedToStudyThis" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WeakTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopResource" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "whyChosen" TEXT NOT NULL,
    "weakTopicId" TEXT NOT NULL,

    CONSTRAINT "TopResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeakTopic_userId_idx" ON "WeakTopic"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TopResource_weakTopicId_key" ON "TopResource"("weakTopicId");

-- AddForeignKey
ALTER TABLE "WeakTopic" ADD CONSTRAINT "WeakTopic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopResource" ADD CONSTRAINT "TopResource_weakTopicId_fkey" FOREIGN KEY ("weakTopicId") REFERENCES "WeakTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
