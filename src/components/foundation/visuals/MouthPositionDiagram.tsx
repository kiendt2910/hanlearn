"use client";

export type ArticulationType =
  | "bilabial_unaspirated"
  | "bilabial_aspirated"
  | "alveolar_stop"
  | "velar"
  | "palatal"
  | "retroflex"
  | "dental_sibilant"
  | "rounded_u_umlaut"
  | "open_vowel";

const ARTICULATION_SPECS: Record<
  ArticulationType,
  {
    titleVi: string;
    lipLabel: string;
    tongueLabel: string;
    airLabel: string;
    tonguePath: string;
    airArrows: boolean;
    strongAir: boolean;
    highlightX: number;
    highlightY: number;
  }
> = {
  bilabial_unaspirated: {
    titleVi: "Âm hai môi KHÔNG bật hơi (b, m)",
    lipLabel: "1. Hai môi khép kín rồi mở nhẹ",
    tongueLabel: "2. Lưỡi đặt thấp, thả lỏng tự nhiên",
    airLabel: "3. Luồng hơi nhẹ, KHÔNG thổi mạnh",
    tonguePath: "M 55 118 Q 100 110 142 118",
    airArrows: true,
    strongAir: false,
    highlightX: 46,
    highlightY: 90,
  },
  bilabial_aspirated: {
    titleVi: "Âm hai môi BẬT HƠI MẠNH (p)",
    lipLabel: "1. Hai môi mím chặt giữ hơi",
    tongueLabel: "2. Lưỡi thả lỏng ở đáy miệng",
    airLabel: "3. Bật luồng hơi MẠNH ra ngoài (làm rung tờ giấy!)",
    tonguePath: "M 55 118 Q 100 110 142 118",
    airArrows: true,
    strongAir: true,
    highlightX: 46,
    highlightY: 90,
  },
  alveolar_stop: {
    titleVi: "Âm đầu lưỡi chạm chân răng trên (d, t, n, l)",
    lipLabel: "1. Môi hé tự nhiên",
    tongueLabel: "2. Đầu lưỡi chạm chắc chân răng cửa trên",
    airLabel: "3. d không bật hơi • t bật hơi mạnh • n thoát mũi",
    tonguePath: "M 64 78 Q 96 96 142 114",
    airArrows: true,
    strongAir: false,
    highlightX: 66,
    highlightY: 74,
  },
  velar: {
    titleVi: "Âm cuống lưỡi nâng lên ngạc mềm (g, k, h)",
    lipLabel: "1. Môi mở vừa tự nhiên",
    tongueLabel: "2. Cuống lưỡi nâng chạm vòm mềm phía sau",
    airLabel: "3. g không bật hơi • k bật mạnh • h ma sát nhẹ ở cổ họng",
    tonguePath: "M 60 118 Q 112 106 132 76",
    airArrows: true,
    strongAir: true,
    highlightX: 130,
    highlightY: 74,
  },
  palatal: {
    titleVi: "Âm mặt lưỡi áp ngạc cứng (j, q, x)",
    lipLabel: "1. Khóe môi hơi kéo ngang (như mỉm cười nhẹ)",
    tongueLabel: "2. Đầu lưỡi hạ sau răng dưới, MẶT lưỡi nâng áp vòm cứng",
    airLabel: "3. j không bật hơi • q bật mạnh • x xì hơi mượt",
    tonguePath: "M 58 110 Q 95 72 138 106",
    airArrows: true,
    strongAir: false,
    highlightX: 96,
    highlightY: 74,
  },
  retroflex: {
    titleVi: "Âm uốn đầu lưỡi lên vòm cứng (zh, ch, sh, r)",
    lipLabel: "1. Môi hơi tròn nhẹ về phía trước",
    tongueLabel: "2. Đầu lưỡi CONG ngược lên chạm vùng sau chân răng",
    airLabel: "3. zh không bật hơi • ch bật mạnh • sh/r xát liên tục",
    tonguePath: "M 86 72 Q 74 96 140 112",
    airArrows: true,
    strongAir: true,
    highlightX: 86,
    highlightY: 68,
  },
  dental_sibilant: {
    titleVi: "Âm đầu lưỡi phẳng chạm sau răng (z, c, s)",
    lipLabel: "1. Môi kéo ngang, KHÔNG tròn môi",
    tongueLabel: "2. Đầu lưỡi duỗi phẳng chạm mặt sau răng cửa trên",
    airLabel: "3. Luồng hơi lách qua khe răng: z nhẹ • c bật mạnh • s xì",
    tonguePath: "M 56 88 Q 96 100 142 114",
    airArrows: true,
    strongAir: false,
    highlightX: 56,
    highlightY: 88,
  },
  rounded_u_umlaut: {
    titleVi: "Khẩu hình tròn môi nhỏ đặc biệt cho ü",
    lipLabel: "1. Chu môi TRÒN NHỎ như đang huýt sáo (vị trí chữ u)",
    tongueLabel: "2. Giữ nguyên môi tròn, đặt lưỡi ở vị trí đọc âm 'i'",
    airLabel: "3. Phát âm đều, tuyệt đối không dẹt môi giữa chừng",
    tonguePath: "M 62 96 Q 94 78 138 108",
    airArrows: true,
    strongAir: false,
    highlightX: 46,
    highlightY: 92,
  },
  open_vowel: {
    titleVi: "Khẩu hình nguyên âm đơn (a, o, e)",
    lipLabel: "1. a mở rộng • o tròn môi • e kéo ngang nửa mở",
    tongueLabel: "2. Lưỡi hạ thấp (a) hoặc lùi nhẹ về sau (o, e)",
    airLabel: "3. Luồng hơi đi ra tự do không bị cản trở",
    tonguePath: "M 60 118 Q 100 114 140 114",
    airArrows: true,
    strongAir: false,
    highlightX: 100,
    highlightY: 96,
  },
};

