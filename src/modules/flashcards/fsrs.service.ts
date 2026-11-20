import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade,
} from "ts-fsrs";
import type { FsrsCardState, ReviewRating } from "@prisma/client";

const scheduler = fsrs(
  generatorParameters({
    enable_fuzz: false,
    maximum_interval: 36500,
  })
);

export interface StoredFsrsState {
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: FsrsCardState;
  dueAt: Date;
  lastReviewAt: Date | null;
}

export interface ComputedFsrsResult {
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: FsrsCardState;
  dueAt: Date;
  lastReviewAt: Date;
}

function toTsFsrsState(state: FsrsCardState): State {
  switch (state) {
    case "NEW":
      return State.New;
    case "LEARNING":
      return State.Learning;
    case "REVIEW":
      return State.Review;
    case "RELEARNING":
      return State.Relearning;
  }
}

function fromTsFsrsState(state: State): FsrsCardState {
  switch (state) {
    case State.New:
      return "NEW";
    case State.Learning:
      return "LEARNING";
    case State.Review:
      return "REVIEW";
    case State.Relearning:
      return "RELEARNING";
  }
}

function toTsFsrsGrade(rating: ReviewRating): Grade {
  switch (rating) {
    case "AGAIN":
      return Rating.Again;
    case "HARD":
      return Rating.Hard;
    case "GOOD":
      return Rating.Good;
    case "EASY":
      return Rating.Easy;
  }
}

function hydrateCard(stored: StoredFsrsState | null, now: Date): Card {
  if (!stored || stored.reps === 0) {
    return createEmptyCard(now);
  }
  return {
    due: stored.dueAt,
    stability: stored.stability,
    difficulty: stored.difficulty,
    scheduled_days: stored.scheduledDays,
    learning_steps: 0,
    reps: stored.reps,
    lapses: stored.lapses,
    state: toTsFsrsState(stored.state),
    last_review: stored.lastReviewAt ?? undefined,
  };
}

export function scheduleFlashcardReview(
  stored: StoredFsrsState | null,
  rating: ReviewRating,
  now = new Date()
): ComputedFsrsResult {
  const card = hydrateCard(stored, now);
  const outcomes = scheduler.repeat(card, now);
  const nextCard = outcomes[toTsFsrsGrade(rating)].card;
  const elapsedDays = stored?.lastReviewAt
    ? Math.max(0, Math.round((now.getTime() - stored.lastReviewAt.getTime()) / 86400000))
    : 0;

  return {
    stability: Number(nextCard.stability.toFixed(4)),
    difficulty: Number(nextCard.difficulty.toFixed(4)),
    elapsedDays,
    scheduledDays: nextCard.scheduled_days,
    reps: nextCard.reps,
    lapses: nextCard.lapses,
    state: fromTsFsrsState(nextCard.state),
    dueAt: nextCard.due,
    lastReviewAt: now,
  };
}

export function previewRatingIntervals(
  stored: StoredFsrsState | null,
  now = new Date()
): Record<ReviewRating, string> {
  const ratings: ReviewRating[] = ["AGAIN", "HARD", "GOOD", "EASY"];
  const previews = {} as Record<ReviewRating, string>;

  for (const rating of ratings) {
    const res = scheduleFlashcardReview(stored, rating, now);
    const diffMinutes = Math.max(
      1,
      Math.round((res.dueAt.getTime() - now.getTime()) / 60000)
    );
    if (diffMinutes < 60) {
      previews[rating] = `${diffMinutes} phút`;
    } else if (diffMinutes < 60 * 24) {
      previews[rating] = `${Math.round(diffMinutes / 60)} giờ`;
    } else {
      previews[rating] = `${Math.max(1, res.scheduledDays)} ngày`;
    }
  }

  return previews;
}
