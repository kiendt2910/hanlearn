import {
  PrismaClient,
  ContentOrigin,
  ContentStatus,
  LessonSectionType,
  SkillType,
  QuestionType,
  ExamType,
} from "@prisma/client";

export async function seedCurriculumContent(prisma: PrismaClient) {
  const hsk2 = await prisma.curriculumVersion.findUniqueOrThrow({
    where: { code: "hsk-2.0-v1" },
  });
  const hsk3 = await prisma.curriculumVersion.findUniqueOrThrow({
    where: { code: "hsk-3.0-v1" },
  });

  // ---------------------------------------------------------------------------
  // 1. Learning Levels (HSK 2.0 Full Ladder + HSK 3.0 Separate Configurable Ladder)
  // ---------------------------------------------------------------------------
  const hsk2LevelsData = [
    {
      code: "foundations",
      titleVi: "Nền tảng tiếng Trung (Pinyin & Chữ Hán)",
      titleZh: "汉语基础",
      descriptionVi: "Làm chủ hệ thống phiên âm Pinyin, 4 thanh điệu + thanh nhẹ và quy tắc viết nét chữ Hán cho người mới bắt đầu hoàn toàn.",
      objectivesVi: [
        "Phát âm đúng thanh mẫu, vận mẫu và 4 thanh điệu tiếng Phổ thông",
        "Nắm vững 8 nét cơ bản và 7 quy tắc bút thuận chữ Hán",
        "Đọc được phiên âm Pinyin chuẩn cho từ vựng sơ cấp",
      ],
      sortOrder: 1,
      cefrEquivalent: "Pre-A1",
    },
    {
      code: "hsk-1",
      titleVi: "HSK 1 — Giao tiếp sơ cấp nhập môn",
      titleZh: "HSK 一级",
      descriptionVi: "Hiểu và sử dụng các cụm từ, mẫu câu cơ bản trong chào hỏi, gia đình, số đếm và sinh hoạt hằng ngày.",
      objectivesVi: [
        "Giới thiệu bản thân, quốc tịch, gia đình và tuổi tác",
        "Đặt câu hỏi đơn giản với 吗, 什么, 几, 多少",
        "Nghe và đọc hiểu các đoạn hội thoại ngắn hằng ngày",
      ],
      sortOrder: 2,
      cefrEquivalent: "A1",
    },
    {
      code: "hsk-2",
      titleVi: "HSK 2 — Giao tiếp đời sống cơ bản",
      titleZh: "HSK 二级",
      descriptionVi: "Trao đổi trực tiếp về thời gian, mua sắm, đi lại, thời tiết và kế hoạch quen thuộc.",
      objectivesVi: [
        "Hỏi giá, mặc cả lịch sự và diễn đạt thời gian chính xác",
        "Mô tả hoạt động đã xảy ra với 了 và dự định với 要/想",
      ],
      sortOrder: 3,
      cefrEquivalent: "A2",
    },
    {
      code: "hsk-3",
      titleVi: "HSK 3 — Giao tiếp độc lập sơ trung cấp",
      titleZh: "HSK 三级",
      descriptionVi: "Xử lý tốt các tình huống học tập, công việc cơ bản và du lịch tại Trung Quốc.",
      objectivesVi: ["Sử dụng bổ ngữ kết quả, bổ ngữ xu hướng và câu chữ 把 cơ bản"],
      sortOrder: 4,
      cefrEquivalent: "B1",
    },
    {
      code: "hsk-4",
      titleVi: "HSK 4 — Trung cấp ứng dụng",
      titleZh: "HSK 四级",
      descriptionVi: "Thảo luận mạch lạc về nhiều chủ đề xã hội, công việc và bày tỏ quan điểm cá nhân.",
      objectivesVi: ["Đọc hiểu bài báo ngắn và viết đoạn văn lập luận rõ ràng"],
      sortOrder: 5,
      cefrEquivalent: "B2",
    },
    {
      code: "hsk-5",
      titleVi: "HSK 5 — Trung cao cấp",
      titleZh: "HSK 五级",
      descriptionVi: "Đọc báo chí, theo dõi chương trình truyền thông và trình bày bài nói hoàn chỉnh.",
      objectivesVi: ["Phân biệt từ cận nghĩa và sắc thái văn viết/văn nói"],
      sortOrder: 6,
      cefrEquivalent: "C1",
    },
    {
      code: "hsk-6",
      titleVi: "HSK 6 — Cao cấp thông thạo",
      titleZh: "HSK 六级",
      descriptionVi: "Nắm bắt thông tin phức tạp, tóm tắt văn bản dài và diễn đạt trôi chảy như người bản xứ.",
      objectivesVi: ["Sử dụng thành ngữ (成语) và cấu trúc văn viết học thuật chuẩn xác"],
      sortOrder: 7,
      cefrEquivalent: "C2",
    },
    {
      code: "advanced-chinese",
      titleVi: "Tiếng Trung Nâng cao & Văn hóa",
      titleZh: "高级汉语",
      descriptionVi: "Chuyên sâu về diễn đạt tự nhiên, truyền thông đương đại và thành ngữ điển tích.",
      objectivesVi: ["Phân tích sắc thái ngữ dụng và diễn ngôn phức tạp"],
      sortOrder: 8,
      cefrEquivalent: "C2+",
    },
    {
      code: "business-chinese",
      titleVi: "Tiếng Trung Thương mại & Công sở",
      titleZh: "商务汉语",
      descriptionVi: "Giao tiếp chuyên nghiệp trong họp hành, đàm phán, email thương mại và đón tiếp đối tác.",
      objectivesVi: [
        "Sử dụng kính ngữ chuẩn mực trong gặp gỡ đối tác và trao danh thiếp",
        "Trình bày báo cáo và đàm phán điều khoản cơ bản",
      ],
      sortOrder: 9,
      cefrEquivalent: "B1–C1",
    },
    {
      code: "academic-chinese",
      titleVi: "Tiếng Trung Học thuật & Nghiên cứu",
      titleZh: "学术汉语",
      descriptionVi: "Đọc tài liệu chuyên ngành, viết tiểu luận học thuật và thuyết trình seminar bằng tiếng Trung.",
      objectivesVi: ["Viết tóm tắt nghiên cứu và sử dụng thuật ngữ học thuật chính xác"],
      sortOrder: 10,
      cefrEquivalent: "C1–C2",
    },
  ];

  const levelMap = new Map<string, string>();
  for (const lvl of hsk2LevelsData) {
    const rec = await prisma.learningLevel.upsert({
      where: {
        curriculumVersionId_code: {
          curriculumVersionId: hsk2.id,
          code: lvl.code,
        },
      },
      update: {
        titleVi: lvl.titleVi,
        titleZh: lvl.titleZh,
        descriptionVi: lvl.descriptionVi,
        objectivesVi: lvl.objectivesVi,
        sortOrder: lvl.sortOrder,
        cefrEquivalent: lvl.cefrEquivalent,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        curriculumVersionId: hsk2.id,
        ...lvl,
        status: ContentStatus.PUBLISHED,
        origin: ContentOrigin.VERIFIED_ORIGINAL,
        configMetadata: { configurable: true },
      },
    });
    levelMap.set(lvl.code, rec.id);
  }

  // HSK 3.0 Separate Configurable Levels
  const hsk3LevelsData = [
    {
      code: "hsk30-elementary-1",
      titleVi: "HSK 3.0 — Bậc 1 (Sơ cấp 1)",
      titleZh: "HSK 3.0 一级",
      descriptionVi: "Cấp độ khởi đầu trong khung tiêu chuẩn năng lực tiếng Trung quốc tế HSK 3.0 (cấu hình độc lập).",
      objectivesVi: ["Nhận diện thanh điệu, chữ Hán cốt lõi và giao tiếp nhập môn"],
      sortOrder: 1,
      cefrEquivalent: "A1",
    },
    {
      code: "hsk30-elementary-2",
      titleVi: "HSK 3.0 — Bậc 2 (Sơ cấp 2)",
      titleZh: "HSK 3.0 二级",
      descriptionVi: "Mở rộng giao tiếp hằng ngày, nghe hiểu và viết câu ngắn theo chuẩn HSK 3.0.",
      objectivesVi: ["Mở rộng vốn từ, viết tay chữ Hán cơ bản và hội thoại thực tế"],
      sortOrder: 2,
      cefrEquivalent: "A2",
    },
    {
      code: "hsk30-elementary-3",
      titleVi: "HSK 3.0 — Bậc 3 (Sơ cấp 3)",
      titleZh: "HSK 3.0 三级",
      descriptionVi: "Hoàn thiện giai đoạn sơ cấp của hệ thống 3 giai đoạn 9 bậc HSK 3.0.",
      objectivesVi: ["Giao tiếp trôi chảy về học tập, công việc và đời sống"],
      sortOrder: 3,
      cefrEquivalent: "B1",
    },
    {
      code: "hsk30-intermediate-4-6",
      titleVi: "HSK 3.0 — Bậc 4–6 (Trung cấp)",
      titleZh: "HSK 3.0 中等（四至六级）",
      descriptionVi: "Phát triển kỹ năng đọc hiểu chuyên sâu, diễn đạt đa dạng và biên dịch sơ cấp.",
      objectivesVi: ["Thảo luận chủ đề xã hội và tóm tắt thông tin đa chiều"],
      sortOrder: 4,
      cefrEquivalent: "B2–C1",
    },
    {
      code: "hsk30-advanced-7-9",
      titleVi: "HSK 3.0 — Bậc 7–9 (Cao cấp)",
      titleZh: "HSK 3.0 高等（七至九级）",
      descriptionVi: "Tiêu chuẩn tiếng Trung học thuật và nghề nghiệp cao cấp (Bậc 7–9).",
      objectivesVi: ["Đọc tài liệu chuyên ngành, thuyết trình và dịch thuật chuyên sâu"],
      sortOrder: 5,
      cefrEquivalent: "C2",
    },
  ];

  for (const lvl of hsk3LevelsData) {
    await prisma.learningLevel.upsert({
      where: {
        curriculumVersionId_code: {
          curriculumVersionId: hsk3.id,
          code: lvl.code,
        },
      },
      update: {
        titleVi: lvl.titleVi,
        titleZh: lvl.titleZh,
        descriptionVi: lvl.descriptionVi,
        objectivesVi: lvl.objectivesVi,
        sortOrder: lvl.sortOrder,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        curriculumVersionId: hsk3.id,
        ...lvl,
        status: ContentStatus.PUBLISHED,
        origin: ContentOrigin.VERIFIED_ORIGINAL,
        configMetadata: { framework: "HSK_3_0", configurable: true },
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Characters & Stroke Order SVG Data (Verified Basic Hanzi)
  // ---------------------------------------------------------------------------
  const charactersSeed = [
    {
      hanzi: "一",
      pinyin: "yī",
      radical: "一",
      strokeCount: 1,
      meaningVi: "Số một; duy nhất",
      mnemonicVi: "Một nét ngang thẳng duy nhất từ trái sang phải.",
      strokes: [
        { order: 1, name: "Heng (Ngang)", path: "M 18 50 L 82 50" },
      ],
    },
    {
      hanzi: "人",
      pinyin: "rén",
      radical: "人",
      strokeCount: 2,
      meaningVi: "Người",
      mnemonicVi: "Hình dáng một người đang đứng hai chân vững chãi.",
      strokes: [
        { order: 1, name: "Pie (Phẩy)", path: "M 52 16 Q 42 54 20 84" },
        { order: 2, name: "Na (Mác)", path: "M 48 44 Q 62 66 82 84" },
      ],
    },
    {
      hanzi: "大",
      pinyin: "dà",
      radical: "大",
      strokeCount: 3,
      meaningVi: "To, lớn",
      mnemonicVi: "Người (人) dang rộng hai tay (一) để chỉ sự to lớn.",
      strokes: [
        { order: 1, name: "Heng (Ngang)", path: "M 20 38 L 80 38" },
        { order: 2, name: "Pie (Phẩy)", path: "M 50 14 Q 46 58 20 86" },
        { order: 3, name: "Na (Mác)", path: "M 50 42 Q 62 66 82 86" },
      ],
    },
    {
      hanzi: "口",
      pinyin: "kǒu",
      radical: "口",
      strokeCount: 3,
      meaningVi: "Miệng; nhân khẩu",
      mnemonicVi: "Hình vuông mô phỏng khuôn miệng khi mở ra.",
      strokes: [
        { order: 1, name: "Shu (Sổ)", path: "M 26 26 L 26 78" },
        { order: 2, name: "Hengzhe (Ngang gập)", path: "M 26 26 L 74 26 L 74 78" },
        { order: 3, name: "Heng (Ngang đóng)", path: "M 26 74 L 74 74" },
      ],
    },
    {
      hanzi: "中",
      pinyin: "zhōng",
      radical: "丨",
      strokeCount: 4,
      meaningVi: "Ở giữa, trung tâm (Trung Quốc)",
      mnemonicVi: "Một nét sổ thẳng xuyên chính giữa hình chữ nhật.",
      strokes: [
        { order: 1, name: "Shu (Sổ trái)", path: "M 24 32 L 28 62" },
        { order: 2, name: "Hengzhe (Ngang gập)", path: "M 24 32 L 76 32 L 72 62" },
        { order: 3, name: "Heng (Ngang đóng)", path: "M 28 60 L 72 60" },
        { order: 4, name: "Shu (Sổ giữa)", path: "M 50 12 L 50 90" },
      ],
    },
    {
      hanzi: "好",
      pinyin: "hǎo",
      radical: "女",
      strokeCount: 6,
      meaningVi: "Tốt, khỏe, hay",
      mnemonicVi: "Bộ Nữ (女 - người mẹ) bên cạnh bộ Tử (子 - đứa con): điều tốt đẹp.",
      strokes: [
        { order: 1, name: "Piedian", path: "M 32 18 L 22 52 L 42 74" },
        { order: 2, name: "Pie", path: "M 42 36 Q 34 62 18 82" },
        { order: 3, name: "Ti (Hất)", path: "M 14 48 L 46 42" },
        { order: 4, name: "Hengpie", path: "M 54 22 L 80 22 L 66 38" },
        { order: 5, name: "Wangou", path: "M 66 38 Q 70 66 64 84 L 56 78" },
        { order: 6, name: "Heng", path: "M 48 52 L 86 52" },
      ],
    },
  ];

  for (const ch of charactersSeed) {
    const saved = await prisma.character.upsert({
      where: { hanzi: ch.hanzi },
      update: {
        pinyin: ch.pinyin,
        radical: ch.radical,
        strokeCount: ch.strokeCount,
        meaningVi: ch.meaningVi,
        mnemonicVi: ch.mnemonicVi,
      },
      create: {
        hanzi: ch.hanzi,
        pinyin: ch.pinyin,
        radical: ch.radical,
        strokeCount: ch.strokeCount,
        meaningVi: ch.meaningVi,
        mnemonicVi: ch.mnemonicVi,
        origin: ContentOrigin.VERIFIED_ORIGINAL,
      },
    });

    for (const st of ch.strokes) {
      await prisma.characterStroke.upsert({
        where: {
          characterId_strokeOrder: {
            characterId: saved.id,
            strokeOrder: st.order,
          },
        },
        update: { svgPath: st.path, strokeName: st.name },
        create: {
          characterId: saved.id,
          strokeOrder: st.order,
          svgPath: st.path,
          strokeName: st.name,
        },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Verified Vocabulary Knowledge Base
  // ---------------------------------------------------------------------------
  const vocabSeed = [
    {
      levelCode: "foundations",
      simplified: "汉语",
      traditional: "漢語",
      pinyin: "hànyǔ",
      pinyinNumbered: "han4yu3",
      partOfSpeech: "Danh từ",
      primaryMeaningVi: "Tiếng Hán, tiếng Trung Quốc",
      primaryMeaningEn: "Chinese language",
      commonMistakesVi: "Không nhầm thanh 4 của 汉 (hàn) sang thanh ngang; 语 (yǔ) là thanh 3 rõ.",
      example: {
        sentenceZh: "我学习汉语。",
        pinyin: "Wǒ xuéxí hànyǔ.",
        translationVi: "Tôi học tiếng Trung.",
      },
    },
    {
      levelCode: "foundations",
      simplified: "声调",
      traditional: "聲調",
      pinyin: "shēngdiào",
      pinyinNumbered: "sheng1diao4",
      partOfSpeech: "Danh từ",
      primaryMeaningVi: "Thanh điệu",
      primaryMeaningEn: "tone",
      commonMistakesVi: "Người Việt hay đọc thanh 1 (shēng) hơi trầm xuống; cần giữ cao độ ngang và ổn định.",
      example: {
        sentenceZh: "汉语有四个基本声调。",
        pinyin: "Hànyǔ yǒu sì gè jīběn shēngdiào.",
        translationVi: "Tiếng Trung có bốn thanh điệu cơ bản.",
      },
    },
    {
      levelCode: "foundations",
      simplified: "汉字",
      traditional: "漢字",
      pinyin: "hànzì",
      pinyinNumbered: "han4zi4",
      partOfSpeech: "Danh từ",
      primaryMeaningVi: "Chữ Hán",
      primaryMeaningEn: "Chinese character",
      commonMistakesVi: "Cả hai âm tiết đều là thanh 4, đọc dứt khoát từ cao xuống thấp.",
      example: {
        sentenceZh: "我喜欢写汉字。",
        pinyin: "Wǒ xǐhuan xiě hànzì.",
        translationVi: "Tôi thích viết chữ Hán.",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "你好",
      traditional: "你好",
      pinyin: "nǐ hǎo",
      pinyinNumbered: "ni3 hao3",
      partOfSpeech: "Cụm từ giao tiếp",
      primaryMeaningVi: "Xin chào",
      primaryMeaningEn: "hello",
      commonMistakesVi: "Biến điệu thanh 3: hai thanh 3 liền nhau nên 你 đọc thành thanh 2 (ní hǎo), nhưng khi viết Pinyin vẫn ghi nǐ hǎo.",
      example: {
        sentenceZh: "你好！很高兴认识你。",
        pinyin: "Nǐ hǎo! Hěn gāoxìng rènshi nǐ.",
        translationVi: "Xin chào! Rất vui được làm quen với bạn.",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "谢谢",
      traditional: "謝謝",
      pinyin: "xièxie",
      pinyinNumbered: "xie4xie5",
      partOfSpeech: "Động từ",
      primaryMeaningVi: "Cảm ơn",
      primaryMeaningEn: "thank you",
      commonMistakesVi: "Âm tiết thứ hai đọc thanh nhẹ (xie), không nhấn mạnh cả hai chữ.",
      example: {
        sentenceZh: "谢谢你的帮助。",
        pinyin: "Xièxie nǐ de bāngzhù.",
        translationVi: "Cảm ơn sự giúp đỡ của bạn.",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "我",
      traditional: "我",
      pinyin: "wǒ",
      pinyinNumbered: "wo3",
      partOfSpeech: "Đại từ",
      primaryMeaningVi: "Tôi, mình",
      primaryMeaningEn: "I, me",
      commonMistakesVi: "Trước thanh 1, 2, 4 chỉ cần đọc nửa thanh 3 trầm, không cần uốn giọng quá dài.",
      example: {
        sentenceZh: "我是越南人。",
        pinyin: "Wǒ shì Yuènán rén.",
        translationVi: "Tôi là người Việt Nam.",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "叫",
      traditional: "叫",
      pinyin: "jiào",
      pinyinNumbered: "jiao4",
      partOfSpeech: "Động từ",
      primaryMeaningVi: "Tên là, gọi là",
      primaryMeaningEn: "to be called",
      commonMistakesVi: "Không dùng 是 trước 叫 (Sai: 我是叫小明 → Đúng: 我叫小明).",
      example: {
        sentenceZh: "我叫明安。",
        pinyin: "Wǒ jiào Míng'ān.",
        translationVi: "Tôi tên là Minh An.",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "名字",
      traditional: "名字",
      pinyin: "míngzi",
      pinyinNumbered: "ming2zi5",
      partOfSpeech: "Danh từ",
      primaryMeaningVi: "Tên, họ tên",
      primaryMeaningEn: "name",
      commonMistakesVi: "Chữ 子 trong 名字 đọc thanh nhẹ (zi).",
      example: {
        sentenceZh: "你叫什么名字？",
        pinyin: "Nǐ jiào shénme míngzi?",
        translationVi: "Bạn tên là gì?",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "是",
      traditional: "是",
      pinyin: "shì",
      pinyinNumbered: "shi4",
      partOfSpeech: "Động từ",
      primaryMeaningVi: "Là",
      primaryMeaningEn: "to be",
      commonMistakesVi: "Không dùng 是 trực tiếp trước tính từ đơn giản (Sai: 他是很高 → Đúng: 他很高).",
      example: {
        sentenceZh: "她是我的汉语老师。",
        pinyin: "Tā shì wǒ de hànyǔ lǎoshī.",
        translationVi: "Cô ấy là giáo viên tiếng Trung của tôi.",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "学生",
      traditional: "學生",
      pinyin: "xuésheng",
      pinyinNumbered: "xue2sheng5",
      partOfSpeech: "Danh từ",
      primaryMeaningVi: "Học sinh, sinh viên",
      primaryMeaningEn: "student",
      commonMistakesVi: "Âm u sau x phát âm là ü (tròn môi).",
      example: {
        sentenceZh: "我是大学生。",
        pinyin: "Wǒ shì dàxuésheng.",
        translationVi: "Tôi là sinh viên đại học.",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "老师",
      traditional: "老師",
      pinyin: "lǎoshī",
      pinyinNumbered: "lao3shi1",
      partOfSpeech: "Danh từ",
      primaryMeaningVi: "Thầy giáo, cô giáo",
      primaryMeaningEn: "teacher",
      commonMistakesVi: "Đặt họ trước 老师: 王老师 (Thầy/Cô Vương), không nói 老师王.",
      example: {
        sentenceZh: "王老师，您好！",
        pinyin: "Wáng lǎoshī, nín hǎo!",
        translationVi: "Em chào thầy/cô Vương ạ!",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "家",
      traditional: "家",
      pinyin: "jiā",
      pinyinNumbered: "jia1",
      partOfSpeech: "Danh từ",
      primaryMeaningVi: "Nhà, gia đình",
      primaryMeaningEn: "home, family",
      commonMistakesVi: "Khi nói 'gia đình tôi', dùng 我家 tự nhiên hơn 我的家 trong văn nói.",
      example: {
        sentenceZh: "我家有四口人。",
        pinyin: "Wǒ jiā yǒu sì kǒu rén.",
        translationVi: "Gia đình tôi có bốn người.",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "爸爸",
      traditional: "爸爸",
      pinyin: "bàba",
      pinyinNumbered: "ba4ba5",
      partOfSpeech: "Danh từ",
      primaryMeaningVi: "Bố, cha",
      primaryMeaningEn: "father, dad",
      commonMistakesVi: "Âm b không bật hơi, gần với âm 'p' nhẹ không bật hơi.",
      example: {
        sentenceZh: "我爸爸是医生。",
        pinyin: "Wǒ bàba shì yīshēng.",
        translationVi: "Bố tôi là bác sĩ.",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "妈妈",
      traditional: "媽媽",
      pinyin: "māma",
      pinyinNumbered: "ma1ma5",
      partOfSpeech: "Danh từ",
      primaryMeaningVi: "Mẹ, má",
      primaryMeaningEn: "mother, mom",
      commonMistakesVi: "Chữ thứ nhất thanh 1 cao đều, chữ thứ hai thanh nhẹ.",
      example: {
        sentenceZh: "妈妈做的菜很好吃。",
        pinyin: "Māma zuò de cài hěn hǎochī.",
        translationVi: "Món mẹ nấu rất ngon.",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "口",
      traditional: "口",
      pinyin: "kǒu",
      pinyinNumbered: "kou3",
      partOfSpeech: "Lượng từ / Danh từ",
      primaryMeaningVi: "Lượng từ chỉ số người trong gia đình; miệng",
      primaryMeaningEn: "measure word for family members",
      commonMistakesVi: "Thường dùng với số nhỏ trong gia đình (三口人, 四口人); tránh dùng cho người lạ.",
      example: {
        sentenceZh: "你家有几口人？",
        pinyin: "Nǐ jiā yǒu jǐ kǒu rén?",
        translationVi: "Nhà bạn có mấy người?",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "岁",
      traditional: "歲",
      pinyin: "suì",
      pinyinNumbered: "sui4",
      partOfSpeech: "Lượng từ",
      primaryMeaningVi: "Tuổi",
      primaryMeaningEn: "years old",
      commonMistakesVi: "Không thêm 是 trước số tuổi (Sai: 我是二十岁 → Đúng: 我二十岁).",
      example: {
        sentenceZh: "我妹妹今年八岁。",
        pinyin: "Wǒ mèimei jīnnián bā suì.",
        translationVi: "Em gái tôi năm nay tám tuổi.",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "想",
      traditional: "想",
      pinyin: "xiǎng",
      pinyinNumbered: "xiang3",
      partOfSpeech: "Động từ năng nguyện",
      primaryMeaningVi: "Muốn, dự định; nhớ, nghĩ",
      primaryMeaningEn: "to want, to think, to miss",
      commonMistakesVi: "想 + Động từ biểu thị mong muốn lịch sự, nhẹ nhàng hơn 要.",
      example: {
        sentenceZh: "我想喝一杯茶。",
        pinyin: "Wǒ xiǎng hē yì bēi chá.",
        translationVi: "Tôi muốn uống một tách trà.",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "吃",
      traditional: "吃",
      pinyin: "chī",
      pinyinNumbered: "chi1",
      partOfSpeech: "Động từ",
      primaryMeaningVi: "Ăn",
      primaryMeaningEn: "to eat",
      commonMistakesVi: "Âm ch uốn lưỡi và bật hơi mạnh.",
      example: {
        sentenceZh: "中午你想吃什么？",
        pinyin: "Zhōngwǔ nǐ xiǎng chī shénme?",
        translationVi: "Buổi trưa bạn muốn ăn gì?",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "米饭",
      traditional: "米飯",
      pinyin: "mǐfàn",
      pinyinNumbered: "mi3fan4",
      partOfSpeech: "Danh từ",
      primaryMeaningVi: "Cơm trắng",
      primaryMeaningEn: "cooked rice",
      commonMistakesVi: "米饭 chỉ cơm trắng đã nấu chín, khác với 大米 (gạo sống).",
      example: {
        sentenceZh: "我喜欢吃米饭和中国菜。",
        pinyin: "Wǒ xǐhuan chī mǐfàn hé Zhōngguó cài.",
        translationVi: "Tôi thích ăn cơm và món ăn Trung Quốc.",
      },
    },
    {
      levelCode: "hsk-1",
      simplified: "喝",
      traditional: "喝",
      pinyin: "hē",
      pinyinNumbered: "he1",
      partOfSpeech: "Động từ",
      primaryMeaningVi: "Uống",
      primaryMeaningEn: "to drink",
      commonMistakesVi: "Người Trung Quốc nói 喝汤 (uống canh) thay vì 吃汤.",
      example: {
        sentenceZh: "我每天喝很多水。",
        pinyin: "Wǒ měitiān hē hěn duō shuǐ.",
        translationVi: "Mỗi ngày tôi uống rất nhiều nước.",
      },
    },
    {
      levelCode: "hsk-2",
      simplified: "多少钱",
      traditional: "多少錢",
      pinyin: "duōshao qián",
      pinyinNumbered: "duo1shao5 qian2",
      partOfSpeech: "Cụm từ nghi vấn",
      primaryMeaningVi: "Bao nhiêu tiền",
      primaryMeaningEn: "how much money",
      commonMistakesVi: "Không dùng 几钱 để hỏi giá; dùng 多少钱.",
      example: {
        sentenceZh: "请问，这本书多少钱？",
        pinyin: "Qǐngwèn, zhè běn shū duōshao qián?",
        translationVi: "Xin hỏi, quyển sách này bao nhiêu tiền?",
      },
    },
    {
      levelCode: "hsk-2",
      simplified: "便宜",
      traditional: "便宜",
      pinyin: "piányi",
      pinyinNumbered: "pian2yi5",
      partOfSpeech: "Tính từ",
      primaryMeaningVi: "Rẻ, phải chăng",
      primaryMeaningEn: "inexpensive, cheap",
      commonMistakesVi: "Trong từ này 便 đọc là pián (không đọc biàn như trong 方便).",
      example: {
        sentenceZh: "这家店的水果很便宜。",
        pinyin: "Zhè jiā diàn de shuǐguǒ hěn piányi.",
        translationVi: "Trái cây ở cửa hàng này rất rẻ.",
      },
    },
    {
      levelCode: "business-chinese",
      simplified: "名片",
      traditional: "名片",
      pinyin: "míngpiàn",
      pinyinNumbered: "ming2pian4",
      partOfSpeech: "Danh từ",
      primaryMeaningVi: "Danh thiếp",
      primaryMeaningEn: "business card",
      commonMistakesVi: "Khi trao danh thiếp trong văn hóa kinh doanh Trung Quốc, nên trao và nhận bằng cả hai tay.",
      example: {
        sentenceZh: "您好，这是我的名片。",
        pinyin: "Nín hǎo, zhè shì wǒ de míngpiàn.",
        translationVi: "Xin chào ngài, đây là danh thiếp của tôi.",
      },
    },
    {
      levelCode: "business-chinese",
      simplified: "合作",
      traditional: "合作",
      pinyin: "hézuò",
      pinyinNumbered: "he2zuo4",
      partOfSpeech: "Động từ / Danh từ",
      primaryMeaningVi: "Hợp tác",
      primaryMeaningEn: "to cooperate, cooperation",
      commonMistakesVi: "Dùng với 愉快 để chúc hợp tác tốt đẹp: 祝我们合作愉快!",
      example: {
        sentenceZh: "希望我们今后合作愉快。",
        pinyin: "Xīwàng wǒmen jīnhòu hézuò yúkuài.",
        translationVi: "Hy vọng chúng ta hợp tác thuận lợi trong thời gian tới.",
      },
    },
  ];

  const vocabMap = new Map<string, string>();
  for (const v of vocabSeed) {
    const saved = await prisma.vocabulary.upsert({
      where: {
        simplified_pinyin: { simplified: v.simplified, pinyin: v.pinyin },
      },
      update: {
        primaryMeaningVi: v.primaryMeaningVi,
        primaryMeaningEn: v.primaryMeaningEn,
        commonMistakesVi: v.commonMistakesVi,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        learningLevelId: levelMap.get(v.levelCode) ?? null,
        simplified: v.simplified,
        traditional: v.traditional,
        pinyin: v.pinyin,
        pinyinNumbered: v.pinyinNumbered,
        partOfSpeech: v.partOfSpeech,
        primaryMeaningVi: v.primaryMeaningVi,
        primaryMeaningEn: v.primaryMeaningEn,
        commonMistakesVi: v.commonMistakesVi,
        status: ContentStatus.PUBLISHED,
        origin: ContentOrigin.VERIFIED_ORIGINAL,
        senses: {
          create: {
            partOfSpeech: v.partOfSpeech,
            meaningVi: v.primaryMeaningVi,
            meaningEn: v.primaryMeaningEn,
            sortOrder: 1,
          },
        },
        examples: {
          create: {
            sentenceZh: v.example.sentenceZh,
            pinyin: v.example.pinyin,
            translationVi: v.example.translationVi,
            sortOrder: 1,
          },
        },
      },
    });
    vocabMap.set(v.simplified, saved.id);
  }

  // ---------------------------------------------------------------------------
  // 4. Verified Grammar Points
  // ---------------------------------------------------------------------------
  const grammarSeed = [
    {
      levelCode: "hsk-1",
      code: "hsk1-shi-sentence",
      titleVi: "Câu chữ 是 (Chủ ngữ + 是 + Danh từ)",
      patternZh: "主语 + 是 + 名词",
      patternPinyin: "Zhǔyǔ + shì + míngcí",
      explanationVi: "Dùng để khẳng định danh tính, nghề nghiệp, quốc tịch hoặc mối quan hệ. Phủ định bằng 不是 (bú shì).",
      usageNotesVi: "Không đặt 是 trước tính từ đơn thuần. Để nối chủ ngữ với tính từ, dùng phó từ chỉ mức độ như 很 (hěn).",
      comparisonsVi: "Khác với tiếng Việt ('Tôi là sinh viên' dùng 是, nhưng 'Hôm nay trời rất nóng' KHÔNG dùng 是).",
      commonErrorsVi: "Sai: 我是很好。→ Đúng: 我很好。",
      examples: [
        { sentenceZh: "我是越南学生。", pinyin: "Wǒ shì Yuènán xuésheng.", translationVi: "Tôi là học sinh Việt Nam.", isIncorrect: false },
        { sentenceZh: "他不是老师，他是医生。", pinyin: "Tā bú shì lǎoshī, tā shì yīshēng.", translationVi: "Anh ấy không phải giáo viên, anh ấy là bác sĩ.", isIncorrect: false },
        { sentenceZh: "我是很高兴。", pinyin: "Wǒ shì hěn gāoxìng.", translationVi: "(Sai ngữ pháp — bỏ 是, nói 我很高兴)", isIncorrect: true },
      ],
    },
    {
      levelCode: "hsk-1",
      code: "hsk1-ma-question",
      titleVi: "Câu hỏi Có/Không với trợ từ 吗",
      patternZh: "陈述句 + 吗？",
      patternPinyin: "Chénshùjù + ma?",
      explanationVi: "Chỉ cần thêm 吗 vào cuối câu trần thuật để tạo thành câu hỏi Có/Không mà không cần đảo ngữ.",
      usageNotesVi: "Không dùng 吗 trong câu đã có đại từ nghi vấn như 什么 (gì), 谁 (ai), 哪儿 (ở đâu).",
      comparisonsVi: "Tương đương với '... phải không? / ... không?' ở cuối câu tiếng Việt.",
      commonErrorsVi: "Sai: 你叫什么名字吗？→ Đúng: 你叫什么名字？",
      examples: [
        { sentenceZh: "你是老师吗？", pinyin: "Nǐ shì lǎoshī ma?", translationVi: "Bạn là giáo viên phải không?", isIncorrect: false },
        { sentenceZh: "你学习汉语吗？", pinyin: "Nǐ xuéxí hànyǔ ma?", translationVi: "Bạn có học tiếng Trung không?", isIncorrect: false },
      ],
    },
    {
      levelCode: "hsk-1",
      code: "hsk1-measure-words",
      titleVi: "Cấu trúc Số từ + Lượng từ + Danh từ",
      patternZh: "数词 + 量词 + 名词",
      patternPinyin: "Shùcí + liàngcí + míngcí",
      explanationVi: "Trong tiếng Trung, khi đếm danh từ bắt buộc phải có lượng từ ở giữa số từ và danh từ (như 个, 口, 本, 杯).",
      usageNotesVi: "Số 2 đứng trước lượng từ đọc là 两 (liǎng), không dùng 二 (èr): 两口人, 两本书.",
      comparisonsVi: "Tương tự 'ba cái bát', 'hai quyển sách' trong tiếng Việt nhưng tiếng Trung áp dụng chặt chẽ hơn (kể cả với 'người': 一个人).",
      commonErrorsVi: "Sai: 二个人 → Đúng: 两个人。",
      examples: [
        { sentenceZh: "我家有四口人。", pinyin: "Wǒ jiā yǒu sì kǒu rén.", translationVi: "Gia đình tôi có 4 người.", isIncorrect: false },
        { sentenceZh: "我想买两本书。", pinyin: "Wǒ xiǎng mǎi liǎng běn shū.", translationVi: "Tôi muốn mua 2 quyển sách.", isIncorrect: false },
      ],
    },
    {
      levelCode: "hsk-1",
      code: "hsk1-xiang-verb",
      titleVi: "Diễn đạt mong muốn với 想 + Động từ",
      patternZh: "主语 + 想 + 动词 + 宾语",
      patternPinyin: "Zhǔyǔ + xiǎng + dòngcí + bīnyǔ",
      explanationVi: "Biểu thị ý muốn hoặc dự định làm việc gì đó một cách lịch sự. Phủ định dùng 不想 (bù xiǎng).",
      usageNotesVi: "Khi gọi món hoặc nêu mong muốn nhẹ nhàng, 想 tự nhiên hơn 要.",
      comparisonsVi: "Tương đương 'muốn...' trong tiếng Việt.",
      commonErrorsVi: "Tránh bỏ động từ chính sau 想 khi nói muốn ăn/uống (nên nói 想喝茶 thay vì 想茶).",
      examples: [
        { sentenceZh: "我想吃米饭。", pinyin: "Wǒ xiǎng chī mǐfàn.", translationVi: "Tôi muốn ăn cơm.", isIncorrect: false },
        { sentenceZh: "我今天不想喝咖啡。", pinyin: "Wǒ jīntiān bù xiǎng hē kāfēi.", translationVi: "Hôm nay tôi không muốn uống cà phê.", isIncorrect: false },
      ],
    },
    {
      levelCode: "hsk-2",
      code: "hsk2-duoshao-qian",
      titleVi: "Hỏi giá cả với 多少钱",
      patternZh: "主语 + 多少钱？",
      patternPinyin: "Zhǔyǔ + duōshao qián?",
      explanationVi: "Cấu trúc chuẩn để hỏi giá tiền của sản phẩm hoặc dịch vụ.",
      usageNotesVi: "Trong văn nói, tiền tệ thường dùng 块 (kuài - tệ) thay cho 元 (yuán).",
      comparisonsVi: "Không cần động từ 是 ở giữa trong văn nói tự nhiên: 这个多少钱？",
      commonErrorsVi: "Sai: 这个几钱？→ Đúng: 这个多少钱？",
      examples: [
        { sentenceZh: "这杯茶多少钱？", pinyin: "Zhè bēi chá duōshao qián?", translationVi: "Cốc trà này bao nhiêu tiền?", isIncorrect: false },
      ],
    },
  ];

  const grammarMap = new Map<string, string>();
  for (const g of grammarSeed) {
    const saved = await prisma.grammarPoint.upsert({
      where: { code: g.code },
      update: {
        titleVi: g.titleVi,
        patternZh: g.patternZh,
        explanationVi: g.explanationVi,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        learningLevelId: levelMap.get(g.levelCode) ?? null,
        code: g.code,
        titleVi: g.titleVi,
        patternZh: g.patternZh,
        patternPinyin: g.patternPinyin,
        explanationVi: g.explanationVi,
        usageNotesVi: g.usageNotesVi,
        comparisonsVi: g.comparisonsVi,
        commonErrorsVi: g.commonErrorsVi,
        status: ContentStatus.PUBLISHED,
        origin: ContentOrigin.VERIFIED_ORIGINAL,
        examples: {
          create: g.examples.map((ex, idx) => ({
            sentenceZh: ex.sentenceZh,
            pinyin: ex.pinyin,
            translationVi: ex.translationVi,
            isIncorrect: ex.isIncorrect,
            sortOrder: idx + 1,
          })),
        },
      },
    });
    grammarMap.set(g.code, saved.id);
  }

  // ---------------------------------------------------------------------------
  // 5. Courses, Modules, and Complete 8-Section Lessons
  // ---------------------------------------------------------------------------
  const coursesSpec = [
    {
      levelCode: "foundations",
      slug: "chinese-foundations-starter",
      titleVi: "Nền tảng Phát âm Pinyin & Quy tắc Chữ Hán",
      titleZh: "汉语拼音与汉字基础",
      summaryVi: "Khóa nhập môn thiết yếu giúp người Việt phát âm chuẩn 4 thanh điệu và nắm chắc quy tắc viết nét chữ Hán trước khi vào HSK 1.",
      estimatedMinutes: 90,
      sortOrder: 1,
      module: {
        slug: "module-1-pinyin-strokes",
        titleVi: "Chương 1: Pinyin, Thanh điệu & Bút thuận",
        titleZh: "第一单元：拼音与笔顺",
      },
      lessons: [
        {
          slug: "foundations-pinyin-tones",
          titleVi: "Bài 1: Hệ thống Pinyin và 4 Thanh điệu chuẩn",
          titleZh: "第一课：拼音与声调",
          subtitleVi: "Phân biệt thanh 1, 2, 3, 4 và thanh nhẹ cho người Việt",
          objectivesVi: [
            "Nhận biết độ cao và đường nét của 4 thanh điệu cơ bản + thanh nhẹ",
            "Tránh các lỗi phát âm phổ biến của người Việt với thanh 1 và thanh 3",
            "Đọc chính xác tổ hợp Pinyin cơ bản như mā, má, mǎ, mà",
          ],
          estimatedMinutes: 20,
          sortOrder: 1,
          vocabKeys: ["汉语", "声调", "汉字"],
          grammarKeys: [],
          listening: {
            dialogueTitleVi: "Nghe phân biệt 4 thanh điệu và câu giới thiệu ngắn",
            lines: [
              { speaker: "Giáo viên", zh: "汉语有四个声调：mā、má、mǎ、mà。", pinyin: "Hànyǔ yǒu sì gè shēngdiào: mā, má, mǎ, mà.", vi: "Tiếng Trung có bốn thanh điệu: mā, má, mǎ, mà." },
              { speaker: "Học viên", zh: "我学习汉语，也学习写汉字。", pinyin: "Wǒ xuéxí hànyǔ, yě xuéxí xiě hànzì.", vi: "Tôi học tiếng Trung và cũng học viết chữ Hán." },
            ],
            comprehensionQuestion: {
              promptVi: "Theo đoạn nghe, học viên đang học những gì?",
              options: ["Chỉ học nói tiếng Anh", "Học tiếng Trung và viết chữ Hán", "Học toán học"],
              correctIndex: 1,
            },
          },
          speaking: [
            { zh: "汉语有四个声调。", pinyin: "Hànyǔ yǒu sì gè shēngdiào.", vi: "Tiếng Trung có bốn thanh điệu." },
            { zh: "我学习汉语。", pinyin: "Wǒ xuéxí hànyǔ.", vi: "Tôi học tiếng Trung." },
          ],
          reading: {
            titleVi: "Giới thiệu ngắn về tiếng Phổ thông",
            passageZh: "汉语的声调非常重要。同一个音节，声调不同，意思也不同。比如：mā（妈）是妈妈，mǎ（马）是马。",
            passagePinyin: "Hànyǔ de shēngdiào fēicháng zhòngyào. Tóng yí gè yīnjié, shēngdiào bùtóng, yìsi yě bùtóng. Bǐrú: mā (mā) shì māma, mǎ (mǎ) shì mǎ.",
            translationVi: "Thanh điệu trong tiếng Trung vô cùng quan trọng. Cùng một âm tiết, thanh điệu khác nhau thì ý nghĩa cũng khác nhau. Ví dụ: mā (妈) là mẹ, mǎ (马) là con ngựa.",
            highlightedWords: ["汉语", "声调"],
          },
          writing: {
            characters: ["一", "人", "大"],
            promptVi: "Luyện tập viết 3 chữ Hán nền tảng (一, 人, 大) theo đúng thứ tự nét và ghép một câu giới thiệu bạn học tiếng Trung.",
            sampleZh: "我学习汉语。",
          },
        },
        {
          slug: "foundations-basic-strokes",
          titleVi: "Bài 2: 8 Nét cơ bản & Quy tắc Bút thuận chữ Hán",
          titleZh: "第二课：基本笔画与笔顺规则",
          subtitleVi: "Ngang trước sổ sau, phẩy trước mác sau, trên trước dưới sau",
          objectivesVi: [
            "Ghi nhớ 7 quy tắc bút thuận cốt lõi khi viết chữ Hán",
            "Viết đúng cấu trúc cân đối của chữ 口, 中, 好",
          ],
          estimatedMinutes: 25,
          sortOrder: 2,
          vocabKeys: ["汉字", "汉语"],
          grammarKeys: [],
          listening: {
            dialogueTitleVi: "Quy tắc viết chữ Hán căn bản",
            lines: [
              { speaker: "Giáo viên", zh: "写汉字要先横后竖，先撇后捺。", pinyin: "Xiě hànzì yào xiān héng hòu shù, xiān piě hòu nà.", vi: "Viết chữ Hán cần ngang trước sổ sau, phẩy trước mác sau." },
              { speaker: "Học viên", zh: "明白了，我每天练习写十个汉字。", pinyin: "Míngbai le, wǒ měitiān liànxí xiě shí gè hànzì.", vi: "Em hiểu rồi, mỗi ngày em luyện viết mười chữ Hán." },
            ],
            comprehensionQuestion: {
              promptVi: "Mỗi ngày học viên dự định luyện viết bao nhiêu chữ Hán?",
              options: ["5 chữ", "10 chữ", "50 chữ"],
              correctIndex: 1,
            },
          },
          speaking: [
            { zh: "我喜欢写汉字。", pinyin: "Wǒ xǐhuan xiě hànzì.", vi: "Tôi thích viết chữ Hán." },
          ],
          reading: {
            titleVi: "Tại sao cần học đúng bút thuận?",
            passageZh: "按正确的笔顺写汉字，字会更好看，也更容易记住。先上后下，先左后右是最常用的规则。",
            passagePinyin: "Àn zhèngquè de bǐshùn xiě hànzì, zì huì gèng hǎokàn, yě gèng róngyì jìzhù. Xiān shàng hòu xià, xiān zuǒ hòu yòu shì zuì chángyòng de guīzé.",
            translationVi: "Viết chữ Hán theo đúng thứ tự nét giúp chữ đẹp hơn và dễ nhớ hơn. Trên trước dưới sau, trái trước phải sau là những quy tắc dùng nhiều nhất.",
            highlightedWords: ["汉字"],
          },
          writing: {
            characters: ["口", "中", "好"],
            promptVi: "Thực hành viết đúng thứ tự nét chữ 口, 中, 好 trên khung vẽ nét chữ.",
            sampleZh: "我喜欢写汉字。",
          },
        },
      ],
    },
    {
      levelCode: "hsk-1",
      slug: "hsk-1-core-communication",
      titleVi: "HSK 1 Toàn diện — Giao tiếp sơ cấp chuẩn",
      titleZh: "HSK 一级标准教程",
      summaryVi: "Khóa học HSK 1 tích hợp đầy đủ Nghe – Nói – Đọc – Viết – Từ vựng – Ngữ pháp cho người học Việt Nam.",
      estimatedMinutes: 180,
      sortOrder: 1,
      module: {
        slug: "module-1-everyday-intro",
        titleVi: "Chương 1: Chào hỏi, Gia đình & Ăn uống",
        titleZh: "第一单元：问候、家庭与饮食",
      },
      lessons: [
        {
          slug: "hsk1-greetings-intro",
          titleVi: "Bài 1: Chào hỏi & Giới thiệu bản thân",
          titleZh: "第一课：你好，你叫什么名字？",
          subtitleVi: "Mẫu câu 你好, 我叫..., 我是... và câu hỏi với 吗",
          objectivesVi: [
            "Chào hỏi lịch sự và cảm ơn trong giao tiếp hằng ngày",
            "Giới thiệu tên, nghề nghiệp và quốc tịch với 叫 và 是",
            "Đặt và trả lời câu hỏi Có/Không với trợ từ 吗",
          ],
          estimatedMinutes: 25,
          sortOrder: 1,
          vocabKeys: ["你好", "谢谢", "我", "叫", "名字", "是", "学生", "老师"],
          grammarKeys: ["hsk1-shi-sentence", "hsk1-ma-question"],
          listening: {
            dialogueTitleVi: "Hội thoại làm quen trong lớp học tiếng Trung",
            lines: [
              { speaker: "Minh An", zh: "你好！我叫明安。你叫什么名字？", pinyin: "Nǐ hǎo! Wǒ jiào Míng'ān. Nǐ jiào shénme míngzi?", vi: "Xin chào! Mình tên là Minh An. Bạn tên là gì?" },
              { speaker: "Lý Hoa", zh: "你好！我叫李华。你是学生吗？", pinyin: "Nǐ hǎo! Wǒ jiào Lǐ Huá. Nǐ shì xuésheng ma?", vi: "Xin chào! Mình tên là Lý Hoa. Bạn là học sinh phải không?" },
              { speaker: "Minh An", zh: "是的，我是越南学生。王老师是我的汉语老师。", pinyin: "Shì de, wǒ shì Yuènán xuésheng. Wáng lǎoshī shì wǒ de hànyǔ lǎoshī.", vi: "Đúng vậy, mình là sinh viên Việt Nam. Thầy Vương là giáo viên tiếng Trung của mình." },
            ],
            comprehensionQuestion: {
              promptVi: "Thầy Vương là ai trong đoạn hội thoại?",
              options: ["Bạn cùng lớp của Minh An", "Giáo viên tiếng Trung của Minh An", "Bác sĩ ở bệnh viện"],
              correctIndex: 1,
            },
          },
          speaking: [
            { zh: "你好！我叫明安。", pinyin: "Nǐ hǎo! Wǒ jiào Míng'ān.", vi: "Xin chào! Tôi tên là Minh An." },
            { zh: "我是越南学生。", pinyin: "Wǒ shì Yuènán xuésheng.", vi: "Tôi là học sinh Việt Nam." },
            { zh: "谢谢王老师！", pinyin: "Xièxie Wáng lǎoshī!", vi: "Cảm ơn thầy Vương!" },
          ],
          reading: {
            titleVi: "Đoạn giới thiệu của sinh viên mới",
            passageZh: "大家好！我叫兰英，我是越南人。我不是老师，我是大学生。我非常喜欢学习汉语。王老师很好，谢谢老师教我们汉语。",
            passagePinyin: "Dàjiā hǎo! Wǒ jiào Lányīng, wǒ shì Yuènán rén. Wǒ bú shì lǎoshī, wǒ shì dàxuésheng. Wǒ fēicháng xǐhuan xuéxí hànyǔ. Wáng lǎoshī hěn hǎo, xièxie lǎoshī jiāo wǒmen hànyǔ.",
            translationVi: "Chào mọi người! Tôi tên là Lan Anh, tôi là người Việt Nam. Tôi không phải giáo viên, tôi là sinh viên đại học. Tôi rất thích học tiếng Trung. Thầy Vương rất tốt, cảm ơn thầy đã dạy tiếng Trung cho chúng em.",
            highlightedWords: ["我", "叫", "是", "老师", "学生", "谢谢", "汉语"],
          },
          writing: {
            characters: ["好", "人", "中"],
            promptVi: "Viết 2–3 câu giới thiệu tên, quốc tịch và vai trò của bạn bằng tiếng Trung (dùng 叫 và 是).",
            sampleZh: "你好！我叫明安，我是越南学生。",
          },
        },
        {
          slug: "hsk1-family-numbers",
          titleVi: "Bài 2: Gia đình, Số đếm & Tuổi tác",
          titleZh: "第二课：你家有几口人？",
          subtitleVi: "Lượng từ 口, giới thiệu thành viên gia đình và nói tuổi với 岁",
          objectivesVi: [
            "Giới thiệu số thành viên trong gia đình bằng lượng từ 口",
            "Gọi tên các thành viên thân thiết (爸爸, 妈妈)",
            "Hỏi và trả lời tuổi tác tự nhiên không dư động từ 是",
          ],
          estimatedMinutes: 25,
          sortOrder: 2,
          vocabKeys: ["家", "爸爸", "妈妈", "口", "岁"],
          grammarKeys: ["hsk1-measure-words"],
          listening: {
            dialogueTitleVi: "Trò chuyện về gia đình",
            lines: [
              { speaker: "Lý Hoa", zh: "明安，你家有几口人？", pinyin: "Míng'ān, nǐ jiā yǒu jǐ kǒu rén?", vi: "Minh An, nhà bạn có mấy người?" },
              { speaker: "Minh An", zh: "我家有四口人：爸爸、妈妈、妹妹和我。", pinyin: "Wǒ jiā yǒu sì kǒu rén: bàba, māma, mèimei hé wǒ.", vi: "Nhà mình có bốn người: bố, mẹ, em gái và mình." },
              { speaker: "Lý Hoa", zh: "你妹妹今年几岁了？", pinyin: "Nǐ mèimei jīnnián jǐ suì le?", vi: "Em gái bạn năm nay mấy tuổi rồi?" },
              { speaker: "Minh An", zh: "她今年八岁。", pinyin: "Tā jīnnián bā suì.", vi: "Em ấy năm nay tám tuổi." },
            ],
            comprehensionQuestion: {
              promptVi: "Nhà Minh An có mấy người?",
              options: ["3 người", "4 người", "5 người"],
              correctIndex: 1,
            },
          },
          speaking: [
            { zh: "我家有四口人。", pinyin: "Wǒ jiā yǒu sì kǒu rén.", vi: "Gia đình tôi có bốn người." },
            { zh: "我妹妹今年八岁。", pinyin: "Wǒ mèimei jīnnián bā suì.", vi: "Em gái tôi năm nay tám tuổi." },
          ],
          reading: {
            titleVi: "Gia đình nhỏ của tôi",
            passageZh: "我家有三口人：爸爸、妈妈和我。我爸爸是老师，我妈妈是医生。我今年二十岁，我是大学生。",
            passagePinyin: "Wǒ jiā yǒu sān kǒu rén: bàba, māma hé wǒ. Wǒ bàba shì lǎoshī, wǒ māma shì yīshēng. Wǒ jīnnián èrshí suì, wǒ shì dàxuésheng.",
            translationVi: "Gia đình tôi có ba người: bố, mẹ và tôi. Bố tôi là giáo viên, mẹ tôi là bác sĩ. Năm nay tôi hai mươi tuổi, tôi là sinh viên đại học.",
            highlightedWords: ["家", "口", "爸爸", "妈妈", "岁"],
          },
          writing: {
            characters: ["口", "人", "大"],
            promptVi: "Viết một đoạn ngắn 3 câu giới thiệu gia đình bạn có mấy người và nghề nghiệp hoặc tuổi tác.",
            sampleZh: "我家有四口人：爸爸、妈妈、妹妹和我。",
          },
        },
        {
          slug: "hsk1-daily-food",
          titleVi: "Bài 3: Ăn uống & Mong muốn hằng ngày",
          titleZh: "第三课：你想吃什么？",
          subtitleVi: "Động từ năng nguyện 想, từ vựng 吃, 喝, 米饭",
          objectivesVi: [
            "Hỏi và trả lời món ăn, thức uống muốn dùng với 想",
            "Phân biệt cách dùng 吃 (ăn) và 喝 (uống) tự nhiên trong tiếng Trung",
          ],
          estimatedMinutes: 25,
          sortOrder: 3,
          vocabKeys: ["想", "吃", "米饭", "喝"],
          grammarKeys: ["hsk1-xiang-verb"],
          listening: {
            dialogueTitleVi: "Gọi món ăn trưa cùng bạn",
            lines: [
              { speaker: "A", zh: "中午你想吃什么？", pinyin: "Zhōngwǔ nǐ xiǎng chī shénme?", vi: "Buổi trưa bạn muốn ăn gì?" },
              { speaker: "B", zh: "我想吃米饭和中国菜。你想喝什么？", pinyin: "Wǒ xiǎng chī mǐfàn hé Zhōngguó cài. Nǐ xiǎng hē shénme?", vi: "Mình muốn ăn cơm và món Trung Quốc. Bạn muốn uống gì?" },
              { speaker: "A", zh: "我想喝一杯茶，谢谢！", pinyin: "Wǒ xiǎng hē yì bēi chá, xièxie!", vi: "Mình muốn uống một tách trà, cảm ơn!" },
            ],
            comprehensionQuestion: {
              promptVi: "Người A muốn uống gì?",
              options: ["Một tách cà phê", "Một tách trà", "Một cốc sữa"],
              correctIndex: 1,
            },
          },
          speaking: [
            { zh: "我想吃米饭。", pinyin: "Wǒ xiǎng chī mǐfàn.", vi: "Tôi muốn ăn cơm." },
            { zh: "我想喝茶。", pinyin: "Wǒ xiǎng hē chá.", vi: "Tôi muốn uống trà." },
          ],
          reading: {
            titleVi: "Bữa trưa ở căn-tin",
            passageZh: "今天中午我和朋友一起吃饭。我想吃米饭，朋友想吃面条。我们都很喜欢喝热茶。",
            passagePinyin: "Jīntiān zhōngwǔ wǒ hé péngyou yìqǐ chīfàn. Wǒ xiǎng chī mǐfàn, péngyou xiǎng chī miàntiáo. Wǒmen dōu hěn xǐhuan hē rè chá.",
            translationVi: "Trưa hôm nay tôi đi ăn cơm cùng bạn. Tôi muốn ăn cơm trắng, bạn tôi muốn ăn mì. Cả hai chúng tôi đều rất thích uống trà nóng.",
            highlightedWords: ["想", "吃", "米饭", "喝"],
          },
          writing: {
            characters: ["口", "好"],
            promptVi: "Viết 2 câu nói món bạn muốn ăn và đồ uống bạn muốn uống hôm nay.",
            sampleZh: "今天我想吃米饭，也想喝茶。",
          },
        },
      ],
    },
    {
      levelCode: "hsk-2",
      slug: "hsk-2-daily-shopping",
      titleVi: "HSK 2 — Mua sắm, Thời gian & Đời sống",
      titleZh: "HSK 二级：购物与生活",
      summaryVi: "Nâng cao khả năng giao tiếp trong mua sắm, hỏi giá và nhận xét sản phẩm.",
      estimatedMinutes: 120,
      sortOrder: 1,
      module: {
        slug: "module-1-shopping",
        titleVi: "Chương 1: Hỏi giá và Mua sắm",
        titleZh: "第一单元：买东西",
      },
      lessons: [
        {
          slug: "hsk2-shopping-price",
          titleVi: "Bài 1: Hỏi giá và nhận xét đắt rẻ",
          titleZh: "第一课：这个多少钱？",
          subtitleVi: "Cấu trúc 多少钱 và cách dùng 便宜",
          objectivesVi: [
            "Hỏi giá hàng hóa tự nhiên bằng 多少钱",
            "Đưa ra nhận xét về giá cả bằng 便宜 / 太贵了",
          ],
          estimatedMinutes: 25,
          sortOrder: 1,
          vocabKeys: ["多少钱", "便宜"],
          grammarKeys: ["hsk2-duoshao-qian"],
          listening: {
            dialogueTitleVi: "Mua sách tại hiệu sách",
            lines: [
              { speaker: "Khách", zh: "请问，这本汉语书多少钱？", pinyin: "Qǐngwèn, zhè běn hànyǔ shū duōshao qián?", vi: "Xin hỏi, quyển sách tiếng Trung này bao nhiêu tiền?" },
              { speaker: "Nhân viên", zh: "三十五块钱，很便宜。", pinyin: "Sānshíwǔ kuài qián, hěn piányi.", vi: "35 tệ ạ, rất phải chăng." },
            ],
            comprehensionQuestion: {
              promptVi: "Quyển sách tiếng Trung giá bao nhiêu tiền?",
              options: ["25 tệ", "35 tệ", "53 tệ"],
              correctIndex: 1,
            },
          },
          speaking: [
            { zh: "请问，这本书多少钱？", pinyin: "Qǐngwèn, zhè běn shū duōshao qián?", vi: "Xin hỏi, quyển sách này bao nhiêu tiền?" },
          ],
          reading: {
            titleVi: "Đi mua trái cây cuối tuần",
            passageZh: "周末我去超市买水果。苹果一斤八块钱，很便宜。我买了两斤苹果。",
            passagePinyin: "Zhōumò wǒ qù chāoshì mǎi shuǐguǒ. Píngguǒ yì jīn bā kuài qián, hěn piányi. Wǒ mǎi le liǎng jīn píngguǒ.",
            translationVi: "Cuối tuần tôi đi siêu thị mua trái cây. Táo một cân (500g) tám tệ, rất rẻ. Tôi đã mua hai cân táo.",
            highlightedWords: ["多少钱", "便宜"],
          },
          writing: {
            characters: ["大", "好"],
            promptVi: "Đặt 1 câu hỏi giá món đồ bạn thích và 1 câu nhận xét giá cả.",
            sampleZh: "请问，这本书多少钱？很便宜！",
          },
        },
      ],
    },
    {
      levelCode: "business-chinese",
      slug: "business-chinese-essentials",
      titleVi: "Tiếng Trung Thương mại — Giao tiếp Đối tác",
      titleZh: "商务汉语入门",
      summaryVi: "Kỹ năng giao tiếp công sở chuyên nghiệp, trao danh thiếp và thiết lập hợp tác.",
      estimatedMinutes: 90,
      sortOrder: 1,
      module: {
        slug: "module-1-partner-meeting",
        titleVi: "Chương 1: Gặp gỡ Đối tác lần đầu",
        titleZh: "第一单元：初次会面",
      },
      lessons: [
        {
          slug: "business-meeting-intro",
          titleVi: "Bài 1: Chào hỏi đối tác & Trao danh thiếp",
          titleZh: "第一课：您好，这是我的名片",
          subtitleVi: "Kính ngữ 您好, trao danh thiếp 名片 và lời chúc 合作愉快",
          objectivesVi: [
            "Sử dụng kính ngữ 您 và câu chào chuẩn mực trong bối cảnh doanh nghiệp",
            "Trao đổi danh thiếp và kết thúc cuộc gặp chuyên nghiệp",
          ],
          estimatedMinutes: 25,
          sortOrder: 1,
          vocabKeys: ["名片", "合作"],
          grammarKeys: [],
          listening: {
            dialogueTitleVi: "Cuộc gặp đầu tiên tại phòng họp",
            lines: [
              { speaker: "Quản lý Trần", zh: "您好，我是陈经理。这是我的名片。", pinyin: "Nín hǎo, wǒ shì Chén jīnglǐ. Zhè shì wǒ de míngpiàn.", vi: "Xin chào ngài, tôi là Quản lý Trần. Đây là danh thiếp của tôi." },
              { speaker: "Đối tác", zh: "陈经理您好！希望我们合作愉快。", pinyin: "Chén jīnglǐ nín hǎo! Xīwàng wǒmen hézuò yúkuài.", vi: "Chào Quản lý Trần! Hy vọng chúng ta hợp tác tốt đẹp." },
            ],
            comprehensionQuestion: {
              promptVi: "Quản lý Trần đã trao vật gì cho đối tác?",
              options: ["Hợp đồng", "Danh thiếp", "Báo giá"],
              correctIndex: 1,
            },
          },
          speaking: [
            { zh: "您好，这是我的名片。", pinyin: "Nín hǎo, zhè shì wǒ de míngpiàn.", vi: "Xin chào ngài, đây là danh thiếp của tôi." },
            { zh: "祝我们合作愉快！", pinyin: "Zhù wǒmen hézuò yúkuài!", vi: "Chúc chúng ta hợp tác tốt đẹp!" },
          ],
          reading: {
            titleVi: "Nghi thức trao danh thiếp",
            passageZh: "在商务场合，交换名片时最好用双手递给对方，并认真看一眼对方的名字和职位。",
            passagePinyin: "Zài shāngwù chǎnghé, jiāohuàn míngpiàn shí zuì hǎo yòng shuāngshǒu dì gěi duìfāng, bìng rènzhēn kàn yì yǎn duìfāng de míngzi hé zhíwèi.",
            translationVi: "Trong bối cảnh thương mại, khi trao đổi danh thiếp tốt nhất nên dùng hai tay đưa cho đối phương, đồng thời nhìn kỹ tên và chức vụ của họ.",
            highlightedWords: ["名片", "合作"],
          },
          writing: {
            characters: ["人", "中"],
            promptVi: "Viết 2 câu tự giới thiệu chức vụ và lời chúc hợp tác với đối tác Trung Quốc.",
            sampleZh: "您好，这是我的名片。希望我们合作愉快。",
          },
        },
      ],
    },
  ];

  const lessonIdMap = new Map<string, string>();
  const questionIdMap = new Map<string, string>();

  for (const cSpec of coursesSpec) {
    const levelId = levelMap.get(cSpec.levelCode);
    if (!levelId) continue;

    const course = await prisma.course.upsert({
      where: { slug: cSpec.slug },
      update: {
        titleVi: cSpec.titleVi,
        titleZh: cSpec.titleZh,
        summaryVi: cSpec.summaryVi,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        learningLevelId: levelId,
        slug: cSpec.slug,
        titleVi: cSpec.titleVi,
        titleZh: cSpec.titleZh,
        summaryVi: cSpec.summaryVi,
        estimatedMinutes: cSpec.estimatedMinutes,
        sortOrder: cSpec.sortOrder,
        status: ContentStatus.PUBLISHED,
        origin: ContentOrigin.VERIFIED_ORIGINAL,
      },
    });

    const mod = await prisma.module.upsert({
      where: { courseId_slug: { courseId: course.id, slug: cSpec.module.slug } },
      update: {
        titleVi: cSpec.module.titleVi,
        titleZh: cSpec.module.titleZh,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        courseId: course.id,
        slug: cSpec.module.slug,
        titleVi: cSpec.module.titleVi,
        titleZh: cSpec.module.titleZh,
        sortOrder: 1,
        status: ContentStatus.PUBLISHED,
      },
    });

    for (const lSpec of cSpec.lessons) {
      const lesson = await prisma.lesson.upsert({
        where: { slug: lSpec.slug },
        update: {
          titleVi: lSpec.titleVi,
          titleZh: lSpec.titleZh,
          subtitleVi: lSpec.subtitleVi,
          objectivesVi: lSpec.objectivesVi,
          status: ContentStatus.PUBLISHED,
        },
        create: {
          moduleId: mod.id,
          slug: lSpec.slug,
          titleVi: lSpec.titleVi,
          titleZh: lSpec.titleZh,
          subtitleVi: lSpec.subtitleVi,
          objectivesVi: lSpec.objectivesVi,
          estimatedMinutes: lSpec.estimatedMinutes,
          sortOrder: lSpec.sortOrder,
          status: ContentStatus.PUBLISHED,
          origin: ContentOrigin.VERIFIED_ORIGINAL,
          publishedAt: new Date(),
        },
      });
      lessonIdMap.set(lSpec.slug, lesson.id);

      // Link Vocabulary
      for (let i = 0; i < lSpec.vocabKeys.length; i++) {
        const vocabId = vocabMap.get(lSpec.vocabKeys[i]);
        if (!vocabId) continue;
        await prisma.lessonVocabulary.upsert({
          where: { lessonId_vocabularyId: { lessonId: lesson.id, vocabularyId: vocabId } },
          update: { sortOrder: i + 1 },
          create: { lessonId: lesson.id, vocabularyId: vocabId, sortOrder: i + 1, isCore: true },
        });
      }

      // Link Grammar
      for (let i = 0; i < lSpec.grammarKeys.length; i++) {
        const grammarPointId = grammarMap.get(lSpec.grammarKeys[i]);
        if (!grammarPointId) continue;
        await prisma.lessonGrammar.upsert({
          where: { lessonId_grammarPointId: { lessonId: lesson.id, grammarPointId } },
          update: { sortOrder: i + 1 },
          create: { lessonId: lesson.id, grammarPointId, sortOrder: i + 1 },
        });
      }

      // Upsert all 8 Standardized Lesson Sections
      const sections: Array<{ type: LessonSectionType; titleVi: string; payload: object }> = [
        {
          type: LessonSectionType.OBJECTIVES,
          titleVi: "Mục tiêu bài học",
          payload: { objectivesVi: lSpec.objectivesVi, estimatedMinutes: lSpec.estimatedMinutes },
        },
        {
          type: LessonSectionType.VOCABULARY,
          titleVi: "Từ vựng trọng tâm",
          payload: { vocabCount: lSpec.vocabKeys.length },
        },
        {
          type: LessonSectionType.GRAMMAR,
          titleVi: "Ngữ pháp & Mẫu câu",
          payload: { grammarCount: lSpec.grammarKeys.length },
        },
        {
          type: LessonSectionType.LISTENING,
          titleVi: "Luyện Nghe & Hội thoại",
          payload: lSpec.listening,
        },
        {
          type: LessonSectionType.SPEAKING,
          titleVi: "Luyện Nói (Nghe & Nhắc lại)",
          payload: { prompts: lSpec.speaking },
        },
        {
          type: LessonSectionType.READING,
          titleVi: "Đọc hiểu văn bản",
          payload: lSpec.reading,
        },
        {
          type: LessonSectionType.WRITING,
          titleVi: "Luyện Viết & Nét chữ",
          payload: lSpec.writing,
        },
        {
          type: LessonSectionType.ASSESSMENT,
          titleVi: "Bài kiểm tra cuối bài",
          payload: { passingPercent: 70 },
        },
      ];

      for (let idx = 0; idx < sections.length; idx++) {
        const sec = sections[idx];
        await prisma.lessonSection.upsert({
          where: {
            lessonId_sectionType_sortOrder: {
              lessonId: lesson.id,
              sectionType: sec.type,
              sortOrder: idx + 1,
            },
          },
          update: {
            titleVi: sec.titleVi,
            contentPayload: sec.payload,
          },
          create: {
            lessonId: lesson.id,
            sectionType: sec.type,
            titleVi: sec.titleVi,
            sortOrder: idx + 1,
            contentPayload: sec.payload,
          },
        });
      }
    }
  }

  // Prerequisite: HSK 1 Lesson 2 recommends Lesson 1; HSK 1 Lesson 1 recommends Foundations Lesson 1
  const f1 = lessonIdMap.get("foundations-pinyin-tones");
  const h1l1 = lessonIdMap.get("hsk1-greetings-intro");
  const h1l2 = lessonIdMap.get("hsk1-family-numbers");
  const h1l3 = lessonIdMap.get("hsk1-daily-food");

  if (f1 && h1l1) {
    await prisma.lessonPrerequisite.upsert({
      where: { lessonId_prerequisiteLessonId: { lessonId: h1l1, prerequisiteLessonId: f1 } },
      update: {},
      create: { lessonId: h1l1, prerequisiteLessonId: f1, isStrict: false },
    });
  }
  if (h1l1 && h1l2) {
    await prisma.lessonPrerequisite.upsert({
      where: { lessonId_prerequisiteLessonId: { lessonId: h1l2, prerequisiteLessonId: h1l1 } },
      update: {},
      create: { lessonId: h1l2, prerequisiteLessonId: h1l1, isStrict: false },
    });
  }
  if (h1l2 && h1l3) {
    await prisma.lessonPrerequisite.upsert({
      where: { lessonId_prerequisiteLessonId: { lessonId: h1l3, prerequisiteLessonId: h1l2 } },
      update: {},
      create: { lessonId: h1l3, prerequisiteLessonId: h1l2, isStrict: false },
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Graded Exercises & Question Bank (Answers stored strictly in QuestionAnswer)
  // ---------------------------------------------------------------------------
  const existingExercises = await prisma.exercise.count();
  if (existingExercises === 0 && h1l1 && h1l2 && h1l3 && f1) {
    const createExerciseWithQuestions = async (params: {
      lessonId: string;
      titleVi: string;
      skillType: SkillType;
      questions: Array<{
        key: string;
        questionType: QuestionType;
        skillType: SkillType;
        difficultyLevel: number;
        promptVi: string;
        promptZh?: string;
        promptPinyin?: string;
        passageZh?: string;
        metadata?: object;
        options?: Array<{ key: string; zh?: string; pinyin?: string; vi?: string }>;
        answer: object;
        explanationVi: string;
      }>;
    }) => {
      const ex = await prisma.exercise.create({
        data: {
          lessonId: params.lessonId,
          titleVi: params.titleVi,
          skillType: params.skillType,
          passingPercent: 70,
          status: ContentStatus.PUBLISHED,
          origin: ContentOrigin.VERIFIED_ORIGINAL,
        },
      });

      for (let i = 0; i < params.questions.length; i++) {
        const q = params.questions[i];
        const createdQ = await prisma.question.create({
          data: {
            exerciseId: ex.id,
            questionType: q.questionType,
            skillType: q.skillType,
            difficultyLevel: q.difficultyLevel,
            promptVi: q.promptVi,
            promptZh: q.promptZh,
            promptPinyin: q.promptPinyin,
            passageZh: q.passageZh,
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
            answers: {
              create: {
                acceptedPayload: q.answer,
              },
            },
            explanations: {
              create: {
                explanationVi: q.explanationVi,
              },
            },
          },
        });
        questionIdMap.set(q.key, createdQ.id);
      }
    };

    await createExerciseWithQuestions({
      lessonId: f1,
      titleVi: "Kiểm tra nhanh Pinyin & Thanh điệu",
      skillType: SkillType.PRONUNCIATION,
      questions: [
        {
          key: "q-f1-1",
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.PRONUNCIATION,
          difficultyLevel: 1,
          promptVi: "Khi hai thanh 3 đứng cạnh nhau như 你好 (nǐ hǎo), chữ 你 được đọc biến điệu thành thanh mấy?",
          promptZh: "你好",
          promptPinyin: "nǐ hǎo",
          options: [
            { key: "A", vi: "Thanh 1" },
            { key: "B", vi: "Thanh 2 (ní hǎo)" },
            { key: "C", vi: "Thanh 4" },
            { key: "D", vi: "Thanh nhẹ" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "Theo quy tắc biến điệu thanh 3, khi hai thanh 3 liền kề nhau thì âm tiết thứ nhất đổi sang đọc như thanh 2: ní hǎo.",
        },
        {
          key: "q-f1-2",
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.VOCABULARY,
          difficultyLevel: 1,
          promptVi: "Từ nào có nghĩa là 'Tiếng Trung / Tiếng Hán'?",
          options: [
            { key: "A", zh: "汉字", pinyin: "hànzì", vi: "Chữ Hán" },
            { key: "B", zh: "声调", pinyin: "shēngdiào", vi: "Thanh điệu" },
            { key: "C", zh: "汉语", pinyin: "hànyǔ", vi: "Tiếng Hán" },
          ],
          answer: { optionKey: "C" },
          explanationVi: "汉语 (hànyǔ) nghĩa là tiếng Hán/tiếng Trung; 汉字 (hànzì) nghĩa là chữ Hán.",
        },
      ],
    });

    await createExerciseWithQuestions({
      lessonId: h1l1,
      titleVi: "Bài tập tổng hợp Bài 1 — Chào hỏi & Giới thiệu",
      skillType: SkillType.GRAMMAR,
      questions: [
        {
          key: "q-h1l1-1",
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.GRAMMAR,
          difficultyLevel: 1,
          promptVi: "Chọn câu đúng ngữ pháp để nói 'Tôi tên là Minh An':",
          options: [
            { key: "A", zh: "我是叫明安。", pinyin: "Wǒ shì jiào Míng'ān." },
            { key: "B", zh: "我叫明安。", pinyin: "Wǒ jiào Míng'ān." },
            { key: "C", zh: "我名字明安。", pinyin: "Wǒ míngzi Míng'ān." },
          ],
          answer: { optionKey: "B" },
          explanationVi: "Động từ 叫 (tên là) dùng trực tiếp sau chủ ngữ, không thêm 是 ở phía trước.",
        },
        {
          key: "q-h1l1-2",
          questionType: QuestionType.FILL_IN_BLANK,
          skillType: SkillType.GRAMMAR,
          difficultyLevel: 1,
          promptVi: "Điền 1 chữ Hán còn thiếu để tạo câu hỏi Có/Không: 'Bạn là sinh viên phải không?'",
          promptZh: "你是学生___？",
          promptPinyin: "Nǐ shì xuésheng ___?",
          answer: { acceptedTexts: ["吗", "ma"] },
          explanationVi: "Thêm trợ từ nghi vấn 吗 (ma) vào cuối câu trần thuật để tạo câu hỏi Có/Không.",
        },
        {
          key: "q-h1l1-3",
          questionType: QuestionType.SENTENCE_ORDERING,
          skillType: SkillType.WRITING,
          difficultyLevel: 1,
          promptVi: "Sắp xếp các từ thành câu đúng nghĩa 'Tôi là học sinh Việt Nam':",
          metadata: { tokens: ["学生", "是", "越南", "我"] },
          answer: { orderedTokens: ["我", "是", "越南", "学生"] },
          explanationVi: "Trật tự chuẩn: Chủ ngữ (我) + Động từ (是) + Định ngữ quốc tịch (越南) + Danh từ chính (学生).",
        },
        {
          key: "q-h1l1-4",
          questionType: QuestionType.LISTENING_COMPREHENSION,
          skillType: SkillType.LISTENING,
          difficultyLevel: 1,
          promptVi: "Nghe câu tiếng Trung và chọn ý đúng:",
          promptZh: "她是我的汉语老师。",
          promptPinyin: "Tā shì wǒ de hànyǔ lǎoshī.",
          options: [
            { key: "A", vi: "Cô ấy là bạn học của tôi." },
            { key: "B", vi: "Cô ấy là giáo viên tiếng Trung của tôi." },
            { key: "C", vi: "Cô ấy là học sinh mới." },
          ],
          answer: { optionKey: "B" },
          explanationVi: "汉语老师 nghĩa là 'giáo viên tiếng Trung'.",
        },
      ],
    });

    await createExerciseWithQuestions({
      lessonId: h1l2,
      titleVi: "Bài tập tổng hợp Bài 2 — Gia đình & Lượng từ",
      skillType: SkillType.VOCABULARY,
      questions: [
        {
          key: "q-h1l2-1",
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.GRAMMAR,
          difficultyLevel: 1,
          promptVi: "Điền lượng từ phù hợp: 我家有四___人。",
          options: [
            { key: "A", zh: "口", pinyin: "kǒu" },
            { key: "B", zh: "本", pinyin: "běn" },
            { key: "C", zh: "杯", pinyin: "bēi" },
          ],
          answer: { optionKey: "A" },
          explanationVi: "口 (kǒu) là lượng từ chuẩn khi đếm số nhân khẩu trong gia đình.",
        },
        {
          key: "q-h1l2-2",
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.GRAMMAR,
          difficultyLevel: 1,
          promptVi: "Câu nào diễn đạt 'Em gái tôi năm nay tám tuổi' tự nhiên và chính xác?",
          options: [
            { key: "A", zh: "我妹妹今年是八岁。" },
            { key: "B", zh: "我妹妹今年八岁。" },
            { key: "C", zh: "我妹妹八岁今年。" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "Khi nói tuổi tác trong tiếng Trung, không dùng 是 trước số tuổi.",
        },
      ],
    });

    await createExerciseWithQuestions({
      lessonId: h1l3,
      titleVi: "Bài tập tổng hợp Bài 3 — Ăn uống & Động từ 想",
      skillType: SkillType.READING,
      questions: [
        {
          key: "q-h1l3-1",
          questionType: QuestionType.MULTIPLE_CHOICE,
          skillType: SkillType.READING,
          difficultyLevel: 1,
          promptVi: "Đọc đoạn ngắn và trả lời: Người nói muốn uống gì?",
          passageZh: "今天很热，我不想吃米饭，我只想喝一杯冰茶。",
          options: [
            { key: "A", vi: "Cơm trắng" },
            { key: "B", vi: "Một cốc trà đá" },
            { key: "C", vi: "Cà phê nóng" },
          ],
          answer: { optionKey: "B" },
          explanationVi: "只想喝一杯冰茶 nghĩa là 'chỉ muốn uống một cốc trà đá'.",
        },
        {
          key: "q-h1l3-2",
          questionType: QuestionType.TRANSLATION,
          skillType: SkillType.WRITING,
          difficultyLevel: 2,
          promptVi: "Dịch sang tiếng Trung giản thể: 'Tôi muốn uống trà.'",
          answer: { acceptedTexts: ["我想喝茶", "我想喝茶。", "我想喝一杯茶", "我想喝一杯茶。"] },
          explanationVi: "Cấu trúc chuẩn: 我 (tôi) + 想 (muốn) + 喝 (uống) + 茶 (trà).",
        },
      ],
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Configurable Exam Templates (Original Practice & Placement Test)
  // ---------------------------------------------------------------------------
  const allPublishedQuestions = await prisma.question.findMany({
    where: { status: ContentStatus.PUBLISHED },
    orderBy: { createdAt: "asc" },
  });

  if (allPublishedQuestions.length > 0) {
    const hsk1LevelId = levelMap.get("hsk-1") ?? null;

    const ensureExam = async (spec: {
      slug: string;
      titleVi: string;
      descriptionVi: string;
      examType: ExamType;
      durationSeconds: number;
      passingScore: number;
      sections: Array<{
        titleVi: string;
        skillType: SkillType;
        instructionsVi: string;
        questionIds: string[];
      }>;
    }) => {
      const existing = await prisma.examTemplate.findUnique({ where: { slug: spec.slug } });
      if (existing) return;

      const totalPoints = spec.sections.reduce(
        (sum, s) => sum + s.questionIds.length * 10,
        0
      );

      await prisma.examTemplate.create({
        data: {
          curriculumVersionId: hsk2.id,
          learningLevelId: hsk1LevelId,
          slug: spec.slug,
          titleVi: spec.titleVi,
          descriptionVi: spec.descriptionVi,
          examType: spec.examType,
          durationSeconds: spec.durationSeconds,
          totalPoints,
          passingScore: spec.passingScore,
          scoringRules: {
            configurable: true,
            pointsPerQuestion: 10,
            autoSubmitOnExpiry: true,
          },
          isOfficialLicensed: false,
          licenseAttribution: "Đề luyện tập gốc biên soạn bởi HanLearn (không phải đề thi chính thức được cấp phép của Hanban/CTI).",
          status: ContentStatus.PUBLISHED,
          origin: ContentOrigin.VERIFIED_ORIGINAL,
          sections: {
            create: spec.sections.map((sec, idx) => ({
              titleVi: sec.titleVi,
              skillType: sec.skillType,
              instructionsVi: sec.instructionsVi,
              sectionPoints: sec.questionIds.length * 10,
              sortOrder: idx + 1,
              questions: {
                create: sec.questionIds.map((qId, qIdx) => ({
                  questionId: qId,
                  sortOrder: qIdx + 1,
                  pointsOverride: 10,
                })),
              },
            })),
          },
        },
      });
    };

    const listeningQs = allPublishedQuestions
      .filter((q) => q.skillType === SkillType.LISTENING || q.skillType === SkillType.PRONUNCIATION)
      .map((q) => q.id);
    const readingGrammarQs = allPublishedQuestions
      .filter((q) => q.skillType === SkillType.READING || q.skillType === SkillType.GRAMMAR || q.skillType === SkillType.VOCABULARY)
      .map((q) => q.id);
    const writingQs = allPublishedQuestions
      .filter((q) => q.skillType === SkillType.WRITING)
      .map((q) => q.id);

    await ensureExam({
      slug: "placement-test-standard",
      titleVi: "Bài kiểm tra đánh giá trình độ đầu vào HanLearn",
      descriptionVi: "Đánh giá nhanh phát âm Pinyin, từ vựng, ngữ pháp và đọc hiểu để gợi ý cấp độ bắt đầu phù hợp trong lộ trình.",
      examType: ExamType.PLACEMENT,
      durationSeconds: 15 * 60,
      passingScore: 40,
      sections: [
        {
          titleVi: "Phần 1: Phát âm & Nghe hiểu cơ bản",
          skillType: SkillType.LISTENING,
          instructionsVi: "Nghe câu mẫu và chọn đáp án chính xác nhất.",
          questionIds: listeningQs.slice(0, 3),
        },
        {
          titleVi: "Phần 2: Từ vựng, Ngữ pháp & Đọc hiểu",
          skillType: SkillType.READING,
          instructionsVi: "Hoàn thành các câu trắc nghiệm và điền từ ngắn.",
          questionIds: readingGrammarQs.slice(0, 5),
        },
      ].filter((s) => s.questionIds.length > 0),
    });

    await ensureExam({
      slug: "hsk1-original-mock-01",
      titleVi: "Đề luyện thi thử HSK 1 — Đề luyện tập gốc số 01",
      descriptionVi: "Bài thi thử tổng hợp Nghe – Đọc – Ngữ pháp – Viết câu ngắn mô phỏng trải nghiệm phòng thi HSK có tính giờ.",
      examType: ExamType.FULL_MOCK,
      durationSeconds: 25 * 60,
      passingScore: 60,
      sections: [
        {
          titleVi: "Phần 1: Nghe hiểu & Thanh điệu",
          skillType: SkillType.LISTENING,
          instructionsVi: "Bấm phát âm thanh từng câu và chọn phương án đúng.",
          questionIds: listeningQs,
        },
        {
          titleVi: "Phần 2: Đọc hiểu, Từ vựng & Ngữ pháp",
          skillType: SkillType.READING,
          instructionsVi: "Đọc kỹ câu hỏi và điền hoặc chọn đáp án chính xác.",
          questionIds: readingGrammarQs,
        },
        {
          titleVi: "Phần 3: Sắp xếp câu & Dịch ngắn",
          skillType: SkillType.WRITING,
          instructionsVi: "Hoàn thành câu tiếng Trung đúng trật tự ngữ pháp.",
          questionIds: writingQs,
        },
      ].filter((s) => s.questionIds.length > 0),
    });

    if (readingGrammarQs.length > 0) {
      await ensureExam({
        slug: "hsk1-grammar-reading-drill",
        titleVi: "Luyện tập chuyên sâu Đọc hiểu & Ngữ pháp HSK 1",
        descriptionVi: "Bộ câu hỏi chuyên đề ngữ pháp câu chữ 是, câu hỏi 吗, lượng từ và đọc hiểu ngắn.",
        examType: ExamType.GRAMMAR_PRACTICE,
        durationSeconds: 12 * 60,
        passingScore: 30,
        sections: [
          {
            titleVi: "Ngữ pháp & Đọc hiểu HSK 1",
            skillType: SkillType.GRAMMAR,
            instructionsVi: "Chọn hoặc điền đáp án chính xác nhất.",
            questionIds: readingGrammarQs,
          },
        ],
      });
    }
  }
}
