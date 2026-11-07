import { UnitData } from '../../types/curriculum';

export const unit9Data: UnitData = {
  id: 'unit-9',
  number: 9,
  semester: 2,
  title: 'Natural Disasters',
  viTitle: 'Thiên tai',
  topic: 'Các loại thảm họa thiên nhiên, kỹ năng ứng phó sơ tán và công tác cứu hộ khẩn cấp',
  icon: '🌪️',
  color: 'amber',
  summary: 'Học từ vựng về thiên tai, quy tắc trọng âm từ đuôi -al và -ous, thì Quá khứ tiếp diễn và cách kết hợp với When/While.',
  vocab: [
    {
      id: 'u9-v1',
      word: 'natural disaster',
      ipa: '/ˈnætʃrəl dɪˈzɑːstə(r)/',
      type: 'n',
      meaning: 'thảm họa thiên nhiên',
      example: 'Floods and typhoons are common natural disasters in central Viet Nam.',
      exampleVi: 'Lũ lụt và bão nhiệt đới là những thảm họa thiên nhiên phổ biến ở miền Trung Việt Nam.'
    },
    {
      id: 'u9-v2',
      word: 'earthquake',
      ipa: '/ˈɜːθkweɪk/',
      type: 'n',
      meaning: 'trận động đất',
      example: 'The violent earthquake shook the city for thirty seconds.',
      exampleVi: 'Trận động đất dữ dội đã làm rung chuyển thành phố trong ba mươi giây.'
    },
    {
      id: 'u9-v3',
      word: 'tsunami',
      ipa: '/tsuːˈnɑːmi/',
      type: 'n',
      meaning: 'sóng thần',
      example: 'A devastating tsunami struck the coastal towns after the undersea tremor.',
      exampleVi: 'Một đợt sóng thần kinh hoàng đã tấn công các thị trấn ven biển sau cơn chấn động dưới đáy biển.',
      tip: 'từ gốc tiếng Nhật, chữ "t" không câm hoàn toàn nhưng phát âm lướt nhẹ'
    },
    {
      id: 'u9-v4',
      word: 'volcanic eruption',
      ipa: '/vɒlˈkænɪk ɪˈrʌpʃn/',
      type: 'n',
      meaning: 'sự phun trào núi lửa',
      example: 'The volcanic eruption forced thousands of residents to leave the island.',
      exampleVi: 'Sự phun trào núi lửa đã buộc hàng nghìn cư dân phải rời khỏi hòn đảo.'
    },
    {
      id: 'u9-v5',
      word: 'typhoon',
      ipa: '/taɪˈfuːn/',
      type: 'n',
      meaning: 'bão nhiệt đới dữ dội',
      example: 'Typhoon Yagi brought torrential rain and strong wind gusts.',
      exampleVi: 'Bão Yagi mang theo mưa xối xả và những cơn gió giật rất mạnh.'
    },
    {
      id: 'u9-v6',
      word: 'flood',
      ipa: '/flʌd/',
      type: 'n, v',
      meaning: 'lũ lụt (n); làm ngập lụt (v)',
      example: 'Heavy rain caused flash floods in the mountainous valleys.',
      exampleVi: 'Mưa lớn đã gây ra lũ quét ở các thung lũng miền núi.',
      tip: 'phát âm là /flʌd/, không phải /fluːd/'
    },
    {
      id: 'u9-v7',
      word: 'drought',
      ipa: '/draʊt/',
      type: 'n',
      meaning: 'hạn hán kéo dài',
      example: 'The severe drought ruined the crops and dried up local wells.',
      exampleVi: 'Đợt hạn hán nghiêm trọng đã phá hủy mùa màng và làm cạn kiệt các giếng nước địa phương.'
    },
    {
      id: 'u9-v8',
      word: 'rescue worker',
      ipa: '/ˈreskjuː ˈwɜːkə(r)/',
      type: 'n',
      meaning: 'nhân viên cứu nạn, cứu hộ',
      example: 'Brave rescue workers worked overnight to save trapped survivors.',
      exampleVi: 'Những nhân viên cứu hộ dũng cảm đã làm việc thấu đêm để giải cứu những người sống sót bị mắc kẹt.'
    },
    {
      id: 'u9-v9',
      word: 'evacuate',
      ipa: '/ɪˈvækjueɪt/',
      type: 'v',
      meaning: 'sơ tán, rút khỏi vùng nguy hiểm',
      example: 'Residents were urgently told to evacuate to high ground.',
      exampleVi: 'Cư dân được khẩn thiết yêu cầu sơ tán lên vùng đất cao.'
    },
    {
      id: 'u9-v10',
      word: 'destruction',
      ipa: '/dɪˈstrʌkʃn/',
      type: 'n',
      meaning: 'sự tàn phá, cảnh đổ nát',
      example: 'The tornado left a path of total destruction behind it.',
      exampleVi: 'Cơn lốc xoáy để lại một vệt tàn phá hoàn toàn phía sau nó.'
    },
    {
      id: 'u9-v11',
      word: 'debris',
      ipa: '/ˈdebriː/',
      type: 'n',
      meaning: 'mảnh vụn bê tông, đống đổ nát gạch đá',
      example: 'Volunteers helped clear the debris from roads after the storm.',
      exampleVi: 'Các tình nguyện viên đã giúp dọn sạch đống đổ nát khỏi các con đường sau bão.',
      tip: 'chữ "s" trong debris là âm câm /'
    },
    {
      id: 'u9-v12',
      word: 'victim',
      ipa: '/ˈvɪktɪm/',
      type: 'n',
      meaning: 'nạn nhân',
      example: 'The Red Cross provided medical supplies and warm blankets to victims.',
      exampleVi: 'Hội Chữ thập đỏ đã cung cấp vật tư y tế và chăn ấm cho các nạn nhân.'
    },
    {
      id: 'u9-v13',
      word: 'predict',
      ipa: '/prɪˈdɪkt/',
      type: 'v',
      meaning: 'dự báo trước, đoán trước',
      example: 'Modern meteorologists can predict tropical storms several days ahead.',
      exampleVi: 'Các nhà khí tượng học hiện đại có thể dự báo các cơn bão nhiệt đới trước vài ngày.'
    },
    {
      id: 'u9-v14',
      word: 'temporary accommodation',
      ipa: '/ˈtemprəri əˌkɒməˈdeɪʃn/',
      type: 'n',
      meaning: 'chỗ ở tạm thời cho người gặp nạn',
      example: 'Homeless families were moved into temporary accommodation at a sports hall.',
      exampleVi: 'Những gia đình mất nhà cửa đã được chuyển đến chỗ ở tạm thời tại một nhà thi đấu thể thao.'
    }
  ],
  pronunciation: {
    title: 'Phonetics: Stress in words ending in -al and -ous',
    sounds: [
      {
        sound: '-al (trọng âm)',
        guide: "Với các tính từ có đuôi -al (thường có 3 âm tiết trở lên), trọng âm rơi vào âm tiết thứ 3 từ cuối đếm ngược lên (tức âm tiết đầu ở từ 3 âm tiết): 'natural, 'practical, 'medical, 'chemical, 'tropical.",
        examples: ["natural /ˈnætʃrəl/", "practical /ˈpræktɪkl/", "medical /ˈmedɪkl/", "chemical /ˈkemɪkl/", "tropical /ˈtrɒpɪkl/"]
      },
      {
        sound: '-ous (trọng âm)',
        guide: "Với các tính từ có đuôi -ous có 3 âm tiết, trọng âm rơi vào âm tiết thứ 3 từ cuối đếm lên: 'dangerous, 'poisonous, 'mountainous, 'marvelous, 'generous.",
        examples: ["dangerous /ˈdeɪndʒərəs/", "poisonous /ˈpɔɪzənəs/", "mountainous /ˈmaʊntənəs/", "marvelous /ˈmɑːvələs/", "generous /ˈdʒenərəs/"]
      }
    ],
    explanation: [
      {
        sound: '-al',
        guide: "Hậu tố -al không nhận trọng âm; trọng âm thường rơi vào âm tiết trước nó 2 bậc: 'natural, 'musical.",
        examples: ['natural', 'practical', 'tropical', 'medical']
      },
      {
        sound: '-ous',
        guide: "Hậu tố -ous tạo tính từ, trọng âm thường cách đuôi này 2 âm tiết: 'dangerous, 'poisonous.",
        examples: ['dangerous', 'poisonous', 'mountainous', 'humorous']
      }
    ]
  },
  grammar: [
    {
      title: '1. Thì Quá khứ tiếp diễn (Past Continuous)',
      rules: [
        'Cấu trúc khẳng định: S + was / were + V-ing.',
        'Cấu trúc phủ định: S + was not (wasn\'t) / were not (weren\'t) + V-ing.',
        'Cấu trúc nghi vấn: Was / Were + S + V-ing...?',
        'Chủ ngữ đi với was: I, He, She, It, danh từ số ít.',
        'Chủ ngữ đi với were: You, We, They, danh từ số nhiều.',
        'Cách dùng: Diễn tả hành động đang diễn ra tại một thời điểm xác định trong quá khứ.',
        'Ví dụ: At 8 p.m. yesterday, our family was watching the weather forecast on TV.'
      ],
      tips: [
        'Dấu hiệu nhận biết: at + giờ + thời gian quá khứ (at 7 p.m. last night), at this time yesterday, at that moment in the past.'
      ],
      examTips: [
        'Nếu thấy "at 3 o\'clock yesterday afternoon", chắc chắn phải chia was/were + V-ing, không chia thì quá khứ đơn.'
      ]
    },
    {
      title: '2. Quá khứ tiếp diễn kết hợp When và While',
      rules: [
        'Trường hợp 1: Một hành động đang xảy ra trong quá khứ thì một hành động ngắn khác xen vào.',
        'Hành động đang xảy ra kéo dài: chia Quá khứ tiếp diễn (Past Continuous - was/were + V-ing).',
        'Hành động chen ngang đột ngột: chia Quá khứ đơn (Past Simple - V2/ed).',
        'Cấu trúc: When + S + V2/ed, S + was/were + V-ing  HOẶC  While + S + was/were + V-ing, S + V2/ed.',
        'Ví dụ: When the earthquake struck, we were sleeping soundly. = While we were sleeping soundly, the earthquake struck.',
        'Trường hợp 2: Hai hành động xảy ra song song đồng thời trong quá khứ: dùng While với cả hai mệnh đề.',
        'Ví dụ: While rescue workers were clearing the road, doctors were treating the injured victims.'
      ],
      tips: [
        'Ghi nhớ mẹo: sau "While" thường là hành động kéo dài (tiếp diễn), sau "When" thường là mốc thời gian / hành động ngắn (đơn).'
      ],
      examTips: [
        'Trong đề thi vào 10, cấu trúc "When + past simple, past continuous" xuất hiện tới 90% ở các câu hỏi kết hợp thì.'
      ]
    }
  ],
  quiz: [
    {
      id: 'u9_q1',
      section: 'I. Pronunciation',
      question: 'Choose the word whose primary stress is positioned differently: A. natural   B. practical   C. disaster   D. dangerous',
      options: ['A. natural', 'B. practical', 'C. disaster', 'D. dangerous'],
      answer: 2,
      explanation: "'disaster' có trọng âm ở âm tiết thứ 2 /dɪˈzɑːstə(r)/. Các từ natural, practical, dangerous đều có trọng âm ở âm tiết thứ 1."
    },
    {
      id: 'u9_q2',
      section: 'I. Pronunciation',
      question: 'Choose the word whose primary stress is positioned differently: A. poisonous   B. volcanic   C. medical   D. mountainous',
      options: ['A. poisonous', 'B. volcanic', 'C. medical', 'D. mountainous'],
      answer: 1,
      explanation: "'volcanic' có trọng âm ở âm tiết thứ 2 /vɒlˈkænɪk/. Các từ còn lại có trọng âm ở âm tiết 1."
    },
    {
      id: 'u9_q3',
      section: 'II. Vocabulary',
      question: 'A giant undersea tremor triggered a massive _______ that wiped out entire coastal villages.',
      options: ['A. tsunami', 'B. drought', 'C. volcanic eruption', 'D. tornado'],
      answer: 0,
      explanation: "Cơn địa chấn dưới đáy biển tạo ra sóng thần khổng lồ -> 'tsunami'."
    },
    {
      id: 'u9_q4',
      section: 'II. Vocabulary',
      question: 'Months with no rainfall caused a catastrophic _______ across the southern plains.',
      options: ['A. flood', 'B. drought', 'C. landslide', 'D. typhoon'],
      answer: 1,
      explanation: "Nhiều tháng không có mưa gây ra hạn hán -> 'drought'."
    },
    {
      id: 'u9_q5',
      section: 'II. Vocabulary',
      question: 'Local authorities ordered residents in low-lying areas to _______ immediately.',
      options: ['A. destroy', 'B. pollute', 'C. evacuate', 'D. erupt'],
      answer: 2,
      explanation: "Chính quyền yêu cầu người dân sơ tán ngay lập tức -> 'evacuate'."
    },
    {
      id: 'u9_q6',
      section: 'III. Grammar',
      question: 'At 8 o\'clock yesterday evening, the rescue team _______ through the debris for survivors.',
      options: ['A. searches', 'B. searched', 'C. was searching', 'D. is searching'],
      answer: 2,
      explanation: "Có mốc thời gian cụ thể trong quá khứ 'At 8 o'clock yesterday evening' dùng Quá khứ tiếp diễn -> 'was searching'."
    },
    {
      id: 'u9_q7',
      section: 'III. Grammar',
      question: 'While my mother _______ dinner, the storm violently knocked down a tree in front of our house.',
      options: ['A. cooked', 'B. was cooking', 'C. is cooking', 'D. has cooked'],
      answer: 1,
      explanation: "Hành động đang diễn ra (mẹ đang nấu ăn) thì hành động khác xen vào (cơn bão quật đổ cây) -> dùng 'was cooking'."
    },
    {
      id: 'u9_q8',
      section: 'III. Grammar',
      question: 'When the siren sounded, all the workers _______ out of the chemical plant.',
      options: ['A. rushed', 'B. were rushing', 'C. rush', 'D. had rushed'],
      answer: 0,
      explanation: "Hành động xảy ra nối tiếp ngay khi còi hú: tiếng còi hú (sounded), công nhân ùa ra ngoài (rushed) -> chia Quá khứ đơn."
    },
    {
      id: 'u9_q9',
      section: 'III. Grammar',
      question: 'While Tom was fixing the leak, his brother _______ emergency phone calls.',
      options: ['A. makes', 'B. made', 'C. was making', 'D. has made'],
      answer: 2,
      explanation: "Hai hành động diễn ra song song cùng lúc trong quá khứ: While S1 was V-ing, S2 was V-ing -> 'was making'."
    },
    {
      id: 'u9_q10',
      section: 'IV. Lexico-Grammar',
      question: 'The powerful tornado left nothing but _______ and fallen roofs in its wake.',
      options: ['A. debris', 'B. equipment', 'C. forecast', 'D. accommodation'],
      answer: 0,
      explanation: "'debris' là đống gạch đá đổ nát, tàn tích sau bão/lốc xoáy."
    },
    {
      id: 'u9_q11',
      section: 'V. Reading Passage',
      question: 'What is the most critical survival advice during an earthquake when you are inside a building?',
      options: [
        'A. Run into an elevator immediately.',
        'B. Drop, cover your head under a sturdy desk, and hold on.',
        'C. Stand near large glass windows to call for help.',
        'D. Climb onto the roof.'
      ],
      answer: 1,
      explanation: "Kỹ năng an toàn khi động đất: 'Drop, Cover, and Hold on' (Nằm sấp xuống, chui dưới bàn vững chắc che đầu và giữ chặt)."
    },
    {
      id: 'u9_q12',
      section: 'VI. Error Identification',
      question: 'Find the mistake: What <u>were</u> you <u>doing</u> when the earthquake <u>was shaking</u> the ground <u>last night</u>?',
      options: ['A. were', 'B. doing', 'C. was shaking', 'D. last night'],
      answer: 2,
      explanation: "Hành động chen ngang 'động đất rung chuyển' xảy ra đột ngột và làm mốc thời điểm, sau 'when' phải chia Quá khứ đơn: 'shook' chứ không dùng 'was shaking'."
    }
  ],
  writtenExercises: [
    {
      id: 'u9_w1',
      unitId: 9,
      type: 'word-form',
      rootWord: 'DESTROY',
      prompt: 'The typhoon caused severe _______ to coastal fishing villages. (DESTROY)',
      question: 'The typhoon caused severe _______ to coastal fishing villages. (DESTROY)',
      prefix: 'The typhoon caused severe',
      acceptedAnswers: ['destruction'],
      accepted: ['destruction'],
      grammarHint: "Sau tính từ 'severe' cần một danh từ: destruction (sự tàn phá).",
      hint: "Sau tính từ 'severe' cần một danh từ: destruction (sự tàn phá).",
      explanation: "Sau tính từ 'severe' cần danh từ 'destruction'."
    },
    {
      id: 'u9_w2',
      unitId: 9,
      type: 'word-form',
      rootWord: 'PREDICT',
      prompt: 'Accurate storm _______ helped save thousands of fishermen at sea. (PREDICT)',
      question: 'Accurate storm _______ helped save thousands of fishermen at sea. (PREDICT)',
      prefix: 'Accurate storm',
      acceptedAnswers: ['predictions', 'prediction'],
      accepted: ['predictions', 'prediction'],
      grammarHint: "Cụm danh từ 'storm predictions/prediction' (những dự báo bão).",
      hint: "Cụm danh từ 'storm predictions/prediction' (những dự báo bão).",
      explanation: "Cần danh từ 'predictions' hoặc 'prediction' ghép với storm."
    },
    {
      id: 'u9_w3',
      unitId: 9,
      type: 'word-form',
      rootWord: 'DANGER',
      prompt: 'It is extremely _______ to stand under tall trees during a thunderstorm. (DANGER)',
      question: 'It is extremely _______ to stand under tall trees during a thunderstorm. (DANGER)',
      prefix: 'It is extremely',
      acceptedAnswers: ['dangerous'],
      accepted: ['dangerous'],
      grammarHint: "Cấu trúc: It is + adv + adj + to V: dangerous (nguy hiểm).",
      hint: "Cấu trúc: It is + adv + adj + to V: dangerous (nguy hiểm).",
      explanation: "Sau trạng từ 'extremely' cần tính từ 'dangerous'."
    },
    {
      id: 'u9_w4',
      unitId: 9,
      type: 'rewrite',
      rootWord: 'when',
      prompt: 'During our dinner, the electricity suddenly went out.',
      question: 'During our dinner, the electricity suddenly went out.',
      prefix: 'We were',
      acceptedAnswers: [
        'having dinner when the electricity suddenly went out',
        'having dinner when the electricity suddenly went out.',
        'We were having dinner when the electricity suddenly went out.'
      ],
      accepted: [
        'having dinner when the electricity suddenly went out',
        'having dinner when the electricity suddenly went out.',
        'We were having dinner when the electricity suddenly went out.'
      ],
      grammarHint: "Cấu trúc kết hợp: S + was/were having dinner when + S + V2/ed.",
      hint: "Cấu trúc kết hợp: S + was/were having dinner when + S + V2/ed.",
      explanation: "Chuyển cụm 'During our dinner' thành mệnh đề tiếp diễn 'We were having dinner when the electricity suddenly went out'."
    },
    {
      id: 'u9_w5',
      unitId: 9,
      type: 'rewrite',
      rootWord: 'while',
      prompt: 'The emergency sirens sounded as the villagers were sleeping.',
      question: 'The emergency sirens sounded as the villagers were sleeping.',
      prefix: 'While the villagers',
      acceptedAnswers: [
        'were sleeping, the emergency sirens sounded',
        'were sleeping, the emergency sirens sounded.',
        'While the villagers were sleeping, the emergency sirens sounded.'
      ],
      accepted: [
        'were sleeping, the emergency sirens sounded',
        'were sleeping, the emergency sirens sounded.',
        'While the villagers were sleeping, the emergency sirens sounded.'
      ],
      grammarHint: "Cấu trúc: While + S + was/were V-ing, S + V2/ed.",
      hint: "Cấu trúc: While + S + was/were V-ing, S + V2/ed.",
      explanation: "Đảo mệnh đề với liên từ 'While the villagers were sleeping, the emergency sirens sounded'."
    },
    {
      id: 'u9_w6',
      unitId: 9,
      type: 'rewrite',
      rootWord: 'because',
      prompt: 'Due to the severe flood, the school was closed for three days.',
      question: 'Due to the severe flood, the school was closed for three days.',
      prefix: 'Because the flood',
      acceptedAnswers: [
        'was severe, the school was closed for three days',
        'was severe, the school was closed for three days.',
        'Because the flood was severe, the school was closed for three days.'
      ],
      accepted: [
        'was severe, the school was closed for three days',
        'was severe, the school was closed for three days.',
        'Because the flood was severe, the school was closed for three days.'
      ],
      grammarHint: "Chuyển cụm danh từ 'Due to the severe flood' thành mệnh đề 'Because the flood was severe'.",
      hint: "Chuyển cụm danh từ 'Due to the severe flood' thành mệnh đề 'Because the flood was severe'.",
      explanation: "Due to + Noun phrase = Because + S + V."
    }
  ]
};
