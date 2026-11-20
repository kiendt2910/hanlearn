export function formatAnswerKeyHuman(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "—";
  const key = payload as {
    optionKey?: string;
    acceptedTexts?: string[];
    orderedTokens?: string[];
  };

  if (key.optionKey) {
    return `Phương án ${key.optionKey}`;
  }
  if (Array.isArray(key.orderedTokens) && key.orderedTokens.length > 0) {
    return key.orderedTokens.join(" ");
  }
  if (Array.isArray(key.acceptedTexts) && key.acceptedTexts.length > 0) {
    return key.acceptedTexts.join(" / ");
  }
  return "—";
}
