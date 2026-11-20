import { describe, expect, it } from "vitest";
import { QuestionType } from "@prisma/client";
import { evaluateQuestionResponse } from "@/modules/exercises/grading.service";
import { mergeLessonProgressMonotonically } from "@/modules/progress/progress.service";

describe("Server-side Exercise & Exam Grading Engine", () => {
  it("grades MULTIPLE_CHOICE and LISTENING_COMPREHENSION case-insensitively", () => {
    expect(
      evaluateQuestionResponse(
        QuestionType.MULTIPLE_CHOICE,
        { optionKey: "b" },
        [{ acceptedPayload: { optionKey: "B" }, caseSensitive: false }]
      )
    ).toBe(true);

    expect(
      evaluateQuestionResponse(
        QuestionType.LISTENING_COMPREHENSION,
        { optionKey: "A" },
        [{ acceptedPayload: { optionKey: "B" }, caseSensitive: false }]
      )
    ).toBe(false);
  });

  it("normalizes trailing Chinese punctuation on FILL_IN_BLANK and TRANSLATION", () => {
    expect(
      evaluateQuestionResponse(
        QuestionType.TRANSLATION,
        { text: "  我想喝茶。 " },
        [{ acceptedPayload: { acceptedTexts: ["我想喝茶"] }, caseSensitive: false }]
      )
    ).toBe(true);

    expect(
      evaluateQuestionResponse(
        QuestionType.FILL_IN_BLANK,
        { text: "吗" },
        [{ acceptedPayload: { acceptedTexts: ["吗", "ma"] }, caseSensitive: false }]
      )
    ).toBe(true);
  });

  it("grades SENTENCE_ORDERING strictly in token order", () => {
    expect(
      evaluateQuestionResponse(
        QuestionType.SENTENCE_ORDERING,
        { orderedTokens: ["我", "是", "越南", "学生"] },
        [
          {
            acceptedPayload: { orderedTokens: ["我", "是", "越南", "学生"] },
            caseSensitive: false,
          },
        ]
      )
    ).toBe(true);

    expect(
      evaluateQuestionResponse(
        QuestionType.SENTENCE_ORDERING,
        { orderedTokens: ["是", "我", "越南", "学生"] },
        [
          {
            acceptedPayload: { orderedTokens: ["我", "是", "越南", "学生"] },
            caseSensitive: false,
          },
        ]
      )
    ).toBe(false);
  });

  it("merges offline lesson progress monotonically without regressing COMPLETED", () => {
    const merged = mergeLessonProgressMonotonically(
      "COMPLETED",
      "IN_PROGRESS",
      ["OBJECTIVES", "VOCABULARY"],
      ["VOCABULARY", "GRAMMAR"]
    );
    expect(merged.status).toBe("COMPLETED");
    expect(merged.completedSections).toEqual(["OBJECTIVES", "VOCABULARY", "GRAMMAR"]);
  });
});
