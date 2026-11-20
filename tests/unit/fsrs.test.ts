import { describe, expect, it } from "vitest";
import {
  previewRatingIntervals,
  scheduleFlashcardReview,
} from "@/modules/flashcards/fsrs.service";

describe("FSRS Spaced Repetition Engine", () => {
  const baseDate = new Date("2026-11-20T04:00:00.000Z");

  it("schedules a NEW card with increasing intervals across AGAIN < HARD <= GOOD <= EASY", () => {
    const again = scheduleFlashcardReview(null, "AGAIN", baseDate);
    const hard = scheduleFlashcardReview(null, "HARD", baseDate);
    const good = scheduleFlashcardReview(null, "GOOD", baseDate);
    const easy = scheduleFlashcardReview(null, "EASY", baseDate);

    expect(again.reps).toBe(1);
    expect(easy.dueAt.getTime()).toBeGreaterThanOrEqual(good.dueAt.getTime());
    expect(good.dueAt.getTime()).toBeGreaterThanOrEqual(hard.dueAt.getTime());
    expect(hard.dueAt.getTime()).toBeGreaterThanOrEqual(again.dueAt.getTime());
    expect(easy.stability).toBeGreaterThan(again.stability);
  });

  it("updates stability and difficulty across subsequent reviews", () => {
    const first = scheduleFlashcardReview(null, "GOOD", baseDate);
    const secondDate = new Date(first.dueAt.getTime() + 60_000);
    const second = scheduleFlashcardReview(first, "GOOD", secondDate);

    expect(second.reps).toBe(2);
    expect(second.dueAt.getTime()).toBeGreaterThan(secondDate.getTime());
  });

  it("returns localized Vietnamese interval preview labels for all 4 ratings", () => {
    const previews = previewRatingIntervals(null, baseDate);
    expect(previews.AGAIN).toMatch(/phút|giờ|ngày/);
    expect(previews.HARD).toMatch(/phút|giờ|ngày/);
    expect(previews.GOOD).toMatch(/phút|giờ|ngày/);
    expect(previews.EASY).toMatch(/phút|giờ|ngày/);
  });
});
