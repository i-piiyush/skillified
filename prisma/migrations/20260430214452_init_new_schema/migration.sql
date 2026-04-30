-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('mcq', 'output');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "level" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "domain" TEXT NOT NULL,
    "stack" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB,
    "correct_answer" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "Question_skill_id_idx" ON "Question"("skill_id");
