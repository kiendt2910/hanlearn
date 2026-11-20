-- CreateEnum
CREATE TYPE "RoleCode" AS ENUM ('ADMIN', 'CONTENT_EDITOR', 'LEARNER');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentOrigin" AS ENUM ('VERIFIED_ORIGINAL', 'OFFICIAL_LICENSED', 'DEMO', 'AI_GENERATED');

-- CreateEnum
CREATE TYPE "CurriculumFramework" AS ENUM ('HSK_2_0', 'HSK_3_0', 'FOUNDATIONS', 'BUSINESS', 'ACADEMIC', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LessonSectionType" AS ENUM ('OBJECTIVES', 'VOCABULARY', 'GRAMMAR', 'LISTENING', 'SPEAKING', 'READING', 'WRITING', 'ASSESSMENT');

-- CreateEnum
CREATE TYPE "LessonProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('LISTENING', 'SPEAKING', 'READING', 'WRITING', 'VOCABULARY', 'GRAMMAR', 'PRONUNCIATION');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'SENTENCE_ORDERING', 'MATCHING', 'LISTENING_COMPREHENSION', 'TRANSLATION', 'WRITING_SHORT', 'WRITING_ESSAY');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('FULL_MOCK', 'LISTENING_PRACTICE', 'READING_PRACTICE', 'WRITING_PRACTICE', 'VOCABULARY_PRACTICE', 'GRAMMAR_PRACTICE', 'CUSTOM', 'PLACEMENT');

-- CreateEnum
CREATE TYPE "ExamAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "FlashcardSourceType" AS ENUM ('VOCABULARY', 'GRAMMAR', 'EXAMPLE_SENTENCE', 'INCORRECT_EXERCISE', 'LESSON_CONCEPT', 'MANUAL');

-- CreateEnum
CREATE TYPE "FsrsCardState" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING');

-- CreateEnum
CREATE TYPE "ReviewRating" AS ENUM ('AGAIN', 'HARD', 'GOOD', 'EASY');

-- CreateEnum
CREATE TYPE "AiConversationMode" AS ENUM ('TUTOR_QA', 'VOCAB_EXPLAIN', 'GRAMMAR_EXPLAIN', 'SENTENCE_CORRECTION', 'TOPIC_CONVERSATION', 'WRITING_COACH');

-- CreateEnum
CREATE TYPE "WritingTaskType" AS ENUM ('CHARACTER_PRACTICE', 'VOCABULARY_WRITING', 'SENTENCE_CONSTRUCTION', 'PARAGRAPH_WRITING', 'TRANSLATION', 'FREE_WRITING');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('AUDIO', 'IMAGE', 'DOCUMENT', 'STROKE_DATA');

-- CreateEnum
CREATE TYPE "SyncOperationStatus" AS ENUM ('APPLIED', 'CONFLICT_RESOLVED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('PENDING', 'VALIDATING', 'IMPORTING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "password_hash" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "native_language" TEXT NOT NULL DEFAULT 'vi',
    "current_curriculum_version_id" UUID,
    "current_level_id" UUID,
    "target_level_id" UUID,
    "daily_goal_minutes" INTEGER NOT NULL DEFAULT 30,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "longest_streak_days" INTEGER NOT NULL DEFAULT 0,
    "last_study_date" DATE,
    "placement_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "code" "RoleCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "ui_language" TEXT NOT NULL DEFAULT 'vi',
    "show_pinyin_by_default" BOOLEAN NOT NULL DEFAULT true,
    "show_translation_default" BOOLEAN NOT NULL DEFAULT true,
    "tone_coloring_enabled" BOOLEAN NOT NULL DEFAULT false,
    "audio_playback_speed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "daily_flashcard_limit" INTEGER NOT NULL DEFAULT 40,
    "auto_generate_flashcards" BOOLEAN NOT NULL DEFAULT true,
    "offline_auto_sync" BOOLEAN NOT NULL DEFAULT true,
    "email_notifications" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_versions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "framework" "CurriculumFramework" NOT NULL,
    "version_tag" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "metadata" JSONB,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_levels" (
    "id" UUID NOT NULL,
    "curriculum_version_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "title_zh" TEXT,
    "description_vi" TEXT,
    "objectives_vi" JSONB,
    "sort_order" INTEGER NOT NULL,
    "cefr_equivalent" TEXT,
    "config_metadata" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "learning_level_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "title_zh" TEXT,
    "summary_vi" TEXT,
    "estimated_minutes" INTEGER NOT NULL DEFAULT 120,
    "sort_order" INTEGER NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "title_zh" TEXT,
    "description_vi" TEXT,
    "sort_order" INTEGER NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" UUID NOT NULL,
    "module_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "title_zh" TEXT,
    "subtitle_vi" TEXT,
    "objectives_vi" JSONB,
    "estimated_minutes" INTEGER NOT NULL DEFAULT 25,
    "sort_order" INTEGER NOT NULL,
    "is_skippable" BOOLEAN NOT NULL DEFAULT true,
    "content_version" INTEGER NOT NULL DEFAULT 1,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_sections" (
    "id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "section_type" "LessonSectionType" NOT NULL,
    "title_vi" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "content_payload" JSONB NOT NULL,
    "audio_asset_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_prerequisites" (
    "lesson_id" UUID NOT NULL,
    "prerequisite_lesson_id" UUID NOT NULL,
    "is_strict" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lesson_prerequisites_pkey" PRIMARY KEY ("lesson_id","prerequisite_lesson_id")
);

-- CreateTable
CREATE TABLE "learning_resources" (
    "id" UUID NOT NULL,
    "lesson_id" UUID,
    "title_vi" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "url" TEXT,
    "media_asset_id" UUID,
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary" (
    "id" UUID NOT NULL,
    "learning_level_id" UUID,
    "simplified" TEXT NOT NULL,
    "traditional" TEXT,
    "pinyin" TEXT NOT NULL,
    "pinyin_numbered" TEXT,
    "part_of_speech" TEXT,
    "primary_meaning_vi" TEXT NOT NULL,
    "primary_meaning_en" TEXT,
    "common_mistakes_vi" TEXT,
    "related_words" JSONB,
    "frequency_rank" INTEGER,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_senses" (
    "id" UUID NOT NULL,
    "vocabulary_id" UUID NOT NULL,
    "part_of_speech" TEXT,
    "meaning_vi" TEXT NOT NULL,
    "meaning_en" TEXT,
    "usage_note_vi" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vocabulary_senses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_examples" (
    "id" UUID NOT NULL,
    "vocabulary_id" UUID NOT NULL,
    "sentence_zh" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "translation_vi" TEXT NOT NULL,
    "translation_en" TEXT,
    "audio_asset_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vocabulary_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_audio" (
    "id" UUID NOT NULL,
    "vocabulary_id" UUID NOT NULL,
    "media_asset_id" UUID NOT NULL,
    "speaker_label" TEXT,
    "speed_tag" TEXT NOT NULL DEFAULT 'normal',
    "is_primary" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "vocabulary_audio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_vocabulary" (
    "lesson_id" UUID NOT NULL,
    "vocabulary_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_core" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "lesson_vocabulary_pkey" PRIMARY KEY ("lesson_id","vocabulary_id")
);

-- CreateTable
CREATE TABLE "grammar_points" (
    "id" UUID NOT NULL,
    "learning_level_id" UUID,
    "code" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "pattern_zh" TEXT NOT NULL,
    "pattern_pinyin" TEXT,
    "explanation_vi" TEXT NOT NULL,
    "usage_notes_vi" TEXT,
    "comparisons_vi" TEXT,
    "common_errors_vi" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammar_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammar_examples" (
    "id" UUID NOT NULL,
    "grammar_point_id" UUID NOT NULL,
    "sentence_zh" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "translation_vi" TEXT NOT NULL,
    "note_vi" TEXT,
    "is_incorrect" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "grammar_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_grammar" (
    "lesson_id" UUID NOT NULL,
    "grammar_point_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lesson_grammar_pkey" PRIMARY KEY ("lesson_id","grammar_point_id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" UUID NOT NULL,
    "hanzi" TEXT NOT NULL,
    "traditional" TEXT,
    "pinyin" TEXT NOT NULL,
    "radical" TEXT,
    "stroke_count" INTEGER NOT NULL,
    "meaning_vi" TEXT NOT NULL,
    "mnemonic_vi" TEXT,
    "decomposition" TEXT,
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_strokes" (
    "id" UUID NOT NULL,
    "character_id" UUID NOT NULL,
    "stroke_order" INTEGER NOT NULL,
    "svg_path" TEXT NOT NULL,
    "median_path" JSONB,
    "stroke_name" TEXT,

    CONSTRAINT "character_strokes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_characters" (
    "vocabulary_id" UUID NOT NULL,
    "character_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "vocabulary_characters_pkey" PRIMARY KEY ("vocabulary_id","character_id","position")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" UUID NOT NULL,
    "lesson_id" UUID,
    "title_vi" TEXT NOT NULL,
    "description_vi" TEXT,
    "skill_type" "SkillType" NOT NULL,
    "passing_percent" INTEGER NOT NULL DEFAULT 70,
    "time_limit_sec" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "exercise_id" UUID,
    "question_type" "QuestionType" NOT NULL,
    "skill_type" "SkillType" NOT NULL,
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "prompt_vi" TEXT,
    "prompt_zh" TEXT,
    "prompt_pinyin" TEXT,
    "passage_zh" TEXT,
    "passage_pinyin" TEXT,
    "audio_asset_id" UUID,
    "image_asset_id" UUID,
    "metadata" JSONB,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "option_key" TEXT NOT NULL,
    "label_zh" TEXT,
    "label_pinyin" TEXT,
    "label_vi" TEXT,
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_answers" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "accepted_payload" JSONB NOT NULL,
    "case_sensitive" BOOLEAN NOT NULL DEFAULT false,
    "rubric_notes_vi" TEXT,

    CONSTRAINT "question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_explanations" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "explanation_vi" TEXT NOT NULL,
    "grammar_ref_id" UUID,
    "vocab_ref_id" UUID,

    CONSTRAINT "question_explanations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_templates" (
    "id" UUID NOT NULL,
    "curriculum_version_id" UUID,
    "learning_level_id" UUID,
    "slug" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "description_vi" TEXT,
    "exam_type" "ExamType" NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "total_points" DOUBLE PRECISION NOT NULL,
    "passing_score" DOUBLE PRECISION NOT NULL,
    "scoring_rules" JSONB NOT NULL,
    "is_official_licensed" BOOLEAN NOT NULL DEFAULT false,
    "license_attribution" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_sections" (
    "id" UUID NOT NULL,
    "exam_template_id" UUID NOT NULL,
    "title_vi" TEXT NOT NULL,
    "skill_type" "SkillType" NOT NULL,
    "instructions_vi" TEXT,
    "duration_seconds" INTEGER,
    "section_points" DOUBLE PRECISION NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "exam_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_section_questions" (
    "exam_section_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "points_override" DOUBLE PRECISION,

    CONSTRAINT "exam_section_questions_pkey" PRIMARY KEY ("exam_section_id","question_id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "exam_template_id" UUID NOT NULL,
    "status" "ExamAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "config_snapshot" JSONB NOT NULL,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_answers" (
    "id" UUID NOT NULL,
    "exam_attempt_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "response_payload" JSONB,
    "is_marked_review" BOOLEAN NOT NULL DEFAULT false,
    "is_correct" BOOLEAN,
    "points_awarded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "answered_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_results" (
    "id" UUID NOT NULL,
    "exam_attempt_id" UUID NOT NULL,
    "total_score" DOUBLE PRECISION NOT NULL,
    "max_score" DOUBLE PRECISION NOT NULL,
    "accuracy_percent" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "correct_count" INTEGER NOT NULL,
    "incorrect_count" INTEGER NOT NULL,
    "unanswered_count" INTEGER NOT NULL,
    "skill_breakdown" JSONB NOT NULL,
    "recommended_revision_vi" JSONB NOT NULL,
    "recommended_level_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_decks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcards" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "deck_id" UUID NOT NULL,
    "front_zh" TEXT NOT NULL,
    "front_pinyin" TEXT,
    "back_vi" TEXT NOT NULL,
    "example_zh" TEXT,
    "example_vi" TEXT,
    "notes_vi" TEXT,
    "audio_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_suspended" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_sources" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "flashcard_id" UUID NOT NULL,
    "source_type" "FlashcardSourceType" NOT NULL,
    "source_entity_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcard_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_states" (
    "id" UUID NOT NULL,
    "flashcard_id" UUID NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "elapsed_days" INTEGER NOT NULL DEFAULT 0,
    "scheduled_days" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "state" "FsrsCardState" NOT NULL DEFAULT 'NEW',
    "due_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_review_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_reviews" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "flashcard_id" UUID NOT NULL,
    "rating" "ReviewRating" NOT NULL,
    "state_before" "FsrsCardState" NOT NULL,
    "state_after" "FsrsCardState" NOT NULL,
    "stability_after" DOUBLE PRECISION NOT NULL,
    "difficulty_after" DOUBLE PRECISION NOT NULL,
    "scheduled_days" INTEGER NOT NULL,
    "duration_ms" INTEGER,
    "client_mutation_id" TEXT,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcard_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_course_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "completed_lessons" INTEGER NOT NULL DEFAULT 0,
    "total_lessons" INTEGER NOT NULL DEFAULT 0,
    "progress_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_course_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_lesson_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "status" "LessonProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completed_sections" JSONB NOT NULL DEFAULT '[]',
    "last_score_percent" DOUBLE PRECISION,
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "skipped_via_test" BOOLEAN NOT NULL DEFAULT false,
    "last_accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_exercise_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "max_score" DOUBLE PRECISION NOT NULL,
    "accuracy_percent" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers_snapshot" JSONB NOT NULL,
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "client_mutation_id" TEXT,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_exercise_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_vocabulary_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "vocabulary_id" UUID NOT NULL,
    "mastery_level" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "incorrect_count" INTEGER NOT NULL DEFAULT 0,
    "is_bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "last_seen_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_vocabulary_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skill_stats" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "skill_type" "SkillType" NOT NULL,
    "mastery_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "attempts_count" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "total_time_sec" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_skill_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "module_type" TEXT NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "items_completed" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3) NOT NULL,
    "client_mutation_id" TEXT,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "mode" "AiConversationMode" NOT NULL,
    "topic" TEXT,
    "learner_level" TEXT,
    "title" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "structured_data" JSONB,
    "provider_name" TEXT,
    "model_name" TEXT,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_submissions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "lesson_id" UUID,
    "parent_submission_id" UUID,
    "revision_number" INTEGER NOT NULL DEFAULT 1,
    "task_type" "WritingTaskType" NOT NULL,
    "prompt_text" TEXT,
    "submitted_text" TEXT NOT NULL,
    "character_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "writing_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_feedback" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "corrected_version_zh" TEXT NOT NULL,
    "grammar_issues" JSONB NOT NULL,
    "vocab_suggestions" JSONB NOT NULL,
    "naturalness_feedback" TEXT NOT NULL,
    "overall_explanation_vi" TEXT NOT NULL,
    "recommendations_vi" JSONB NOT NULL,
    "provider_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "writing_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pronunciation_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_text_zh" TEXT NOT NULL,
    "target_pinyin" TEXT NOT NULL,
    "reference_audio_url" TEXT,
    "recording_asset_id" UUID,
    "duration_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pronunciation_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pronunciation_feedback" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "evaluation_mode" TEXT NOT NULL,
    "recognized_transcript_zh" TEXT,
    "transcript_match_percent" DOUBLE PRECISION,
    "tone_scoring_supported" BOOLEAN NOT NULL DEFAULT false,
    "tone_score_payload" JSONB,
    "feedback_vi" TEXT NOT NULL,
    "limitation_notice_vi" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pronunciation_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "body_vi" TEXT NOT NULL,
    "action_url" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "uploaded_by_id" UUID,
    "media_type" "MediaType" NOT NULL,
    "storage_key" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "duration_ms" INTEGER,
    "checksum_sha" TEXT,
    "origin" "ContentOrigin" NOT NULL DEFAULT 'VERIFIED_ORIGINAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "is_secret" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "updated_by_id" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "content_audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "before_data" JSONB,
    "after_data" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_sync_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "client_mutation_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "operation_type" TEXT NOT NULL,
    "status" "SyncOperationStatus" NOT NULL,
    "conflict_detail" JSONB,
    "client_timestamp" TIMESTAMP(3) NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offline_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_import_jobs" (
    "id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'PENDING',
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "imported_rows" INTEGER NOT NULL DEFAULT 0,
    "error_report" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "content_import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_versions_code_key" ON "curriculum_versions"("code");

-- CreateIndex
CREATE INDEX "curriculum_versions_framework_status_idx" ON "curriculum_versions"("framework", "status");

-- CreateIndex
CREATE INDEX "learning_levels_curriculum_version_id_sort_order_idx" ON "learning_levels"("curriculum_version_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "learning_levels_curriculum_version_id_code_key" ON "learning_levels"("curriculum_version_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_learning_level_id_sort_order_idx" ON "courses"("learning_level_id", "sort_order");

-- CreateIndex
CREATE INDEX "modules_course_id_sort_order_idx" ON "modules"("course_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "modules_course_id_slug_key" ON "modules"("course_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");

-- CreateIndex
CREATE INDEX "lessons_module_id_sort_order_idx" ON "lessons"("module_id", "sort_order");

-- CreateIndex
CREATE INDEX "lessons_status_idx" ON "lessons"("status");

-- CreateIndex
CREATE INDEX "lesson_sections_lesson_id_sort_order_idx" ON "lesson_sections"("lesson_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_sections_lesson_id_section_type_sort_order_key" ON "lesson_sections"("lesson_id", "section_type", "sort_order");

-- CreateIndex
CREATE INDEX "learning_resources_lesson_id_idx" ON "learning_resources"("lesson_id");

-- CreateIndex
CREATE INDEX "vocabulary_learning_level_id_idx" ON "vocabulary"("learning_level_id");

-- CreateIndex
CREATE INDEX "vocabulary_simplified_idx" ON "vocabulary"("simplified");

-- CreateIndex
CREATE INDEX "vocabulary_pinyin_numbered_idx" ON "vocabulary"("pinyin_numbered");

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_simplified_pinyin_key" ON "vocabulary"("simplified", "pinyin");

-- CreateIndex
CREATE INDEX "vocabulary_senses_vocabulary_id_idx" ON "vocabulary_senses"("vocabulary_id");

-- CreateIndex
CREATE INDEX "vocabulary_examples_vocabulary_id_idx" ON "vocabulary_examples"("vocabulary_id");

-- CreateIndex
CREATE INDEX "vocabulary_audio_vocabulary_id_idx" ON "vocabulary_audio"("vocabulary_id");

-- CreateIndex
CREATE INDEX "lesson_vocabulary_vocabulary_id_idx" ON "lesson_vocabulary"("vocabulary_id");

-- CreateIndex
CREATE UNIQUE INDEX "grammar_points_code_key" ON "grammar_points"("code");

-- CreateIndex
CREATE INDEX "grammar_points_learning_level_id_idx" ON "grammar_points"("learning_level_id");

-- CreateIndex
CREATE INDEX "grammar_examples_grammar_point_id_idx" ON "grammar_examples"("grammar_point_id");

-- CreateIndex
CREATE INDEX "lesson_grammar_grammar_point_id_idx" ON "lesson_grammar"("grammar_point_id");

-- CreateIndex
CREATE UNIQUE INDEX "characters_hanzi_key" ON "characters"("hanzi");

-- CreateIndex
CREATE UNIQUE INDEX "character_strokes_character_id_stroke_order_key" ON "character_strokes"("character_id", "stroke_order");

-- CreateIndex
CREATE INDEX "exercises_lesson_id_sort_order_idx" ON "exercises"("lesson_id", "sort_order");

-- CreateIndex
CREATE INDEX "questions_exercise_id_sort_order_idx" ON "questions"("exercise_id", "sort_order");

-- CreateIndex
CREATE INDEX "questions_skill_type_question_type_status_idx" ON "questions"("skill_type", "question_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "question_options_question_id_option_key_key" ON "question_options"("question_id", "option_key");

-- CreateIndex
CREATE INDEX "question_answers_question_id_idx" ON "question_answers"("question_id");

-- CreateIndex
CREATE INDEX "question_explanations_question_id_idx" ON "question_explanations"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_templates_slug_key" ON "exam_templates"("slug");

-- CreateIndex
CREATE INDEX "exam_templates_exam_type_status_idx" ON "exam_templates"("exam_type", "status");

-- CreateIndex
CREATE INDEX "exam_templates_curriculum_version_id_learning_level_id_idx" ON "exam_templates"("curriculum_version_id", "learning_level_id");

-- CreateIndex
CREATE INDEX "exam_sections_exam_template_id_sort_order_idx" ON "exam_sections"("exam_template_id", "sort_order");

-- CreateIndex
CREATE INDEX "exam_section_questions_exam_section_id_sort_order_idx" ON "exam_section_questions"("exam_section_id", "sort_order");

-- CreateIndex
CREATE INDEX "exam_attempts_user_id_started_at_idx" ON "exam_attempts"("user_id", "started_at");

-- CreateIndex
CREATE INDEX "exam_attempts_exam_template_id_idx" ON "exam_attempts"("exam_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_answers_exam_attempt_id_question_id_key" ON "exam_answers"("exam_attempt_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_exam_attempt_id_key" ON "exam_results"("exam_attempt_id");

-- CreateIndex
CREATE INDEX "flashcard_decks_user_id_idx" ON "flashcard_decks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "flashcard_decks_user_id_name_key" ON "flashcard_decks"("user_id", "name");

-- CreateIndex
CREATE INDEX "flashcards_user_id_deck_id_idx" ON "flashcards"("user_id", "deck_id");

-- CreateIndex
CREATE UNIQUE INDEX "flashcard_sources_flashcard_id_key" ON "flashcard_sources"("flashcard_id");

-- CreateIndex
CREATE UNIQUE INDEX "flashcard_sources_user_id_source_type_source_entity_id_key" ON "flashcard_sources"("user_id", "source_type", "source_entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "flashcard_states_flashcard_id_key" ON "flashcard_states"("flashcard_id");

-- CreateIndex
CREATE INDEX "flashcard_states_due_at_state_idx" ON "flashcard_states"("due_at", "state");

-- CreateIndex
CREATE UNIQUE INDEX "flashcard_reviews_client_mutation_id_key" ON "flashcard_reviews"("client_mutation_id");

-- CreateIndex
CREATE INDEX "flashcard_reviews_user_id_reviewed_at_idx" ON "flashcard_reviews"("user_id", "reviewed_at");

-- CreateIndex
CREATE INDEX "flashcard_reviews_flashcard_id_idx" ON "flashcard_reviews"("flashcard_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_course_progress_user_id_course_id_key" ON "user_course_progress"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "user_lesson_progress_user_id_status_idx" ON "user_lesson_progress"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_lesson_progress_user_id_lesson_id_key" ON "user_lesson_progress"("user_id", "lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_exercise_attempts_client_mutation_id_key" ON "user_exercise_attempts"("client_mutation_id");

-- CreateIndex
CREATE INDEX "user_exercise_attempts_user_id_exercise_id_idx" ON "user_exercise_attempts"("user_id", "exercise_id");

-- CreateIndex
CREATE INDEX "user_vocabulary_progress_user_id_mastery_level_idx" ON "user_vocabulary_progress"("user_id", "mastery_level");

-- CreateIndex
CREATE UNIQUE INDEX "user_vocabulary_progress_user_id_vocabulary_id_key" ON "user_vocabulary_progress"("user_id", "vocabulary_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_skill_stats_user_id_skill_type_key" ON "user_skill_stats"("user_id", "skill_type");

-- CreateIndex
CREATE UNIQUE INDEX "study_sessions_client_mutation_id_key" ON "study_sessions"("client_mutation_id");

-- CreateIndex
CREATE INDEX "study_sessions_user_id_started_at_idx" ON "study_sessions"("user_id", "started_at");

-- CreateIndex
CREATE INDEX "ai_conversations_user_id_deleted_at_updated_at_idx" ON "ai_conversations"("user_id", "deleted_at", "updated_at");

-- CreateIndex
CREATE INDEX "ai_messages_conversation_id_created_at_idx" ON "ai_messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "writing_submissions_user_id_created_at_idx" ON "writing_submissions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "writing_feedback_submission_id_idx" ON "writing_feedback"("submission_id");

-- CreateIndex
CREATE INDEX "pronunciation_attempts_user_id_created_at_idx" ON "pronunciation_attempts"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "pronunciation_feedback_attempt_id_idx" ON "pronunciation_feedback"("attempt_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_created_at_idx" ON "notifications"("user_id", "read_at", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_storage_key_key" ON "media_assets"("storage_key");

-- CreateIndex
CREATE INDEX "media_assets_media_type_idx" ON "media_assets"("media_type");

-- CreateIndex
CREATE INDEX "content_audit_logs_entity_type_entity_id_idx" ON "content_audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "content_audit_logs_actor_id_created_at_idx" ON "content_audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "offline_sync_logs_client_mutation_id_key" ON "offline_sync_logs"("client_mutation_id");

-- CreateIndex
CREATE INDEX "offline_sync_logs_user_id_processed_at_idx" ON "offline_sync_logs"("user_id", "processed_at");

-- CreateIndex
CREATE INDEX "content_import_jobs_created_by_id_started_at_idx" ON "content_import_jobs"("created_by_id", "started_at");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_current_curriculum_version_id_fkey" FOREIGN KEY ("current_curriculum_version_id") REFERENCES "curriculum_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_current_level_id_fkey" FOREIGN KEY ("current_level_id") REFERENCES "learning_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_target_level_id_fkey" FOREIGN KEY ("target_level_id") REFERENCES "learning_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_levels" ADD CONSTRAINT "learning_levels_curriculum_version_id_fkey" FOREIGN KEY ("curriculum_version_id") REFERENCES "curriculum_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_learning_level_id_fkey" FOREIGN KEY ("learning_level_id") REFERENCES "learning_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_sections" ADD CONSTRAINT "lesson_sections_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_sections" ADD CONSTRAINT "lesson_sections_audio_asset_id_fkey" FOREIGN KEY ("audio_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_prerequisites" ADD CONSTRAINT "lesson_prerequisites_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_prerequisites" ADD CONSTRAINT "lesson_prerequisites_prerequisite_lesson_id_fkey" FOREIGN KEY ("prerequisite_lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_resources" ADD CONSTRAINT "learning_resources_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_resources" ADD CONSTRAINT "learning_resources_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary" ADD CONSTRAINT "vocabulary_learning_level_id_fkey" FOREIGN KEY ("learning_level_id") REFERENCES "learning_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_senses" ADD CONSTRAINT "vocabulary_senses_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_examples" ADD CONSTRAINT "vocabulary_examples_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_examples" ADD CONSTRAINT "vocabulary_examples_audio_asset_id_fkey" FOREIGN KEY ("audio_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_audio" ADD CONSTRAINT "vocabulary_audio_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_audio" ADD CONSTRAINT "vocabulary_audio_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_vocabulary" ADD CONSTRAINT "lesson_vocabulary_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_vocabulary" ADD CONSTRAINT "lesson_vocabulary_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_points" ADD CONSTRAINT "grammar_points_learning_level_id_fkey" FOREIGN KEY ("learning_level_id") REFERENCES "learning_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_examples" ADD CONSTRAINT "grammar_examples_grammar_point_id_fkey" FOREIGN KEY ("grammar_point_id") REFERENCES "grammar_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_grammar" ADD CONSTRAINT "lesson_grammar_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_grammar" ADD CONSTRAINT "lesson_grammar_grammar_point_id_fkey" FOREIGN KEY ("grammar_point_id") REFERENCES "grammar_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_strokes" ADD CONSTRAINT "character_strokes_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_characters" ADD CONSTRAINT "vocabulary_characters_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_characters" ADD CONSTRAINT "vocabulary_characters_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_audio_asset_id_fkey" FOREIGN KEY ("audio_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_image_asset_id_fkey" FOREIGN KEY ("image_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_explanations" ADD CONSTRAINT "question_explanations_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_templates" ADD CONSTRAINT "exam_templates_curriculum_version_id_fkey" FOREIGN KEY ("curriculum_version_id") REFERENCES "curriculum_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_templates" ADD CONSTRAINT "exam_templates_learning_level_id_fkey" FOREIGN KEY ("learning_level_id") REFERENCES "learning_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sections" ADD CONSTRAINT "exam_sections_exam_template_id_fkey" FOREIGN KEY ("exam_template_id") REFERENCES "exam_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_section_questions" ADD CONSTRAINT "exam_section_questions_exam_section_id_fkey" FOREIGN KEY ("exam_section_id") REFERENCES "exam_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_section_questions" ADD CONSTRAINT "exam_section_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_exam_template_id_fkey" FOREIGN KEY ("exam_template_id") REFERENCES "exam_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_answers" ADD CONSTRAINT "exam_answers_exam_attempt_id_fkey" FOREIGN KEY ("exam_attempt_id") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_answers" ADD CONSTRAINT "exam_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_exam_attempt_id_fkey" FOREIGN KEY ("exam_attempt_id") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_decks" ADD CONSTRAINT "flashcard_decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "flashcard_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_sources" ADD CONSTRAINT "flashcard_sources_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_states" ADD CONSTRAINT "flashcard_states_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course_progress" ADD CONSTRAINT "user_course_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course_progress" ADD CONSTRAINT "user_course_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exercise_attempts" ADD CONSTRAINT "user_exercise_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exercise_attempts" ADD CONSTRAINT "user_exercise_attempts_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_vocabulary_progress" ADD CONSTRAINT "user_vocabulary_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_vocabulary_progress" ADD CONSTRAINT "user_vocabulary_progress_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skill_stats" ADD CONSTRAINT "user_skill_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_submissions" ADD CONSTRAINT "writing_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_submissions" ADD CONSTRAINT "writing_submissions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_submissions" ADD CONSTRAINT "writing_submissions_parent_submission_id_fkey" FOREIGN KEY ("parent_submission_id") REFERENCES "writing_submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_feedback" ADD CONSTRAINT "writing_feedback_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "writing_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_attempts" ADD CONSTRAINT "pronunciation_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_attempts" ADD CONSTRAINT "pronunciation_attempts_recording_asset_id_fkey" FOREIGN KEY ("recording_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_feedback" ADD CONSTRAINT "pronunciation_feedback_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "pronunciation_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_audit_logs" ADD CONSTRAINT "content_audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offline_sync_logs" ADD CONSTRAINT "offline_sync_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_import_jobs" ADD CONSTRAINT "content_import_jobs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
