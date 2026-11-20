-- CreateEnum
CREATE TYPE "ComponentRoleType" AS ENUM ('SEMANTIC', 'PHONETIC', 'BOTH', 'STRUCTURAL');

-- AlterEnum
ALTER TYPE "ContentStatus" ADD VALUE 'IN_REVIEW';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QuestionType" ADD VALUE 'AUDIO_DISCRIMINATION';
ALTER TYPE "QuestionType" ADD VALUE 'SYLLABLE_BUILDER';
ALTER TYPE "QuestionType" ADD VALUE 'STROKE_ORDER_SEQUENCE';
ALTER TYPE "QuestionType" ADD VALUE 'RADICAL_MATCHING';

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "concept_id" UUID;

-- CreateTable
CREATE TABLE "learning_concepts" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "stage_number" INTEGER NOT NULL,
    "pillar" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "explanation_vi" TEXT NOT NULL,
    "simple_explanation_vi" TEXT NOT NULL,
    "extra_examples" JSONB,
    "remediation_question" JSONB,
    "lesson_id" UUID,
    "prerequisite_lesson_id" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_concept_masteries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "concept_id" UUID NOT NULL,
    "mastery_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "attempts_count" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "consecutive_misses" INTEGER NOT NULL DEFAULT 0,
    "needs_remediation" BOOLEAN NOT NULL DEFAULT false,
    "last_reviewed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_concept_masteries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_concept_bookmarks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "concept_id" UUID NOT NULL,
    "note_vi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_concept_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radical_components" (
    "id" UUID NOT NULL,
    "symbol" TEXT NOT NULL,
    "variants" JSONB NOT NULL DEFAULT '[]',
    "pinyin" TEXT NOT NULL,
    "name_vi" TEXT NOT NULL,
    "meaning_vi" TEXT NOT NULL,
    "role_type" "ComponentRoleType" NOT NULL DEFAULT 'SEMANTIC',
    "category_vi" TEXT NOT NULL,
    "common_position_vi" TEXT NOT NULL,
    "recognition_tip_vi" TEXT NOT NULL,
    "example_characters" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radical_components_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "learning_concepts_code_key" ON "learning_concepts"("code");

-- CreateIndex
CREATE INDEX "learning_concepts_stage_number_pillar_idx" ON "learning_concepts"("stage_number", "pillar");

-- CreateIndex
CREATE INDEX "user_concept_masteries_user_id_needs_remediation_idx" ON "user_concept_masteries"("user_id", "needs_remediation");

-- CreateIndex
CREATE UNIQUE INDEX "user_concept_masteries_user_id_concept_id_key" ON "user_concept_masteries"("user_id", "concept_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_concept_bookmarks_user_id_concept_id_key" ON "user_concept_bookmarks"("user_id", "concept_id");

-- CreateIndex
CREATE UNIQUE INDEX "radical_components_symbol_key" ON "radical_components"("symbol");

-- CreateIndex
CREATE INDEX "radical_components_category_vi_sort_order_idx" ON "radical_components"("category_vi", "sort_order");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "learning_concepts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_concepts" ADD CONSTRAINT "learning_concepts_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_concepts" ADD CONSTRAINT "learning_concepts_prerequisite_lesson_id_fkey" FOREIGN KEY ("prerequisite_lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_concept_masteries" ADD CONSTRAINT "user_concept_masteries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_concept_masteries" ADD CONSTRAINT "user_concept_masteries_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "learning_concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_concept_bookmarks" ADD CONSTRAINT "user_concept_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_concept_bookmarks" ADD CONSTRAINT "user_concept_bookmarks_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "learning_concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