export function MouthPositionDiagram({
  type,
  symbol,
}: {
  type: ArticulationType;
  symbol?: string;
}) {
  const spec = ARTICULATION_SPECS[type];

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-foreground">{spec.titleVi}</span>
        {symbol ? (
          <span className="font-pinyin rounded bg-accent px-2 py-0.5 text-sm font-bold text-accent-foreground">
            {symbol}
          </span>
        ) : null}
      </div>

      <div className="grid items-center gap-4 sm:grid-cols-12">
        <svg
          viewBox="0 0 210 145"
          role="img"
          aria-label={`Sơ đồ khẩu hình phát âm: ${spec.titleVi}`}
          className="h-36 w-full rounded-md border border-border bg-surface sm:col-span-5"
        >
          {/* Nasal cavity outline */}
          <path
            d="M 48 34 Q 105 22 152 46 L 152 132"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
          />
          {/* Upper palate / roof of mouth */}
          <path
            d="M 52 72 Q 95 54 138 72"
            fill="none"
            stroke="#64748B"
            strokeWidth="2.5"
          />
          {/* Upper & Lower teeth */}
          <rect x="52" y="72" width="7" height="10" rx="1.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
          <rect x="52" y="96" width="7" height="10" rx="1.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
          {/* Lips */}
          <path d="M 42 74 Q 48 80 46 86" fill="none" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          <path d="M 42 104 Q 48 98 46 92" fill="none" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          {/* Tongue */}
          <path
            d={spec.tonguePath}
            fill="none"
            stroke="#2563EB"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Articulation highlight zone */}
          <circle
            cx={spec.highlightX}
            cy={spec.highlightY}
            r="10"
            fill="#2563EB"
            fillOpacity="0.18"
            stroke="#1D4ED8"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          {/* Airflow arrow */}
          {spec.airArrows ? (
            <g stroke={spec.strongAir ? "#DC2626" : "#059669"} strokeWidth={spec.strongAir ? "2.5" : "1.8"}>
              <line x1="36" y1="89" x2="10" y2="89" />
              <polyline points="16,84 10,89 16,94" fill="none" />
              {spec.strongAir ? (
                <>
                  <line x1="36" y1="80" x2="14" y2="75" />
                  <line x1="36" y1="98" x2="14" y2="103" />
                </>
              ) : null}
            </g>
          ) : null}
          {/* Labels */}
          <text x="86" y="48" fontSize="8" fill="#64748B">Vòm miệng</text>
          <text x="98" y="132" fontSize="8" fill="#2563EB" fontWeight="600">Lưỡi</text>
          <text x="8" y="118" fontSize="7.5" fill={spec.strongAir ? "#DC2626" : "#059669"} fontWeight="600">
            {spec.strongAir ? "Hơi mạnh" : "Hơi nhẹ"}
          </text>
        </svg>

        <ul className="space-y-2 text-xs text-foreground sm:col-span-7">
          <li className="rounded bg-surface px-2.5 py-1.5 border border-border">
            {spec.lipLabel}
          </li>
          <li className="rounded bg-surface px-2.5 py-1.5 border border-border">
            {spec.tongueLabel}
          </li>
          <li className="rounded bg-surface px-2.5 py-1.5 border border-border">
            {spec.airLabel}
          </li>
        </ul>
      </div>
    </div>
  );
}
