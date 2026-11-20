import {
  ComponentRoleType,
  ContentOrigin,
  ContentStatus,
  ExamType,
  LessonSectionType,
  PrismaClient,
  QuestionType,
  SkillType,
} from "@prisma/client";

export async function seedZeroToChineseFoundation(prisma: PrismaClient) {
  const hsk2 = await prisma.curriculumVersion.findUniqueOrThrow({
    where: { code: "hsk-2.0-v1" },
  });

  const foundationLevel = await prisma.learningLevel.upsert({
    where: {
      curriculumVersionId_code: {
        curriculumVersionId: hsk2.id,
        code: "foundations",
      },
    },
    update: {
      titleVi: "Nền tảng Tiếng Trung từ Con số 0 (Zero-to-Chinese)",
      titleZh: "零基础汉语入门系统",
      descriptionVi:
        "Khóa nhập môn toàn diện gồm 8 chặng (Stage 0 → Stage 7) thiết kế riêng cho người Việt chưa từng học tiếng Trung: Pinyin, 4 thanh điệu, 8 nét cơ bản, 18 bộ thủ, từ vựng trực quan, ngữ pháp nền và ghép câu trước khi lên HSK 1.",
      objectivesVi: [
        "Hiểu bản chất chữ Hán, Giản thể vs Phồn thể, Pinyin và phương pháp tự học đúng ngay từ ngày đầu",
        "Làm chủ 21 thanh mẫu, 36 vận mẫu, 4 thanh điệu cơ bản, thanh nhẹ và quy tắc biến điệu",
        "Viết chuẩn 8 nét cơ bản, 6 quy tắc bút thuận và nhận diện 18 bộ thủ/thành phần cấu tạo chữ",
        "Ghép được câu khẳng định, phủ định, nghi vấn và vượt qua Đánh giá 6 trụ cột trước khi vào HSK 1",
      ],
      status: ContentStatus.PUBLISHED,
    },
    create: {
      curriculumVersionId: hsk2.id,
      code: "foundations",
      titleVi: "Nền tảng Tiếng Trung từ Con số 0 (Zero-to-Chinese)",
      titleZh: "零基础汉语入门系统",
      descriptionVi: "Khóa nhập môn toàn diện từ con số 0 cho người Việt.",
      sortOrder: 1,
      cefrEquivalent: "Pre-A1",
      status: ContentStatus.PUBLISHED,
      origin: ContentOrigin.VERIFIED_ORIGINAL,
    },
  });

  // ---------------------------------------------------------------------------
  // 1. Seed all 18 Verified Radicals & Components
  // ---------------------------------------------------------------------------
  const radicalsData: Array<{
    symbol: string;
    variants: string[];
    pinyin: string;
    nameVi: string;
    meaningVi: string;
    roleType: ComponentRoleType;
    categoryVi: string;
    commonPositionVi: string;
    recognitionTipVi: string;
    exampleCharacters: Array<{ hanzi: string; pinyin: string; meaningVi: string }>;
  }> = [
    { symbol: "人", variants: ["亻"], pinyin: "rén", nameVi: "Bộ Nhân (Người)", meaningVi: "Con người, hành động của con người", roleType: "SEMANTIC", categoryVi: "Con người", commonPositionVi: "Bên trái (dạng 亻) hoặc bên trên", recognitionTipVi: "Dạng biến thể 亻 đứng bên trái rất phổ biến trong các đại từ và động từ chỉ người.", exampleCharacters: [{ hanzi: "你", pinyin: "nǐ", meaningVi: "bạn" }, { hanzi: "休", pinyin: "xiū", meaningVi: "nghỉ ngơi" }, { hanzi: "他", pinyin: "tā", meaningVi: "anh ấy" }] },
    { symbol: "口", variants: [], pinyin: "kǒu", nameVi: "Bộ Khẩu (Miệng)", meaningVi: "Miệng, ăn uống, nói năng, âm thanh", roleType: "SEMANTIC", categoryVi: "Con người", commonPositionVi: "Bên trái, bên trên hoặc bên dưới", recognitionTipVi: "Cũng hay dùng làm bộ gợi nghĩa cho trợ từ ngữ khí như 吗, 呢.", exampleCharacters: [{ hanzi: "吃", pinyin: "chī", meaningVi: "ăn" }, { hanzi: "喝", pinyin: "hē", meaningVi: "uống" }, { hanzi: "叫", pinyin: "jiào", meaningVi: "tên là / gọi" }] },
    { symbol: "女", variants: [], pinyin: "nǚ", nameVi: "Bộ Nữ (Phụ nữ)", meaningVi: "Phụ nữ, người thân nữ, vẻ đẹp", roleType: "SEMANTIC", categoryVi: "Con người", commonPositionVi: "Bên trái hoặc bên dưới", recognitionTipVi: "Trong 妈 (mẹ), 女 gợi nghĩa phụ nữ còn 马 chỉ gợi âm đọc.", exampleCharacters: [{ hanzi: "好", pinyin: "hǎo", meaningVi: "tốt" }, { hanzi: "妈", pinyin: "mā", meaningVi: "mẹ" }, { hanzi: "她", pinyin: "tā", meaningVi: "cô ấy" }] },
    { symbol: "子", variants: [], pinyin: "zǐ", nameVi: "Bộ Tử (Con nhỏ)", meaningVi: "Đứa trẻ, con cái, hậu tố danh từ", roleType: "BOTH", categoryVi: "Con người", commonPositionVi: "Bên phải, bên trái hoặc bên dưới", recognitionTipVi: "Đứng cuối từ hay đọc thanh nhẹ (zi) như trong 名字 (tên), 桌子 (cái bàn).", exampleCharacters: [{ hanzi: "好", pinyin: "hǎo", meaningVi: "tốt" }, { hanzi: "字", pinyin: "zì", meaningVi: "chữ viết" }, { hanzi: "学", pinyin: "xué", meaningVi: "học" }] },
    { symbol: "手", variants: ["扌"], pinyin: "shǒu", nameVi: "Bộ Thủ (Bàn tay)", meaningVi: "Động tác bằng tay", roleType: "SEMANTIC", categoryVi: "Con người", commonPositionVi: "Bên trái (dạng 扌 — Tài gẩy)", recognitionTipVi: "Khi ghép bên trái thu gọn thành 3 nét 扌 (ngang, sổ móc, hất).", exampleCharacters: [{ hanzi: "打", pinyin: "dǎ", meaningVi: "đánh / gọi điện" }, { hanzi: "找", pinyin: "zhǎo", meaningVi: "tìm" }] },
    { symbol: "心", variants: ["忄"], pinyin: "xīn", nameVi: "Bộ Tâm (Trái tim)", meaningVi: "Cảm xúc, suy nghĩ, tâm trạng", roleType: "SEMANTIC", categoryVi: "Con người", commonPositionVi: "Bên dưới (心) hoặc bên trái (忄 — Tâm đứng)", recognitionTipVi: "Hầu hết động từ/tính từ cảm xúc đều chứa 心 ở đáy hoặc 忄 bên trái.", exampleCharacters: [{ hanzi: "想", pinyin: "xiǎng", meaningVi: "muốn / nhớ" }, { hanzi: "忙", pinyin: "máng", meaningVi: "bận rộn" }, { hanzi: "您", pinyin: "nín", meaningVi: "ngài (kính ngữ)" }] },
    { symbol: "足", variants: ["⻊"], pinyin: "zú", nameVi: "Bộ Túc (Bàn chân)", meaningVi: "Chân, di chuyển, chạy nhảy", roleType: "SEMANTIC", categoryVi: "Con người", commonPositionVi: "Bên trái (dạng ⻊)", recognitionTipVi: "Nhận diện qua ô 口 nhỏ phía trên nét đứng khi ghép bên trái.", exampleCharacters: [{ hanzi: "跑", pinyin: "pǎo", meaningVi: "chạy" }, { hanzi: "路", pinyin: "lù", meaningVi: "con đường" }] },
    { symbol: "日", variants: [], pinyin: "rì", nameVi: "Bộ Nhật (Mặt trời)", meaningVi: "Mặt trời, ánh sáng, thời gian, ngày", roleType: "SEMANTIC", categoryVi: "Thiên nhiên", commonPositionVi: "Bên trái hoặc bên trên", recognitionTipVi: "Hình chữ nhật thon dọc có 1 nét ngang ở giữa (khác với 口 rỗng).", exampleCharacters: [{ hanzi: "明", pinyin: "míng", meaningVi: "sáng / ngày mai" }, { hanzi: "时", pinyin: "shí", meaningVi: "thời gian" }] },
    { symbol: "月", variants: [], pinyin: "yuè", nameVi: "Bộ Nguyệt (Trăng / Cơ thể)", meaningVi: "Mặt trăng, tháng; hoặc biến thể bộ Nhục (cơ thể)", roleType: "SEMANTIC", categoryVi: "Thiên nhiên", commonPositionVi: "Bên trái hoặc bên phải", recognitionTipVi: "Lưu ý quan trọng: Trong 明 nghĩa là trăng, nhưng trong 脸 (mặt), 脚 (chân) lại chỉ bộ phận cơ thể!", exampleCharacters: [{ hanzi: "明", pinyin: "míng", meaningVi: "sáng" }, { hanzi: "朋", pinyin: "péng", meaningVi: "bạn bè" }] },
    { symbol: "木", variants: [], pinyin: "mù", nameVi: "Bộ Mộc (Cây gỗ)", meaningVi: "Cây cối, vật làm bằng gỗ", roleType: "SEMANTIC", categoryVi: "Thiên nhiên", commonPositionVi: "Bên trái, bên dưới hoặc độc lập", recognitionTipVi: "Khi đứng bên trái, nét mác cuối thu gọn thành nét chấm gọn (林, 休).", exampleCharacters: [{ hanzi: "休", pinyin: "xiū", meaningVi: "nghỉ ngơi" }, { hanzi: "林", pinyin: "lín", meaningVi: "rừng" }, { hanzi: "桌", pinyin: "zhuō", meaningVi: "cái bàn" }] },
    { symbol: "水", variants: ["氵"], pinyin: "shuǐ", nameVi: "Bộ Thủy (Nước)", meaningVi: "Nước, chất lỏng, dòng chảy", roleType: "SEMANTIC", categoryVi: "Thiên nhiên", commonPositionVi: "Bên trái (dạng 氵 — Ba chấm thủy)", recognitionTipVi: "Biến thể 氵 gồm 2 chấm + 1 nét hất đi lên.", exampleCharacters: [{ hanzi: "河", pinyin: "hé", meaningVi: "dòng sông" }, { hanzi: "汉", pinyin: "hàn", meaningVi: "Hán (Hán ngữ)" }] },
    { symbol: "火", variants: ["灬"], pinyin: "huǒ", nameVi: "Bộ Hỏa (Lửa)", meaningVi: "Lửa, nhiệt độ, nấu nướng", roleType: "SEMANTIC", categoryVi: "Thiên nhiên", commonPositionVi: "Bên trái (火) hoặc bên dưới (灬 — 4 chấm hỏa)", recognitionTipVi: "4 chấm ở đáy chữ 热 (nóng), 点 (giờ/chấm) là biến thể của lửa.", exampleCharacters: [{ hanzi: "热", pinyin: "rè", meaningVi: "nóng" }, { hanzi: "炒", pinyin: "chǎo", meaningVi: "xào" }] },
    { symbol: "土", variants: [], pinyin: "tǔ", nameVi: "Bộ Thổ (Đất)", meaningVi: "Đất đai, địa điểm, xây dựng", roleType: "SEMANTIC", categoryVi: "Thiên nhiên", commonPositionVi: "Bên trái hoặc bên dưới", recognitionTipVi: "Nét ngang dưới dài hơn nét ngang trên (khác với 士 trên dài dưới ngắn).", exampleCharacters: [{ hanzi: "地", pinyin: "dì", meaningVi: "đất / nơi" }, { hanzi: "坐", pinyin: "zuò", meaningVi: "ngồi" }] },
    { symbol: "艹", variants: [], pinyin: "cǎo", nameVi: "Bộ Thảo đầu (Cỏ cây)", meaningVi: "Thực vật, hoa lá, trà, rau củ", roleType: "SEMANTIC", categoryVi: "Thiên nhiên", commonPositionVi: "Luôn nằm trên cùng của chữ", recognitionTipVi: "Thấy 艹 ở đỉnh chữ, thường liên quan đến thực vật (茶 trà, 菜 rau/món ăn).", exampleCharacters: [{ hanzi: "茶", pinyin: "chá", meaningVi: "trà" }, { hanzi: "菜", pinyin: "cài", meaningVi: "rau / món ăn" }] },
    { symbol: "言", variants: ["讠"], pinyin: "yán", nameVi: "Bộ Ngôn (Lời nói)", meaningVi: "Ngôn ngữ, giao tiếp, lời nói", roleType: "SEMANTIC", categoryVi: "Đời sống", commonPositionVi: "Bên trái (dạng giản thể 讠)", recognitionTipVi: "Trong chữ Giản thể, 言 bên trái rút gọn thành 2 nét 讠 rất dễ nhận ra.", exampleCharacters: [{ hanzi: "语", pinyin: "yǔ", meaningVi: "ngôn ngữ" }, { hanzi: "谢", pinyin: "xiè", meaningVi: "cảm ơn" }, { hanzi: "说", pinyin: "shuō", meaningVi: "nói" }] },
    { symbol: "宀", variants: [], pinyin: "mián", nameVi: "Bộ Miên (Mái nhà)", meaningVi: "Nhà cửa, mái che, sự bình yên", roleType: "SEMANTIC", categoryVi: "Đời sống", commonPositionVi: "Luôn nằm che phía trên", recognitionTipVi: "Hình mái nhà có ống khói nhỏ ở đỉnh (家 gia đình, 字 chữ viết).", exampleCharacters: [{ hanzi: "家", pinyin: "jiā", meaningVi: "nhà / gia đình" }, { hanzi: "字", pinyin: "zì", meaningVi: "chữ" }] },
    { symbol: "纟", variants: ["糹"], pinyin: "sī", nameVi: "Bộ Mịch (Sợi tơ)", meaningVi: "Sợi chỉ, vải vóc, màu sắc, kết nối", roleType: "SEMANTIC", categoryVi: "Đời sống", commonPositionVi: "Bên trái", recognitionTipVi: "Thường xuất hiện trong tên màu sắc (红 đỏ) và các từ liên kết (给 đưa cho, 练 luyện tập).", exampleCharacters: [{ hanzi: "红", pinyin: "hóng", meaningVi: "màu đỏ" }, { hanzi: "给", pinyin: "gěi", meaningVi: "cho / đưa cho" }] },
    { symbol: "金", variants: ["钅"], pinyin: "jīn", nameVi: "Bộ Kim (Kim loại)", meaningVi: "Kim loại, tiền bạc, công cụ", roleType: "SEMANTIC", categoryVi: "Đời sống", commonPositionVi: "Bên trái (dạng giản thể 钅)", recognitionTipVi: "Dạng 钅 xuất hiện trong 钱 (tiền), 钟 (đồng hồ), 银 (bạc/ngân hàng).", exampleCharacters: [{ hanzi: "钱", pinyin: "qián", meaningVi: "tiền" }, { hanzi: "钟", pinyin: "zhōng", meaningVi: "đồng hồ" }] },
  ];

  for (let i = 0; i < radicalsData.length; i++) {
    const r = radicalsData[i];
    await prisma.radicalComponent.upsert({
      where: { symbol: r.symbol },
      update: { ...r, sortOrder: i + 1, status: ContentStatus.PUBLISHED },
      create: { ...r, sortOrder: i + 1, status: ContentStatus.PUBLISHED, origin: ContentOrigin.VERIFIED_ORIGINAL },
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Seed Learning Concepts (for Concept-Level Adaptive Mastery & 6 Pillars)
  // ---------------------------------------------------------------------------
  const conceptsData = [
    {
      code: "foundation.intro.characters_vs_pinyin",
      stageNumber: 0,
      pillar: "PINYIN",
      titleVi: "Phân biệt Chữ Hán và Pinyin",
      explanationVi: "Chữ Hán là hệ thống chữ viết chính thức; Pinyin chỉ là công cụ phiên âm bằng chữ cái Latin giúp người mới học đọc đúng âm tiếng Phổ thông.",
      simpleExplanationVi: "Nói thật ngắn gọn: Chữ Hán (你好) là mặt chữ để đọc – viết lâu dài, còn Pinyin (nǐ hǎo) giống như 'bánh xe phụ' giúp bạn biết cách phát âm khi mới bắt đầu.",
      extraExamples: [
        { zh: "你好", pinyin: "nǐ hǎo", vi: "Chữ Hán là 你好, Pinyin là nǐ hǎo" },
        { zh: "谢谢", pinyin: "xièxie", vi: "Chữ Hán là 谢谢, Pinyin là xièxie" },
      ],
      remediationQuestion: {
        promptVi: "Câu kiểm tra bậc dễ: Trong hai cách viết '你好' và 'nǐ hǎo', đâu là phiên âm Pinyin?",
        options: ["你好", "nǐ hǎo"],
        correctIndex: 1,
        explanationVi: "nǐ hǎo dùng chữ cái Latin có dấu thanh — đó chính là Pinyin giúp đọc âm.",
      },
    },
    {
      code: "foundation.pinyin.contrast_bp_dt_gk",
      stageNumber: 1,
      pillar: "PINYIN",
      titleVi: "Phân biệt âm không bật hơi vs bật hơi (b/p, d/t, g/k)",
      explanationVi: "Trong tiếng Trung, cặp b/p, d/t, g/k khác nhau ở LUỒNG HƠI: b, d, g không bật hơi; p, t, k bật luồng hơi rất mạnh ra ngoài.",
      simpleExplanationVi: "Đặt một mảnh giấy mỏng trước miệng: đọc bā, dā, gā giấy đứng yên; đọc pā, tā, kā giấy bay lên rõ rệt!",
      extraExamples: [
        { zh: "八 / 怕", pinyin: "bā / pà", vi: "bā không bật hơi (số 8) vs pà bật hơi mạnh (sợ)" },
        { zh: "大 / 他", pinyin: "dà / tā", vi: "dà không bật hơi (to) vs tā bật hơi mạnh (anh ấy)" },
      ],
      remediationQuestion: {
        promptVi: "Câu bậc dễ: Trong cặp 'b' và 'p' tiếng Trung, âm nào đẩy luồng hơi mạnh làm rung tờ giấy trước miệng?",
        options: ["b", "p"],
        correctIndex: 1,
        explanationVi: "p là âm hai môi bật hơi mạnh; b là âm không bật hơi.",
      },
    },
    {
      code: "foundation.pinyin.finals_and_combinations",
      stageNumber: 1,
      pillar: "PINYIN",
      titleVi: "Vận mẫu & Quy tắc ghép âm Pinyin (j/q/x + ü)",
      explanationVi: "Khi vận mẫu ü ghép sau j, q, x thì viết bỏ dấu hai chấm thành ju, qu, xu nhưng khẩu hình vẫn giữ tròn môi đọc âm ü.",
      simpleExplanationVi: "Mẹo dễ nhớ: chữ j, q, x không bao giờ đi với u thường, nên khi thấy ju, qu, xu hãy luôn chu môi đọc là ü!",
      extraExamples: [
        { zh: "去", pinyin: "qù (đọc qǜ)", vi: "Đi — viết qù nhưng chu môi tròn đọc ü" },
        { zh: "学", pinyin: "xué (đọc xüé)", vi: "Học — viết xué nhưng đọc âm ü" },
      ],
      remediationQuestion: {
        promptVi: "Câu bậc dễ: Khi ghép 'q' + 'ü' + thanh 4, Pinyin chuẩn viết như thế nào?",
        options: ["qǜ", "qù"],
        correctIndex: 1,
        explanationVi: "Sau j, q, x ta bỏ hai chấm trên đầu ü nên viết thành qù.",
      },
    },
    {
      code: "foundation.tones.four_basic",
      stageNumber: 1,
      pillar: "TONES",
      titleVi: "4 Thanh điệu cơ bản & Thanh nhẹ",
      explanationVi: "Thanh 1 (55) cao phẳng, Thanh 2 (35) đi lên, Thanh 3 (214) rất trầm, Thanh 4 (51) rơi mạnh dứt khoát, Thanh nhẹ đọc ngắn và thả lỏng.",
      simpleExplanationVi: "Đừng gắn cứng dấu tiếng Việt: Thanh 1 cao như ngân nốt nhạc; Thanh 4 dứt khoát như hô 'Dừng!'; Thanh 3 hạ giọng thật trầm xuống cổ họng.",
      extraExamples: [
        { zh: "妈 / 马", pinyin: "mā / mǎ", vi: "mā (cao phẳng = mẹ) vs mǎ (rất trầm = ngựa)" },
        { zh: "妈妈", pinyin: "māma", vi: "Chữ thứ hai đọc nhẹ và ngắn (thanh nhẹ)" },
      ],
      remediationQuestion: {
        promptVi: "Câu bậc dễ: Thanh điệu nào rơi nhanh và dứt khoát từ cao nhất xuống thấp nhất (5 → 1)?",
        options: ["Thanh 1 (ˉ)", "Thanh 4 (ˋ)"],
        correctIndex: 1,
        explanationVi: "Thanh 4 (ˋ) rơi mạnh từ nấc 5 xuống nấc 1.",
      },
    },
    {
      code: "foundation.strokes.eight_basic",
      stageNumber: 2,
      pillar: "STROKES",
      titleVi: "8 Nét cơ bản & Quy tắc Bút thuận",
      explanationVi: "Mọi chữ Hán ghép từ 8 nét cơ bản (横, 竖, 撇, 捺, 点, 提, 折, 钩) và viết theo quy tắc ngang trước sổ sau, trên trước dưới, trái trước phải, vào trước đóng sau.",
      simpleExplanationVi: "Nhớ cặp hay nhầm nhất: Phẩy (撇) kéo XUỐNG sang trái, còn Hất (提) hất LÊN sang phải. Nét Gập (折) luôn tính là 1 nét liền!",
      extraExamples: [
        { zh: "十", pinyin: "shí", vi: "Nét 1 Ngang (横) → Nét 2 Sổ (竖)" },
        { zh: "人", pinyin: "rén", vi: "Nét 1 Phẩy (撇) → Nét 2 Mác (捺)" },
      ],
      remediationQuestion: {
        promptVi: "Câu bậc dễ: Khi viết chữ '十' (số 10), ta viết nét nào trước?",
        options: ["Nét Ngang (横) trước", "Nét Sổ (竖) trước"],
        correctIndex: 0,
        explanationVi: "Theo quy tắc 'Ngang trước, sổ sau', viết nét Ngang trước rồi mới kéo nét Sổ.",
      },
    },
    {
      code: "foundation.radicals.semantic_vs_phonetic",
      stageNumber: 3,
      pillar: "RADICALS",
      titleVi: "Bộ thủ gợi nghĩa vs Thành phần gợi âm",
      explanationVi: "Nhiều chữ Hán là chữ Hình thanh gồm 1 phần gợi nhóm nghĩa (như 女, 氵, 讠) và 1 phần gợi âm đọc (như 马 trong 妈).",
      simpleExplanationVi: "Mẹo cực dễ: Nhìn 妈 (mẹ) = 女 (phụ nữ) + 马 (đọc mǎ giống mā). Đừng dịch 马 là con ngựa — nó chỉ giúp bạn đoán cách đọc!",
      extraExamples: [
        { zh: "妈 / 吗 / 骂", pinyin: "mā / ma / mà", vi: "Cả 3 đều mượn 马 để gợi âm 'ma', chỉ đổi bộ gợi nghĩa 女 / 口" },
        { zh: "河", pinyin: "hé", vi: "氵 (nước) + 可 (gợi âm) = con sông" },
      ],
      remediationQuestion: {
        promptVi: "Câu bậc dễ: Bộ ba chấm thủy '氵' trong chữ 河 (sông) gợi ý liên quan đến gì?",
        options: ["Nước / chất lỏng", "Lửa / nhiệt độ"],
        correctIndex: 0,
        explanationVi: "氵 là biến thể của 水 (nước).",
      },
    },
    {
      code: "foundation.vocab_grammar.core_patterns",
      stageNumber: 5,
      pillar: "VOCAB_GRAMMAR",
      titleVi: "Từ vựng đầu tiên & Ngữ pháp nền tảng (是, 不/没, 吗, 很)",
      explanationVi: "Dùng 是 nối danh từ, dùng 很 nối tính từ, dùng 不/没 để phủ định, và thêm 吗 cuối câu trần thuật để hỏi Có/Không.",
      simpleExplanationVi: "Quy tắc vàng cho người Việt: Tuyệt đối KHÔNG viết '我是很好' — trước tính từ (好, 忙, 高) bỏ 是, chỉ dùng 很!",
      extraExamples: [
        { zh: "我很好。", pinyin: "Wǒ hěn hǎo.", vi: "Tôi rất khỏe (KHÔNG có 是)" },
        { zh: "我是学生。", pinyin: "Wǒ shì xuésheng.", vi: "Tôi là học sinh (có 是 trước danh từ)" },
      ],
      remediationQuestion: {
        promptVi: "Câu bậc dễ: Câu nào đúng để nói 'Tôi rất khỏe'?",
        options: ["我是很好。", "我很好。"],
        correctIndex: 1,
        explanationVi: "Trước tính từ 好 dùng 很, không dùng 是.",
      },
    },
    {
      code: "foundation.sentences.word_order",
      stageNumber: 6,
      pillar: "SENTENCES",
      titleVi: "Ghép câu chuẩn trật tự Tiếng Trung (S + Thời gian + Địa điểm + V + O)",
      explanationVi: "Trong tiếng Trung, trạng ngữ Thời gian và Địa điểm đứng TRƯỚC động từ chính (khác với tiếng Việt hay đặt ở cuối câu).",
      simpleExplanationVi: "Tiếng Việt nói 'Tôi học tiếng Trung ở trường hôm nay', nhưng tiếng Trung đặt Thời gian & Địa điểm lên trước động từ: 我今天在学校学习汉语。",
      extraExamples: [
        { zh: "我今天在家学习。", pinyin: "Wǒ jīntiān zài jiā xuéxí.", vi: "Hôm nay tôi học ở nhà." },
      ],
      remediationQuestion: {
        promptVi: "Câu bậc dễ: Trong tiếng Trung, cụm chỉ nơi chốn '在家' (ở nhà) thường đặt ở đâu so với động từ '学习' (học)?",
        options: ["Đứng TRƯỚC động từ (在家学习)", "Đứng SAU động từ (学习在家)"],
        correctIndex: 0,
        explanationVi: "Địa điểm (在 + nơi chốn) đặt trước động từ chính.",
      },
    },
  ];

  const conceptMap = new Map<string, string>();
  for (const c of conceptsData) {
    const saved = await prisma.learningConcept.upsert({
      where: { code: c.code },
      update: {
        titleVi: c.titleVi,
        explanationVi: c.explanationVi,
        simpleExplanationVi: c.simpleExplanationVi,
        extraExamples: c.extraExamples,
        remediationQuestion: c.remediationQuestion,
      },
      create: {
        ...c,
        status: ContentStatus.PUBLISHED,
        origin: ContentOrigin.VERIFIED_ORIGINAL,
      },
    });
    conceptMap.set(c.code, saved.id);
  }

  // ---------------------------------------------------------------------------
  // 3. Seed Structured Courses, Modules & 13-Part Foundation Lessons (Stages 0-6)
  // ---------------------------------------------------------------------------
  const foundationCourse = await prisma.course.upsert({
    where: { slug: "chinese-foundations-starter" },
    update: {
      titleVi: "Khóa Nền tảng Tiếng Trung từ Con số 0 (Stages 0 – 7)",
      titleZh: "零基础系统入门课程",
      summaryVi:
        "Lộ trình nhập môn đầy đủ từ chưa biết gì đến sẵn sàng vào HSK 1: Nhập môn → Pinyin & 4 Thanh điệu → 8 Nét & Bút thuận → 18 Bộ thủ → Từ vựng trực quan → Ngữ pháp nền → Ghép câu → Đánh giá 6 trụ cột.",
      estimatedMinutes: 360,
      status: ContentStatus.PUBLISHED,
    },
    create: {
      learningLevelId: foundationLevel.id,
      slug: "chinese-foundations-starter",
      titleVi: "Khóa Nền tảng Tiếng Trung từ Con số 0 (Stages 0 – 7)",
      titleZh: "零基础系统入门课程",
      summaryVi: "Lộ trình nhập môn đầy đủ từ con số 0 cho người Việt.",
      estimatedMinutes: 360,
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
      origin: ContentOrigin.VERIFIED_ORIGINAL,
    },
  });

  const stageModulesSpec = [
    { slug: "stage-0-intro", titleVi: "Chặng 0 — Nhập môn: Hiểu đúng về Tiếng Trung", titleZh: "第零阶段：认识汉语", sortOrder: 1 },
    { slug: "stage-1-pinyin", titleVi: "Chặng 1 — Pinyin: Thanh mẫu, Vận mẫu, Ghép âm & 4 Thanh điệu", titleZh: "第一阶段：拼音与声调", sortOrder: 2 },
    { slug: "stage-2-writing", titleVi: "Chặng 2 — Chữ Hán, 8 Nét cơ bản, Bút thuận & Cấu trúc", titleZh: "第二阶段：汉字笔画与结构", sortOrder: 3 },
    { slug: "stage-3-radicals", titleVi: "Chặng 3 — Bộ thủ & Thành phần cấu tạo chữ Hán", titleZh: "第三阶段：偏旁部首", sortOrder: 4 },
    { slug: "stage-4-vocab", titleVi: "Chặng 4 — Từ vựng Đầu tiên qua Hình ảnh Trực quan", titleZh: "第四阶段：基础词汇", sortOrder: 5 },
    { slug: "stage-5-grammar", titleVi: "Chặng 5 — Ngữ pháp Nền tảng từng bước", titleZh: "第五阶段：基础语法", sortOrder: 6 },
    { slug: "stage-6-sentences", titleVi: "Chặng 6 — Ghép câu & Giao tiếp Sơ khởi", titleZh: "第六阶段：造句与对话", sortOrder: 7 },
  ];

  const modMap = new Map<string, string>();
  for (const m of stageModulesSpec) {
    const saved = await prisma.module.upsert({
      where: { courseId_slug: { courseId: foundationCourse.id, slug: m.slug } },
      update: { titleVi: m.titleVi, titleZh: m.titleZh, sortOrder: m.sortOrder, status: ContentStatus.PUBLISHED },
      create: { courseId: foundationCourse.id, ...m, status: ContentStatus.PUBLISHED },
    });
    modMap.set(m.slug, saved.id);
  }

  // Helper to upsert a complete 13-part Foundation Lesson + attached Knowledge Check Exercise
  const upsertFoundationLesson = async (spec: {
    moduleSlug: string;
    slug: string;
    titleVi: string;
    titleZh: string;
    subtitleVi: string;
    estimatedMinutes: number;
    sortOrder: number;
    conceptCode: string;
    foundationPayload: Record<string, unknown>;
    knowledgeCheck?: {
      titleVi: string;
      skillType: SkillType;
      questions: Array<{
        questionType: QuestionType;
        skillType: SkillType;
        conceptCode?: string;
        promptVi: string;
        promptZh?: string;
        promptPinyin?: string;
        metadata?: object;
        options?: Array<{ key: string; zh?: string; pinyin?: string; vi?: string }>;
        answer: object;
        explanationVi: string;
      }>;
    };
  }) => {
    const moduleId = modMap.get(spec.moduleSlug);
    if (!moduleId) return null;

    const objectives = Array.isArray(spec.foundationPayload.objectivesVi)
      ? (spec.foundationPayload.objectivesVi as string[])
      : [];

    const lesson = await prisma.lesson.upsert({
      where: { slug: spec.slug },
      update: {
        moduleId,
        titleVi: spec.titleVi,
        titleZh: spec.titleZh,
        subtitleVi: spec.subtitleVi,
        objectivesVi: objectives,
        estimatedMinutes: spec.estimatedMinutes,
        sortOrder: spec.sortOrder,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        moduleId,
        slug: spec.slug,
        titleVi: spec.titleVi,
        titleZh: spec.titleZh,
        subtitleVi: spec.subtitleVi,
        objectivesVi: objectives,
        estimatedMinutes: spec.estimatedMinutes,
        sortOrder: spec.sortOrder,
        status: ContentStatus.PUBLISHED,
        origin: ContentOrigin.VERIFIED_ORIGINAL,
        publishedAt: new Date(),
      },
    });

    // Store rich 13-part Foundation specification in OBJECTIVES section (cleanly backward-compatible)
    await prisma.lessonSection.upsert({
      where: {
        lessonId_sectionType_sortOrder: {
          lessonId: lesson.id,
          sectionType: LessonSectionType.OBJECTIVES,
          sortOrder: 1,
        },
      },
      update: {
        titleVi: "Bài học Nền tảng (13 bước A–M)",
        contentPayload: {
          foundationMode: true,
          ...spec.foundationPayload,
        } as never,
      },
      create: {
        lessonId: lesson.id,
        sectionType: LessonSectionType.OBJECTIVES,
        titleVi: "Bài học Nền tảng (13 bước A–M)",
        sortOrder: 1,
        contentPayload: {
          foundationMode: true,
          ...spec.foundationPayload,
        } as never,
      },
    });

    // Link concept to lesson
    const conceptId = conceptMap.get(spec.conceptCode);
    if (conceptId) {
      await prisma.learningConcept.update({
        where: { id: conceptId },
        data: { lessonId: lesson.id },
      });
    }

    // Create or ensure Knowledge Check exercise
    if (spec.knowledgeCheck) {
      const existingEx = await prisma.exercise.findFirst({
        where: { lessonId: lesson.id, titleVi: spec.knowledgeCheck.titleVi },
      });
      if (!existingEx) {
        const ex = await prisma.exercise.create({
          data: {
            lessonId: lesson.id,
            titleVi: spec.knowledgeCheck.titleVi,
            skillType: spec.knowledgeCheck.skillType,
            passingPercent: 80,
            status: ContentStatus.PUBLISHED,
            origin: ContentOrigin.VERIFIED_ORIGINAL,
          },
        });
        for (let i = 0; i < spec.knowledgeCheck.questions.length; i++) {
          const q = spec.knowledgeCheck.questions[i];
          await prisma.question.create({
            data: {
              exerciseId: ex.id,
              conceptId: conceptMap.get(q.conceptCode ?? spec.conceptCode) ?? null,
              questionType: q.questionType,
              skillType: q.skillType,
              difficultyLevel: 1,
              promptVi: q.promptVi,
              promptZh: q.promptZh,
              promptPinyin: q.promptPinyin,
              metadata: q.metadata,
              points: 10,
              sortOrder: i + 1,
              status: ContentStatus.PUBLISHED,
              origin: ContentOrigin.VERIFIED_ORIGINAL,
              options: q.options
                ? {
                    create: q.options.map((opt, idx) => ({
                      optionKey: opt.key,
                      labelZh: opt.zh,
                      labelPinyin: opt.pinyin,
                      labelVi: opt.vi,
                      sortOrder: idx + 1,
                    })),
                  }
                : undefined,
              answers: { create: { acceptedPayload: q.answer } },
              explanations: { create: { explanationVi: q.explanationVi } },
            },
          });
        }
      }
    }

    return lesson;
  };

  // --- STAGE 0: Introduction ---
  await upsertFoundationLesson({
    moduleSlug: "stage-0-intro",
    slug: "foundation-s0-what-is-chinese",
    titleVi: "Bài 0.1 — Tiếng Trung là gì? (Giản thể, Phồn thể, Chữ Hán & Pinyin)",
    titleZh: "第 0.1 课：什么是汉语？",
    subtitleVi: "Hiểu rõ bức tranh toàn cảnh trước khi học chữ cái đầu tiên",
    estimatedMinutes: 12,
    sortOrder: 1,
    conceptCode: "foundation.intro.characters_vs_pinyin",
    foundationPayload: {
      stageLabel: "Chặng 0 — Nhập môn Tiếng Trung",
      introWhatVi: "Bạn sẽ hiểu chính xác Tiếng Phổ thông (Mandarin), Chữ Hán Giản thể vs Phồn thể, và công cụ phiên âm Pinyin khác nhau như thế nào.",
      introWhyVi: "Rất nhiều người mới học bị rối vì tưởng Pinyin là chữ viết chính thức hoặc sợ hãi khi thấy chữ Hán không đánh vần được như tiếng Việt.",
      objectivesVi: [
        "Phân biệt được Chữ Hán Giản thể (简体 — dùng ở Trung Quốc đại lục, kỳ thi HSK) và Phồn thể (繁体)",
        "Hiểu vai trò của Pinyin: công cụ phiên âm học phát âm, không thay thế chữ Hán",
        "Nhìn ra mối liên hệ giữa Mặt chữ (汉字) – Âm đọc (拼音) – Nghĩa tiếng Việt",
      ],
      explanationBlocks: [
        {
          headingVi: "1. Tiếng Phổ thông (普通话 — Pǔtōnghuà)",
          bodyVi: "Tiếng Trung có nhiều phương ngữ địa phương (như tiếng Quảng Đông), nhưng ngôn ngữ chuẩn quốc gia dùng trong giáo dục, truyền thông và kỳ thi HSK là Tiếng Phổ thông (Mandarin).",
        },
        {
          headingVi: "2. Chữ Giản thể (简体) vs Chữ Phồn thể (繁体)",
          bodyVi: "Chữ Giản thể rút gọn số nét từ chữ Phồn thể giúp dễ học, dễ viết hơn (ví dụ: 汉语 vs 漢語, 学 vs 學). Toàn bộ lộ trình HSK trên HanLearn sử dụng Giản thể làm chuẩn và hiển thị thêm Phồn thể để tham khảo.",
        },
        {
          headingVi: "3. Pinyin (拼音) là gì?",
          bodyVi: "Vì chữ Hán không thể nhìn mặt chữ để đánh vần trực tiếp như tiếng Việt, hệ thống Pinyin dùng chữ cái Latin + dấu thanh (như nǐ hǎo) để ghi lại chính xác cách phát âm của từng chữ Hán.",
        },
      ],
      visualType: "INTRO_COMPARE",
      audioSamples: [
        { zh: "普通话", pinyin: "Pǔtōnghuà", vi: "Tiếng Phổ thông" },
        { zh: "汉字", pinyin: "Hànzì", vi: "Chữ Hán" },
        { zh: "拼音", pinyin: "Pīnyīn", vi: "Phiên âm Pinyin" },
      ],
      guidedExample: {
        titleVi: "Ví dụ trực quan: Từ Chữ Hán → Pinyin → Nghĩa",
        stepsVi: [
          "Mặt chữ Giản thể: 汉语 (ít nét hơn Phồn thể 漢語)",
          "Phiên âm Pinyin: hànyǔ (giúp bạn biết đọc thanh 4 và thanh 3)",
          "Ý nghĩa tiếng Việt: Tiếng Hán / Tiếng Trung",
        ],
      },
      commonMistakesVi: [
        "Nghĩ rằng học xong Pinyin là đủ và bỏ qua chữ Hán (thực tế ngoài đời và bài thi chỉ viết chữ Hán).",
        "Đọc chữ cái Pinyin y hệt cách đánh vần tiếng Việt hoặc tiếng Anh.",
      ],
      summaryVi: "Chữ Hán (汉字) là mặt chữ chính thức; Pinyin (拼音) là bản đồ phát âm; chúng ta học Pinyin trước (Chặng 1) rồi học viết chữ Hán từng bước (Chặng 2–3).",
    },
    knowledgeCheck: {
      titleVi: "Kiểm tra hiểu biết Bài 0.1",
      skillType: SkillType.VOCABULARY,
      questions: [
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.VOCABULARY,
          promptVi: "Vai trò chính xác của hệ thống Pinyin (ví dụ: nǐ hǎo) là gì?",
          options: [
            { key: "A", vi: "Thay thế hoàn toàn chữ Hán ở Trung Quốc" },
            { key: "B", vi: "Công cụ phiên âm giúp học và tra cứu cách phát âm chuẩn của chữ Hán" },
            { key: "C", vi: "Một dạng chữ viết cổ hơn chữ Phồn thể" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "Pinyin dùng chữ cái Latin và dấu thanh để ghi lại âm đọc của chữ Hán, giúp người mới học phát âm chuẩn.",
        },
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.VOCABULARY,
          promptVi: "Hệ chữ nào được dùng làm chuẩn chính thức trong kỳ thi HSK và tại Trung Quốc đại lục?",
          options: [
            { key: "A", vi: "Chữ Giản thể (简体)" },
            { key: "B", vi: "Chữ Phồn thể (繁体)" },
          ],
          answer: { optionKey: "A" },
          explanationVi: "Chữ Giản thể (简体) có số nét rút gọn hơn và là chuẩn chính thức của kỳ thi HSK.",
        },
      ],
    },
  });

  await upsertFoundationLesson({
    moduleSlug: "stage-0-intro",
    slug: "foundation-s0-how-writing-works",
    titleVi: "Bài 0.2 — Chữ Hán vận hành như thế nào? (Chữ → Từ → Câu)",
    titleZh: "第 0.2 课：汉字、词与句子",
    subtitleVi: "Một chữ không phải một chữ cái, mà là một khối âm tiết mang nghĩa",
    estimatedMinutes: 12,
    sortOrder: 2,
    conceptCode: "foundation.intro.characters_vs_pinyin",
    foundationPayload: {
      stageLabel: "Chặng 0 — Nhập môn Tiếng Trung",
      introWhatVi: "Hiểu cấu trúc Chữ đơn (字) → Từ vựng (词) → Câu hoàn chỉnh (句子) và vì sao văn bản tiếng Trung không có dấu cách giữa các từ.",
      introWhyVi: "Người mới thường bị ngợp khi thấy một dòng chữ Hán viết liền nhau. Hiểu quy luật ghép chữ giúp bạn đọc tách ý rất dễ dàng.",
      objectivesVi: [
        "Phân biệt 1 chữ Hán (字) và 1 từ tiếng Trung (词 — thường gồm 1 hoặc 2 chữ)",
        "Hiểu mỗi chữ Hán thường ứng với 1 âm tiết duy nhất",
      ],
      explanationBlocks: [
        {
          headingVi: "1 chữ Hán = 1 khối vuông = 1 âm tiết",
          bodyVi: "Khác với chữ cái Latin (c-h-ữ ghép nhiều ký tự thành 1 âm), mỗi chữ Hán đứng gói gọn trong 1 ô vuông đều nhau và thường đọc đúng 1 âm tiết: 学 (xué — học), 生 (shēng — sinh).",
        },
        {
          headingVi: "Từ Chữ (字) → Từ (词) → Câu (句子)",
          bodyVi: "Ghép 2 chữ có nghĩa tạo thành từ mới rất logic: 学 (học) + 生 (sinh) = 学生 (học sinh). Ghép các từ theo trật tự tạo thành câu: 我是学生。(Tôi là học sinh.)",
        },
      ],
      visualType: "SENTENCE_ORDER",
      sentenceSlots: [
        { labelVi: "Chữ 1 (Đại từ)", zh: "我", pinyin: "wǒ", colorClass: "border-blue-300 bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-200" },
        { labelVi: "Chữ 2 (Động từ)", zh: "是", pinyin: "shì", colorClass: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200" },
        { labelVi: "Từ 2 chữ (Danh từ)", zh: "学生", pinyin: "xuésheng", colorClass: "border-purple-300 bg-purple-50 text-purple-900 dark:bg-purple-950/50 dark:text-purple-200" },
      ],
      audioSamples: [
        { zh: "学", pinyin: "xué", vi: "Học (1 chữ)" },
        { zh: "学生", pinyin: "xuésheng", vi: "Học sinh (1 từ gồm 2 chữ)" },
        { zh: "我是学生。", pinyin: "Wǒ shì xuésheng.", vi: "Tôi là học sinh (1 câu)" },
      ],
      guidedExample: {
        titleVi: "Cách ghép từ logic trong tiếng Trung",
        stepsVi: [
          "电 (diàn: điện) + 脑 (nǎo: não) = 电脑 (diànnǎo: máy tính)",
          "手 (shǒu: tay) + 机 (jī: máy) = 手机 (shǒujī: điện thoại di động)",
        ],
      },
      commonMistakesVi: [
        "Cố tìm khoảng trắng giữa các từ trong câu tiếng Trung (tiếng Trung không chèn dấu cách giữa các từ, chỉ dùng dấu câu 。 ， ？).",
      ],
      summaryVi: "Chữ Hán ghép lại thành Từ theo logic rất gần với từ Hán-Việt, nhờ vậy người Việt có lợi thế lớn khi mở rộng vốn từ!",
    },
  });

  await upsertFoundationLesson({
    moduleSlug: "stage-0-intro",
    slug: "foundation-s0-how-to-study",
    titleVi: "Bài 0.3 — Lộ trình & Phương pháp tự học Tiếng Trung khoa học",
    titleZh: "第 0.3 课：如何高效学习汉语",
    subtitleVi: "5 thói quen vàng: Nghe trước nói sau, học theo bộ thủ, ôn lặp lại FSRS",
    estimatedMinutes: 10,
    sortOrder: 3,
    conceptCode: "foundation.intro.characters_vs_pinyin",
    foundationPayload: {
      stageLabel: "Chặng 0 — Nhập môn Tiếng Trung",
      introWhatVi: "Nắm 5 nguyên tắc tự học tiếng Trung bền vững cho người mới bắt đầu.",
      introWhyVi: "Học sai thứ tự (cố chép phạt hàng trăm chữ khi chưa biết Pinyin và bút thuận) là lý do phổ biến nhất khiến người mới bỏ cuộc.",
      objectivesVi: [
        "Biết thứ tự chuẩn: Nghe âm mẫu → Tập khẩu hình → Nhìn bộ thủ nhớ chữ → Viết đúng bút thuận → Ôn FSRS",
        "Biết cách tận dụng chế độ lặp lại không bị phạt và Flashcard tự động trên HanLearn",
      ],
      explanationBlocks: [
        { headingVi: "1. Nghe và bắt chước khẩu hình, không đoán theo mặt chữ Latin", bodyVi: "Luôn nghe âm thanh ở tốc độ 0.75x rồi mới đọc theo và ghi âm so sánh." },
        { headingVi: "2. Ghi nhớ chữ Hán bằng bộ thủ & hình ảnh", bodyVi: "Tách chữ thành 2–3 khối quen thuộc thay vì nhớ từng nét rời rạc." },
        { headingVi: "3. Ôn ít nhưng đều mỗi ngày bằng FSRS", bodyVi: "Chỉ cần 15–20 phút/ngày ôn thẻ Flashcard đến hạn hiệu quả hơn học dồn 3 tiếng cuối tuần." },
      ],
      visualType: "NONE",
      audioSamples: [{ zh: "循序渐进", pinyin: "xúnxù jiànjìn", vi: "Tiến bộ từng bước vững chắc" }],
      guidedExample: {
        titleVi: "Chu trình 15 phút mỗi ngày trên HanLearn",
        stepsVi: [
          "5 phút đầu: Ôn Flashcards FSRS đến hạn",
          "8 phút giữa: Học 1 bài vi mô mới trong Chặng Nền tảng",
          "2 phút cuối: Hoàn thành Knowledge Check & tạo thẻ mới",
        ],
      },
      commonMistakesVi: ["Học nhảy cóc sang HSK 1 khi chưa phân biệt được 4 thanh điệu và thanh mẫu bật hơi."],
      summaryVi: "Đi chậm mà chắc ở Chặng Nền tảng sẽ giúp bạn tăng tốc gấp 3 lần khi bước sang HSK 1–3.",
    },
  });

  // --- STAGE 1: Pinyin Initials, Finals, Combinations, Sample Lesson A (4 Tones), Tone Sandhi, Diagnostic ---
  await upsertFoundationLesson({
    moduleSlug: "stage-1-pinyin",
    slug: "foundation-s1-initials-labials-alveolars",
    titleVi: "Bài 1.1 — Thanh mẫu nhóm Môi (b, p, m, f) & Đầu lưỡi (d, t, n, l)",
    titleZh: "第 1.1 课：声母 b p m f · d t n l",
    subtitleVi: "Nắm chắc quy luật Bật hơi vs Không bật hơi — chìa khóa phát âm chuẩn",
    estimatedMinutes: 16,
    sortOrder: 1,
    conceptCode: "foundation.pinyin.contrast_bp_dt_gk",
    foundationPayload: {
      stageLabel: "Chặng 1 — Pinyin: Thanh mẫu (Nhóm 1/3)",
      introWhatVi: "Học từng thanh mẫu một trong 2 nhóm đầu tiên: b, p, m, f và d, t, n, l cùng đối chiếu cặp dễ nhầm b/p và d/t.",
      introWhyVi: "Chữ 'b' và 'd' trong Pinyin KHÔNG phát âm giống hệt 'b' và 'đ' tiếng Việt. Hiểu đúng độ bật hơi ngay hôm nay sẽ giúp người Trung Quốc hiểu bạn ngay lập tức.",
      objectivesVi: [
        "Phát âm đúng từng thanh mẫu b, p, m, f, d, t, n, l theo đúng vị trí môi – lưỡi – luồng hơi",
        "Nghe và phân biệt chính xác cặp không bật hơi vs bật hơi: b/p và d/t",
      ],
      explanationBlocks: [
        {
          headingVi: "Nhóm Môi: b · p · m · f",
          bodyVi: "• b: Hai môi khép kín rồi mở nhẹ, KHÔNG bật hơi (tham khảo gần âm 'p' nhẹ không bật hơi, không rung dây thanh như 'b' Việt).\n• p: Hai môi mím chặt rồi BẬT HƠI MẠNH (để tờ giấy trước miệng sẽ bay lên).\n• m: Hai môi khép, luồng hơi đi qua mũi (gần giống 'm' tiếng Việt).\n• f: Răng cửa trên chạm nhẹ môi dưới rồi thổi hơi ma sát (gần giống 'ph' tiếng Việt).",
        },
        {
          headingVi: "Nhóm Đầu lưỡi: d · t · n · l",
          bodyVi: "• d: Đầu lưỡi chạm chân răng cửa trên rồi bật nhẹ, KHÔNG bật hơi (tham khảo gần âm 't' không bật hơi).\n• t: Cùng vị trí đầu lưỡi như d nhưng BẬT HƠI MẠNH (gần giống 'th' tiếng Việt).\n• n: Đầu lưỡi chạm chân răng trên, hơi thoát qua mũi.\n• l: Đầu lưỡi chạm chân răng trên, hơi thoát ra hai bên cạnh lưỡi.",
        },
      ],
      visualType: "MOUTH_CONTRAST",
      mouthTypes: ["bilabial_unaspirated", "bilabial_aspirated", "alveolar_stop"],
      audioSamples: [
        { zh: "八", pinyin: "bā", vi: "b (không bật hơi) — Số 8" },
        { zh: "怕", pinyin: "pà", vi: "p (bật hơi mạnh) — Sợ" },
        { zh: "妈", pinyin: "mā", vi: "m (âm mũi môi) — Mẹ" },
        { zh: "发", pinyin: "fā", vi: "f (răng trên – môi dưới) — Gửi/phát" },
        { zh: "大", pinyin: "dà", vi: "d (không bật hơi) — To lớn" },
        { zh: "他", pinyin: "tā", vi: "t (bật hơi mạnh) — Anh ấy" },
        { zh: "你", pinyin: "nǐ", vi: "n (âm mũi đầu lưỡi) — Bạn" },
        { zh: "来", pinyin: "lái", vi: "l (âm bên đầu lưỡi) — Đến" },
      ],
      guidedExample: {
        titleVi: "Bài thực nghiệm 'Tờ giấy trước miệng' phân biệt b/p & d/t",
        stepsVi: [
          "Cầm 1 tờ giấy mỏng cách miệng khoảng 3 cm.",
          "Đọc 'bā' và 'dā' → tờ giấy hầu như đứng yên.",
          "Đọc 'pā' và 'tā' → luồng hơi mạnh thổi tờ giấy bật mạnh ra xa!",
        ],
      },
      commonMistakesVi: [
        "Đọc 'b' thành 'bờ' rung giọng tiếng Việt hoặc đọc 'p' quá nhẹ giống 'b'.",
        "Đọc 'd' thành 'đờ' nặng tiếng Việt hoặc nhầm 'n' với 'l'.",
      ],
      summaryVi: "Ghi nhớ cốt lõi: b & d là KHÔNG bật hơi; p & t là BẬT HƠI MẠNH. So sánh tiếng Việt chỉ mang tính tham khảo gần đúng.",
    },
    knowledgeCheck: {
      titleVi: "Kiểm tra phân biệt Thanh mẫu b/p/m/f & d/t/n/l",
      skillType: SkillType.PRONUNCIATION,
      questions: [
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.PRONUNCIATION,
          promptVi: "Điểm khác biệt cốt lõi giữa cặp thanh mẫu 'b' và 'p' trong tiếng Trung là gì?",
          options: [
            { key: "A", vi: "b không bật hơi, p bật luồng hơi mạnh ra ngoài" },
            { key: "B", vi: "b uốn lưỡi, p không uốn lưỡi" },
            { key: "C", vi: "Hai âm đọc giống hệt nhau" },
          ],
          answer: { optionKey: "A" },
          explanationVi: "Cả b và p đều khép hai môi ở cùng vị trí, chỉ khác nhau ở độ bật hơi (p bật mạnh).",
        },
        {
          questionType: QuestionType.AUDIO_DISCRIMINATION,
          skillType: SkillType.LISTENING,
          promptVi: "Nghe âm mẫu và chọn từ tương ứng với âm BẬT HƠI MẠNH 't':",
          promptZh: "他",
          promptPinyin: "tā",
          options: [
            { key: "A", zh: "大", pinyin: "dà" },
            { key: "B", zh: "他", pinyin: "tā" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "他 (tā) bắt đầu bằng thanh mẫu t bật hơi mạnh.",
        },
      ],
    },
  });

  await upsertFoundationLesson({
    moduleSlug: "stage-1-pinyin",
    slug: "foundation-s1-initials-velars-palatals",
    titleVi: "Bài 1.2 — Thanh mẫu Cuống lưỡi (g, k, h) & Mặt lưỡi (j, q, x)",
    titleZh: "第 1.2 课：声母 g k h · j q x",
    subtitleVi: "Phân biệt g/k và bộ ba mặt lưỡi mượt mà j/q/x",
    estimatedMinutes: 16,
    sortOrder: 2,
    conceptCode: "foundation.pinyin.contrast_bp_dt_gk",
    foundationPayload: {
      stageLabel: "Chặng 1 — Pinyin: Thanh mẫu (Nhóm 2/3)",
      introWhatVi: "Học nhóm cuống lưỡi g, k, h và nhóm mặt lưỡi j, q, x (nhóm âm đặc trưng rất hay dùng trong 你好, 谢谢, 学习).",
      introWhyVi: "Người Việt hay đọc 'q' và 'x' bị cứng hoặc giống 'ch/s' nặng. Đặt đúng mặt lưỡi áp ngạc cứng giúp âm thanh nhẹ và tự nhiên ngay.",
      objectivesVi: [
        "Phân biệt g (không bật hơi), k (bật hơi mạnh) và h (ma sát cuống lưỡi)",
        "Phát âm đúng nhóm mặt lưỡi j, q, x với đầu lưỡi hạ sau răng dưới",
      ],
      explanationBlocks: [
        {
          headingVi: "Nhóm Cuống lưỡi: g · k · h",
          bodyVi: "• g: Cuống lưỡi nâng chạm vòm mềm, KHÔNG bật hơi (gần âm 'c/k' nhẹ).\n• k: Cùng vị trí cuống lưỡi nhưng BẬT HƠI MẠNH (gần âm 'kh' bật mạnh).\n• h: Cuống lưỡi gần chạm vòm mềm tạo luồng hơi ma sát nhẹ ở cổ họng (mạnh hơn 'h' tiếng Việt một chút, nhẹ hơn 'kh').",
        },
        {
          headingVi: "Nhóm Mặt lưỡi: j · q · x",
          bodyVi: "Khóe môi hơi kéo ngang như mỉm cười nhẹ, đầu lưỡi tì sau răng dưới, MẶT lưỡi áp vòm cứng:\n• j: Không bật hơi (gần 'ch' rất nhẹ và dẹt).\n• q: BẬT HƠI MẠNH ở mặt lưỡi.\n• x: Xì luồng hơi mảnh, mượt (nhẹ hơn 'x' uốn lưỡi).",
        },
      ],
      visualType: "MOUTH_CONTRAST",
      mouthTypes: ["velar", "palatal"],
      audioSamples: [
        { zh: "哥", pinyin: "gē", vi: "g (không bật hơi) — Anh trai" },
        { zh: "渴", pinyin: "kě", vi: "k (bật hơi mạnh) — Khát nước" },
        { zh: "喝", pinyin: "hē", vi: "h (ma sát cổ họng) — Uống" },
        { zh: "家", pinyin: "jiā", vi: "j (mặt lưỡi không bật hơi) — Nhà" },
        { zh: "七", pinyin: "qī", vi: "q (mặt lưỡi bật hơi mạnh) — Số 7" },
        { zh: "谢", pinyin: "xiè", vi: "x (mặt lưỡi xì nhẹ) — Cảm ơn" },
      ],
      guidedExample: {
        titleVi: "Phân biệt nhanh bộ ba j / q / x",
        stepsVi: [
          "Đặt đầu lưỡi chạm nhẹ mặt sau răng cửa dưới và giữ nguyên.",
          "Đọc lần lượt jī (nhẹ) → qī (bật hơi mạnh) → xī (xì mượt).",
        ],
      },
      commonMistakesVi: ["Uốn cong đầu lưỡi khi đọc j/q/x (làm nhầm sang zh/ch/sh)."],
      summaryVi: "g/k khác nhau ở bật hơi; j/q/x luôn giữ đầu lưỡi hạ thấp và mặt lưỡi nâng áp vòm cứng.",
    },
  });

  await upsertFoundationLesson({
    moduleSlug: "stage-1-pinyin",
    slug: "foundation-s1-initials-retroflex-sibilants",
    titleVi: "Bài 1.3 — Thanh mẫu Uốn lưỡi (zh, ch, sh, r) & Đầu lưỡi phẳng (z, c, s)",
    titleZh: "第 1.3 课：声母 zh ch sh r · z c s",
    subtitleVi: "Chinh phục hai nhóm thanh mẫu dễ nhầm nhất đối với người Việt",
    estimatedMinutes: 18,
    sortOrder: 3,
    conceptCode: "foundation.pinyin.contrast_bp_dt_gk",
    foundationPayload: {
      stageLabel: "Chặng 1 — Pinyin: Thanh mẫu (Nhóm 3/3)",
      introWhatVi: "Hoàn thiện 7 thanh mẫu cuối cùng: nhóm uốn lưỡi (zh, ch, sh, r) và nhóm đầu lưỡi thẳng (z, c, s).",
      introWhyVi: "Sự khác biệt giữa 'zhōng' (中) và 'zǒng' (总), hay 'shì' (是) và 'sì' (四 — số 4) nằm hoàn toàn ở việc có uốn cong đầu lưỡi hay không!",
      objectivesVi: [
        "Uốn đầu lưỡi đúng vị trí cho zh, ch, sh, r",
        "Duỗi thẳng đầu lưỡi chạm mặt sau răng cửa cho z, c, s",
        "Phân biệt rõ cặp kinh điển: shì (是 — là) vs sì (四 — số 4)",
      ],
      explanationBlocks: [
        {
          headingVi: "Nhóm Uốn lưỡi: zh · ch · sh · r",
          bodyVi: "Cong đầu lưỡi lên phía sau chân răng trên (vòm cứng trước), môi hơi tròn nhẹ:\n• zh: Không bật hơi (gần 'tr' uốn lưỡi nhẹ).\n• ch: BẬT HƠI MẠNH khi đầu lưỡi mở ra.\n• sh: Thổi hơi ma sát liên tục khi uốn lưỡi (gần 's' nặng uốn lưỡi).\n• r: Cùng vị trí uốn lưỡi như sh nhưng RUNG DÂY THANH (không rung lưỡi rrr như tiếng Việt).",
        },
        {
          headingVi: "Nhóm Đầu lưỡi thẳng (Âm răng): z · c · s",
          bodyVi: "Duỗi phẳng đầu lưỡi chạm sát mặt sau răng cửa trên, kéo nhẹ khóe môi:\n• z: Không bật hơi (gần 'ch/ts' nhẹ sau răng).\n• c: BẬT HƠI MẠNH lách qua khe răng (gần 'ts' bật hơi).\n• s: Xì hơi mỏng qua khe răng (gần 'x' nhẹ).",
        },
      ],
      visualType: "MOUTH_CONTRAST",
      mouthTypes: ["retroflex", "dental_sibilant"],
      audioSamples: [
        { zh: "中", pinyin: "zhōng", vi: "zh (uốn lưỡi, không bật hơi) — Ở giữa" },
        { zh: "吃", pinyin: "chī", vi: "ch (uốn lưỡi, bật hơi mạnh) — Ăn" },
        { zh: "是", pinyin: "shì", vi: "sh (uốn lưỡi) — Là" },
        { zh: "人", pinyin: "rén", vi: "r (uốn lưỡi rung dây thanh) — Người" },
        { zh: "字", pinyin: "zì", vi: "z (lưỡi thẳng, không bật hơi) — Chữ" },
        { zh: "菜", pinyin: "cài", vi: "c (lưỡi thẳng, bật hơi mạnh) — Món ăn" },
        { zh: "四", pinyin: "sì", vi: "s (lưỡi thẳng) — Số 4" },
      ],
      guidedExample: {
        titleVi: "Bài luyện đối chiếu vàng: 四 (sì) vs 十 (shí)",
        stepsVi: [
          "Đọc 四 (sì): duỗi phẳng đầu lưỡi sau răng cửa.",
          "Đọc 十 (shí): cong đầu lưỡi lên vòm cứng.",
          "Luyện câu kinh điển: 四是四，十是十 (Sì shì sì, shí shì shí).",
        ],
      },
      commonMistakesVi: [
        "Đọc 'c' thành 'cờ' tiếng Việt (sai hoàn toàn! Trong Pinyin, 'c' là âm răng bật hơi giống 'ts' bật hơi).",
        "Đọc 'sh' giống 's' dẫn đến nhầm 是 (là) thành 四 (số 4).",
      ],
      summaryVi: "Nhóm có chữ 'h' (zh, ch, sh) + r đều UỐN LƯỠI; nhóm không có 'h' (z, c, s) đều DUỖI THẲNG LƯỠI sau răng.",
    },
  });

  await upsertFoundationLesson({
    moduleSlug: "stage-1-pinyin",
    slug: "foundation-s1-finals-progressive",
    titleVi: "Bài 1.4 — Hệ thống Vận mẫu (Đơn, Kép, Âm mũi & Âm đặc biệt ü, er)",
    titleZh: "第 1.4 课：韵母系统",
    subtitleVi: "Khẩu hình chuẩn cho 6 vận mẫu đơn và các nhóm vận mẫu mở rộng",
    estimatedMinutes: 18,
    sortOrder: 4,
    conceptCode: "foundation.pinyin.finals_and_combinations",
    foundationPayload: {
      stageLabel: "Chặng 1 — Pinyin: Vận mẫu",
      introWhatVi: "Học theo 5 nhóm tiến bộ: Vận mẫu đơn (a, o, e, i, u, ü) → Kép (ai, ei, ao, ou) → Mũi (an, en, ang, eng, ong) → Nhóm i- & u-/ü- → er.",
      introWhyVi: "Hai bẫy lớn nhất với người Việt là nguyên âm 'e' (đọc giống 'ơ/ưa' nhẹ, KHÔNG đọc 'e' bẹt như tiếng Việt) và nguyên âm tròn môi 'ü'.",
      objectivesVi: [
        "Tạo đúng khẩu hình tròn môi nhỏ cho 'ü' (giữ môi chữ u, đọc âm i)",
        "Phân biệt đuôi mũi trước -n (an, en, in) và mũi sau -ng (ang, eng, ing, ong)",
        "Nhận biết các dạng viết rút gọn: iu (iou), ui (uei), un (uen)",
      ],
      explanationBlocks: [
        { headingVi: "Nhóm 1 — 6 Vận mẫu đơn: a · o · e · i · u · ü", bodyVi: "• a: Há rộng tự nhiên.\n• o: Tròn môi trung bình (gần 'ô/ua' ngắn).\n• e: Kéo ngang khóe miệng nửa mở, lưỡi lùi sau (gần 'ơ' nhẹ, KHÔNG phải 'e' Việt!).\n• i: Môi dẹt như mỉm cười.\n• u: Chu môi tròn nhỏ.\n• ü: Chu môi TRÒN NHỎ như chữ u, giữ nguyên môi và phát âm chữ i." },
        { headingVi: "Nhóm 2 & 3 — Vận mẫu kép & Âm mũi", bodyVi: "• Kép: ai, ei, ao, ou (trượt mượt khẩu hình từ nguyên âm đầu sang nguyên âm sau).\n• Mũi trước (-n): an, en, in, ün (kết thúc đầu lưỡi chạm chân răng trên).\n• Mũi sau (-ng): ang, eng, ing, ong (kết thúc cuống lưỡi nâng lên sau)." },
        { headingVi: "Nhóm 4 & 5 — Nhóm i-, u-, ü- & er", bodyVi: "• Nhóm i-: ia, ie, iao, iu (=iou), ian (đọc gần yen), in, iang, ing, iong.\n• Nhóm u-: ua, uo, uai, ui (=uei), uan, un (=uen), uang, ueng.\n• Nhóm ü- & er: üe, üan, ün và âm uốn lưỡi độc lập er (như 二 èr — số 2)." },
      ],
      visualType: "MOUTH_CONTRAST",
      mouthTypes: ["open_vowel", "rounded_u_umlaut"],
      audioSamples: [
        { zh: "啊", pinyin: "ā", vi: "a — mở rộng" },
        { zh: "鹅", pinyin: "é", vi: "e — gần 'ơ' nhẹ" },
        { zh: "鱼", pinyin: "yú", vi: "ü — tròn môi nhỏ" },
        { zh: "二", pinyin: "èr", vi: "er — uốn lưỡi cuối âm" },
        { zh: "好", pinyin: "hǎo", vi: "ao — vận mẫu kép" },
        { zh: "忙", pinyin: "máng", vi: "ang — âm mũi sau" },
      ],
      guidedExample: {
        titleVi: "Mẹo đọc chuẩn âm 'ü' trong 5 giây",
        stepsVi: [
          "1. Nói kéo dài chữ 'i' tiếng Việt.",
          "2. Giữ nguyên vị trí lưỡi, từ từ chu tròn hai môi lại thành vòng tròn nhỏ như huýt sáo.",
          "3. Âm phát ra chính là 'ü' chuẩn tiếng Phổ thông!",
        ],
      },
      commonMistakesVi: [
        "Đọc 'e' thành 'e' bẹt tiếng Việt (ví dụ đọc 喝 hē thành 'he' → sai, phải gần 'hơ').",
        "Đọc 'ü' bị mở dẹt môi giữa chừng khiến âm biến thành 'i'.",
      ],
      summaryVi: "Nắm chắc khẩu hình 'e' và 'ü' cùng sự khác biệt giữa -n và -ng là bạn đã vượt qua 80% lỗi vận mẫu phổ biến.",
    },
  });

  await upsertFoundationLesson({
    moduleSlug: "stage-1-pinyin",
    slug: "foundation-s1-pinyin-combinations",
    titleVi: "Bài 1.5 — Ghép âm Pinyin & Quy tắc Chính tả đặc biệt",
    titleZh: "第 1.5 课：拼读规则",
    subtitleVi: "Tự ghép Thanh mẫu + Vận mẫu và nắm quy tắc bỏ hai chấm ü sau j, q, x",
    estimatedMinutes: 14,
    sortOrder: 5,
    conceptCode: "foundation.pinyin.finals_and_combinations",
    foundationPayload: {
      stageLabel: "Chặng 1 — Pinyin: Ghép âm tương tác",
      introWhatVi: "Thực hành ghép Thanh mẫu + Vận mẫu thành âm tiết hoàn chỉnh (b+a=ba, m+a=ma, n+i=ni, h+ao=hao) và học quy tắc chính tả đặc biệt.",
      introWhyVi: "Không phải mọi thanh mẫu đều ghép được với mọi vận mẫu, và Pinyin có quy ước rút gọn dấu hai chấm trên ü sau j, q, x, y.",
      objectivesVi: [
        "Ghép trôi chảy các âm tiết sơ cấp như ba, ma, ni, hao",
        "Ghi nhớ quy tắc vàng: j/q/x + ü viết thành ju, qu, xu nhưng VẪN đọc âm ü",
      ],
      explanationBlocks: [
        { headingVi: "1. Công thức ghép âm: Thanh mẫu (đọc ngắn) + Vận mẫu (đọc rõ)", bodyVi: "Đọc lướt thật nhanh thanh mẫu rồi nối liền sang vận mẫu: b + a = ba, m + a = ma, n + i = ni, h + ao = hao." },
        { headingVi: "2. Quy tắc bỏ hai chấm của ü sau j, q, x, y", bodyVi: "Nhóm j, q, x KHÔNG bao giờ ghép với u thường. Vì vậy khi ghép với ü, người ta bỏ hai chấm cho gọn (ju, qu, xu, yu) nhưng miệng vẫn chu tròn đọc ü! Riêng sau n và l (nü, lü) thì PHẢI giữ nguyên hai chấm để phân biệt với nu, lu." },
      ],
      visualType: "SYLLABLE_BUILDER",
      audioSamples: [
        { zh: "爸", pinyin: "bà (b + a)", vi: "Bố" },
        { zh: "你", pinyin: "nǐ (n + i)", vi: "Bạn" },
        { zh: "好", pinyin: "hǎo (h + ao)", vi: "Tốt" },
        { zh: "去", pinyin: "qù (q + ü)", vi: "Đi (vẫn đọc ü!)" },
      ],
      guidedExample: {
        titleVi: "Thử ngay trên Bảng Ghép âm tương tác phía trên",
        stepsVi: [
          "Chọn 'm' + 'a' + Thanh 1 → nghe 'mā'.",
          "Chọn 'q' + 'ü' + Thanh 4 → quan sát hệ thống tự chuyển thành 'qù' và giải thích quy tắc.",
          "Thử chọn 'j' + 'a' → quan sát lý do tổ hợp này không hợp lệ.",
        ],
      },
      commonMistakesVi: ["Thấy 'qu', 'xu', 'ju' lại đọc thành âm 'u' thường (sai! Phải chu môi đọc ü)."],
      summaryVi: "Ghi nhớ: Sau j, q, x, y bỏ hai chấm nhưng vẫn đọc ü; sau n, l giữ hai chấm (nü, lü).",
    },
    knowledgeCheck: {
      titleVi: "Kiểm tra Ghép âm & Chính tả Pinyin",
      skillType: SkillType.PRONUNCIATION,
      questions: [
        {
          questionType: QuestionType.SYLLABLE_BUILDER,
          skillType: SkillType.PRONUNCIATION,
          promptVi: "Ghép Thanh mẫu 'q' + Vận mẫu 'ü' + Thanh 4 theo đúng quy tắc chính tả Pinyin:",
          answer: { acceptedTexts: ["qù", "qu4"] },
          explanationVi: "Sau j, q, x thì ü bỏ hai chấm viết thành qù (nhưng vẫn đọc là ü).",
        },
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.PRONUNCIATION,
          promptVi: "Vì sao chữ 'nǚ' (女 — phụ nữ) bắt buộc phải giữ dấu hai chấm trên đầu chữ ü?",
          options: [
            { key: "A", vi: "Để phân biệt với âm 'nǔ' (vì n ghép được với cả u và ü)" },
            { key: "B", vi: "Vì đẹp mắt hơn" },
          ],
          answer: { optionKey: "A" },
          explanationVi: "n và l ghép được với cả u lẫn ü nên phải giữ dấu hai chấm để phân biệt rõ ràng.",
        },
      ],
    },
  });

  // --- SAMPLE LESSON A (Upgrading existing slug `foundations-pinyin-tones` in-place!) ---
  await upsertFoundationLesson({
    moduleSlug: "stage-1-pinyin",
    slug: "foundations-pinyin-tones",
    titleVi: "Bài 1.6.1 (Bài mẫu A) — Hiểu Pinyin & 4 Thanh điệu cơ bản (+ Thanh nhẹ)",
    titleZh: "第 1.6.1 课：四个基本声调与轻声",
    subtitleVi: "Cao độ 5 bậc (55, 35, 214, 51), thanh nhẹ và bộ ví dụ đổi nghĩa mā / má / mǎ / mà",
    estimatedMinutes: 18,
    sortOrder: 6,
    conceptCode: "foundation.tones.four_basic",
    foundationPayload: {
      stageLabel: "Chặng 1 — Pinyin: 4 Thanh điệu cơ bản (Bài mẫu A)",
      introWhatVi: "Bạn sẽ học cách đọc chuẩn 4 thanh điệu cơ bản và thanh nhẹ trong tiếng Phổ thông thông qua đồ thị cao độ 5 bậc trực quan.",
      introWhyVi: "Trong tiếng Trung, đổi thanh điệu là đổi hoàn toàn nghĩa của từ! Cùng chuỗi 'ma' nhưng đọc sai thanh điệu có thể biến 'mẹ (mā)' thành 'con ngựa (mǎ)' hoặc 'mắng (mà)'.",
      objectivesVi: [
        "Đọc hiểu đồ thị cao độ 5 bậc (1 thấp nhất → 5 cao nhất) của 4 thanh điệu + thanh nhẹ",
        "Phân biệt bằng tai và phát âm chuẩn bộ âm mẫu mā, má, mǎ, mà, ma",
        "Tránh 3 lỗi thanh điệu phổ biến nhất của người học Việt Nam (chưa vội học biến điệu ở bài này)",
      ],
      explanationBlocks: [
        { headingVi: "Thanh 1 (ˉ — Âm bình, cao độ 5 → 5)", bodyVi: "Cao và phẳng đều từ đầu đến cuối như một nốt nhạc ngân dài. Không để giọng tụt xuống như thanh ngang tiếng Việt." },
        { headingVi: "Thanh 2 (ˊ — Dương bình, cao độ 3 → 5)", bodyVi: "Đi lên gọn từ mức giữa lên cao, giống giọng ngạc nhiên hỏi 'Hả?' / 'Sao?'." },
        { headingVi: "Thanh 3 (ˇ — Thượng thanh, cao độ 2 → 1 → 4)", bodyVi: "Hạ xuống rất trầm ở cổ họng rồi nhấc nhẹ lên khi đứng một mình; trong câu giao tiếp thực tế thường chỉ đọc nửa thanh trầm (2 → 1)." },
        { headingVi: "Thanh 4 (ˋ — Khứ thanh, cao độ 5 → 1)", bodyVi: "Rơi nhanh, mạnh và dứt khoát từ nấc cao nhất xuống thấp nhất (như giọng hô 'Dừng!'), KHÔNG phải dấu huyền kéo dài yếu ớt." },
        { headingVi: "Thanh nhẹ (không dấu — Khinh thanh)", bodyVi: "Đọc thật nhẹ, ngắn và thả lỏng sau âm tiết chính, ví dụ chữ thứ hai trong 妈妈 (māma — mẹ) hoặc 谢谢 (xièxie — cảm ơn)." },
      ],
      visualType: "TONE_PITCH",
      audioSamples: [
        { zh: "妈", pinyin: "mā", vi: "Thanh 1 (55) — Mẹ" },
        { zh: "麻", pinyin: "má", vi: "Thanh 2 (35) — Cây gai / Tê" },
        { zh: "马", pinyin: "mǎ", vi: "Thanh 3 (214) — Con ngựa" },
        { zh: "骂", pinyin: "mà", vi: "Thanh 4 (51) — Mắng" },
        { zh: "吗", pinyin: "ma", vi: "Thanh nhẹ — Trợ từ hỏi (...không?)" },
      ],
      guidedExample: {
        titleVi: "Hướng dẫn luyện nghe & đọc theo từng bước",
        stepsVi: [
          "1. Chỉnh tốc độ 0.75x và bấm nghe lần lượt 5 thẻ cao độ phía trên.",
          "2. Đặt tay vẽ đường cao độ trong không khí khi đọc theo: ngang cao (1) → vút lên (2) → hạ thấp (3) → chém dứt khoát xuống (4).",
          "3. Dùng khung Ghi âm bên dưới đọc chuỗi 'mā, má, mǎ, mà' rồi nghe lại tự đối chiếu.",
        ],
      },
      commonMistakesVi: [
        "Đọc Thanh 1 quá thấp giống thanh ngang tiếng Việt → hãy nâng cao hơn 1–2 nấc và giữ phẳng lì.",
        "Đọc Thanh 4 nhẹ và kéo dài như dấu huyền → hãy bắt đầu thật cao rồi rơi mạnh, dứt khoát.",
        "Nhấn mạnh cả hai âm trong từ có thanh nhẹ (māma, xièxie) → hãy thả lỏng hoàn toàn âm sau.",
      ],
      summaryVi: "4 thanh điệu (55 · 35 · 214 · 51) + thanh nhẹ là nền tảng nghe hiểu. Sau khi đạt ≥ 80% bài kiểm tra bên dưới, bạn mới chuyển sang Bài 1.6.2 (Biến điệu).",
    },
    knowledgeCheck: {
      titleVi: "Kiểm tra hiểu biết Bài mẫu A — 4 Thanh điệu & Thanh nhẹ",
      skillType: SkillType.PRONUNCIATION,
      questions: [
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.PRONUNCIATION,
          promptVi: "Thanh điệu nào có cao độ CAO và PHẲNG ĐỀU (5 → 5) từ đầu đến cuối?",
          options: [
            { key: "A", vi: "Thanh 1 (ˉ)" },
            { key: "B", vi: "Thanh 2 (ˊ)" },
            { key: "C", vi: "Thanh 3 (ˇ)" },
            { key: "D", vi: "Thanh 4 (ˋ)" },
          ],
          answer: { optionKey: "A" },
          explanationVi: "Thanh 1 (Âm bình) giữ cao độ ổn định ở mức cao nhất (5 → 5).",
        },
        {
          questionType: QuestionType.AUDIO_DISCRIMINATION,
          skillType: SkillType.LISTENING,
          promptVi: "Nghe âm thanh mẫu (giọng rơi mạnh dứt khoát) và chọn đúng Pinyin & nghĩa:",
          promptZh: "骂",
          promptPinyin: "mà",
          options: [
            { key: "A", zh: "妈", pinyin: "mā", vi: "Mẹ" },
            { key: "B", zh: "麻", pinyin: "má", vi: "Cây gai / Tê" },
            { key: "C", zh: "马", pinyin: "mǎ", vi: "Con ngựa" },
            { key: "D", zh: "骂", pinyin: "mà", vi: "Mắng" },
          ],
          answer: { optionKey: "D" },
          explanationVi: "Âm rơi mạnh và nhanh từ mức 5 xuống mức 1 là Thanh 4: mà (骂 — mắng).",
        },
        {
          questionType: QuestionType.AUDIO_DISCRIMINATION,
          skillType: SkillType.LISTENING,
          promptVi: "Nghe từ 妈妈 (māma — mẹ). Âm tiết thứ hai đọc thanh gì?",
          promptZh: "妈妈",
          promptPinyin: "māma",
          options: [
            { key: "A", vi: "Thanh 1" },
            { key: "B", vi: "Thanh 4" },
            { key: "C", vi: "Thanh nhẹ (ngắn và thả lỏng)" },
          ],
          answer: { optionKey: "C" },
          explanationVi: "Trong 妈妈 (māma), chữ thứ hai không mang dấu và đọc thật nhẹ, ngắn.",
        },
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.PRONUNCIATION,
          promptVi: "Đặc điểm nổi bật nhất của Thanh 3 (ˇ) trong lời nói thực tế là gì?",
          options: [
            { key: "A", vi: "Cao nhất và ngang phẳng" },
            { key: "B", vi: "Rất trầm ở quãng thấp (2→1→4 khi đứng riêng; thường đọc nửa thanh trầm trong câu)" },
            { key: "C", vi: "Rơi nhanh mạnh từ cao xuống thấp" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "Thanh 3 đặc trưng bởi cao độ rất trầm và thay đổi linh hoạt tùy vị trí trong câu.",
        },
        {
          questionType: QuestionType.SYLLABLE_BUILDER,
          skillType: SkillType.PRONUNCIATION,
          promptVi: "Nhập Pinyin có dấu thanh (hoặc dạng số) cho từ 'Con ngựa' (m + a + Thanh 3):",
          answer: { acceptedTexts: ["mǎ", "ma3"] },
          explanationVi: "m + a + thanh 3 tạo thành mǎ (马 — con ngựa).",
        },
      ],
    },
  });

  await upsertFoundationLesson({
    moduleSlug: "stage-1-pinyin",
    slug: "foundation-s1-tone-sandhi",
    titleVi: "Bài 1.6.2 — Biến điệu trong lời nói tự nhiên (Thanh 3, 不 và 一)",
    titleZh: "第 1.6.2 课：变调规则",
    subtitleVi: "Tách riêng sau khi đã vững 4 thanh điệu cơ bản",
    estimatedMinutes: 15,
    sortOrder: 7,
    conceptCode: "foundation.tones.four_basic",
    foundationPayload: {
      stageLabel: "Chặng 1 — Pinyin: Biến điệu tự nhiên",
      introWhatVi: "Học 3 quy tắc biến điệu thực tế giúp phát âm trôi chảy như người bản xứ: biến điệu 2 thanh 3, biến điệu chữ 不 (bù) và biến điệu chữ 一 (yī).",
      introWhyVi: "Đọc liên tiếp hai thanh 3 trầm rất mỏi cổ họng nên người Trung Quốc tự nhiên nâng âm đầu lên thanh 2 — nhưng Pinyin trong sách vẫn ghi dấu gốc!",
      objectivesVi: [
        "Đọc đúng biến điệu 3 + 3 → 2 + 3 (你好 nǐ hǎo đọc thành ní hǎo)",
        "Nắm biến điệu của 不 (trước thanh 4 đọc bú: 不是 bú shì)",
        "Nắm biến điệu của 一 (trước thanh 4 đọc yí; trước thanh 1/2/3 đọc yì)",
      ],
      explanationBlocks: [
        { headingVi: "1. Biến điệu hai thanh 3 liền nhau (3 + 3 → 2 + 3)", bodyVi: "Khi 2 âm tiết mang thanh 3 đứng cạnh nhau, âm thứ nhất đọc như Thanh 2: 你好 (viết nǐ hǎo, đọc ní hǎo), 很好 (viết hěn hǎo, đọc hén hǎo)." },
        { headingVi: "2. Biến điệu chữ 不 (bù — không)", bodyVi: "Gốc là thanh 4 (bù). Khi đứng trước một chữ Thanh 4 khác, 不 đổi sang đọc Thanh 2 (bú): 不是 (bú shì), 不对 (bú duì)." },
        { headingVi: "3. Biến điệu chữ 一 (yī — số một)", bodyVi: "Khi đếm số (一二三) giữ thanh 1 (yī). Trước thanh 4 đổi thành thanh 2 (一个 yí gè); trước thanh 1, 2, 3 đổi thành thanh 4 (一天 yì tiān, 一年 yì nián, 一起 yìqǐ)." },
      ],
      visualType: "TONE_PITCH",
      audioSamples: [
        { zh: "你好", pinyin: "nǐ hǎo → đọc ní hǎo", vi: "Biến điệu 3 + 3" },
        { zh: "不是", pinyin: "bú shì", vi: "不 trước thanh 4 đọc bú" },
        { zh: "一个", pinyin: "yí gè", vi: "一 trước thanh 4 đọc yí" },
        { zh: "一天", pinyin: "yì tiān", vi: "一 trước thanh 1 đọc yì" },
      ],
      guidedExample: {
        titleVi: "Tại sao trong từ điển 你好 vẫn viết nǐ hǎo?",
        stepsVi: [
          "Từ điển ghi thanh điệu GỐC của từng chữ để bạn biết nghĩa gốc.",
          "Khi đọc thành cụm từ trong giao tiếp, miệng tự áp dụng biến điệu cho êm tai.",
        ],
      },
      commonMistakesVi: ["Đọc cứng nhắc từng thanh 3 riêng lẻ (nǐ... hǎo...) làm câu nói bị ngắt quãng."],
      summaryVi: "3 quy tắc vàng: (3+3 → 2+3), (不 + thanh 4 → bú), (一 + thanh 4 → yí; 一 + thanh 1/2/3 → yì).",
    },
  });

  // --- STAGE 2: Characters, Sample Lesson B (8 Basic Strokes), Stroke Order Rules, Character Structures ---
  await upsertFoundationLesson({
    moduleSlug: "stage-2-writing",
    slug: "foundation-s2-understanding-characters",
    titleVi: "Bài 2.1 — Hiểu cấu tạo Chữ Hán & Lý do Bút thuận quan trọng",
    titleZh: "第 2.1 课：认识汉字结构",
    subtitleVi: "Tại sao không thể vẽ chữ Hán tùy hứng theo cảm giác?",
    estimatedMinutes: 12,
    sortOrder: 1,
    conceptCode: "foundation.strokes.eight_basic",
    foundationPayload: {
      stageLabel: "Chặng 2 — Chữ Hán & Tập viết",
      introWhatVi: "Tìm hiểu bản chất hình khối của chữ Hán, sự khác biệt giữa Chữ và Từ, và lý do viết đúng bút thuận giúp bạn nhớ mặt chữ gấp đôi.",
      introWhyVi: "Viết đúng thứ tự nét tạo ra 'trí nhớ cơ tay' ổn định, giúp chữ đẹp đều trong ô vuông và gõ/tra từ điển viết tay chính xác.",
      objectivesVi: ["Hiểu mỗi chữ Hán nằm gọn trong ô Mễ (米字格)", "Biết lý do cần học 8 nét trước khi viết chữ hoàn chỉnh"],
      explanationBlocks: [
        { headingVi: "Ô Mễ (米字格) là người bạn thân của người mới", bodyVi: "Các đường chia tâm dọc, ngang và đường chéo trong ô Mễ giúp bạn căn tỷ lệ cân đối cho từng nét chữ." },
      ],
      visualType: "CHAR_STRUCTURES",
      audioSamples: [{ zh: "汉字", pinyin: "hànzì", vi: "Chữ Hán" }],
      guidedExample: {
        titleVi: "Quan sát tỷ lệ 6 dạng cấu trúc chữ phía trên",
        stepsVi: ["Nhận ra chữ độc thể (人) đặt ở tâm, còn chữ Trái–Phải (你, 好) thường chia 1/3 trái và 2/3 phải."],
      },
      commonMistakesVi: ["Viết chữ quá lệch lên trên hoặc tách rời hai bên chữ Trái–Phải thành như 2 chữ khác nhau."],
      summaryVi: "Chuẩn bị sẵn sàng tinh thần: Chữ Hán không cần 'vẽ' mà được xây theo quy luật rõ ràng từ 8 nét cơ bản.",
    },
  });

  // --- SAMPLE LESSON B (Upgrading existing slug `foundations-basic-strokes` in-place!) ---
  await upsertFoundationLesson({
    moduleSlug: "stage-2-writing",
    slug: "foundations-basic-strokes",
    titleVi: "Bài 2.2 (Bài mẫu B) — 8 Nét chữ Hán cơ bản (横 竖 撇 捺 点 提 折 钩)",
    titleZh: "第 2.2 课：汉字八种基本笔画",
    subtitleVi: "Điểm đặt bút, hướng đi, điểm dừng, hoạt ảnh từng nét & khung tập tô đối chiếu",
    estimatedMinutes: 20,
    sortOrder: 2,
    conceptCode: "foundation.strokes.eight_basic",
    foundationPayload: {
      stageLabel: "Chặng 2 — Chữ Hán & Tập viết (Bài mẫu B)",
      introWhatVi: "Học từng nét một trong 8 nét cơ bản cấu thành toàn bộ chữ Hán: Ngang (横), Sổ (竖), Phẩy (撇), Mác (捺), Chấm (点), Hất (提), Gập (折) và Móc (钩).",
      introWhyVi: "Mọi chữ Hán dù có 2 nét hay 20 nét đều được lắp ghép từ 8 nét gốc này. Viết sai hướng ngay từ đầu rất khó sửa về sau.",
      objectivesVi: [
        "Nhận diện đúng tên, điểm bắt đầu (1), hướng đi và điểm kết thúc của cả 8 nét cơ bản",
        "Phân biệt rõ cặp hay nhầm: Phẩy (撇 — đi xuống) vs Hất (提 — đi lên)",
        "Thực hành tô theo mẫu và tự viết trên lưới ô Mễ (米字格) rồi chồng mẫu tự đối chiếu",
      ],
      explanationBlocks: [
        { headingVi: "Nhóm 1 — Trục khung: Ngang (横) & Sổ (竖)", bodyVi: "Ngang luôn kéo từ TRÁI sang PHẢI; Sổ luôn kéo thẳng từ TRÊN xuống DƯỚI. Đây là hai nét xương sống tạo độ vững cho chữ." },
        { headingVi: "Nhóm 2 — Nét xiên mềm mại: Phẩy (撇) & Mác (捺)", bodyVi: "Phẩy lượn từ trên-phải xuống dưới-trái rồi thả nhẹ bút; Mác đi từ trên-trái xuống dưới-phải và nhấn đậm đuôi (ví dụ chữ 人)." },
        { headingVi: "Nhóm 3 — Nét ngắn & chuyển hướng: Chấm (点), Hất (提), Gập (折), Móc (钩)", bodyVi: "Chấm đi xuống hình giọt nước; Hất đi LÊN sang phải; Gập dừng góc vuông nhưng tính là 1 NÉT LIỀN; Móc bật ngắn sắc ở cuối nét." },
      ],
      visualType: "STROKE_ANATOMY",
      audioSamples: [
        { zh: "横、竖、撇、捺", pinyin: "héng, shù, piě, nà", vi: "Ngang, Sổ, Phẩy, Mác" },
        { zh: "点、提、折、钩", pinyin: "diǎn, tí, zhé, gōu", vi: "Chấm, Hất, Gập, Móc" },
      ],
      guidedExample: {
        titleVi: "Cách luyện hiệu quả trên Xưởng Nét chữ phía trên",
        stepsVi: [
          "1. Chọn từng nét từ 1 → 8 và bấm 'Xem lại nét' để quan sát chấm xanh (1. đặt bút) → ô vuông đỏ (dừng).",
          "2. Chuyển chế độ 'Tô theo mẫu' viết 3 lần theo đúng hướng.",
          "3. Chuyển sang 'Tự viết' rồi bấm 'So sánh chồng mẫu' để tự kiểm tra tỷ lệ.",
        ],
      },
      commonMistakesVi: [
        "Nhầm hướng giữa Phẩy (撇 đi xuống-trái) và Hất (提 đi lên-phải).",
        "Tách nét Gập (折 — như góc trên-phải chữ 口) thành 2 nét rời.",
        "Kéo nét Ngang ngược từ phải sang trái.",
      ],
      summaryVi: "8 nét cơ bản là bảng chữ cái hình học của chữ Hán. Hãy hoàn thành bài kiểm tra bên dưới để sang Quy tắc Bút thuận.",
    },
    knowledgeCheck: {
      titleVi: "Kiểm tra hiểu biết Bài mẫu B — 8 Nét cơ bản",
      skillType: SkillType.WRITING,
      questions: [
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.WRITING,
          promptVi: "Nét Ngang (横) luôn được viết theo hướng nào?",
          options: [
            { key: "A", vi: "Phải → Trái" },
            { key: "B", vi: "Trái → Phải" },
            { key: "C", vi: "Dưới → Trên" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "Nét Ngang luôn đặt bút bên trái kéo sang phải.",
        },
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.WRITING,
          promptVi: "Sự khác nhau cơ bản về hướng đi giữa Nét Phẩy (撇) và Nét Hất (提) là gì?",
          options: [
            { key: "A", vi: "Phẩy đi xuống-trái; Hất đi lên-phải" },
            { key: "B", vi: "Cả hai đều đi từ trên xuống dưới" },
            { key: "C", vi: "Phẩy đi lên; Hất đi xuống" },
          ],
          answer: { optionKey: "A" },
          explanationVi: "Phẩy (撇) vuốt từ trên-phải xuống dưới-trái; Hất (提) hất từ dưới-trái lên trên-phải.",
        },
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.WRITING,
          promptVi: "Nét Gập (横折) tạo góc trên-phải trong chữ 口 được tính là mấy nét?",
          options: [
            { key: "A", vi: "2 nét rời" },
            { key: "B", vi: "1 nét liền (dừng đổi hướng tại góc)" },
            { key: "C", vi: "3 nét" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "Nét Gập luôn tính là 1 nét liền duy nhất.",
        },
        {
          questionType: QuestionType.STROKE_ORDER_SEQUENCE,
          skillType: SkillType.WRITING,
          promptVi: "Sắp xếp đúng thứ tự 2 nét của chữ 人 (người):",
          metadata: { tokens: ["Nét Mác (捺)", "Nét Phẩy (撇)"] },
          answer: { orderedTokens: ["Nét Phẩy (撇)", "Nét Mác (捺)"] },
          explanationVi: "Quy tắc bút thuận chuẩn: Phẩy trước, Mác sau (先撇后捺).",
        },
        {
          questionType: QuestionType.STROKE_ORDER_SEQUENCE,
          skillType: SkillType.WRITING,
          promptVi: "Sắp xếp đúng thứ tự 3 nét của chữ 口 (miệng):",
          metadata: { tokens: ["Ngang đóng đáy (横)", "Sổ trái (竖)", "Ngang gập trên-phải (横折)"] },
          answer: { orderedTokens: ["Sổ trái (竖)", "Ngang gập trên-phải (横折)", "Ngang đóng đáy (横)"] },
          explanationVi: "Viết vách trái (竖), khung trên-phải (横折), rồi mới đóng đáy (横) sau cùng.",
        },
      ],
    },
  });

  await upsertFoundationLesson({
    moduleSlug: "stage-2-writing",
    slug: "foundation-s2-stroke-order-rules",
    titleVi: "Bài 2.3 — 6 Quy tắc Bút thuận cốt lõi (十, 人, 大, 木, 口, 日, 月)",
    titleZh: "第 2.3 课：笔顺基本规则",
    subtitleVi: "Trên trước dưới, trái trước phải, ngang trước sổ, vào trước đóng sau",
    estimatedMinutes: 16,
    sortOrder: 3,
    conceptCode: "foundation.strokes.eight_basic",
    foundationPayload: {
      stageLabel: "Chặng 2 — Quy tắc Bút thuận",
      introWhatVi: "Học 6 quy tắc bút thuận chuẩn áp dụng trên 7 chữ mẫu kinh điển: 十, 人, 大, 木, 口, 日, 月.",
      introWhyVi: "Thay vì học thuộc thứ tự nét của hàng nghìn chữ riêng lẻ, chỉ cần 6 quy tắc này bạn đã viết đúng trên 90% chữ Hán cơ bản.",
      objectivesVi: [
        "Áp dụng đúng 6 quy tắc bút thuận trên chữ 十, 人, 大, 木, 口, 日, 月",
        "Hiểu rằng một số chữ cụ thể có thể có chi tiết quy ước riêng theo chuẩn từng vùng",
      ],
      explanationBlocks: [
        { headingVi: "1. Trên trước dưới sau (三, 二) & 2. Trái trước phải sau (林, 你)", bodyVi: "Bắt đầu từ tầng trên cùng xuống đáy, và từ khối bên trái sang khối bên phải." },
        { headingVi: "3. Ngang trước sổ sau (十, 大, 木) & 4. Ngoài trước trong sau (月, 同)", bodyVi: "Với nét giao cắt phổ biến như 十 và 木, kéo ngang trước rồi mới kéo sổ." },
        { headingVi: "5. Vào trước đóng sau (口, 日, 国) & 6. Giữa trước hai bên sau (小, 水)", bodyVi: "Viết hết phần ruột bên trong chữ 日/国 rồi mới kéo nét ngang đáy đóng cửa lại! Chú ý: quy ước bút thuận vẫn có ngoại lệ chi tiết ở một số chữ đặc thù." },
      ],
      visualType: "CHAR_STROKE_DEMO",
      demoCharacters: ["一", "人", "大", "口", "中", "好"],
      audioSamples: [
        { zh: "十、人、大、木", pinyin: "shí, rén, dà, mù", vi: "Mười, Người, To, Cây" },
        { zh: "口、日、月", pinyin: "kǒu, rì, yuè", vi: "Miệng, Mặt trời, Mặt trăng" },
      ],
      guidedExample: {
        titleVi: "Bấm 'Chạy nét' và 'Từng nét' trên chữ 口, 人, 大, 中, 好",
        stepsVi: ["Quan sát nét đóng đáy của chữ 口 và chữ 中 luôn được viết sau khi hoàn tất phần trong."],
      },
      commonMistakesVi: ["Đóng đáy chữ 口 hoặc 日 trước khi viết nét ngang ở giữa."],
      summaryVi: "6 quy tắc cốt lõi giúp tay bạn viết chữ Hán tự nhiên, nhanh và chuẩn cấu trúc.",
    },
  });

  // --- STAGE 3: Sample Lesson C — Radicals & Character Components ---
  await upsertFoundationLesson({
    moduleSlug: "stage-3-radicals",
    slug: "foundation-s3-radicals-and-components",
    titleVi: "Bài 3.1 (Bài mẫu C) — Bộ thủ & Thành phần cấu tạo chữ Hán (Nghĩa vs Âm)",
    titleZh: "第 3.1 课：偏旁部首与形声字",
    subtitleVi: "Phân biệt Nét – Bộ thủ – Thành phần và hiểu đúng chữ Hình thanh (你, 好, 妈, 河, 休, 明, 语, 林)",
    estimatedMinutes: 18,
    sortOrder: 1,
    conceptCode: "foundation.radicals.semantic_vs_phonetic",
    foundationPayload: {
      stageLabel: "Chặng 3 — Bộ thủ & Thành phần chữ (Bài mẫu C)",
      introWhatVi: "Hiểu sự khác nhau giữa Nét chữ, Bộ thủ và Thành phần cấu tạo chữ; giải mã 8 chữ mẫu (你, 好, 妈, 河, 休, 明, 语, 林) và khám phá 18 bộ thủ phổ biến nhất.",
      introWhyVi: "Hiểu bộ phận giúp bạn giải mã chữ mới thay vì học vẹt, nhưng đồng thời phải hiểu ĐÚNG vai trò gợi nghĩa vs gợi âm để không suy diễn sai lệch.",
      objectivesVi: [
        "Phân biệt 4 cấp độ: Nét chữ → Thành phần → Bộ thủ → Chữ hoàn chỉnh",
        "Phân biệt thành phần gợi nghĩa (như 女, 氵, 讠) với thành phần gợi âm (như 马 trong 妈)",
        "Nhận diện được 18 bộ thủ cốt lõi và các biến thể khi ghép (亻, 氵, 扌, 忄, 讠, 钅)",
      ],
      explanationBlocks: [
        {
          headingVi: "1. Không phải mọi thành phần trong chữ đều chỉ nghĩa!",
          bodyVi: "Phần lớn chữ Hán hiện đại là chữ Hình thanh (形声字): gồm 1 thành phần gợi nhóm nghĩa + 1 thành phần gợi âm đọc. Ví dụ: 妈 (mā — mẹ) = 女 (gợi nghĩa phụ nữ) + 马 (gợi âm đọc mǎ → mā, KHÔNG mang nghĩa con ngựa!).",
        },
        {
          headingVi: "2. Biến thể thu gọn khi ghép vào chữ",
          bodyVi: "Khi đứng bên trái làm bộ phận ghép, nhiều bộ thủ thu gọn dáng cho cân ô vuông: 人 → 亻 (你, 休), 水 → 氵 (河), 手 → 扌 (打), 心 → 忄 (忙), 言 → 讠 (语, 谢), 金 → 钅 (钱).",
        },
        {
          headingVi: "3. Lưu ý tinh tế về bộ 月",
          bodyVi: "Trong 明 (sáng), 月 nghĩa là Mặt trăng; nhưng trong các chữ chỉ cơ thể (như 脸 khuôn mặt, 脚 bàn chân), 月 là biến thể lịch sử của bộ Nhục (肉 — cơ thể).",
        },
      ],
      visualType: "RADICAL_BREAKDOWN",
      audioSamples: [
        { zh: "你、好、妈、河", pinyin: "nǐ, hǎo, mā, hé", vi: "Bạn, Tốt, Mẹ, Con sông" },
        { zh: "休、明、语、林", pinyin: "xiū, míng, yǔ, lín", vi: "Nghỉ ngơi, Sáng, Ngôn ngữ, Rừng" },
      ],
      guidedExample: {
        titleVi: "Thực hành tách bộ phận trực quan trên 8 chữ mẫu phía trên",
        stepsVi: [
          "1. Bấm vào 妈 → thấy màu xanh lam 女 (gợi nghĩa) + màu tím 马 (gợi âm).",
          "2. Bấm vào 休 (亻+木) và 明 (日+月) → thấy cả 2 phần cùng gợi nghĩa (chữ Hội ý).",
          "3. Xem bảng 18 bộ thủ đầy đủ tại Trung tâm Nền tảng (/foundation) để ôn theo 3 nhóm Con người / Thiên nhiên / Đời sống.",
        ],
      },
      commonMistakesVi: [
        "Cố dịch thành phần gợi âm thành nghĩa (như dịch 妈 thành 'phụ nữ + con ngựa').",
        "Tưởng rằng chỉ cần nhìn 1 bộ thủ là đoán chính xác 100% nghĩa của mọi chữ Hán.",
      ],
      summaryVi: "Dùng bộ thủ làm manh mối gợi nhớ và phân loại chữ khoa học, luôn phân tách rõ phần gợi nghĩa với phần gợi âm.",
    },
    knowledgeCheck: {
      titleVi: "Kiểm tra hiểu biết Bài mẫu C — Bộ thủ & Thành phần chữ",
      skillType: SkillType.VOCABULARY,
      questions: [
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.VOCABULARY,
          promptVi: "Trong chữ 妈 (mā — mẹ), thành phần 马 đóng vai trò chính là gì?",
          options: [
            { key: "A", vi: "Chỉ nghĩa con ngựa" },
            { key: "B", vi: "Thành phần gợi âm đọc (mǎ gần với mā)" },
            { key: "C", vi: "Chỉ là nét trang trí" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "妈 là chữ Hình thanh: 女 gợi nhóm nghĩa (phụ nữ), còn 马 là thành phần gợi âm.",
        },
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.VOCABULARY,
          promptVi: "Biến thể '氵' (ba chấm thủy bên trái chữ 河) xuất phát từ chữ độc lập nào?",
          options: [
            { key: "A", zh: "火", vi: "Lửa" },
            { key: "B", zh: "水", vi: "Nước" },
            { key: "C", zh: "手", vi: "Tay" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "水 (nước) khi ghép bên trái thu gọn thành 氵.",
        },
        {
          questionType: QuestionType.RADICAL_MATCHING,
          skillType: SkillType.VOCABULARY,
          promptVi: "Chọn chữ có chứa bộ thủ gợi nghĩa Lời nói / Ngôn ngữ (讠):",
          options: [
            { key: "A", zh: "休", pinyin: "xiū" },
            { key: "B", zh: "林", pinyin: "lín" },
            { key: "C", zh: "语", pinyin: "yǔ" },
            { key: "D", zh: "河", pinyin: "hé" },
          ],
          answer: { optionKey: "C" },
          explanationVi: "语 (ngôn ngữ, trong 汉语) mang bộ Ngôn giản thể 讠 bên trái.",
        },
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.VOCABULARY,
          promptVi: "Chữ 林 (lín — khu rừng) được ghép từ thành phần nào?",
          options: [
            { key: "A", vi: "日 + 月" },
            { key: "B", vi: "木 + 木 (hai cái cây)" },
            { key: "C", vi: "亻 + 木" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "Hai chữ 木 (cây) đứng cạnh nhau tạo thành 林 (khu rừng).",
        },
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.VOCABULARY,
          promptVi: "Nhận định nào sau đây là CHÍNH XÁC nhất về bộ thủ chữ Hán?",
          options: [
            { key: "A", vi: "Biết bộ thủ là đoán chính xác 100% nghĩa của mọi chữ" },
            { key: "B", vi: "Bộ thủ giúp phân loại và gợi nhóm nghĩa trong nhiều chữ, nhưng nhiều thành phần khác có vai trò gợi âm" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "Hiểu chính xác cả thành phần gợi nghĩa và gợi âm giúp học chữ Hán bền vững.",
        },
      ],
    },
  });

  // --- STAGE 4: First Vocabulary with Visual Scenes ---
  await upsertFoundationLesson({
    moduleSlug: "stage-4-vocab",
    slug: "foundation-s4-first-vocabulary",
    titleVi: "Bài 4.1 — Từ vựng Đầu tiên qua Bối cảnh Trực quan (Chào hỏi, Gia đình, Ẩm thực)",
    titleZh: "第 4.1 课：看图学基础词汇",
    subtitleVi: "Ghi nhớ từ vựng bằng hình ảnh đời thực, phân rã thanh điệu và câu ví dụ",
    estimatedMinutes: 16,
    sortOrder: 1,
    conceptCode: "foundation.vocab_grammar.core_patterns",
    foundationPayload: {
      stageLabel: "Chặng 4 — Từ vựng Đầu tiên Trực quan",
      introWhatVi: "Học nhóm từ vựng thiết yếu nhất sau khi đã vững Pinyin, nét chữ và bộ thủ — đi kèm hình minh họa bối cảnh trực tiếp.",
      introWhyVi: "Liên kết trực tiếp Chữ Hán + Âm thanh + Hình ảnh bối cảnh giúp bạn phản xạ không cần dịch trung gian chậm chạp.",
      objectivesVi: [
        "Nhận diện, phát âm và dùng đúng từ chào hỏi (你好, 谢谢), gia đình (爸爸, 妈妈, 家) và ăn uống (吃, 喝, 米饭, 茶)",
        "Phân tích được thanh điệu và bộ thủ bên trong từng từ vừa học",
      ],
      explanationBlocks: [
        { headingVi: "Kết nối kiến thức Chặng 1–3 vào Từ vựng thật", bodyVi: "• 你好 (nǐ hǎo): 你 có bộ 亻 (người), 好 gồm 女 + 子; biến điệu đọc ní hǎo.\n• 妈妈 (māma): 妈 có bộ 女 + gợi âm 马; chữ sau đọc thanh nhẹ.\n• 吃米饭 / 喝茶: 吃 và 喝 đều có bộ 口 (miệng); 茶 có bộ 艹 (thảo mộc) phía trên!" },
      ],
      visualType: "VOCAB_SCENES",
      sceneImages: [
        { src: "/images/foundation/greeting.svg", captionVi: "Chào hỏi trực tiếp: 你好 (Nǐ hǎo — Xin chào)" },
        { src: "/images/foundation/family.svg", captionVi: "Gia đình 4 người: 爸爸 · 妈妈 · 我 · 妹妹" },
        { src: "/images/foundation/food-tea.svg", captionVi: "Ăn uống hằng ngày: 吃米饭 (ăn cơm) & 喝茶 (uống trà)" },
      ],
      audioSamples: [
        { zh: "你好！", pinyin: "Nǐ hǎo!", vi: "Xin chào!" },
        { zh: "我家有四口人。", pinyin: "Wǒ jiā yǒu sì kǒu rén.", vi: "Nhà tôi có bốn người." },
        { zh: "我想吃米饭，想喝茶。", pinyin: "Wǒ xiǎng chī mǐfàn, xiǎng hē chá.", vi: "Tôi muốn ăn cơm, muốn uống trà." },
      ],
      guidedExample: {
        titleVi: "Quan sát 3 tranh bối cảnh và đọc to câu bên dưới mỗi hình",
        stepsVi: ["Ghi chú bộ thủ 口 trong 吃/喝 và bộ 艹 trong 茶 để nhớ mặt chữ ngay lập tức."],
      },
      commonMistakesVi: ["Dùng 吃 (ăn) cho đồ uống hoặc canh (tiếng Trung dùng 喝 cho trà, nước và cả canh 喝汤)."],
      summaryVi: "Từ vựng không hề khô khan khi gắn với hình ảnh ngữ cảnh và bộ thủ đã học.",
    },
  });

  // --- STAGE 5: Basic Grammar ---
  await upsertFoundationLesson({
    moduleSlug: "stage-5-grammar",
    slug: "foundation-s5-basic-grammar",
    titleVi: "Bài 5.1 — Ngữ pháp Nền tảng: Câu 是, Phủ định 不/没, Câu hỏi 吗 & Tính từ 很",
    titleZh: "第 5.1 课：基础语法核心",
    subtitleVi: "Đối chiếu trực diện thói quen tiếng Việt để không đặt câu sai",
    estimatedMinutes: 18,
    sortOrder: 1,
    conceptCode: "foundation.vocab_grammar.core_patterns",
    foundationPayload: {
      stageLabel: "Chặng 5 — Ngữ pháp Nền tảng",
      introWhatVi: "Nắm 4 trụ cột ngữ pháp quan trọng nhất của tiếng Trung sơ cấp: Câu chữ 是, Phủ định 不/没, Câu hỏi Có/Không 吗, và câu tính từ dùng 很.",
      introWhyVi: "90% lỗi ngữ pháp của người Việt mới học đến từ việc dịch từng chữ từ tiếng Việt sang tiếng Trung (như viết '我是很好').",
      objectivesVi: [
        "Biết chính xác khi nào dùng 是 (trước danh từ) và khi nào dùng 很 (trước tính từ)",
        "Phân biệt phủ định với 不 và 没 (không có: 没有)",
        "Đặt câu hỏi tự nhiên với 吗 và từ để hỏi 什么/几 không cần đảo ngữ",
      ],
      explanationBlocks: [
        { headingVi: "1. Câu chữ 是 (Chủ ngữ + 是 + Danh từ)", bodyVi: "Chỉ dùng 是 để nối với DANH TỪ: 我是越南学生。(Tôi là sinh viên Việt Nam). Phủ định: 我不是老师。" },
        { headingVi: "2. Câu tính từ (Chủ ngữ + 很 + Tính từ)", bodyVi: "KHÔNG dùng 是 trước tính từ! Dùng 很 làm cầu nối tự nhiên: 我很好。(Tôi khỏe). 今天很热。(Hôm nay nóng)." },
        { headingVi: "3. Phủ định 不 vs 没", bodyVi: "• 不 (bù): phủ định sự thật hiện tại, thói quen, ý muốn (不是, 不想, 不喝).\n• 没 (méi): dùng với 有 → 没有 (không có) và phủ định hành động chưa xảy ra." },
        { headingVi: "4. Câu hỏi 吗 & Từ để hỏi (什么, 谁, 几, 多少)", bodyVi: "• Thêm 吗 vào cuối câu trần thuật: 你是学生吗？\n• Khi đã có từ để hỏi thì KHÔNG thêm 吗 và giữ nguyên vị trí từ như câu trả lời: 你叫什么名字？" },
      ],
      visualType: "GRAMMAR_COMPARE",
      grammarCompareRows: [
        { vietnameseVi: "Tôi rất khỏe", wrongZh: "我是很好。", correctZh: "我很好。", correctPinyin: "Wǒ hěn hǎo.", reasonVi: "Không dùng 是 trước tính từ đơn giản" },
        { vietnameseVi: "Tôi tên là Minh", wrongZh: "我是叫明。", correctZh: "我叫明。", correctPinyin: "Wǒ jiào Míng.", reasonVi: "叫 đã là động từ, không thêm 是" },
        { vietnameseVi: "Tôi không có sách", wrongZh: "我不有书。", correctZh: "我没有书。", correctPinyin: "Wǒ méiyǒu shū.", reasonVi: "Phủ định của 有 luôn dùng 没 (没有)" },
        { vietnameseVi: "Bạn tên là gì?", wrongZh: "你叫什么名字吗？", correctZh: "你叫什么名字？", correctPinyin: "Nǐ jiào shénme míngzi?", reasonVi: "Đã có từ để hỏi 什么 thì không thêm 吗" },
        { vietnameseVi: "Hai người", wrongZh: "二个人", correctZh: "两个人", correctPinyin: "liǎng gè rén", reasonVi: "Trước lượng từ dùng 两 (liǎng), không dùng 二" },
      ],
      audioSamples: [
        { zh: "我是越南学生。", pinyin: "Wǒ shì Yuènán xuésheng.", vi: "Tôi là sinh viên Việt Nam." },
        { zh: "我很好，谢谢你。", pinyin: "Wǒ hěn hǎo, xièxie nǐ.", vi: "Tôi rất khỏe, cảm ơn bạn." },
        { zh: "我没有哥哥。", pinyin: "Wǒ méiyǒu gēge.", vi: "Tôi không có anh trai." },
        { zh: "你喝茶吗？", pinyin: "Nǐ hē chá ma?", vi: "Bạn có uống trà không?" },
        { zh: "我家有四口人。", pinyin: "Wǒ jiā yǒu sì kǒu rén.", vi: "Nhà tôi có bốn người." },
      ],
      guidedExample: {
        titleVi: "5 bước kiểm tra câu trước khi nói/viết",
        stepsVi: [
          "Có dùng 是 trước tính từ không? → Bỏ 是, thay bằng 很.",
          "Có phủ định động từ 有 không? → Luôn dùng 没有.",
          "Có cả 什么/几 lẫn 吗 trong cùng câu không? → Bỏ 吗.",
        ],
      },
      commonMistakesVi: ["Viết '我不有' thay vì '我没有'; viết '我是很好' thay vì '我很好'."],
      summaryVi: "Nắm 5 dòng bảng đối chiếu phía trên là bạn đã tránh được gần như toàn bộ lỗi ngữ pháp sơ cấp!",
    },
    knowledgeCheck: {
      titleVi: "Kiểm tra Ngữ pháp Nền tảng",
      skillType: SkillType.GRAMMAR,
      questions: [
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.GRAMMAR,
          promptVi: "Chọn câu đúng ngữ pháp để nói 'Tôi không có cà phê':",
          options: [
            { key: "A", zh: "我不有咖啡。" },
            { key: "B", zh: "我没有咖啡。" },
            { key: "C", zh: "我不是有咖啡。" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "Phủ định của động từ 有 luôn dùng 没 → 没有.",
        },
        {
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.GRAMMAR,
          promptVi: "Chọn câu đúng để nói 'Hôm nay rất nóng':",
          options: [
            { key: "A", zh: "今天是很热。" },
            { key: "B", zh: "今天很热。" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "Trước tính từ 热 (nóng) dùng 很, không dùng 是.",
        },
      ],
    },
  });

  // --- STAGE 6: Basic Sentence Construction ---
  await upsertFoundationLesson({
    moduleSlug: "stage-6-sentences",
    slug: "foundation-s6-sentence-construction",
    titleVi: "Bài 6.1 — Ghép câu chuẩn Trật tự Tiếng Trung & Hội thoại đầu tiên",
    titleZh: "第 6.1 课：基本造句与日常对话",
    subtitleVi: "Chủ ngữ + Thời gian + Địa điểm + Động từ + Tân ngữ",
    estimatedMinutes: 16,
    sortOrder: 1,
    conceptCode: "foundation.sentences.word_order",
    foundationPayload: {
      stageLabel: "Chặng 6 — Ghép câu & Hội thoại Sơ khởi",
      introWhatVi: "Luyện sắp xếp từ vựng và ngữ pháp đã học thành câu hoàn chỉnh chuẩn trật tự tiếng Trung.",
      introWhyVi: "Trật tự đặt Thời gian và Địa điểm trong tiếng Trung NGƯỢC với thói quen đặt cuối câu của tiếng Việt.",
      objectivesVi: [
        "Áp dụng công thức vàng: Chủ ngữ + Thời gian + Địa điểm (在...) + Động từ + Tân ngữ",
        "Tự dựng được câu khẳng định, phủ định và câu hỏi ngắn",
      ],
      explanationBlocks: [
        {
          headingVi: "Công thức Trật tự câu tiếng Trung",
          bodyVi: "Khác tiếng Việt ('Tôi học tiếng Trung ở nhà hôm nay'), tiếng Trung đặt khung cảnh Thời gian và Địa điểm lên TRƯỚC hành động: 我 (Chủ ngữ) + 今天 (Thời gian) + 在家 (Địa điểm) + 学习 (Động từ) + 汉语 (Tân ngữ).",
        },
      ],
      visualType: "SENTENCE_ORDER",
      sentenceSlots: [
        { labelVi: "1. Chủ ngữ", zh: "我", pinyin: "Wǒ", colorClass: "border-blue-300 bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-200" },
        { labelVi: "2. Thời gian", zh: "今天", pinyin: "jīntiān", colorClass: "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200" },
        { labelVi: "3. Địa điểm", zh: "在家", pinyin: "zài jiā", colorClass: "border-teal-300 bg-teal-50 text-teal-900 dark:bg-teal-950/50 dark:text-teal-200" },
        { labelVi: "4. Động từ", zh: "学习", pinyin: "xuéxí", colorClass: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200" },
        { labelVi: "5. Tân ngữ", zh: "汉语", pinyin: "hànyǔ", colorClass: "border-purple-300 bg-purple-50 text-purple-900 dark:bg-purple-950/50 dark:text-purple-200" },
      ],
      audioSamples: [
        { zh: "我今天在家学习汉语。", pinyin: "Wǒ jīntiān zài jiā xuéxí hànyǔ.", vi: "Hôm nay tôi học tiếng Trung ở nhà." },
        { zh: "明天我想去学校看书。", pinyin: "Míngtiān wǒ xiǎng qù xuéxiào kànshū.", vi: "Ngày mai tôi muốn đến trường đọc sách." },
      ],
      guidedExample: {
        titleVi: "Bước ghép câu không bao giờ nhầm",
        stepsVi: [
          "Bước 1: Xác định Ai? (我)",
          "Bước 2: Khi nào? Ở đâu? (今天 + 在家)",
          "Bước 3: Làm gì? Cái gì? (学习 + 汉语)",
        ],
      },
      commonMistakesVi: ["Đặt '在家' ra cuối câu (Sai: 我学习汉语在家 → Đúng: 我在家学习汉语)."],
      summaryVi: "Nhớ quy tắc 'Khung cảnh (Thời gian, Địa điểm) đặt trước Hành động'. Sau bài này, hãy làm Đánh giá Tổng hợp Chặng 7 để nhận xác nhận sẵn sàng lên HSK 1!",
    },
    knowledgeCheck: {
      titleVi: "Kiểm tra Ghép câu Trật tự Tiếng Trung",
      skillType: SkillType.WRITING,
      questions: [
        {
          questionType: QuestionType.SENTENCE_ORDERING,
          skillType: SkillType.WRITING,
          promptVi: "Sắp xếp các từ thành câu chuẩn nghĩa 'Hôm nay tôi học tiếng Trung ở nhà':",
          metadata: { tokens: ["学习", "今天", "汉语", "在家", "我"] },
          answer: { orderedTokens: ["我", "今天", "在家", "学习", "汉语"] },
          explanationVi: "Trật tự chuẩn: Chủ ngữ (我) + Thời gian (今天) + Địa điểm (在家) + Động từ (学习) + Tân ngữ (汉语).",
        },
      ],
    },
  });

  // ---------------------------------------------------------------------------
  // 4. STAGE 7 — Comprehensive Multi-Skill Foundation Assessment (ExamTemplate)
  // ---------------------------------------------------------------------------
  const existingFoundationExam = await prisma.examTemplate.findUnique({
    where: { slug: "foundation-final-assessment" },
  });

  if (!existingFoundationExam) {
    const foundationQs = await prisma.question.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        conceptId: { not: null },
      },
      orderBy: { createdAt: "asc" },
      take: 14,
    });

    if (foundationQs.length > 0) {
      const totalPoints = foundationQs.length * 10;
      await prisma.examTemplate.create({
        data: {
          curriculumVersionId: hsk2.id,
          learningLevelId: foundationLevel.id,
          slug: "foundation-final-assessment",
          titleVi: "Chặng 7 — Bài Đánh giá Tổng hợp Nền tảng (Xét điều kiện lên HSK 1)",
          descriptionVi:
            "Đánh giá toàn diện đa kỹ năng: Pinyin, 4 Thanh điệu, 8 Nét & Bút thuận, Bộ thủ, Ngữ pháp nền và Ghép câu. Hệ thống chỉ khuyến nghị lên HSK 1 khi bạn vững tất cả các trụ cột.",
          examType: ExamType.FULL_MOCK,
          durationSeconds: 15 * 60,
          totalPoints,
          passingScore: Math.round(totalPoints * 0.8),
          scoringRules: {
            configurable: true,
            pointsPerQuestion: 10,
            foundationGate: true,
            requiresAllPillars: true,
          },
          isOfficialLicensed: false,
          licenseAttribution: "Bài đánh giá nền tảng gốc biên soạn bởi HanLearn.",
          status: ContentStatus.PUBLISHED,
          origin: ContentOrigin.VERIFIED_ORIGINAL,
          sections: {
            create: [
              {
                titleVi: "Đánh giá Đa kỹ năng Nền tảng Tiếng Trung (Stages 0 – 6)",
                skillType: SkillType.PRONUNCIATION,
                instructionsVi: "Hoàn thành tất cả các câu hỏi về Pinyin, Thanh điệu, Nét chữ, Bộ thủ, Ngữ pháp và Ghép câu.",
                sectionPoints: totalPoints,
                sortOrder: 1,
                questions: {
                  create: foundationQs.map((q, idx) => ({
                    questionId: q.id,
                    sortOrder: idx + 1,
                    pointsOverride: 10,
                  })),
                },
              },
            ],
          },
        },
      });
    }
  }
}
