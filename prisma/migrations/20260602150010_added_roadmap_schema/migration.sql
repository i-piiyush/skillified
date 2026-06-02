-- CreateEnum
CREATE TYPE "TopicType" AS ENUM ('PRACTICAL', 'DSA', 'SYSTEM_DESIGN');

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "estimatedMonths" INTEGER NOT NULL,
    "practicalWeight" INTEGER NOT NULL,
    "dsaWeight" INTEGER NOT NULL,
    "systemDesignWeight" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapTopic" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "type" "TopicType" NOT NULL,
    "name" TEXT NOT NULL,
    "depth" INTEGER NOT NULL,
    "focusedHours" INTEGER NOT NULL,
    "focus" TEXT[],
    "avoid" TEXT[],
    "projects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "easyQuestions" INTEGER,
    "mediumQuestions" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoadmapTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Roadmap_userId_idx" ON "Roadmap"("userId");

-- CreateIndex
CREATE INDEX "RoadmapTopic_roadmapId_idx" ON "RoadmapTopic"("roadmapId");

-- CreateIndex
CREATE INDEX "RoadmapTopic_type_idx" ON "RoadmapTopic"("type");

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapTopic" ADD CONSTRAINT "RoadmapTopic_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
