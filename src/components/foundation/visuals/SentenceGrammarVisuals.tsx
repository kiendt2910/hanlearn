"use client";

export function SentenceOrderDiagram({
  slots,
}: {
  slots: Array<{ labelVi: string; zh: string; pinyin: string; colorClass: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="mb-3 text-xs font-semibold text-foreground">
        Sơ đồ Trật tự Câu Tiếng Trung (Đọc từ trái sang phải)
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {slots.map((slot, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {idx > 0 ? <span className="text-sm font-bold text-muted-foreground">→</span> : null}
            <div className={`rounded-md border px-3 py-2 text-center ${slot.colorClass}`}>
              <div className="text-[11px] font-semibold opacity-80">{slot.labelVi}</div>
              <div lang="zh-Hans" className="font-hanzi mt-0.5 text-lg font-bold">
                {slot.zh}
              </div>
              <div className="font-pinyin text-[11px]">{slot.pinyin}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GrammarComparisonTable({
  rows,
}: {
  rows: Array<{
    vietnameseVi: string;
    wrongZh: string;
    correctZh: string;
    correctPinyin: string;
    reasonVi: string;
  }>;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-border bg-surface-muted text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Ý tiếng Việt</th>
            <th className="px-3 py-2">✗ Lỗi dịch từng chữ</th>
            <th className="px-3 py-2">✓ Cách nói tiếng Trung chuẩn</th>
            <th className="px-3 py-2">Vì sao?</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i} className="bg-surface">
              <td className="px-3 py-2.5 font-medium text-foreground">{r.vietnameseVi}</td>
              <td className="font-hanzi px-3 py-2.5 text-red-600 dark:text-red-400">
                {r.wrongZh}
              </td>
              <td className="px-3 py-2.5">
                <div lang="zh-Hans" className="font-hanzi text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  {r.correctZh}
                </div>
                <div className="font-pinyin text-[11px] text-primary">{r.correctPinyin}</div>
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">{r.reasonVi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
