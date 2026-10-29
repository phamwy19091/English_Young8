// Dữ liệu Tiếng Anh 8 Global Success - Học kì 1 (Unit 1, Unit 2, Unit 3)
window.STUDY_DATA = window.STUDY_DATA || {};
window.STUDY_DATA.units = window.STUDY_DATA.units || [];

window.STUDY_DATA.units.push(
  // ==========================================
  // UNIT 1: LEISURE TIME
  // ==========================================
  {
    id: "unit-1",
    number: 1,
    semester: 1,
    title: "Leisure Time",
    viTitle: "Thời gian rảnh rỗi",
    icon: "🎨",
    color: "#4F46E5",
    summary: "Từ vựng về các hoạt động giải trí, sở thích; Ngữ âm /ʊ/ và /uː/; Động từ chỉ sự yêu thích (Verbs of liking/disliking + V-ing / to V).",
    pronunciation: {
      sounds: ["/ʊ/ (u ngắn)", "/uː/ (u dài)"],
      explanation: [
        {
          sound: "/ʊ/",
          desc: "Âm u ngắn: môi hơi tròn, phát âm ngắn và dứt khoát. Thường gặp ở các chữ 'oo' (trước k, d, t), 'u', 'ou'.",
          examples: ["book /bʊk/", "cook /kʊk/", "look /lʊk/", "good /ɡʊd/", "foot /fʊt/", "put /pʊt/", "pudding /ˈpʊdɪŋ/", "woman /ˈwʊmən/", "wolf /wʊlf/", "sugar /ˈʃʊɡə(r)/"]
        },
        {
          sound: "/uː/",
          desc: "Âm u dài: môi chu tròn nhỏ, kéo dài hơi. Thường gặp ở 'oo' (cuối từ hoặc trước l, m, n, p), 'ou', 'u...e', 'ew'.",
          examples: ["school /skuːl/", "cool /kuːl/", "pool /puːl/", "cartoon /kɑːˈtuːn/", "spoon /spuːn/", "group /ɡruːp/", "soup /suːp/", "June /dʒuːn/", "move /muːv/", "choose /tʃuːz/"]
        }
      ]
    },
    vocabulary: [
      { id: "u1-v1", word: "leisure", ipa: "/ˈleʒə(r)/", type: "n", meaning: "thời gian rảnh rỗi, sự giải trí", example: "What do you often do in your leisure time?", exampleVi: "Bạn thường làm gì vào thời gian rảnh rỗi?", tip: "Cụm từ cố định: in one's leisure time = in one's free time" },
      { id: "u1-v2", word: "do DIY", ipa: "/duː ˌdiː aɪ ˈwaɪ/", type: "v.phr", meaning: "tự tay làm đồ dùng (Do It Yourself)", example: "My brother loves doing DIY to decorate his room.", exampleVi: "Anh trai tôi thích tự làm đồ thủ công để trang trí phòng.", tip: "Luôn đi với động từ DO: do DIY" },
      { id: "u1-v3", word: "make origami", ipa: "/meɪk ˌɒrɪˈɡɑːmi/", type: "v.phr", meaning: "gấp giấy nghệ thuật Nhật Bản", example: "Making origami helps me relax after school.", exampleVi: "Gấp giấy origami giúp tôi thư giãn sau giờ học.", tip: "Đi với động từ MAKE: make origami / make crafts" },
      { id: "u1-v4", word: "knit", ipa: "/nɪt/", type: "v", meaning: "đan len", example: "She is knitting a wool sweater for her grandmother.", exampleVi: "Cô ấy đang đan một chiếc áo len cho bà.", tip: "Âm 'k' ở đầu là âm câm (không đọc âm k) -> /nɪt/, knitting kit: bộ dụng cụ đan len" },
      { id: "u1-v5", word: "do puzzles", ipa: "/duː ˈpʌzlz/", type: "v.phr", meaning: "giải câu đố, chơi ghép hình", example: "Doing puzzles is great for your brain.", exampleVi: "Giải câu đố rất tốt cho trí não của bạn.", tip: "Đi với động từ DO: do puzzles" },
      { id: "u1-v6", word: "surf the net", ipa: "/sɜːf ðə net/", type: "v.phr", meaning: "lướt mạng Internet", example: "Teenagers shouldn't spend too much time surfing the net.", exampleVi: "Thanh thiếu niên không nên dành quá nhiều thời gian lướt mạng.", tip: "= browse the internet / go online" },
      { id: "u1-v7", word: "message friends", ipa: "/ˈmesɪdʒ frendz/", type: "v.phr", meaning: "nhắn tin cho bạn bè", example: "I prefer messaging friends to calling them.", exampleVi: "Tôi thích nhắn tin cho bạn bè hơn là gọi điện.", tip: "Message vừa là danh từ (tin nhắn) vừa là động từ (nhắn tin)" },
      { id: "u1-v8", word: "hang out (with)", ipa: "/hæŋ aʊt/", type: "phr.v", meaning: "đi chơi (với bạn bè)", example: "We usually hang out at the shopping mall on Sundays.", exampleVi: "Chúng tôi thường đi chơi ở trung tâm thương mại vào Chủ nhật.", tip: "hang out + with somebody" },
      { id: "u1-v9", word: "be keen on", ipa: "/bi kiːn ɒn/", type: "adj.phr", meaning: "say mê, rất thích", example: "Trang is very keen on playing badminton.", exampleVi: "Trang rất mê chơi cầu lông.", tip: "be keen on + V-ing / Noun = be fond of = be interested in" },
      { id: "u1-v10", word: "be fond of", ipa: "/bi fɒnd əv/", type: "adj.phr", meaning: "thích, yêu mến", example: "My grandfather is fond of gardening.", exampleVi: "Ông tôi rất thích làm vườn.", tip: "Theo sau giới từ (on, of, in, about) LUÔN là V-ing" },
      { id: "u1-v11", word: "be crazy about", ipa: "/bi ˈkreɪzi əˈbaʊt/", type: "adj.phr", meaning: "phát cuồng vì, cực kỳ mê", example: "Tom is crazy about playing computer games.", exampleVi: "Tom cực kỳ mê chơi trò chơi máy tính.", tip: "Mức độ thích rất mạnh, tương đương 'adore'" },
      { id: "u1-v12", word: "fancy", ipa: "/ˈfænsi/", type: "v", meaning: "thích, muốn", example: "Do you fancy going to the cinema this evening?", exampleVi: "Tối nay bạn có muốn đi xem phim không?", tip: "Bẫy thi: Fancy + V-ing (KHÔNG đi với to V)" },
      { id: "u1-v13", word: "detest", ipa: "/dɪˈtest/", type: "v", meaning: "căm ghét, cực kỳ ghét", example: "I detest waking up early on cold winter days.", exampleVi: "Tôi cực kỳ ghét phải dậy sớm vào những ngày đông lạnh giá.", tip: "Trọng âm rơi vào âm tiết thứ 2 (/dɪˈtest/). Detest + V-ing" },
      { id: "u1-v14", word: "adore", ipa: "/əˈdɔː(r)/", type: "v", meaning: "yêu thích, mê mẩn", example: "Little girls often adore playing with dolls.", exampleVi: "Các bé gái thường mê chơi búp bê.", tip: "Trọng âm âm 2 (/əˈdɔː/). Adore + V-ing" },
      { id: "u1-v15", word: "keep in touch", ipa: "/kiːp ɪn tʌtʃ/", type: "v.phr", meaning: "giữ liên lạc", example: "Social media helps us keep in touch with distant friends.", exampleVi: "Mạng xã hội giúp chúng ta giữ liên lạc với bạn bè ở xa.", tip: "keep in touch WITH somebody" }
    ],
    grammar: [
      {
        title: "1. Động từ chỉ sự yêu thích / ghét (Verbs of liking and disliking)",
        rules: [
          "Nhóm 1: Đi được với cả V-ing VÀ to-V (nghĩa hầu như không đổi): like, love, hate, prefer.",
          "Ví dụ: She likes knitting. = She likes to knit.",
          "Nhóm 2: CHỈ đi với danh động từ (V-ing), TUYỆT ĐỐI KHÔNG đi với to-V: adore (rất thích), fancy (thích), enjoy (thích), mind (ngại/phiền), detest (căm ghét), dislike (không thích).",
          "Ví dụ: I fancy making origami. (ĐÚNG) — I fancy to make origami. (SAI)"
        ],
        examTips: [
          "Cấu trúc 'would like / would love / would prefer' luôn đi với TO + V nguyên thể (Ví dụ: I'd like to go out).",
          "Cấu trúc 'prefer + V-ing + TO + V-ing' (thích làm gì hơn làm gì): I prefer reading books to watching TV.",
          "Các cụm tính từ: be keen on / be fond of / be interested in / be crazy about / be into + V-ing."
        ]
      }
    ],
    practice: [
      {
        id: "u1-q1",
        type: "pronunciation",
        question: "Choose the word whose underlined part is pronounced differently: A. c<u>oo</u>k   B. b<u>oo</u>k   C. sch<u>oo</u>l   D. f<u>oo</u>t",
        options: ["A. cook", "B. book", "C. school", "D. foot"],
        answer: 2,
        explanation: "'school' phát âm là /skuːl/ (âm /uː/ dài). Các từ còn lại (cook, book, foot) phát âm là /ʊ/ ngắn."
      },
      {
        id: "u1-q2",
        type: "pronunciation",
        question: "Choose the word whose underlined part is pronounced differently: A. gr<u>ou</u>p   B. s<u>ou</u>p   C. w<u>ou</u>ld   D. t<u>oo</u>th",
        options: ["A. group", "B. soup", "C. would", "D. tooth"],
        answer: 2,
        explanation: "'would' phát âm là /wʊd/ (âm /ʊ/ ngắn). Các từ group, soup, tooth đều phát âm là /uː/ dài."
      },
      {
        id: "u1-q3",
        type: "grammar",
        question: "Do you fancy _______ out with friends at the shopping mall this Sunday?",
        options: ["A. hang", "B. hanging", "C. to hang", "D. hung"],
        answer: 1,
        explanation: "Sau động từ 'fancy' (thích/muốn) bắt buộc dùng V-ing -> hanging."
      },
      {
        id: "u1-q4",
        type: "grammar",
        question: "My younger sister detests _______ housework at weekends.",
        options: ["A. doing", "B. to do", "C. do", "D. does"],
        answer: 0,
        explanation: "Sau 'detest' (cực kỳ ghét) chỉ dùng V-ing -> doing."
      },
      {
        id: "u1-q5",
        type: "vocabulary",
        question: "My dad loves _______ DIY. He made this wooden bookshelf himself.",
        options: ["A. making", "B. doing", "C. playing", "D. going"],
        answer: 1,
        explanation: "Cụm từ cố định: 'do DIY' (tự tay làm/sửa chữa đồ đạc)."
      },
      {
        id: "u1-q6",
        type: "vocabulary",
        question: "Nam is very _______ on playing badminton. He plays it every afternoon.",
        options: ["A. fond", "B. crazy", "C. interested", "D. keen"],
        answer: 3,
        explanation: "Ta có cụm: 'be keen on + V-ing' (say mê, thích làm gì). Fond đi với 'of', crazy đi với 'about', interested đi với 'in'."
      },
      {
        id: "u1-q7",
        type: "grammar",
        question: "I would like _______ you to my birthday party this Saturday evening.",
        options: ["A. invite", "B. inviting", "C. to invite", "D. invited"],
        answer: 2,
        explanation: "Khác với 'like + V-ing/to V', cấu trúc 'would like' LUÔN đi với 'to + V nguyên thể' -> to invite."
      },
      {
        id: "u1-q8",
        type: "grammar",
        question: "Many teenagers prefer messaging their friends _______ calling them directly.",
        options: ["A. than", "B. to", "C. more than", "D. from"],
        answer: 1,
        explanation: "Cấu trúc thích cái gì hơn cái gì: 'prefer + V-ing + TO + V-ing'."
      },
      {
        id: "u1-q9",
        type: "vocabulary",
        question: "Making _______ requires only a piece of paper and your skilful hands.",
        options: ["A. origami", "B. knitting", "C. puzzles", "D. judo"],
        answer: 0,
        explanation: "'make origami' là nghệ thuật gấp giấy Nhật Bản (chỉ cần giấy và đôi tay khéo léo)."
      },
      {
        id: "u1-q10",
        type: "grammar",
        question: "Would you mind _______ the window? It is quite cold in here.",
        options: ["A. close", "B. to close", "C. closing", "D. closed"],
        answer: 2,
        explanation: "Cấu trúc 'Would you mind + V-ing?' (Bạn có phiền làm gì đó không?) -> closing."
      },
      {
        id: "u1-q11",
        type: "vocabulary",
        question: "Social media helps me _______ in touch with my old friends from primary school.",
        options: ["A. make", "B. keep", "C. do", "D. take"],
        answer: 1,
        explanation: "Cụm từ 'keep in touch with sb': giữ liên lạc với ai."
      },
      {
        id: "u1-q12",
        type: "grammar",
        question: "Find the mistake: My brother is <u>crazy</u> <u>about</u> <u>to play</u> chess <u>in</u> his free time.",
        options: ["A. crazy", "B. about", "C. to play", "D. in"],
        answer: 2,
        explanation: "Sau giới từ 'about' (trong cụm 'be crazy about') phải dùng V-ing -> sửa 'to play' thành 'playing'."
      }
    ]
  },

  // ==========================================
  // UNIT 2: LIFE IN THE COUNTRYSIDE
  // ==========================================
  {
    id: "unit-2",
    number: 2,
    semester: 1,
    title: "Life in the Countryside",
    viTitle: "Cuộc sống ở miền quê",
    icon: "🌾",
    color: "#059669",
    summary: "Từ vựng về hoạt động nhà nông, cảnh sắc làng quê; Ngữ âm /ə/ và /ɪ/; So sánh hơn của trạng từ (Comparative adverbs).",
    pronunciation: {
      sounds: ["/ə/ (ơ ngắn - schwa)", "/ɪ/ (i ngắn)"],
      explanation: [
        {
          sound: "/ə/",
          desc: "Âm ơ ngắn (schwa): âm không nhấn trọng âm phổ biến nhất trong tiếng Anh, thả lỏng miệng.",
          examples: ["hospitable /hɒˈspɪtəbl/", "picturesque /ˌpɪktʃəˈresk/", "garden /ˈɡɑːdn/", "proverb /ˈprɒvɜːb/", "activity /ækˈtɪvəti/", "support /səˈpɔːt/"]
        },
        {
          sound: "/ɪ/",
          desc: "Âm i ngắn: miệng mở hẹp ngang tự nhiên, phát âm ngắn gọn.",
          examples: ["village /ˈvɪlɪdʒ/", "harvest /ˈhɑːvɪst/", "milk /mɪlk/", "pick /pɪk/", "collect /kəˈlekt/", "build /bɪld/", "cottage /ˈkɒtɪdʒ/"]
        }
      ]
    },
    vocabulary: [
      { id: "u2-v1", word: "harvest", ipa: "/ˈhɑːvɪst/", type: "n, v", meaning: "vụ mùa, thu hoạch, gặt hái", example: "Farmers are extremely busy during harvest time.", exampleVi: "Nông dân cực kỳ bận rộn vào mùa gặt.", tip: "harvest time = mùa gặt" },
      { id: "u2-v2", word: "combine harvester", ipa: "/ˈkɒmbaɪn ˈhɑːvɪstə(r)/", type: "n.phr", meaning: "máy gặt đập liên hợp", example: "They use a combine harvester to cut and thresh rice quickly.", exampleVi: "Họ dùng máy gặt đập liên hợp để cắt và tuốt lúa nhanh chóng.", tip: "Máy móc hiện đại nhất xuất hiện trong bài đọc Unit 2" },
      { id: "u2-v3", word: "load / unload", ipa: "/ləʊd/ - /ˌʌnˈləʊd/", type: "v", meaning: "chất hàng lên / dỡ hàng xuống", example: "The villagers are unloading the rice from the truck.", exampleVi: "Dân làng đang dỡ lúa từ trên xe tải xuống.", tip: "load sth onto... (chất lên) >< unload sth from... (dỡ xuống)" },
      { id: "u2-v4", word: "herd", ipa: "/hɜːd/", type: "v", meaning: "chăn, lùa (gia súc)", example: "Country children often help their parents herd the buffaloes.", exampleVi: "Trẻ em vùng quê thường giúp bố mẹ chăn trâu.", tip: "herd buffaloes / cattle / sheep" },
      { id: "u2-v5", word: "plough", ipa: "/plaʊ/", type: "v, n", meaning: "cày (ruộng), cái cày", example: "In the past, farmers used buffaloes to plough their fields.", exampleVi: "Ngày xưa, nông dân dùng trâu để cày ruộng.", tip: "plough a field = cày ruộng" },
      { id: "u2-v6", word: "milk cows", ipa: "/mɪlk kaʊz/", type: "v.phr", meaning: "vắt sữa bò", example: "Workers on the dairy farm milk cows twice a day.", exampleVi: "Công nhân ở trang trại bò sữa vắt sữa bò hai lần một ngày.", tip: "Milk ở đây là động từ (vắt sữa)" },
      { id: "u2-v7", word: "dry the rice", ipa: "/draɪ ðə raɪs/", type: "v.phr", meaning: "phơi thóc / lúa", example: "My grandmother is drying the rice in the front yard.", exampleVi: "Bà tôi đang phơi thóc ở sân trước.", tip: "Dry (v): làm khô, phơi khô" },
      { id: "u2-v8", word: "paddy field", ipa: "/ˈpædi fiːld/", type: "n.phr", meaning: "cánh đồng lúa", example: "Green paddy fields stretch as far as the eye can see.", exampleVi: "Những cánh đồng lúa xanh mướt trải dài tít tắp.", tip: "= rice field" },
      { id: "u2-v9", word: "orchard", ipa: "/ˈɔːtʃəd/", type: "n", meaning: "vườn cây ăn quả", example: "We spent the morning picking fruit in the orchard.", exampleVi: "Chúng tôi dành buổi sáng hái trái cây trong vườn cây ăn quả.", tip: "Vườn hoa/rau là garden, vườn cây ăn quả là orchard" },
      { id: "u2-v10", word: "hospitable", ipa: "/hɒˈspɪtəbl/", type: "adj", meaning: "hiếu khách, mến khách", example: "People in my hometown are very friendly and hospitable.", exampleVi: "Người dân quê tôi rất thân thiện và hiếu khách.", tip: "Dạng trạng từ: hospitably (so sánh hơn: more hospitably)" },
      { id: "u2-v11", word: "picturesque", ipa: "/ˌpɪktʃəˈresk/", type: "adj", meaning: "đẹp như tranh vẽ", example: "The ancient village is located in a picturesque valley.", exampleVi: "Ngôi làng cổ nằm trong một thung lũng đẹp như tranh vẽ.", tip: "Trọng âm rơi vào âm tiết cuối /-ˈresk/" },
      { id: "u2-v12", word: "vast", ipa: "/vɑːst/", type: "adj", meaning: "rộng lớn, mênh mông, bát ngát", example: "Nomads move across the vast grasslands.", exampleVi: "Người du mục di chuyển qua những đồng cỏ mênh mông.", tip: "vast open spaces: không gian rộng mở mênh mông" },
      { id: "u2-v13", word: "well-trained", ipa: "/ˌwel ˈtreɪnd/", type: "adj", meaning: "được đào tạo bài bản, lành nghề", example: "The farm employs well-trained workers to operate machines.", exampleVi: "Trang trại thuê những công nhân lành nghề để vận hành máy móc.", tip: "Tính từ ghép" },
      { id: "u2-v14", word: "cultivate", ipa: "/ˈkʌltɪveɪt/", type: "v", meaning: "canh tác, trồng trọt", example: "Local people mainly cultivate wet rice and corn.", exampleVi: "Người dân địa phương chủ yếu canh tác lúa nước và ngô.", tip: "Trọng âm âm 1: /ˈkʌltɪveɪt/" },
      { id: "u2-v15", word: "poultry / cattle", ipa: "/ˈpəʊltri/ - /ˈkætl/", type: "n", meaning: "gia cầm (gà, vịt) / gia súc lớn (bò, trâu)", example: "His family raises both poultry and cattle on the farm.", exampleVi: "Gia đình ông ấy nuôi cả gia cầm và gia súc trong trang trại.", tip: "Cattle luôn mang nghĩa số nhiều (Cattle ARE grazing)" }
    ],
    grammar: [
      {
        title: "1. So sánh hơn của Trạng từ (Comparative forms of Adverbs)",
        rules: [
          "a) Trạng từ ngắn (1 âm tiết, viết giống tính từ): fast, hard, early, late, high, near, long, soon -> Thêm đuôi '-er' + than.",
          "Ví dụ: Farmers in my village work harder than people in the city. / She woke up earlier than usual.",
          "b) Trạng từ dài (2 âm tiết trở lên, thường có đuôi '-ly'): slowly, carefully, peacefully, soundly, generously, traditionally -> Dùng 'more / less + trạng từ + than'.",
          "Ví dụ: With a combine harvester, farmers can harvest rice more quickly than before.",
          "c) Trạng từ bất quy tắc (BẮT BUỘC HỌC THUỘC): well -> better; badly -> worse; far -> farther / further; little -> less; much/many -> more."
        ],
        examTips: [
          "Phân biệt khi nào dùng Tính từ, khi nào dùng Trạng từ trong câu so sánh: Nếu trước chỗ trống là động từ TO BE (am/is/are/was/were) hoặc linking verbs (seem, look, feel, become) -> dùng TÍNH TỪ (happier, more peaceful). Nếu trước chỗ trống là ĐỘNG TỪ THƯỜNG (run, work, drive, sleep, live) -> dùng TRẠNG TỪ (faster, harder, more peacefully).",
          "Lưu ý: 'hard' vừa là tính từ vừa là trạng từ (so sánh hơn là 'harder'). Còn 'hardly' có nghĩa là 'hầu như không', KHÔNG phải trạng từ của hard!",
          "Lưu ý: 'early' kết thúc bằng -y nhưng là trạng từ ngắn -> đổi thành 'earlier' (không dùng more early)."
        ]
      }
    ],
    practice: [
      {
        id: "u2-q1",
        type: "pronunciation",
        question: "Choose the word whose underlined part is pronounced differently: A. v<u>i</u>llage   B. h<u>a</u>rvest   C. p<u>i</u>ck   D. b<u>u</u>ild",
        options: ["A. village", "B. harvest", "C. pick", "D. build"],
        answer: 1,
        explanation: "Phần gạch chân chữ 'a' trong 'harvest' phát âm là /ɑː/, còn phần gạch chân trong village, pick, build đều phát âm là /ɪ/."
      },
      {
        id: "u2-q2",
        type: "grammar",
        question: "Thanks to the combine harvester, farmers can harvest their crops _______ than in the past.",
        options: ["A. quicklier", "B. more quick", "C. more quickly", "D. quicker"],
        answer: 2,
        explanation: "Bổ nghĩa cho động từ thường 'harvest' cần dùng trạng từ 'quickly'. Trạng từ đuôi -ly khi so sánh hơn dùng 'more quickly'."
      },
      {
        id: "u2-q3",
        type: "grammar",
        question: "During harvest time, farmers have to get up _______ than on normal days.",
        options: ["A. more early", "B. earlier", "C. earlyer", "D. earliest"],
        answer: 1,
        explanation: "'early' là trạng từ đặc biệt có dạng so sánh hơn là 'earlier' (y đổi thành i + er)."
      },
      {
        id: "u2-q4",
        type: "grammar",
        question: "After a hard working day in the field, the workers slept _______ than ever.",
        options: ["A. soundlier", "B. more sound", "C. more soundly", "D. sounder"],
        answer: 2,
        explanation: "Bổ nghĩa cho động từ 'slept' (ngủ) -> dùng cụm 'sleep soundly' (ngủ say). So sánh hơn là 'more soundly'."
      },
      {
        id: "u2-q5",
        type: "vocabulary",
        question: "People in the countryside are famous for being friendly and _______ to visitors.",
        options: ["A. hospitable", "B. vast", "C. picturesque", "D. well-trained"],
        answer: 0,
        explanation: "'hospitable' nghĩa là hiếu khách, mến khách (rất hợp ngữ cảnh với visitors)."
      },
      {
        id: "u2-q6",
        type: "vocabulary",
        question: "The strong men are helping _______ the rice bags from the truck into the warehouse.",
        options: ["A. herd", "B. plough", "C. milk", "D. unload"],
        answer: 3,
        explanation: "'unload ... from the truck': dỡ hàng từ trên xe tải xuống."
      },
      {
        id: "u2-q7",
        type: "grammar",
        question: "My sister dances _______ than I do, so she was chosen for the school show.",
        options: ["A. more good", "B. weller", "C. better", "D. more well"],
        answer: 2,
        explanation: "Trạng từ của 'good' là 'well' (dances well). Dạng so sánh hơn bất quy tắc của 'well' là 'better'."
      },
      {
        id: "u2-q8",
        type: "vocabulary",
        question: "We visited a vast fruit _______ in Tien Giang and tasted fresh mangoes.",
        options: ["A. paddy field", "B. orchard", "C. canal", "D. pond"],
        answer: 1,
        explanation: "'orchard' là vườn cây ăn quả (hợp với fruit và fresh mangoes)."
      },
      {
        id: "u2-q9",
        type: "grammar",
        question: "In the countryside, life seems _______ and people live _______ than in big cities.",
        options: [
          "A. more peaceful / more happily",
          "B. more peacefully / more happy",
          "C. peacefuler / happier",
          "D. more peaceful / happier"
        ],
        answer: 0,
        explanation: "Sau linking verb 'seems' dùng tính từ (more peaceful); sau động từ thường 'live' dùng trạng từ (more happily)."
      },
      {
        id: "u2-q10",
        type: "vocabulary",
        question: "Look! A boy is _______ a herd of buffaloes along the green pasture.",
        options: ["A. ploughing", "B. herding", "C. drying", "D. harvesting"],
        answer: 1,
        explanation: "'herd buffaloes' = chăn trâu."
      },
      {
        id: "u2-q11",
        type: "grammar",
        question: "It rained _______ today than yesterday, so the village roads were flooded.",
        options: ["A. more heavily", "B. heavilier", "C. more heavy", "D. heavier"],
        answer: 0,
        explanation: "Bổ nghĩa cho động từ 'rained' -> dùng trạng từ 'heavily' -> so sánh hơn 'more heavily'."
      },
      {
        id: "u2-q12",
        type: "grammar",
        question: "Rewrite check: 'Lan speaks English more fluently than Mai.' means _______.",
        options: [
          "A. Mai speaks English more fluently than Lan.",
          "B. Mai doesn't speak English as fluently as Lan.",
          "C. Mai speaks English fluentlier than Lan.",
          "D. Lan speaks English less fluently than Mai."
        ],
        answer: 1,
        explanation: "Lan nói tiếng Anh trôi chảy hơn Mai = Mai không nói tiếng Anh trôi chảy bằng Lan (not as + adv + as)."
      }
    ]
  },

  // ==========================================
  // UNIT 3: TEENAGERS
  // ==========================================
  {
    id: "unit-3",
    number: 3,
    semester: 1,
    title: "Teenagers",
    viTitle: "Thanh thiếu niên",
    icon: "🎒",
    color: "#D97706",
    summary: "Từ vựng về câu lạc bộ học đường, mạng xã hội và áp lực tuổi teen; Ngữ âm /ʊə/ và /ɔɪ/; Câu đơn (Simple sentences) và Câu ghép (Compound sentences).",
    pronunciation: {
      sounds: ["/ʊə/ (ua)", "/ɔɪ/ (oi)"],
      explanation: [
        {
          sound: "/ʊə/",
          desc: "Nguyên âm đôi /ʊə/ (đọc liền từ u sang ơ -> 'ua'). Thường gặp ở chữ 'ure', 'our', 'oor'.",
          examples: ["sure /ʃʊə(r)/", "ensure /ɪnˈʃʊə(r)/", "tourist /ˈtʊərɪst/", "tournament /ˈtʊənəmənt/", "poor /pʊə(r)/", "mature /məˈtʃʊə(r)/", "curious /ˈkjʊəriəs/"]
        },
        {
          sound: "/ɔɪ/",
          desc: "Nguyên âm đôi /ɔɪ/ (đọc liền từ o sang i -> 'oi'). Thường gặp ở chữ 'oi', 'oy'.",
          examples: ["boy /bɔɪ/", "toy /tɔɪ/", "enjoy /ɪnˈdʒɔɪ/", "avoid /əˈvɔɪd/", "choice /tʃɔɪs/", "voice /vɔɪs/", "noisy /ˈnɔɪzi/", "join /dʒɔɪn/"]
        }
      ]
    },
    vocabulary: [
      { id: "u3-v1", word: "peer pressure", ipa: "/ˈpɪə preʃə(r)/", type: "n.phr", meaning: "áp lực đồng trang lứa (từ bạn bè)", example: "Many teenagers suffer from peer pressure at school.", exampleVi: "Nhiều thanh thiếu niên chịu áp lực đồng trang lứa ở trường.", tip: "peer (n): bạn đồng trang lứa; pressure (n): áp lực" },
      { id: "u3-v2", word: "expectation", ipa: "/ˌekspekˈteɪʃn/", type: "n", meaning: "sự kỳ vọng, mong đợi", example: "High parental expectations can make teens feel stressed.", exampleVi: "Sự kỳ vọng cao của cha mẹ có thể khiến tuổi teen cảm thấy căng thẳng.", tip: "meet one's expectations: đáp ứng kỳ vọng của ai" },
      { id: "u3-v3", word: "bully", ipa: "/ˈbʊli/", type: "v, n", meaning: "bắt nạt / kẻ bắt nạt", example: "Schools must take action to stop cyberbullying.", exampleVi: "Nhà trường phải hành động để ngăn chặn bắt nạt trên mạng.", tip: "school bullying (bắt nạt học đường), cyberbullying (bắt nạt qua mạng)" },
      { id: "u3-v4", word: "concentrate (on)", ipa: "/ˈkɒnsntreɪt/", type: "v", meaning: "tập trung (vào)", example: "Turn off notifications so you can concentrate on your study.", exampleVi: "Hãy tắt thông báo để bạn có thể tập trung vào việc học.", tip: "concentrate ON sth = focus ON sth" },
      { id: "u3-v5", word: "forum", ipa: "/ˈfɔːrəm/", type: "n", meaning: "diễn đàn", example: "Students often discuss homework on the school forum.", exampleVi: "Học sinh thường thảo luận bài tập về nhà trên diễn đàn trường.", tip: "post a question on the forum" },
      { id: "u3-v6", word: "browse", ipa: "/braʊz/", type: "v", meaning: "duyệt, lướt xem (trang web)", example: "She spent half an hour browsing the school website.", exampleVi: "Cô ấy dành nửa tiếng để lướt xem trang web của trường.", tip: "browse a website" },
      { id: "u3-v7", word: "upload / download", ipa: "/ˌʌpˈləʊd/ - /ˌdaʊnˈləʊd/", type: "v", meaning: "tải lên / tải xuống", example: "He uploaded photos of the sports competition to Facebook.", exampleVi: "Cậu ấy đã tải ảnh cuộc thi thể thao lên Facebook.", tip: "upload TO somewhere / download FROM somewhere" },
      { id: "u3-v8", word: "notification", ipa: "/ˌnəʊtɪfɪˈkeɪʃn/", type: "n", meaning: "thông báo (trên điện thoại/mạng)", example: "I check my notifications as soon as I wake up.", exampleVi: "Tôi kiểm tra thông báo ngay khi thức dậy.", tip: "Trọng âm rơi vào âm tiết trước đuôi -tion: /-ˈkeɪʃn/" },
      { id: "u3-v9", word: "log on (to)", ipa: "/lɒɡ ɒn/", type: "phr.v", meaning: "đăng nhập (vào tài khoản)", example: "You need a password to log on to your account.", exampleVi: "Bạn cần mật khẩu để đăng nhập vào tài khoản.", tip: "= log in (to)" },
      { id: "u3-v10", word: "user-friendly", ipa: "/ˌjuːzə ˈfrendli/", type: "adj", meaning: "thân thiện với người dùng, dễ sử dụng", example: "This learning app is very user-friendly for 8th graders.", exampleVi: "Ứng dụng học tập này rất dễ sử dụng cho học sinh lớp 8.", tip: "Trái nghĩa với complicated / hard to use" },
      { id: "u3-v11", word: "stressful / stressed", ipa: "/ˈstresfl/ - /strest/", type: "adj", meaning: "gây căng thẳng (vật/việc) / cảm thấy căng thẳng (người)", example: "Preparing for the final exam is stressful, so I feel stressed.", exampleVi: "Chuẩn bị cho kì thi cuối kì rất căng thẳng, nên tôi cảm thấy áp lực.", tip: "Vật/việc dùng -ful (stressful), cảm xúc con người dùng -ed (stressed)" },
      { id: "u3-v12", word: "connect (with)", ipa: "/kəˈnekt/", type: "v", meaning: "kết nối (với)", example: "Clubs help teenagers connect with peers who share the same interests.", exampleVi: "Các câu lạc bộ giúp thiếu niên kết nối với bạn bè cùng sở thích.", tip: "connection (n): sự kết nối" },
      { id: "u3-v13", word: "mature", ipa: "/məˈtʃʊə(r)/", type: "adj", meaning: "trưởng thành, chín chắn", example: "Joining teamwork activities makes teenagers more mature.", exampleVi: "Tham gia hoạt động nhóm giúp thanh thiếu niên trưởng thành hơn.", tip: "Chứa âm /ʊə/ của Unit 3!" },
      { id: "u3-v14", word: "tournament", ipa: "/ˈtʊənəmənt/", type: "n", meaning: "giải đấu", example: "Our chess club is organizing an annual tournament next month.", exampleVi: "Câu lạc bộ cờ vua của chúng tôi sẽ tổ chức giải đấu thường niên vào tháng tới.", tip: "Chứa âm /ʊə/ đầu từ" }
    ],
    grammar: [
      {
        title: "1. Câu đơn (Simple Sentences) và Câu ghép (Compound Sentences)",
        rules: [
          "a) Câu đơn (Simple sentence): Chỉ có MỘT mệnh đề độc lập (1 cụm Chủ ngữ - Vị ngữ chính). Ví dụ: Minh likes playing chess.",
          "b) Câu ghép (Compound sentence): Gồm HAI (hoặc nhiều) mệnh đề độc lập ghép lại với nhau. Có 2 cách nối:",
          "CÁCH 1: Dùng Liên từ kết hợp (Coordinating conjunctions - Mẹo nhớ: F-A-N-B-O-Y-S), trước liên từ có dấu phẩy (,):",
          "• for (bởi vì) | • and (và) | • nor (cũng không) | • but (nhưng) | • or (hoặc là, kẻo mà) | • yet (thế nhưng) | • so (vì vậy)",
          "CÁCH 2: Dùng Trạng từ liên kết (Conjunctive adverbs) — ĐẶC BIỆT CHÚ Ý DẤU CÂU (đề thi cực hay hỏi!):",
          "Công thức: Mệnh đề 1 + [ ; ] (hoặc dấu chấm) + Trạng từ liên kết + [ , ] + Mệnh đề 2.",
          "• however (tuy nhiên - chỉ sự đối lập) | • therefore (do đó, vì vậy - chỉ kết quả) | • otherwise (nếu không thì) | • moreover / furthermore (hơn thế nữa - bổ sung ý)"
        ],
        examTips: [
          "MẸO NHÌN DẤU CÂU TRONG BÀI TRẮC NGHIỆM: Nếu chỗ trống có dạng: `, ______ ` (chỉ có 1 dấu phẩy đằng trước) -> Chọn nhóm FANBOYS (and, but, or, so, for).",
          "Nếu chỗ trống có dạng: `; ______ ,` hoặc `. ______ ,` (có dấu chấm phẩy/dấu chấm trước VÀ dấu phẩy sau) -> BẮT BUỘC chọn nhóm Trạng từ liên kết (however, therefore, otherwise, moreover)!",
          "Phân biệt 'or' và 'otherwise': Cả 2 đều dịch là 'nếu không thì', nhưng 'or' đứng sau dấu phẩy (, or), còn 'otherwise' đứng giữa (; otherwise,)."
        ]
      }
    ],
    practice: [
      {
        id: "u3-q1",
        type: "pronunciation",
        question: "Choose the word whose underlined part is pronounced differently: A. b<u>oy</u>   B. v<u>oi</u>ce   C. t<u>ou</u>rist   D. ch<u>oi</u>ce",
        options: ["A. boy", "B. voice", "C. tourist", "D. choice"],
        answer: 2,
        explanation: "'tourist' phát âm là /ˈtʊərɪst/ (âm /ʊə/). Các từ boy, voice, choice đều chứa âm /ɔɪ/."
      },
      {
        id: "u3-q2",
        type: "grammar",
        question: "She wanted to prepare well for the midterm test; _______, she turned off her smartphone.",
        options: ["A. so", "B. but", "C. therefore", "D. however"],
        answer: 2,
        explanation: "Quan sát dấu câu: phía trước có dấu chấm phẩy (;) và phía sau có dấu phẩy (,) -> phải dùng trạng từ liên kết. Về nghĩa: 'Muốn chuẩn bị tốt cho bài thi; DO ĐÓ (therefore), cô ấy tắt điện thoại'."
      },
      {
        id: "u3-q3",
        type: "grammar",
        question: "You should focus on the lesson in class; _______, you won't understand the grammar points.",
        options: ["A. or", "B. otherwise", "C. however", "D. therefore"],
        answer: 1,
        explanation: "Có cấu trúc `; _______ ,` và mang nghĩa 'nếu không thì' -> chọn 'otherwise'. (Không chọn 'or' vì sau 'or' không có dấu phẩy)."
      },
      {
        id: "u3-q4",
        type: "grammar",
        question: "Nam is very good at drawing, _______ he decided to join the Arts and Crafts club.",
        options: ["A. so", "B. therefore", "C. however", "D. but"],
        answer: 0,
        explanation: "Trước chỗ trống là dấu phẩy (,) và sau chỗ trống KHÔNG có dấu phẩy -> dùng liên từ kết hợp FANBOYS. Hợp nghĩa kết quả là 'so' (vì vậy)."
      },
      {
        id: "u3-q5",
        type: "grammar",
        question: "My brother tried very hard in the chess tournament; _______, he couldn't win the first prize.",
        options: ["A. but", "B. therefore", "C. however", "D. otherwise"],
        answer: 2,
        explanation: "Dấu `; _______ ,` + nghĩa tương phản (cố gắng hết sức >< không giành giải nhất) -> chọn 'however' (tuy nhiên)."
      },
      {
        id: "u3-q6",
        type: "vocabulary",
        question: "Please turn off the TV! I cannot _______ on my English homework.",
        options: ["A. connect", "B. concentrate", "C. browse", "D. upload"],
        answer: 1,
        explanation: "Cụm từ 'concentrate on sth': tập trung vào việc gì."
      },
      {
        id: "u3-q7",
        type: "vocabulary",
        question: "Many students feel anxious because they want to meet their parents' high _______.",
        options: ["A. notifications", "B. forums", "C. expectations", "D. tournaments"],
        answer: 2,
        explanation: "'parental expectations': sự kỳ vọng của cha mẹ. Cụm 'meet expectations': đáp ứng kỳ vọng."
      },
      {
        id: "u3-q8",
        type: "vocabulary",
        question: "You need to _______ on to your student account to check the exam schedule.",
        options: ["A. log", "B. browse", "C. connect", "D. upload"],
        answer: 0,
        explanation: "'log on to an account': đăng nhập vào tài khoản."
      },
      {
        id: "u3-q9",
        type: "vocabulary",
        question: "This new dictionary website is very _______. Even primary students can use it easily.",
        options: ["A. stressful", "B. user-friendly", "C. mature", "D. noisy"],
        answer: 1,
        explanation: "'user-friendly': thân thiện với người dùng, dễ sử dụng."
      },
      {
        id: "u3-q10",
        type: "grammar",
        question: "Which of the following is a SIMPLE sentence (câu đơn)?",
        options: [
          "A. Teenagers often use Messenger, and they also use TikTok.",
          "B. Both Minh and Lan enjoy participating in the music club.",
          "C. He felt tired, so he went to bed early.",
          "D. You can join the sports club, or you can join the chess club."
        ],
        answer: 1,
        explanation: "Câu B chỉ có 1 cụm Chủ ngữ (Both Minh and Lan) và 1 Vị ngữ (enjoy participating...) nên là Câu đơn. Các câu A, C, D đều có 2 mệnh đề nối bằng and, so, or nên là Câu ghép."
      },
      {
        id: "u3-q11",
        type: "vocabulary",
        question: "_______ pressure can have both positive and negative effects on teenagers.",
        options: ["A. Friend", "B. Mate", "C. Peer", "D. Club"],
        answer: 2,
        explanation: "Cụm danh từ cố định: 'peer pressure' (áp lực đồng trang lứa)."
      },
      {
        id: "u3-q12",
        type: "grammar",
        question: "Find the mistake: She <u>wanted</u> to improve her English; <u>so</u>, she <u>joined</u> the English speaking <u>club</u>.",
        options: ["A. wanted", "B. so", "C. joined", "D. club"],
        answer: 1,
        explanation: "Giữa dấu chấm phẩy (;) và dấu phẩy (,) không được dùng 'so', phải sửa 'so' thành 'therefore'."
      }
    ]
  }
);
