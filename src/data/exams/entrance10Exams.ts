import { ExamData } from '../../types/curriculum';

export const entrance10Exams: ExamData[] = [
  {
    id: 'exam-entrance-10-1',
    title: 'Đề Luyện Thi Tuyển Sinh Vào Lớp 10 - Mã đề 101 (Chuẩn Đề Sở GD&ĐT)',
    category: 'entrance10',
    badge: 'Tuyển Sinh 10',
    targetScore: 'Mục tiêu 8.5+',
    durationMinutes: 60,
    grade: 9,
    semester: 2,
    type: 'entrance10',
    scope: 'Tổng ôn toàn diện Tiếng Anh THCS (Lớp 6, 7, 8, 9) theo ma trận đề thi chính thức vào 10',
    description: 'Đề thi 50 câu trắc nghiệm bao phủ toàn diện 8 phần thi trọng điểm: Phát âm, Trọng âm, Ngữ pháp - Từ vựng, Hội thoại giao tiếp, Đồng nghĩa - Trái nghĩa, Tìm lỗi sai, Đọc điền từ, Đọc hiểu và Viết lại câu.',
    questions: [
      // I. PRONUNCIATION & STRESS (Q1 - Q6)
      {
        id: 'ent1_q1',
        section: 'I. Phonetics - Pronunciation',
        question: 'Choose the word whose underlined part is pronounced differently: A. finish<u>ed</u>   B. look<u>ed</u>   C. stopp<u>ed</u>   D. decid<u>ed</u>',
        options: ['A. finished', 'B. looked', 'C. stopped', 'D. decided'],
        answer: 3,
        explanation: "'decided' tận cùng bằng 'd' nên đuôi -ed phát âm là /ɪd/. Các từ finished, looked, stopped đuôi -ed phát âm là /t/."
      },
      {
        id: 'ent1_q2',
        section: 'I. Phonetics - Pronunciation',
        question: 'Choose the word whose underlined part is pronounced differently: A. book<u>s</u>   B. cat<u>s</u>   C. dog<u>s</u>   D. map<u>s</u>',
        options: ['A. books', 'B. cats', 'C. dogs', 'D. maps'],
        answer: 2,
        explanation: "'dogs' kết thúc bằng phụ âm hữu thanh /ɡ/ nên đuôi -s phát âm là /z/. Các từ còn lại tận cùng bằng âm vô thanh (/k/, /t/, /p/) nên đuôi -s phát âm là /s/."
      },
      {
        id: 'ent1_q3',
        section: 'I. Phonetics - Pronunciation',
        question: 'Choose the word whose underlined part is pronounced differently: A. th<u>i</u>nk   B. f<u>i</u>nd   C. dr<u>i</u>ve   D. m<u>i</u>nd',
        options: ['A. think', 'B. find', 'C. drive', 'D. mind'],
        answer: 0,
        explanation: "'think' có chữ 'i' phát âm là /ɪ/ ngắn. Các từ find, drive, mind phát âm là /aɪ/."
      },
      {
        id: 'ent1_q4',
        section: 'I. Phonetics - Stress',
        question: 'Choose the word whose primary stress is positioned differently: A. protect   B. pollute   C. provide   D. plastic',
        options: ['A. protect', 'B. pollute', 'C. provide', 'D. plastic'],
        answer: 3,
        explanation: "'plastic' là danh từ/tính từ có 2 âm tiết, trọng âm rơi vào âm tiết 1 /ˈplæstɪk/. Các từ protect, pollute, provide là động từ có trọng âm rơi vào âm tiết 2."
      },
      {
        id: 'ent1_q5',
        section: 'I. Phonetics - Stress',
        question: 'Choose the word whose primary stress is positioned differently: A. traditional   B. environment   C. electricity   D. community',
        options: ['A. traditional', 'B. environment', 'C. electricity', 'D. community'],
        answer: 2,
        explanation: "'electricity' có trọng âm rơi vào âm tiết thứ 3 /ɪˌlekˈtrɪsəti/. Các từ traditional, environment, community đều có trọng âm rơi vào âm tiết thứ 2."
      },
      {
        id: 'ent1_q6',
        section: 'I. Phonetics - Stress',
        question: 'Choose the word whose primary stress is positioned differently: A. generous   B. natural   C. practical   D. convenient',
        options: ['A. generous', 'B. natural', 'C. practical', 'D. convenient'],
        answer: 3,
        explanation: "'convenient' có trọng âm ở âm tiết 2 /kənˈviːniənt/. Các từ generous, natural, practical đều có trọng âm ở âm tiết 1."
      },

      // II. LEXICO-GRAMMAR (Q7 - Q22)
      {
        id: 'ent1_q7',
        section: 'II. Lexico-Grammar',
        question: 'If she _______ hard for the entrance examination, she will surely pass with high flying colors.',
        options: ['A. studies', 'B. studied', 'C. will study', 'D. is studying'],
        answer: 0,
        explanation: "Câu điều kiện loại 1 (Conditional Type 1): Mệnh đề If chia thì Hiện tại đơn (studies), mệnh đề chính dùng will + V."
      },
      {
        id: 'ent1_q8',
        section: 'II. Lexico-Grammar',
        question: 'If I _______ a million dollars, I would travel around the world to support endangered wildlife.',
        options: ['A. have', 'B. had', 'C. will have', 'D. would have'],
        answer: 1,
        explanation: "Câu điều kiện loại 2 (Conditional Type 2): Mệnh đề If chia thì Quá khứ đơn (had), mệnh đề chính dùng would + V."
      },
      {
        id: 'ent1_q9',
        section: 'II. Lexico-Grammar',
        question: 'The young scientist _______ won the national innovators award is only 15 years old.',
        options: ['A. which', 'B. whom', 'C. who', 'D. whose'],
        answer: 2,
        explanation: "Đại từ quan hệ 'who' thay thế cho danh từ chỉ người 'The young scientist' làm chủ ngữ cho mệnh đề quan hệ."
      },
      {
        id: 'ent1_q10',
        section: 'II. Lexico-Grammar',
        question: 'This ancient pagoda, _______ was constructed five hundred years ago, attracts thousands of pilgrims every spring.',
        options: ['A. which', 'B. that', 'C. where', 'D. who'],
        answer: 0,
        explanation: "Trong mệnh đề quan hệ không xác định (có dấu phẩy), thay thế cho danh từ chỉ vật 'This ancient pagoda' chỉ dùng 'which', KHÔNG DÙNG 'that'."
      },
      {
        id: 'ent1_q11',
        section: 'II. Lexico-Grammar',
        question: 'A brand-new modern library _______ in our school campus next month.',
        options: ['A. will build', 'B. will be built', 'C. is built', 'D. built'],
        answer: 1,
        explanation: "Câu bị động thì Tương lai đơn (Future Simple Passive): S + will be + V3/ed -> 'will be built'."
      },
      {
        id: 'ent1_q12',
        section: 'II. Lexico-Grammar',
        question: 'These solar panels _______ by the maintenance technician yesterday afternoon.',
        options: ['A. were inspected', 'B. was inspected', 'C. inspected', 'D. are inspected'],
        answer: 0,
        explanation: "Câu bị động thì Quá khứ đơn với chủ ngữ số nhiều 'These solar panels' -> 'were inspected'."
      },
      {
        id: 'ent1_q13',
        section: 'II. Lexico-Grammar',
        question: 'My father suggested _______ public transport rather than private motorbikes to cut down emissions.',
        options: ['A. use', 'B. to use', 'C. using', 'D. used'],
        answer: 2,
        explanation: "Cấu trúc đề xuất: suggest + V-ing -> 'suggested using'."
      },
      {
        id: 'ent1_q14',
        section: 'II. Lexico-Grammar',
        question: 'Lan used to _______ cycling to school when she was in grade 6, but now she takes the bus.',
        options: ['A. go', 'B. going', 'C. went', 'D. goes'],
        answer: 0,
        explanation: "Cấu trúc thói quen trong quá khứ đã chấm dứt: used to + V nguyên thể -> 'used to go'."
      },
      {
        id: 'ent1_q15',
        section: 'II. Lexico-Grammar',
        question: 'I look forward to _______ you at the youth green camp next Saturday.',
        options: ['A. see', 'B. seeing', 'C. seen', 'D. saw'],
        answer: 1,
        explanation: "Cụm cố định: 'look forward to + V-ing' (rất trông mong, háo hức làm gì)."
      },
      {
        id: 'ent1_q16',
        section: 'II. Lexico-Grammar',
        question: 'Remember to _______ off all the air conditioners and computers before leaving the classroom.',
        options: ['A. turn', 'B. put', 'C. take', 'D. give'],
        answer: 0,
        explanation: "Cụm động từ: 'turn off' (tắt thiết bị điện)."
      },
      {
        id: 'ent1_q17',
        section: 'II. Lexico-Grammar',
        question: 'She decided to _______ up fast food in order to improve her health and lose weight.',
        options: ['A. give', 'B. get', 'C. look', 'D. make'],
        answer: 0,
        explanation: "Cụm động từ: 'give up' (từ bỏ một thói quen)."
      },
      {
        id: 'ent1_q18',
        section: 'II. Lexico-Grammar',
        question: 'You haven\'t finished doing your grammar homework yet, _______?',
        options: ['A. have you', 'B. haven\'t you', 'C. did you', 'D. do you'],
        answer: 0,
        explanation: "Câu hỏi đuôi (Tag question): Mệnh đề trước ở dạng phủ định thì Hiện tại hoàn thành ('haven\'t finished'), phần đuôi dùng khẳng định 'have you'."
      },
      {
        id: 'ent1_q19',
        section: 'II. Lexico-Grammar',
        question: 'Neither Nam nor his brothers _______ willing to participate in the marathon tomorrow.',
        options: ['A. is', 'B. are', 'C. was', 'D. were'],
        answer: 1,
        explanation: "Cấu trúc 'Neither S1 nor S2': động từ chia theo chủ ngữ gần nhất (S2 là 'his brothers' số nhiều) -> dùng 'are'."
      },
      {
        id: 'ent1_q20',
        section: 'II. Lexico-Grammar',
        question: 'She asked me how long _______ English before taking the high school entrance test.',
        options: ['A. I had learned', 'B. had I learned', 'C. I have learned', 'D. have I learned'],
        answer: 0,
        explanation: "Câu tường thuật câu hỏi Wh-: giữ trật tự khẳng định S + V (lùi thì): 'how long I had learned'."
      },
      {
        id: 'ent1_q21',
        section: 'II. Lexico-Grammar',
        question: 'Despite _______ severely injured in the traffic collision, the driver managed to help the passengers out.',
        options: ['A. he was', 'B. being', 'C. was', 'D. been'],
        answer: 1,
        explanation: "Sau giới từ 'Despite' là V-ing: 'Despite being severely injured...'."
      },
      {
        id: 'ent1_q22',
        section: 'II. Lexico-Grammar',
        question: 'The more regularly you read English novels, the _______ your vocabulary will become.',
        options: ['A. good', 'B. better', 'C. best', 'D. well'],
        answer: 1,
        explanation: "Cấu trúc so sánh kép (The more... the better...): The + comparative... the + comparative..."
      },

      // III. CONVERSATIONAL EXCHANGES (Q23 - Q26)
      {
        id: 'ent1_q23',
        section: 'III. Conversational Exchanges',
        question: '- David: "Thank you so much for guiding me through the difficult geometry theorem!" - Hoa: "_______"',
        options: [
          'A. Don\'t mention it. It\'s my pleasure.',
          'B. You must be kidding.',
          'C. No, I wouldn\'t say that.',
          'D. Same to you.'
        ],
        answer: 0,
        explanation: "Đáp lại lời cảm ơn: 'Don\'t mention it. It\'s my pleasure' (Không có gì đâu, đó là niềm vinh hạnh của tớ)."
      },
      {
        id: 'ent1_q24',
        section: 'III. Conversational Exchanges',
        question: '- Tim: "Why don\'t we organize a garage sale to raise money for charity this Sunday?" - Sarah: "_______"',
        options: [
          'A. That sounds like a brilliant idea!',
          'B. Yes, I do.',
          'C. I\'m sorry I am fine.',
          'D. Because I was busy.'
        ],
        answer: 0,
        explanation: "Hưởng ứng lời gợi ý 'Why don\'t we...': 'That sounds like a brilliant idea!' (Nghe như một ý tưởng tuyệt vời!)."
      },
      {
        id: 'ent1_q25',
        section: 'III. Conversational Exchanges',
        question: '- Examiner: "Would you mind if I took a look at your identity registration card?" - Student: "_______"',
        options: [
          'A. No, not at all. Here you are.',
          'B. Yes, please take it.',
          'C. Yes, I would mind so much.',
          'D. Don\'t worry about it.'
        ],
        answer: 0,
        explanation: "Đáp lại câu hỏi 'Would you mind if...' khi đồng ý cho xem: 'No, not at all' (Không, em không phiền chút nào ạ)."
      },
      {
        id: 'ent1_q26',
        section: 'III. Conversational Exchanges',
        question: '- Minh: "I passed the first round of the national English olympiad!" - Lan: "_______"',
        options: [
          'A. Wow, congratulations! You truly deserved it.',
          'B. Better luck next time.',
          'C. Never mind.',
          'D. You should try harder.'
        ],
        answer: 0,
        explanation: "Chúc mừng thành công của bạn bè: 'Wow, congratulations! You truly deserved it' (Chúc mừng nhé, bạn rất xứng đáng)."
      },

      // IV. CLOSEST & OPPOSITE IN MEANING (Q27 - Q30)
      {
        id: 'ent1_q27',
        section: 'IV. Closest in Meaning',
        question: 'Choose the word CLOSEST in meaning to the underlined word: Solar and wind energy are <u>renewable</u> sources that will never run out.',
        options: ['A. non-replaceable', 'B. inexhaustible', 'C. harmful', 'D. expensive'],
        answer: 1,
        explanation: "'renewable' (có thể tái tạo, không bao giờ cạn kiệt) đồng nghĩa với 'inexhaustible' (vô tận, không cạn)."
      },
      {
        id: 'ent1_q28',
        section: 'IV. Closest in Meaning',
        question: 'Choose the word CLOSEST in meaning to the underlined word: The government carried out an <u>extensive</u> vaccination campaign across all districts.',
        options: ['A. narrow', 'B. widespread', 'C. limited', 'D. tiny'],
        answer: 1,
        explanation: "'extensive' = quy mô lớn, sâu rộng, đồng nghĩa với 'widespread'."
      },
      {
        id: 'ent1_q29',
        section: 'IV. Opposite in Meaning',
        question: 'Choose the word OPPOSITE in meaning to the underlined word: The math examination was surprisingly <u>straightforward</u>, so most students finished early.',
        options: ['A. complicated', 'B. simple', 'C. clear', 'D. easy'],
        answer: 0,
        explanation: "'straightforward' là dễ hiểu, đơn giản; trái nghĩa với 'complicated' (phức tạp, rắc rối)."
      },
      {
        id: 'ent1_q30',
        section: 'IV. Opposite in Meaning',
        question: 'Choose the word OPPOSITE in meaning to the underlined word: He was <u>reluctant</u> to speak in front of a thousand spectators at the school hall.',
        options: ['A. hesitant', 'B. eager', 'C. cautious', 'D. unwilling'],
        answer: 1,
        explanation: "'reluctant' = miễn cưỡng, ngần ngại; trái nghĩa với 'eager' (háo hức, sốt sắng)."
      },

      // V. ERROR IDENTIFICATION (Q31 - Q34)
      {
        id: 'ent1_q31',
        section: 'V. Error Identification',
        question: 'Find the mistake: If we <u>will continue</u> to dump untreated industrial waste into the lake, <u>all the marine fish</u> <u>will perish</u> <u>in the near future</u>.',
        options: ['A. will continue', 'B. all the marine fish', 'C. will perish', 'D. in the near future'],
        answer: 0,
        explanation: "Trong mệnh đề If của câu điều kiện loại 1, TUYỆT ĐỐI KHÔNG dùng thì tương lai 'will continue', phải sửa thành 'continue'."
      },
      {
        id: 'ent1_q32',
        section: 'V. Error Identification',
        question: 'Find the mistake: The boy <u>whom</u> won <u>the first prize</u> in <u>the national robotics contest</u> <u>is</u> only in grade 8.',
        options: ['A. whom', 'B. the first prize', 'C. the national robotics contest', 'D. is'],
        answer: 0,
        explanation: "'whom' chỉ dùng làm tân ngữ; ở đây làm chủ ngữ cho động từ 'won' nên phải dùng 'who'."
      },
      {
        id: 'ent1_q33',
        section: 'V. Error Identification',
        question: 'Find the mistake: My uncle <u>advised</u> me <u>giving up</u> staying up late <u>playing</u> video games <u>on school nights</u>.',
        options: ['A. advised', 'B. giving up', 'C. playing', 'D. on school nights'],
        answer: 1,
        explanation: "Cấu trúc: advise somebody to do something -> 'giving up' phải sửa thành 'to give up'."
      },
      {
        id: 'ent1_q34',
        section: 'V. Error Identification',
        question: 'Find the mistake: <u>Because of</u> she <u>had studied</u> diligently for months, <u>she passed</u> the admission exam <u>with flying colors</u>.',
        options: ['A. Because of', 'B. had studied', 'C. she passed', 'D. with flying colors'],
        answer: 0,
        explanation: "Sau 'Because of' chỉ là cụm danh từ hoặc V-ing; ở đây có mệnh đề 'she had studied...' nên phải dùng 'Because'."
      },

      // VI. CLOZE TEST (Q35 - Q39)
      {
        id: 'ent1_q35',
        section: 'VI. Cloze Test',
        question: '[Cloze Q35] English has become the dominant global language, spoken by (35) _______ of millions of non-native speakers worldwide.',
        options: ['A. hundreds', 'B. hundred', 'C. a hundred', 'D. one hundred'],
        answer: 0,
        explanation: "Cụm 'hundreds of millions' (hàng trăm triệu).",
        passage: "English has become the dominant global language, spoken by (35) _______ of millions of non-native speakers worldwide. In modern society, acquiring strong English proficiency opens the door to high-paying international careers and prestigious scholarships. (36) _______, simply memorizing grammar rules and vocabulary lists in textbooks is never enough. To achieve true fluency, students should actively (37) _______ English into their daily routines by listening to podcasts, reading foreign newspapers, and participating in international youth forums. Moreover, having the courage to speak without fearing mistakes is the single most vital factor (38) _______ distinguishes successful language learners from hesitant ones. With consistent determination and modern learning strategies, every student can (39) _______ their target proficiency.",
        passageGroupId: "ent1_cloze_pg"
      },
      {
        id: 'ent1_q36',
        section: 'VI. Cloze Test',
        question: '[Cloze Q36] (36) _______, simply memorizing grammar rules and vocabulary lists in textbooks is never enough.',
        options: ['A. Therefore', 'B. However', 'C. Furthermore', 'D. In addition'],
        answer: 1,
        explanation: "Liên từ biểu thị sự đối lập mang tính chuyển ý: 'However' (Tuy nhiên).",
        passage: "English has become the dominant global language, spoken by (35) _______ of millions of non-native speakers worldwide. In modern society, acquiring strong English proficiency opens the door to high-paying international careers and prestigious scholarships. (36) _______, simply memorizing grammar rules and vocabulary lists in textbooks is never enough. To achieve true fluency, students should actively (37) _______ English into their daily routines by listening to podcasts, reading foreign newspapers, and participating in international youth forums. Moreover, having the courage to speak without fearing mistakes is the single most vital factor (38) _______ distinguishes successful language learners from hesitant ones. With consistent determination and modern learning strategies, every student can (39) _______ their target proficiency.",
        passageGroupId: "ent1_cloze_pg"
      },
      {
        id: 'ent1_q37',
        section: 'VI. Cloze Test',
        question: '[Cloze Q37] To achieve true fluency, students should actively (37) _______ English into their daily routines.',
        options: ['A. integrate', 'B. invent', 'C. destroy', 'D. evacuate'],
        answer: 0,
        explanation: "Cụm 'integrate ... into' (lồng ghép, tích hợp tiếng Anh vào thói quen hàng ngày).",
        passage: "English has become the dominant global language, spoken by (35) _______ of millions of non-native speakers worldwide. In modern society, acquiring strong English proficiency opens the door to high-paying international careers and prestigious scholarships. (36) _______, simply memorizing grammar rules and vocabulary lists in textbooks is never enough. To achieve true fluency, students should actively (37) _______ English into their daily routines by listening to podcasts, reading foreign newspapers, and participating in international youth forums. Moreover, having the courage to speak without fearing mistakes is the single most vital factor (38) _______ distinguishes successful language learners from hesitant ones. With consistent determination and modern learning strategies, every student can (39) _______ their target proficiency.",
        passageGroupId: "ent1_cloze_pg"
      },
      {
        id: 'ent1_q38',
        section: 'VI. Cloze Test',
        question: '[Cloze Q38] ...is the single most vital factor (38) _______ distinguishes successful language learners from hesitant ones.',
        options: ['A. who', 'B. that', 'C. whom', 'D. whose'],
        answer: 1,
        explanation: "Sau dạng so sánh nhất 'the single most vital factor' đại từ quan hệ ưu tiên dùng 'that'.",
        passage: "English has become the dominant global language, spoken by (35) _______ of millions of non-native speakers worldwide. In modern society, acquiring strong English proficiency opens the door to high-paying international careers and prestigious scholarships. (36) _______, simply memorizing grammar rules and vocabulary lists in textbooks is never enough. To achieve true fluency, students should actively (37) _______ English into their daily routines by listening to podcasts, reading foreign newspapers, and participating in international youth forums. Moreover, having the courage to speak without fearing mistakes is the single most vital factor (38) _______ distinguishes successful language learners from hesitant ones. With consistent determination and modern learning strategies, every student can (39) _______ their target proficiency.",
        passageGroupId: "ent1_cloze_pg"
      },
      {
        id: 'ent1_q39',
        section: 'VI. Cloze Test',
        question: '[Cloze Q39] With consistent determination and modern learning strategies, every student can (39) _______ their target proficiency.',
        options: ['A. achieve', 'B. make', 'C. lead', 'D. produce'],
        answer: 0,
        explanation: "'achieve one\'s target' (đạt được mục tiêu đề ra).",
        passage: "English has become the dominant global language, spoken by (35) _______ of millions of non-native speakers worldwide. In modern society, acquiring strong English proficiency opens the door to high-paying international careers and prestigious scholarships. (36) _______, simply memorizing grammar rules and vocabulary lists in textbooks is never enough. To achieve true fluency, students should actively (37) _______ English into their daily routines by listening to podcasts, reading foreign newspapers, and participating in international youth forums. Moreover, having the courage to speak without fearing mistakes is the single most vital factor (38) _______ distinguishes successful language learners from hesitant ones. With consistent determination and modern learning strategies, every student can (39) _______ their target proficiency.",
        passageGroupId: "ent1_cloze_pg"
      },

      // VII. READING COMPREHENSION (Q40 - Q44)
      {
        id: 'ent1_q40',
        section: 'VII. Reading Comprehension',
        question: '[Reading Q40] What is the primary theme of the reading passage?',
        options: [
          'A. How to assemble a robotic lawnmower at home.',
          'B. The transformational impact of artificial intelligence on secondary education.',
          'C. Why students should abandon traditional schools entirely.',
          'D. The history of smartphone displays.'
        ],
        answer: 1,
        explanation: "Chủ đề chính của bài là sự tác động mang tính chuyển biến của trí tuệ nhân tạo (AI) đối với giáo dục trung học.",
        passage: "Artificial Intelligence (AI) is no longer a futuristic concept confined to science fiction novels; it is actively revolutionizing education across the globe. Today, adaptive AI learning software can diagnose a student's individual learning weaknesses within minutes and instantly generate customized exercises. For example, if a student repeatedly struggles with the difference between the Past Continuous and Past Simple tenses, the system automatically provides targeted practice questions until mastery is confirmed.\n\nFurthermore, generative AI systems serve as 24/7 personal conversational tutors, enabling learners to practice spoken English and receive immediate feedback on pronunciation and grammatical accuracy without the anxiety of being judged by peers. However, educational experts emphasize that technology can never replace dedicated teachers. While machines excel at crunching data and grading tests, only human educators possess empathy, moral guidance, and the ability to inspire creative thinking and emotional resilience in young minds.",
        passageGroupId: "ent1_read_pg"
      },
      {
        id: 'ent1_q41',
        section: 'VII. Reading Comprehension',
        question: '[Reading Q41] According to the passage, how does adaptive AI assist struggling students?',
        options: [
          'A. By writing their final exam essays for them.',
          'B. By pinpointing weaknesses and delivering personalized remedial exercises.',
          'C. By giving them free smartphones.',
          'D. By lowering the passing grade threshold.'
        ],
        answer: 1,
        explanation: "Trong đoạn 1: '...can diagnose a student\'s individual learning weaknesses within minutes and instantly generate customized exercises'.",
        passage: "Artificial Intelligence (AI) is no longer a futuristic concept confined to science fiction novels; it is actively revolutionizing education across the globe. Today, adaptive AI learning software can diagnose a student's individual learning weaknesses within minutes and instantly generate customized exercises. For example, if a student repeatedly struggles with the difference between the Past Continuous and Past Simple tenses, the system automatically provides targeted practice questions until mastery is confirmed.\n\nFurthermore, generative AI systems serve as 24/7 personal conversational tutors, enabling learners to practice spoken English and receive immediate feedback on pronunciation and grammatical accuracy without the anxiety of being judged by peers. However, educational experts emphasize that technology can never replace dedicated teachers. While machines excel at crunching data and grading tests, only human educators possess empathy, moral guidance, and the ability to inspire creative thinking and emotional resilience in young minds.",
        passageGroupId: "ent1_read_pg"
      },
      {
        id: 'ent1_q42',
        section: 'VII. Reading Comprehension',
        question: '[Reading Q42] The word "confined" in paragraph 1 is closest in meaning to:',
        options: ['A. limited', 'B. invited', 'C. protected', 'D. publicized'],
        answer: 0,
        explanation: "'confined to' có nghĩa là bị giới hạn trong, chỉ tồn tại trong, đồng nghĩa với 'limited to'.",
        passage: "Artificial Intelligence (AI) is no longer a futuristic concept confined to science fiction novels; it is actively revolutionizing education across the globe. Today, adaptive AI learning software can diagnose a student's individual learning weaknesses within minutes and instantly generate customized exercises. For example, if a student repeatedly struggles with the difference between the Past Continuous and Past Simple tenses, the system automatically provides targeted practice questions until mastery is confirmed.\n\nFurthermore, generative AI systems serve as 24/7 personal conversational tutors, enabling learners to practice spoken English and receive immediate feedback on pronunciation and grammatical accuracy without the anxiety of being judged by peers. However, educational experts emphasize that technology can never replace dedicated teachers. While machines excel at crunching data and grading tests, only human educators possess empathy, moral guidance, and the ability to inspire creative thinking and emotional resilience in young minds.",
        passageGroupId: "ent1_read_pg"
      },
      {
        id: 'ent1_q43',
        section: 'VII. Reading Comprehension',
        question: '[Reading Q43] Why does practicing English with AI tutors help reduce learner anxiety?',
        options: [
          'A. Because AI tutors give students money for every correct sentence.',
          'B. Because students can practice at their own pace without fear of peer judgment.',
          'C. Because AI automatically passes them to the next school grade.',
          'D. Because AI speaks only in Vietnamese.'
        ],
        answer: 1,
        explanation: "Trong đoạn 2: '...without the anxiety of being judged by peers' (không sợ bị bạn bè chê cười hay phán xét).",
        passage: "Artificial Intelligence (AI) is no longer a futuristic concept confined to science fiction novels; it is actively revolutionizing education across the globe. Today, adaptive AI learning software can diagnose a student's individual learning weaknesses within minutes and instantly generate customized exercises. For example, if a student repeatedly struggles with the difference between the Past Continuous and Past Simple tenses, the system automatically provides targeted practice questions until mastery is confirmed.\n\nFurthermore, generative AI systems serve as 24/7 personal conversational tutors, enabling learners to practice spoken English and receive immediate feedback on pronunciation and grammatical accuracy without the anxiety of being judged by peers. However, educational experts emphasize that technology can never replace dedicated teachers. While machines excel at crunching data and grading tests, only human educators possess empathy, moral guidance, and the ability to inspire creative thinking and emotional resilience in young minds.",
        passageGroupId: "ent1_read_pg"
      },
      {
        id: 'ent1_q44',
        section: 'VII. Reading Comprehension',
        question: '[Reading Q44] According to the author, why will human teachers never be fully replaced by AI?',
        options: [
          'A. Because AI hardware is too costly to maintain.',
          'B. Because only human teachers provide genuine empathy, moral guidance, and inspiration.',
          'C. Because governments will ban AI altogether.',
          'D. Because AI cannot connect to school Wi-Fi.'
        ],
        answer: 1,
        explanation: "Trong câu cuối: '...only human educators possess empathy, moral guidance, and the ability to inspire creative thinking and emotional resilience...'.",
        passage: "Artificial Intelligence (AI) is no longer a futuristic concept confined to science fiction novels; it is actively revolutionizing education across the globe. Today, adaptive AI learning software can diagnose a student's individual learning weaknesses within minutes and instantly generate customized exercises. For example, if a student repeatedly struggles with the difference between the Past Continuous and Past Simple tenses, the system automatically provides targeted practice questions until mastery is confirmed.\n\nFurthermore, generative AI systems serve as 24/7 personal conversational tutors, enabling learners to practice spoken English and receive immediate feedback on pronunciation and grammatical accuracy without the anxiety of being judged by peers. However, educational experts emphasize that technology can never replace dedicated teachers. While machines excel at crunching data and grading tests, only human educators possess empathy, moral guidance, and the ability to inspire creative thinking and emotional resilience in young minds.",
        passageGroupId: "ent1_read_pg"
      },

      // VIII. SENTENCE TRANSFORMATION & COMBINATION (Q45 - Q50)
      {
        id: 'ent1_q45',
        section: 'VIII. Sentence Transformation',
        question: 'Choose the sentence with the same meaning: "People believe that the old banyan tree in the village square is sacred."',
        options: [
          'A. The old banyan tree in the village square is believed to be sacred.',
          'B. The old banyan tree in the village square was believed to be sacred.',
          'C. It was believed that the old banyan tree in the village square is sacred.',
          'D. The old banyan tree in the village square is believed being sacred.'
        ],
        answer: 0,
        explanation: "Bị động đặc biệt với động từ chỉ quan điểm (impersonal passive): 'People believe that S + V' -> 'S + is believed to + V' -> 'The old banyan tree... is believed to be sacred'."
      },
      {
        id: 'ent1_q46',
        section: 'VIII. Sentence Transformation',
        question: 'Choose the sentence with the same meaning: "I haven\'t seen my former English teacher since we graduated from secondary school."',
        options: [
          'A. The last time I saw my former English teacher was when we graduated from secondary school.',
          'B. I last saw my former English teacher when we had graduated from secondary school.',
          'C. It is since we graduated from secondary school that I have seen my English teacher.',
          'D. I did not see my former English teacher when we graduated from secondary school.'
        ],
        answer: 0,
        explanation: "Chuyển từ Hiện tại hoàn thành 'haven\'t seen... since...' sang 'The last time I saw... was when...'."
      },
      {
        id: 'ent1_q47',
        section: 'VIII. Sentence Transformation',
        question: 'Choose the sentence with the same meaning: "Unless you practice listening to native speakers every day, you won\'t pass the oral interview."',
        options: [
          'A. If you do not practice listening to native speakers every day, you won\'t pass the oral interview.',
          'B. If you practice listening to native speakers every day, you won\'t pass the oral interview.',
          'C. Unless you do not practice listening to native speakers every day, you will pass the oral interview.',
          'D. If you didn\'t practice listening to native speakers every day, you wouldn\'t pass the oral interview.'
        ],
        answer: 0,
        explanation: "Unless + S + V = If + S + don\'t/doesn\'t + V."
      },
      {
        id: 'ent1_q48',
        section: 'VIII. Sentence Transformation',
        question: 'Choose the sentence with the same meaning: "The mountain slope was too steep for the novice climbers to scale."',
        options: [
          'A. The mountain slope was so steep that the novice climbers could not scale it.',
          'B. The mountain slope was such steep that the novice climbers could not scale it.',
          'C. The mountain slope was not steep enough for the novice climbers to scale.',
          'D. The novice climbers were so steep that they could not scale the mountain.'
        ],
        answer: 0,
        explanation: "too + adj + for sb to V = so + adj + that + S + could not + V."
      },
      {
        id: 'ent1_q49',
        section: 'VIII. Sentence Combination',
        question: 'Choose the best sentence that combines: "Peter arrived at the exam hall late. He forgot to set his alarm clock."',
        options: [
          'A. Because Peter forgot to set his alarm clock, he arrived at the exam hall late.',
          'B. Although Peter arrived at the exam hall late, he forgot to set his alarm clock.',
          'C. Peter arrived at the exam hall late so that he forgot to set his alarm clock.',
          'D. Peter forgot to set his alarm clock because he arrived at the exam hall late.'
        ],
        answer: 0,
        explanation: "Nối câu quan hệ nguyên nhân - kết quả: 'Because Peter forgot to set his alarm clock, he arrived at the exam hall late'."
      },
      {
        id: 'ent1_q50',
        section: 'VIII. Sentence Combination',
        question: 'Choose the best sentence that combines: "The weather was awful. However, the volunteers completed the reforestation project."',
        options: [
          'A. Despite the awful weather, the volunteers completed the reforestation project.',
          'B. Because of the awful weather, the volunteers completed the reforestation project.',
          'C. In spite of the weather was awful, the volunteers completed the reforestation project.',
          'D. Although the awful weather, the volunteers completed the reforestation project.'
        ],
        answer: 0,
        explanation: "Chỉ sự tương phản: Despite + noun phrase ('Despite the awful weather, the volunteers completed the reforestation project')."
      }
    ]
  },
  {
    id: 'exam-entrance-10-2',
    title: 'Đề Luyện Thi Tuyển Sinh Vào Lớp 10 - Mã đề 102 (Đề Thực Chiến Phân Hóa Cao)',
    category: 'entrance10',
    badge: 'Tuyển Sinh 10',
    targetScore: 'Mục tiêu 9.0+',
    durationMinutes: 60,
    grade: 9,
    semester: 2,
    type: 'entrance10',
    scope: 'Đề thi thực chiến nâng cao, phân hóa mức độ vận dụng và vận dụng cao',
    description: 'Bộ 50 câu trắc nghiệm chuẩn cấu trúc tuyển sinh 10 với các bài tập phân hóa sâu: cụm động từ nâng cao, thành ngữ thường gặp, cấu trúc đảo ngữ, mệnh đề phân từ và đọc hiểu học thuật.',
    questions: [
      {
        id: 'ent2_q1',
        section: 'I. Phonetics - Pronunciation',
        question: 'Choose the word whose underlined part is pronounced differently: A. miss<u>ed</u>   B. pass<u>ed</u>   C. pleas<u>ed</u>   D. watch<u>ed</u>',
        options: ['A. missed', 'B. passed', 'C. pleased', 'D. watched'],
        answer: 2,
        explanation: "'pleased' kết thúc bằng âm /z/ nên đuôi -ed phát âm là /d/. Các từ missed, passed, watched đuôi -ed phát âm là /t/."
      },
      {
        id: 'ent2_q2',
        section: 'I. Phonetics - Pronunciation',
        question: 'Choose the word whose underlined part is pronounced differently: A. l<u>a</u>nd   B. m<u>a</u>ny   C. pl<u>a</u>stic   D. f<u>a</u>ctory',
        options: ['A. land', 'B. many', 'C. plastic', 'D. factory'],
        answer: 1,
        explanation: "'many' có chữ 'a' phát âm là /e/ /ˈmeni/. Các từ land, plastic, factory phát âm là /æ/."
      },
      {
        id: 'ent2_q3',
        section: 'I. Phonetics - Stress',
        question: 'Choose the word whose primary stress is positioned differently: A. disaster   B. eruption   C. tsunami   D. hurricane',
        options: ['A. disaster', 'B. eruption', 'C. tsunami', 'D. hurricane'],
        answer: 3,
        explanation: "'hurricane' có trọng âm 1 /ˈhʌrɪkən/. Các từ disaster, eruption, tsunami đều có trọng âm rơi vào âm tiết thứ 2."
      },
      {
        id: 'ent2_q4',
        section: 'I. Phonetics - Stress',
        question: 'Choose the word whose primary stress is positioned differently: A. economy   B. economic   C. communicate   D. remarkable',
        options: ['A. economy', 'B. economic', 'C. communicate', 'D. remarkable'],
        answer: 1,
        explanation: "'economic' có trọng âm rơi vào âm tiết thứ 3 /ˌiːkəˈnɒmɪk/. Các từ còn lại có trọng âm ở âm tiết thứ 2."
      },
      {
        id: 'ent2_q5',
        section: 'II. Lexico-Grammar',
        question: 'It is essential that every student _______ the examination regulations strictly.',
        options: ['A. obey', 'B. obeys', 'C. obeyed', 'D. is obeying'],
        answer: 0,
        explanation: "Thức giả định (Subjunctive): It is essential that + S + (should) + V nguyên thể -> 'obey'."
      },
      {
        id: 'ent2_q6',
        section: 'II. Lexico-Grammar',
        question: 'Hardly had the bell rung _______ all the students dashed enthusiastically out into the schoolyard.',
        options: ['A. than', 'B. when', 'C. then', 'D. that'],
        answer: 1,
        explanation: "Cấu trúc đảo ngữ: Hardly + had + S + V3/ed + WHEN + S + V2/ed."
      },
      {
        id: 'ent2_q7',
        section: 'II. Lexico-Grammar',
        question: 'The teacher made us _______ all ten practice tests before the final examination.',
        options: ['A. redo', 'B. to redo', 'C. redoing', 'D. redone'],
        answer: 0,
        explanation: "Cấu trúc: make somebody do something (bắt/yêu cầu ai làm gì) -> 'redo'."
      },
      {
        id: 'ent2_q8',
        section: 'II. Lexico-Grammar',
        question: 'No sooner _______ home than it started to pour with rain.',
        options: ['A. had he arrived', 'B. he had arrived', 'C. did he arrive', 'D. was he arriving'],
        answer: 0,
        explanation: "Cấu trúc đảo ngữ: No sooner + had + S + V3/ed + than..."
      },
      {
        id: 'ent2_q9',
        section: 'II. Lexico-Grammar',
        question: 'You should take an umbrella with you in case it _______ rain later this afternoon.',
        options: ['A. will', 'B. should', 'C. would', 'D. must'],
        answer: 1,
        explanation: "Sau 'in case' có thể dùng 'should + V' để diễn tả khả năng có thể xảy ra (phòng khi)."
      },
      {
        id: 'ent2_q10',
        section: 'II. Lexico-Grammar',
        question: 'He has an exceptional talent _______ acquiring foreign languages rapidly.',
        options: ['A. for', 'B. at', 'C. with', 'D. in'],
        answer: 0,
        explanation: "Cụm cố định: have a talent FOR something (có năng khiếu về việc gì)."
      },
      {
        id: 'ent2_q11',
        section: 'II. Lexico-Grammar',
        question: 'The proposal was turned _______ by the school board due to budget constraints.',
        options: ['A. down', 'B. off', 'C. away', 'D. out'],
        answer: 0,
        explanation: "'turn down' = từ chối, bác bỏ một lời đề nghị/kế hoạch."
      },
      {
        id: 'ent2_q12',
        section: 'II. Lexico-Grammar',
        question: 'We ran _______ of paper for the photocopier just before the meeting started.',
        options: ['A. out', 'B. away', 'C. over', 'D. down'],
        answer: 0,
        explanation: "Cụm 'run out of' (hết sạch cái gì)."
      },
      {
        id: 'ent2_q13',
        section: 'II. Lexico-Grammar',
        question: 'She worked diligently day and night _______ she could win a full scholarship to high school.',
        options: ['A. in order to', 'B. so that', 'C. so as to', 'D. because'],
        answer: 1,
        explanation: "Chỉ mục đích + mệnh đề (she could win...) -> dùng 'so that'."
      },
      {
        id: 'ent2_q14',
        section: 'II. Lexico-Grammar',
        question: 'The higher the temperature climbs, _______ comfortable the classroom becomes.',
        options: ['A. the less', 'B. the least', 'C. less', 'D. the more little'],
        answer: 0,
        explanation: "So sánh kép: The higher... the less comfortable..."
      },
      {
        id: 'ent2_q15',
        section: 'III. Conversational Exchanges',
        question: '- Laura: "Do you mind if I borrow your bilingual dictionary for a minute?" - Peter: "_______"',
        options: [
          'A. Not at all. Go ahead.',
          'B. Yes, I do mind.',
          'C. You are welcome.',
          'D. Never mind that.'
        ],
        answer: 0,
        explanation: "'Not at all. Go ahead' (Không phiền đâu, bạn cứ dùng đi)."
      },
      {
        id: 'ent2_q16',
        section: 'III. Conversational Exchanges',
        question: '- Teacher: "That was an outstanding presentation on space colonization, Nam!" - Nam: "_______"',
        options: [
          'A. Thank you, teacher. I spent a lot of time preparing it.',
          'B. You shouldn\'t praise me.',
          'C. It\'s none of your business.',
          'D. That is wrong.'
        ],
        answer: 0,
        explanation: "Đáp lại lời khen ngợi của thầy cô một cách lịch sự, khiêm tốn."
      },
      {
        id: 'ent2_q17',
        section: 'IV. Closest in Meaning',
        question: 'Choose the word CLOSEST in meaning to the underlined word: We must <u>eradicate</u> poverty and hunger in remote mountainous communes.',
        options: ['A. wipe out', 'B. build up', 'C. increase', 'D. conserve'],
        answer: 0,
        explanation: "'eradicate' = xóa bỏ triệt để, đồng nghĩa với 'wipe out'."
      },
      {
        id: 'ent2_q18',
        section: 'IV. Opposite in Meaning',
        question: 'Choose the word OPPOSITE in meaning to the underlined word: His explanation was so <u>ambiguous</u> that nobody understood what he meant.',
        options: ['A. clear-cut', 'B. vague', 'C. confusing', 'D. doubtful'],
        answer: 0,
        explanation: "'ambiguous' = mơ hồ, đa nghĩa; trái nghĩa với 'clear-cut' (rõ ràng, dứt khoát)."
      },
      {
        id: 'ent2_q19',
        section: 'V. Error Identification',
        question: 'Find the mistake: <u>Neither of</u> the applicants <u>were</u> considered <u>qualified enough</u> for <u>the position</u>.',
        options: ['A. Neither of', 'B. were', 'C. qualified enough', 'D. the position'],
        answer: 1,
        explanation: "Cụm 'Neither of + plural noun' theo chuẩn ngữ pháp chia động từ ở số ít: 'was', không chia 'were'."
      },
      {
        id: 'ent2_q20',
        section: 'V. Error Identification',
        question: 'Find the mistake: The new shopping complex <u>which</u> was built <u>last year</u> <u>attracts</u> a <u>great deal of</u> teenagers every weekend.',
        options: ['A. which', 'B. last year', 'C. attracts', 'D. great deal of'],
        answer: 3,
        explanation: "'a great deal of' chỉ đi với danh từ không đếm được; 'teenagers' là danh từ đếm được số nhiều nên phải dùng 'a large number of' hoặc 'many'."
      },
      {
        id: 'ent2_q21',
        section: 'VI. Cloze Test',
        question: '[Cloze Q21] Renewable energy technologies have advanced by leaps and (21) _______ in recent decades.',
        options: ['A. bounds', 'B. jumps', 'C. walks', 'D. steps'],
        answer: 0,
        explanation: "Thành ngữ 'by leaps and bounds' (tiến bộ vượt bậc, nhanh chóng).",
        passage: "Renewable energy technologies have advanced by leaps and (21) _______ in recent decades. Solar panels and offshore wind turbines are now producing electricity at costs lower than traditional coal plants. However, the intermittent nature of sunshine and wind requires powerful grid-scale battery storage to ensure steady electricity supply around the clock. Nations that invest heavily in clean energy infrastructure will not only protect their environment from carbon pollution but also generate millions of sustainable green jobs.",
        passageGroupId: "ent2_cloze_pg"
      },
      {
        id: 'ent2_q22',
        section: 'VI. Cloze Test',
        question: '[Cloze Q22] However, the intermittent nature of sunshine and wind requires powerful grid-scale battery storage to ensure steady electricity supply around the (22) _______.',
        options: ['A. clock', 'B. time', 'C. day', 'D. night'],
        answer: 0,
        explanation: "Cụm thành ngữ 'around the clock' (suốt ngày đêm, 24/24).",
        passage: "Renewable energy technologies have advanced by leaps and (21) _______ in recent decades. Solar panels and offshore wind turbines are now producing electricity at costs lower than traditional coal plants. However, the intermittent nature of sunshine and wind requires powerful grid-scale battery storage to ensure steady electricity supply around the clock. Nations that invest heavily in clean energy infrastructure will not only protect their environment from carbon pollution but also generate millions of sustainable green jobs.",
        passageGroupId: "ent2_cloze_pg"
      },
      {
        id: 'ent2_q23',
        section: 'VII. Reading Comprehension',
        question: '[Reading Q23] What is the primary takeaway regarding ocean plastic pollution?',
        options: [
          'A. Microplastics only affect fish near European shores.',
          'B. Plastic degradation into microplastics poses an invisible food chain threat to both marine life and human consumers.',
          'C. Plastic breaks down safely within three weeks.',
          'D. Cleaning beaches once a year completely solves the crisis.'
        ],
        answer: 1,
        explanation: "Tác hại của rác nhựa là phân rã thành vi nhựa đi vào chuỗi thức ăn đe dọa sinh vật biển và sức khỏe con người.",
        passage: "Every year, an estimated eight million metric tons of plastic waste enter the world's oceans. Plastic does not naturally biodegrade; instead, sunlight and wave action fragment it into microscopic particles known as microplastics. These tiny toxic fragments absorb environmental toxins and are ingested by plankton, fish, and filter-feeding shellfish. As larger predators consume contaminated prey, toxins biomagnify up the food chain, eventually arriving on dinner plates across the globe. Urgent international treaties and bans on non-essential single-use plastics are imperative to avert an ecological collapse.",
        passageGroupId: "ent2_read_pg"
      },
      {
        id: 'ent2_q24',
        section: 'VIII. Sentence Transformation',
        question: 'Choose the sentence with the same meaning: "It was such a fascinating documentary that we watched it three times."',
        options: [
          'A. The documentary was so fascinating that we watched it three times.',
          'B. The documentary was such fascinating that we watched it three times.',
          'C. So fascinating the documentary was that we watched it three times.',
          'D. It was so a fascinating documentary that we watched it three times.'
        ],
        answer: 0,
        explanation: "such + a/an + adj + noun + that = S + be + so + adj + that."
      },
      {
        id: 'ent2_q25',
        section: 'VIII. Sentence Transformation',
        question: 'Choose the sentence with the same meaning: "Had I known about the test schedule change, I would have arrived earlier."',
        options: [
          'A. If I had known about the test schedule change, I would have arrived earlier.',
          'B. If I knew about the test schedule change, I would arrive earlier.',
          'C. Unless I had known about the test schedule change, I would have arrived earlier.',
          'D. If I didn\'t know about the test schedule change, I wouldn\'t have arrived earlier.'
        ],
        answer: 0,
        explanation: "Đảo ngữ câu điều kiện loại 3: Had + S + V3/ed = If + S + had + V3/ed."
      }
    ]
  },
  {
    id: 'exam-entrance-10-3',
    title: 'Đề Luyện Thi Tuyển Sinh Vào Lớp 10 - Mã đề 103 (Chinh Phục Điểm 9.5 – 10)',
    category: 'entrance10',
    badge: 'Tuyển Sinh 10 (Chuyên/9+)',
    targetScore: 'Mục tiêu 9.5 - 10',
    durationMinutes: 60,
    grade: 9,
    semester: 2,
    type: 'entrance10',
    scope: 'Đề thi chinh phục điểm 10 vào trường THPT Chuyên và công lập hàng đầu',
    description: 'Bộ câu hỏi chất lượng cao bao gồm đảo ngữ nâng cao, thành ngữ collocations, cấu trúc giả định thức và bài đọc hiểu về khoa học môi trường.',
    questions: [
      {
        id: 'ent3_q1',
        section: 'I. Phonetics - Pronunciation',
        question: 'Choose the word whose underlined part is pronounced differently: A. exhau<u>st</u>   B. <u>st</u>udent   C. <u>st</u>udy   D. <u>st</u>ation',
        options: ['A. exhaust', 'B. student', 'C. study', 'D. station'],
        answer: 0,
        explanation: "'exhaust' có cụm phát âm là /ɪɡˈzɔːst/ (chữ 'h' câm, âm /z/), các từ còn lại phát âm là /st/."
      },
      {
        id: 'ent3_q2',
        section: 'I. Phonetics - Stress',
        question: 'Choose the word whose primary stress is positioned differently: A. biodiversity   B. extraterrestrial   C. environmental   D. civilization',
        options: ['A. biodiversity', 'B. extraterrestrial', 'C. environmental', 'D. civilization'],
        answer: 2,
        explanation: "'environmental' có trọng âm ở âm tiết thứ 4 /ɪnˌvaɪrənˈmentl/. Các từ biodiversity, extraterrestrial, civilization đều có trọng âm ở âm tiết thứ 5."
      },
      {
        id: 'ent3_q3',
        section: 'II. Lexico-Grammar',
        question: 'Only after the rescue team arrived _______ the trapped miners realize they were safe.',
        options: ['A. did', 'B. had', 'C. would', 'D. that'],
        answer: 0,
        explanation: "Cấu trúc đảo ngữ: Only after + S + V, trợ động từ + S + V nguyên thể -> 'Only after the rescue team arrived DID the trapped miners realize...'."
      },
      {
        id: 'ent3_q4',
        section: 'II. Lexico-Grammar',
        question: 'Had it not been for your prompt assistance, we _______ our graduation thesis on time.',
        options: ['A. couldn\'t finish', 'B. wouldn\'t have finished', 'C. won\'t finish', 'D. hadn\'t finished'],
        answer: 1,
        explanation: "Đảo ngữ câu điều kiện loại 3 với 'Had it not been for...': S + would/could not have + V3/ed."
      },
      {
        id: 'ent3_q5',
        section: 'II. Lexico-Grammar',
        question: 'She is so dedicated to her research that she often burns the _______ oil in the laboratory.',
        options: ['A. morning', 'B. midnight', 'C. afternoon', 'D. evening'],
        answer: 1,
        explanation: "Thành ngữ: 'burn the midnight oil' (thức khuya miệt mài học tập/làm việc)."
      },
      {
        id: 'ent3_q6',
        section: 'II. Lexico-Grammar',
        question: 'The government took stringent measures to _______ down on tax evasion.',
        options: ['A. crack', 'B. break', 'C. cut', 'D. put'],
        answer: 0,
        explanation: "Cụm thành ngữ: 'crack down on' (mạnh tay trấn áp, xử lý nghiêm minh)."
      },
      {
        id: 'ent3_q7',
        section: 'III. Conversational Exchanges',
        question: '- Interviewer: "Could you tell us why you selected this high school?" - Candidate: "_______"',
        options: [
          'A. Because your rigorous academic curriculum and inspiring clubs align perfectly with my aspirations.',
          'B. Because I was forced to come.',
          'C. Never mind that question.',
          'D. Same to you.'
        ],
        answer: 0,
        explanation: "Câu trả lời phỏng vấn chuyên nghiệp, mạch lạc và thể hiện sự chuẩn bị chu đáo."
      },
      {
        id: 'ent3_q8',
        section: 'IV. Closest in Meaning',
        question: 'Choose the word CLOSEST in meaning to the underlined word: Her arguments were so <u>lucid</u> and persuasive that everyone agreed immediately.',
        options: ['A. clear and easy to understand', 'B. confusing and prolonged', 'C. hesitant', 'D. loud'],
        answer: 0,
        explanation: "'lucid' = sáng sủa, minh bạch, dễ hiểu."
      },
      {
        id: 'ent3_q9',
        section: 'IV. Opposite in Meaning',
        question: 'Choose the word OPPOSITE in meaning to the underlined word: The doctor was praised for his <u>meticulous</u> attention to patient symptoms.',
        options: ['A. careless and sloppy', 'B. detailed', 'C. strict', 'D. diligent'],
        answer: 0,
        explanation: "'meticulous' = tỉ mỉ, cẩn thận; trái nghĩa với 'careless and sloppy' (cẩu thả, lơ là)."
      },
      {
        id: 'ent3_q10',
        section: 'V. Error Identification',
        question: 'Find the mistake: <u>Not until</u> did he <u>arrive</u> at the station <u>did he remember</u> his <u>train ticket</u>.',
        options: ['A. Not until', 'B. did he', 'C. arrive', 'D. did he remember'],
        answer: 1,
        explanation: "Cấu trúc: Not until + mệnh đề thời gian (S + V quá khứ đơn, KHÔNG ĐẢO NGỮ) + mệnh đề chính (ĐẢO NGỮ) -> 'Not until he arrived... did he remember...' (bỏ 'did he' ở vế đầu thành 'he arrived')."
      },
      {
        id: 'ent3_q11',
        section: 'VI. Reading Comprehension',
        question: 'What is the most effective approach to preserving global ecosystems according to modern ecologists?',
        options: [
          'A. Moving all humans into underground cities.',
          'B. Combining technological innovation with strict conservation policies and community empowerment.',
          'C. Allowing market forces to regulate all natural reserves.',
          'D. Cutting down all old forests to build solar farms.'
        ],
        answer: 1,
        explanation: "Bảo tồn hệ sinh thái đòi hỏi giải pháp liên ngành: kết hợp công nghệ, chính sách bảo tồn nghiêm ngặt và trao quyền cho cộng đồng địa phương."
      },
      {
        id: 'ent3_q12',
        section: 'VII. Sentence Transformation',
        question: 'Choose the sentence with the same meaning: "He was so exhausted that he fell asleep immediately at his desk."',
        options: [
          'A. So exhausted was he that he fell asleep immediately at his desk.',
          'B. Such exhausted was he that he fell asleep immediately at his desk.',
          'C. So was he exhausted that he fell asleep immediately at his desk.',
          'D. He was such exhausted that he fell asleep immediately at his desk.'
        ],
        answer: 0,
        explanation: "Cấu trúc đảo ngữ với 'So + adj': So + adj + be + S + that -> 'So exhausted was he that he fell asleep immediately at his desk'."
      }
    ]
  }
];
