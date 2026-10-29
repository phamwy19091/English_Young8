// Dữ liệu Tiếng Anh 8 Global Success - Học kì 1 (Unit 4, Unit 5, Unit 6)
window.STUDY_DATA = window.STUDY_DATA || {};
window.STUDY_DATA.units = window.STUDY_DATA.units || [];

window.STUDY_DATA.units.push(
  // ==========================================
  // UNIT 4: ETHNIC GROUPS OF VIET NAM
  // ==========================================
  {
    id: "unit-4",
    number: 4,
    semester: 1,
    title: "Ethnic Groups of Viet Nam",
    viTitle: "Các dân tộc Việt Nam",
    icon: "🏔️",
    color: "#0284C7",
    summary: "Từ vựng về văn hóa, nhà sàn, trang phục và đời sống các dân tộc thiểu số; Ngữ âm /k/ và /ɡ/; Câu hỏi Yes/No & Wh-questions; Danh từ đếm được và không đếm được.",
    pronunciation: {
      sounds: ["/k/ (âm vô thanh)", "/ɡ/ (âm hữu thanh)"],
      explanation: [
        {
          sound: "/k/",
          desc: "Âm /k/ vô thanh (cổ họng không rung). Thường được viết bằng chữ 'c', 'k', 'ch' (trong một số từ), 'qu'.",
          examples: ["cultural /ˈkʌltʃərəl/", "communal /kəˈmjuːnl/", "costume /ˈkɒstjuːm/", "crop /krɒp/", "folk /fəʊk/", "kitchen /ˈkɪtʃɪn/", "musical /ˈmjuːzɪkl/"]
        },
        {
          sound: "/ɡ/",
          desc: "Âm /ɡ/ hữu thanh (cổ họng rung). Thường được viết bằng chữ 'g', 'gg'. (Lưu ý: chữ 'g' trước e, i, y đôi khi đọc là /dʒ/ như village, heritage).",
          examples: ["gong /ɡɒŋ/", "garden /ˈɡɑːdn/", "gather /ˈɡæðə(r)/", "group /ɡruːp/", "tiger /ˈtaɪɡə(r)/", "villager /ˈvɪlɪdʒə(r)/ -> chú ý g trong village là /dʒ/!"]
        }
      ]
    },
    vocabulary: [
      { id: "u4-v1", word: "ethnic group", ipa: "/ˈeθnɪk ɡruːp/", type: "n.phr", meaning: "nhóm dân tộc, dân tộc", example: "Viet Nam has 54 ethnic groups living together peacefully.", exampleVi: "Việt Nam có 54 dân tộc cùng chung sống hòa bình.", tip: "ethnic minority (dân tộc thiểu số) >< ethnic majority (dân tộc đa số - người Kinh)" },
      { id: "u4-v2", word: "stilt house", ipa: "/stɪlt haʊs/", type: "n.phr", meaning: "nhà sàn", example: "Many ethnic minority people in the mountains live in stilt houses.", exampleVi: "Nhiều người dân tộc thiểu số ở vùng núi sống trong nhà sàn.", tip: "stilt (n): cột sàn; post (n): cột nhà" },
      { id: "u4-v3", word: "communal house", ipa: "/kəˈmjuːnl haʊs/", type: "n.phr", meaning: "nhà rông, nhà sinh hoạt cộng đồng", example: "The Rong house is the communal house of the Bana and Ede people.", exampleVi: "Nhà Rông là nhà sinh hoạt cộng đồng của người Ba-na và Ê-đê.", tip: "Trọng âm của communal rơi vào âm 2: /kəˈmjuːnl/" },
      { id: "u4-v4", word: "terraced field", ipa: "/ˈterəst fiːld/", type: "n.phr", meaning: "ruộng bậc thang", example: "Mu Cang Chai is famous for its breathtaking terraced fields.", exampleVi: "Mù Cang Chải nổi tiếng với những thửa ruộng bậc thang tuyệt đẹp.", tip: "Luôn có '-ed' ở chữ terraced: terraced fields" },
      { id: "u4-v5", word: "costume", ipa: "/ˈkɒstjuːm/", type: "n", meaning: "trang phục (truyền thống)", example: "Ethnic girls look beautiful in their traditional costumes.", exampleVi: "Các cô gái dân tộc trông rất đẹp trong trang phục truyền thống của họ.", tip: "Phân biệt: costume (trang phục) và custom (phong tục - học ở Unit 5)" },
      { id: "u4-v6", word: "weave", ipa: "/wiːv/", type: "v", meaning: "dệt (vải, thổ cẩm), đan (rổ rá)", example: "Tay women learn how to weave cloth from a very young age.", exampleVi: "Phụ nữ dân tộc Tày học cách dệt vải từ khi còn rất nhỏ.", tip: "weave cloth (dệt vải), weave baskets (đan rổ)" },
      { id: "u4-v7", word: "five-colour sticky rice", ipa: "/faɪv ˈkʌlə ˈstɪki raɪs/", type: "n.phr", meaning: "xôi ngũ sắc", example: "Five-colour sticky rice is made with natural roots and leaves.", exampleVi: "Xôi ngũ sắc được làm từ các loại rễ và lá cây tự nhiên.", tip: "sticky rice (xôi / gạo nếp) là danh từ KHÔNG đếm được" },
      { id: "u4-v8", word: "gong", ipa: "/ɡɒŋ/", type: "n", meaning: "cồng, chiêng", example: "The Gong Culture in the Central Highlands is a UNESCO heritage.", exampleVi: "Không gian văn hóa Cồng chiêng Tây Nguyên là di sản UNESCO.", tip: "bamboo flute: sáo trúc; musical instrument: nhạc cụ" },
      { id: "u4-v9", word: "folk dance", ipa: "/fəʊk dɑːns/", type: "n.phr", meaning: "điệu múa dân gian", example: "Visitors love joining the Xoe folk dance around the campfire.", exampleVi: "Du khách thích tham gia điệu múa xòe dân gian quanh lửa trại.", tip: "Chữ 'l' trong folk là âm câm -> đọc là /fəʊk/" },
      { id: "u4-v10", word: "livestock", ipa: "/ˈlaɪvstɒk/", type: "n", meaning: "vật nuôi, gia súc", example: "Villagers raise livestock and poultry for food and income.", exampleVi: "Dân làng nuôi gia súc và gia cầm để lấy thức ăn và thu nhập.", tip: "livestock là danh từ không đếm được / tập hợp" },
      { id: "u4-v11", word: "overlook", ipa: "/ˌəʊvəˈlʊk/", type: "v", meaning: "nhìn ra, hướng ra (từ trên cao)", example: "Their stilt house overlooks a green valley and a small stream.", exampleVi: "Ngôi nhà sàn của họ nhìn ra một thung lũng xanh và con suối nhỏ.", tip: "Trọng âm rơi vào âm tiết thứ 3 /-ˈlʊk/" },
      { id: "u4-v12", word: "staircase", ipa: "/ˈsteəkeɪs/", type: "n", meaning: "cầu thang bộ", example: "A traditional stilt house usually has an odd number of steps in its staircase.", exampleVi: "Một ngôi nhà sàn truyền thống thường có số bậc cầu thang là số lẻ.", tip: "odd number: số lẻ (7, 9 bậc) >< even number: số chẵn" },
      { id: "u4-v13", word: "minority / majority", ipa: "/maɪˈnɒrəti/ - /məˈdʒɒrəti/", type: "n", meaning: "thiểu số / đa số", example: "The Kinh people account for the majority of Viet Nam's population.", exampleVi: "Người Kinh chiếm đa số dân số Việt Nam.", tip: "Cả 2 từ đều có trọng âm rơi vào âm tiết thứ 2 (trước đuôi -ity)" },
      { id: "u4-v14", word: "lowland / highland", ipa: "/ˈləʊlənd/ - /ˈhaɪlənd/", type: "n", meaning: "vùng đồng bằng (vùng thấp) / vùng cao nguyên (vùng cao)", example: "The Central Highlands is home to many ethnic minority groups.", exampleVi: "Tây Nguyên là quê hương của nhiều dân tộc thiểu số.", tip: "The Central Highlands = Tây Nguyên" }
    ],
    grammar: [
      {
        title: "1. Danh từ đếm được (Countable) & Danh từ không đếm được (Uncountable)",
        rules: [
          "a) Danh từ đếm được (Countable nouns): Có dạng số ít (a stilt house, an ethnic group, a costume) và số nhiều (stilt houses, costumes, people, children, women, men, teeth, feet).",
          "• Các lượng từ đi với Danh từ đếm được số nhiều: many, a few (một vài - đủ dùng), few (rất ít - hầu như không), several, a number of.",
          "b) Danh từ KHÔNG đếm được (Uncountable nouns): KHÔNG có dạng số nhiều (không thêm -s/es), KHÔNG dùng a/an đằng trước, động từ theo sau luôn chia SỐ ÍT.",
          "• Các danh từ không đếm được CỰC HAY RA THI ở lớp 8: information (thông tin), furniture (đồ nội thất), advice (lời khuyên), luggage/baggage (hành lý), homework, housework, work, money, time, rice (lúa/gạo), sticky rice (xôi), water, milk, butter, sugar, music, nature, weather, traffic, livestock.",
          "• Các lượng từ đi với Danh từ KHÔNG đếm được: much, a little (một chút), little (rất ít).",
          "c) Lượng từ dùng cho CẢ HAI loại: some (câu khẳng định / lời mời), any (câu phủ định / nghi vấn), a lot of / lots of."
        ],
        examTips: [
          "Bẫy đề thi số 1: Thấy 'information', 'furniture', 'advice', 'luggage', 'rice', 'water' -> TUYỆT ĐỐI KHÔNG chọn many / a few / a / an! Phải chọn much / a little / some / any.",
          "Bẫy đề thi số 2: Thấy 'people', 'children', 'women', 'men', 'cattle' -> Đây là danh từ ĐẾM ĐƯỢC SỐ NHIỀU bất quy tắc (dù không có chữ 's' ở cuối) -> Phải chọn many / a few (KHÔNG chọn much / a little)!"
        ]
      },
      {
        title: "2. Câu hỏi Yes/No và Câu hỏi có từ để hỏi (Wh-questions)",
        rules: [
          "• Yes/No question: Be + S + ...? HOẶC Do/Does/Did/Modal + S + V(nguyên thể)...?",
          "• Wh-question: Wh-word (What, Where, When, Why, Who, Which, Whose, How, How many, How much, How often, How far...) + trợ động từ + S + V?",
          "Lưu ý phân biệt: 'Which' dùng khi có sự lựa chọn giới hạn (Which ethnic group has a larger population, the Tay or the Thai?)."
        ],
        examTips: [
          "Trong câu hỏi quá khứ đơn có 'Did', động từ chính phải trả về NGUYÊN THỂ (Where did you go? - KHÔNG dùng Where did you went?)."
        ]
      }
    ],
    practice: [
      {
        id: "u4-q1",
        type: "pronunciation",
        question: "Choose the word whose underlined part is pronounced differently: A. <u>c</u>ultural   B. <u>c</u>ommunal   C. <u>c</u>ostume   D. <u>c</u>ity",
        options: ["A. cultural", "B. communal", "C. costume", "D. city"],
        answer: 3,
        explanation: "Chữ 'c' trong 'city' phát âm là /s/ (/ˈsɪti/). Trong các từ cultural, communal, costume đều phát âm là /k/."
      },
      {
        id: "u4-q2",
        type: "pronunciation",
        question: "Choose the word whose underlined part is pronounced differently: A. <u>g</u>ong   B. villa<u>g</u>e   C. <u>g</u>arden   D. <u>g</u>ather",
        options: ["A. gong", "B. village", "C. garden", "D. gather"],
        answer: 1,
        explanation: "Chữ 'g' trong 'village' phát âm là /dʒ/ (/ˈvɪlɪdʒ/). Các từ gong, garden, gather phát âm là /ɡ/."
      },
      {
        id: "u4-q3",
        type: "grammar",
        question: "How _______ ethnic minority groups are there in Viet Nam?",
        options: ["A. much", "B. many", "C. little", "D. a little"],
        answer: 1,
        explanation: "'groups' là danh từ đếm được số nhiều -> dùng 'How many'."
      },
      {
        id: "u4-q4",
        type: "grammar",
        question: "We need to find _______ information about the Ede's communal house for our presentation.",
        options: ["A. a few", "B. many", "C. some", "D. an"],
        answer: 2,
        explanation: "'information' là danh từ KHÔNG đếm được nên loại 'a few', 'many', 'an'. Chọn 'some'."
      },
      {
        id: "u4-q5",
        type: "grammar",
        question: "There is only _______ sticky rice left in the pot, so we should cook some more.",
        options: ["A. a few", "B. many", "C. a little", "D. any"],
        answer: 2,
        explanation: "'sticky rice' (xôi) là danh từ không đếm được trong câu khẳng định ('only a little' = chỉ còn một chút)."
      },
      {
        id: "u4-q6",
        type: "grammar",
        question: "_______ ethnic group has a larger population, the Tay or the Hmong?",
        options: ["A. What", "B. Which", "C. Who", "D. Whose"],
        answer: 1,
        explanation: "Câu hỏi đưa ra sự lựa chọn cụ thể giữa 2 đối tượng ('the Tay or the Hmong') -> dùng 'Which'."
      },
      {
        id: "u4-q7",
        type: "vocabulary",
        question: "The Bahnars and Edés often hold important village ceremonies in their _______ house (Rong house).",
        options: ["A. stilt", "B. communal", "C. terraced", "D. highland"],
        answer: 1,
        explanation: "Nhà Rông là nhà sinh hoạt cộng đồng: 'communal house'."
      },
      {
        id: "u4-q8",
        type: "vocabulary",
        question: "Farmers in mountainous areas grow rice on _______ fields along the hillsides.",
        options: ["A. terraced", "B. communal", "C. musical", "D. folk"],
        answer: 0,
        explanation: "'terraced fields': ruộng bậc thang trên sườn đồi núi."
      },
      {
        id: "u4-q9",
        type: "grammar",
        question: "Look at the wooden _______ in this stilt house! It is very simple and traditional.",
        options: ["A. furnitures", "B. a furniture", "C. furniture", "D. many furniture"],
        answer: 2,
        explanation: "'furniture' (đồ đạc nội thất) là danh từ KHÔNG đếm được -> không thêm 's', không dùng 'a' hay 'many'."
      },
      {
        id: "u4-q10",
        type: "vocabulary",
        question: "Traditional _______ of ethnic minority women are often colourful and decorated with silver coins.",
        options: ["A. customs", "B. costumes", "C. staircases", "D. posts"],
        answer: 1,
        explanation: "'costumes': trang phục truyền thống (được trang trí nhiều màu sắc)."
      },
      {
        id: "u4-q11",
        type: "grammar",
        question: "_______ did you travel to Ha Giang last summer? — By coach with my family.",
        options: ["A. Where", "B. When", "C. How", "D. Why"],
        answer: 2,
        explanation: "Câu trả lời là 'By coach' (bằng xe khách - chỉ phương tiện đi lại) -> câu hỏi dùng 'How'."
      },
      {
        id: "u4-q12",
        type: "grammar",
        question: "Find the mistake: How <u>much</u> <u>people</u> <u>live</u> in a traditional Ede long <u>house</u>?",
        options: ["A. much", "B. people", "C. live", "D. house"],
        answer: 0,
        explanation: "'people' là danh từ đếm được số nhiều -> phải sửa 'much' thành 'many' (How many people)."
      }
    ]
  },

  // ==========================================
  // UNIT 5: OUR CUSTOMS AND TRADITIONS
  // ==========================================
  {
    id: "unit-5",
    number: 5,
    semester: 1,
    title: "Our Customs and Traditions",
    viTitle: "Phong tục và Truyền thống",
    icon: "🏮",
    color: "#DC2626",
    summary: "Từ vựng về lễ hội, phong tục tập quán Việt Nam; Ngữ âm /n/ và /ŋ/; Mạo từ (a, an, the) và Trường hợp không dùng mạo từ (Zero article Ø).",
    pronunciation: {
      sounds: ["/n/ (n đầu lưỡi)", "/ŋ/ (ng cuống lưỡi)"],
      explanation: [
        {
          sound: "/n/",
          desc: "Âm /n/: đầu lưỡi chạm lợi hàm trên. Thường viết là 'n', 'nn', 'kn' (k câm như know, knit).",
          examples: ["ceremony /ˈserəməni/", "tradition /trəˈdɪʃn/", "lantern /ˈlæntən/", "reunion /ˌriːˈjuːniən/", "longevity /lɒnˈdʒevəti/", "ornamental /ˌɔːnəˈmentl/"]
        },
        {
          sound: "/ŋ/",
          desc: "Âm /ŋ/ (như 'ng' trong tiếng Việt): cuống lưỡi nâng lên chạm ngạc mềm. Thường xuất hiện ở 'ng' HOẶC chữ 'n' đứng ngay trước âm /k/ hoặc /ɡ/ (như nk, nc, ng)!",
          examples: ["offering /ˈɒfərɪŋ/", "thanksgiving /ˌθæŋksˈɡɪvɪŋ/", "gong /ɡɒŋ/", "spring /sprɪŋ/", "longevity -> chữ n đọc là /n/, nhưng 'think /θɪŋk/', 'pink /pɪŋk/', 'monk /mʌŋk/', 'single /ˈsɪŋɡl/', 'language /ˈlæŋɡwɪdʒ/' đọc là /ŋ/!"]
        }
      ]
    },
    vocabulary: [
      { id: "u5-v1", word: "custom / tradition", ipa: "/ˈkʌstəm/ - /trəˈdɪʃn/", type: "n", meaning: "phong tục / truyền thống", example: "It is a custom in my family to have dinner together on New Year's Eve.", exampleVi: "Ăn tối cùng nhau vào đêm Giao thừa là một phong tục trong gia đình tôi.", tip: "have a custom of + V-ing; break with tradition (phá vỡ truyền thống)" },
      { id: "u5-v2", word: "worship ancestors", ipa: "/ˈwɜːʃɪp ˈænsestəz/", type: "v.phr", meaning: "thờ cúng tổ tiên", example: "Worshipping ancestors is an important tradition of Vietnamese people.", exampleVi: "Thờ cúng tổ tiên là một truyền thống quan trọng của người Việt.", tip: "whale worship: tục thờ cá Ông (cá voi) của ngư dân vùng biển" },
      { id: "u5-v3", word: "longevity", ipa: "/lɒnˈdʒevəti/", type: "n", meaning: "sự trường thọ, sống lâu", example: "We held a longevity ceremony for my 80-year-old grandmother.", exampleVi: "Chúng tôi tổ chức lễ mừng thọ cho bà nội 80 tuổi.", tip: "longevity ceremony: lễ mừng thọ. Trọng âm âm 2: /lɒnˈdʒevəti/" },
      { id: "u5-v4", word: "family reunion", ipa: "/ˈfæməli ˌriːˈjuːniən/", type: "n.phr", meaning: "cuộc sum họp, đoàn tụ gia đình", example: "Tet is the biggest occasion for family reunions in Viet Nam.", exampleVi: "Tết là dịp lớn nhất để sum họp gia đình ở Việt Nam.", tip: "family bonding: sự gắn kết tình cảm gia đình" },
      { id: "u5-v5", word: "ornamental tree", ipa: "/ˌɔːnəˈmentl triː/", type: "n.phr", meaning: "cây cảnh trang trí", example: "Kumquat trees and peach blossoms are popular ornamental trees at Tet.", exampleVi: "Cây quất và hoa đào là những loại cây cảnh phổ biến vào dịp Tết.", tip: "kumquat tree (cây quất), peach blossom (hoa đào), apricot blossom (hoa mai)" },
      { id: "u5-v6", word: "bamboo pole", ipa: "/ˌbæmˈbuː pəʊl/", type: "n.phr", meaning: "cây nêu (ngày Tết)", example: "In the past, villagers put up a bamboo pole to chase away bad luck.", exampleVi: "Ngày xưa, dân làng dựng cây nêu để xua đuổi điều xui xẻo.", tip: "chase away bad luck / evil spirits: xua đuổi vận xui / tà ma" },
      { id: "u5-v7", word: "offering", ipa: "/ˈɒfərɪŋ/", type: "n", meaning: "đồ cúng, lễ vật", example: "People prepare offerings of fruit, flowers and incense for the altar.", exampleVi: "Mọi người chuẩn bị lễ vật gồm trái cây, hoa và hương lên bàn thờ.", tip: "food offerings: đồ lễ cúng" },
      { id: "u5-v8", word: "festival goer", ipa: "/ˈfestɪvl ˈɡəʊə(r)/", type: "n.phr", meaning: "người đi trẩy hội, du khách tham gia lễ hội", example: "Thousands of festival goers gathered at the Hung Kings Temple.", exampleVi: "Hàng nghìn người đi lễ hội đã tập trung tại Đền Hùng.", tip: "go -> goer (người đi đến đâu đó)" },
      { id: "u5-v9", word: "martial arts", ipa: "/ˌmɑːʃl ˈɑːts/", type: "n.phr", meaning: "võ thuật", example: "The festival features traditional games and martial arts performances.", exampleVi: "Lễ hội có các trò chơi truyền thống và màn biểu diễn võ thuật.", tip: "Luôn có 's' ở arts: martial arts" },
      { id: "u5-v10", word: "lantern", ipa: "/ˈlæntən/", type: "n", meaning: "đèn lồng", example: "Children carry colourful lanterns during the Mid-Autumn Festival.", exampleVi: "Trẻ em rước những chiếc đèn lồng rực rỡ trong Tết Trung thu.", tip: "release lanterns: thả đèn hoa đăng / đèn lồng" },
      { id: "u5-v11", word: "table manners", ipa: "/ˈteɪbl ˈmænəz/", type: "n.phr", meaning: "phép tắc trên bàn ăn", example: "Inviting elders to eat first is one of Vietnamese table manners.", exampleVi: "Mời người lớn tuổi ăn trước là một trong những phép tắc bàn ăn của người Việt.", tip: "manners (số nhiều): phép lịch sự, quy tắc ứng xử" },
      { id: "u5-v12", word: "acrobatics", ipa: "/ˌækrəˈbætɪks/", type: "n", meaning: "màn nhào lộn, xiếc", example: "The lion dance includes exciting acrobatics and drum music.", exampleVi: "Múa lân bao gồm những màn nhào lộn hấp dẫn và tiếng trống rộn ràng.", tip: "Trọng âm rơi vào âm tiết thứ 3 /-ˈbæt-/" },
      { id: "u5-v13", word: "coastal", ipa: "/ˈkəʊstl/", type: "adj", meaning: "thuộc vùng ven biển", example: "Whale worship is very popular in Vietnamese coastal villages.", exampleVi: "Tục thờ cá Ông rất phổ biến ở các làng ven biển Việt Nam.", tip: "coast (n: bờ biển) -> coastal (adj: ven biển)" },
      { id: "u5-v14", word: "carp", ipa: "/kɑːp/", type: "n", meaning: "cá chép", example: "People release live carps into rivers on the 23rd of the last lunar month.", exampleVi: "Mọi người thả cá chép sống ra sông vào ngày 23 tháng Chạp.", tip: "Land Genie and Kitchen Gods: Ông Công Ông Táo" }
    ],
    grammar: [
      {
        title: "1. Mạo từ A / An / The và Không dùng mạo từ (Zero article Ø)",
        rules: [
          "a) Mạo từ bất định 'A / An': chỉ đứng trước danh từ ĐẾM ĐƯỢC SỐ ÍT khi nhắc đến lần đầu hoặc mang nghĩa 'một'.",
          "• Dùng 'an' trước nguyên âm (u, e, o, a, i) tính theo CÁCH PHÁT ÂM: an ornamental tree, an offering, an hour (h câm), an honest boy.",
          "• Dùng 'a' trước phụ âm (tính theo cách phát âm): a custom, a lantern, a uniform (/ˈjuːnɪfɔːm/), a university (/ˌjuːnɪˈvɜːsəti/).",
          "b) Mạo từ xác định 'The':",
          "• Vật/người đã xác định hoặc được nhắc lại lần thứ 2.",
          "• Vật duy nhất: the sun, the moon, the earth, the world, the capital.",
          "• Trước so sánh nhất (the biggest) và số thứ tự (the first, the second).",
          "• Trước tên dân tộc để chỉ cả cộng đồng: the Kinh, the Tay, the Ede, the Vietnamese.",
          "• Trước nhạc cụ: play the guitar / play the piano / play the bamboo flute.",
          "• Trước danh từ có 'of' xác định phía sau: the tradition of worshipping ancestors.",
          "c) KHÔNG dùng mạo từ (Zero article - kí hiệu Ø) — TRỌNG TÂM ĐỀ THI:",
          "• Trước danh từ số nhiều hoặc danh từ không đếm được khi nói chung chung: Ø Festivals are fun. / Ø Sticky rice is delicious.",
          "• Trước các bữa ăn: have Ø breakfast / Ø lunch / Ø dinner.",
          "• Trước các môn thể thao, trò chơi: play Ø badminton / Ø chess / Ø tug of war.",
          "• Trước thứ, tháng, năm, mùa (nói chung) và hầu hết các ngày lễ Tết ngắn: at Ø Tet, on Ø Sundays, in Ø January, on Ø Christmas Day, on Ø New Year's Eve.",
          "• Trước tên quốc gia (trừ các nước có Kingdom, States, Republic, Philippines, Netherlands): in Ø Viet Nam, in Ø Japan (NHƯNG: the UK, the USA)."
        ],
        examTips: [
          "Cẩn thận bẫy 'a/an': 'a uniform', 'a university', 'a European country' (vì chữ u/eu ở đây phát âm là /juː/ - phụ âm /j/!). Ngược lại: 'an hour', 'an MC', 'an SOS'!",
          "Cẩn thận với Tết và Lễ hội: 'at Ø Tet' (không có mạo từ), NHƯNG 'the Mid-Autumn Festival', 'the Hung Kings Temple Festival' (các lễ hội có chữ Festival thường dùng 'the')."
        ]
      }
    ],
    practice: [
      {
        id: "u5-q1",
        type: "pronunciation",
        question: "Choose the word whose underlined part is pronounced differently: A. la<u>n</u>tern   B. <u>n</u>ature   C. mo<u>n</u>k   D. ceremo<u>n</u>y",
        options: ["A. lantern", "B. nature", "C. monk", "D. ceremony"],
        answer: 2,
        explanation: "Chữ 'n' trong 'monk' đứng trước âm /k/ nên phát âm là /ŋ/ (/mʌŋk/). Trong lantern, nature, ceremony chữ 'n' phát âm là /n/."
      },
      {
        id: "u5-q2",
        type: "pronunciation",
        question: "Choose the word whose underlined part is pronounced differently: A. thi<u>n</u>k   B. la<u>n</u>guage   C. lon<u>g</u>evity   D. tha<u>n</u>ksgiving",
        options: ["A. think", "B. language", "C. longevity", "D. thanksgiving"],
        answer: 2,
        explanation: "Trong 'longevity' (/lɒnˈdʒevəti/), âm tiết là /lɒn-/ và /-dʒev-/. Còn trong think, language, thanksgiving chữ 'n' đều phát âm là /ŋ/."
      },
      {
        id: "u5-q3",
        type: "grammar",
        question: "In Viet Nam, people often buy _______ ornamental tree such as a kumquat tree for Tet.",
        options: ["A. a", "B. an", "C. the", "D. Ø (no article)"],
        answer: 1,
        explanation: "'tree' là danh từ đếm được số ít nhắc đến chung ('một cây cảnh'), đứng trước 'ornamental' bắt đầu bằng nguyên âm /ɔː/ -> dùng 'an'."
      },
      {
        id: "u5-q4",
        type: "grammar",
        question: "My family always has a big dinner together on _______ New Year's Eve.",
        options: ["A. a", "B. an", "C. the", "D. Ø (no article)"],
        answer: 3,
        explanation: "Trước các dịp lễ như 'New Year's Eve', 'Tet', 'Christmas' ta KHÔNG dùng mạo từ (Ø)."
      },
      {
        id: "u5-q5",
        type: "grammar",
        question: "_______ Tay are the second largest ethnic group in Viet Nam after _______ Kinh.",
        options: ["A. The / the", "B. Ø / Ø", "C. A / a", "D. The / Ø"],
        answer: 0,
        explanation: "Khi nói về cả một cộng đồng dân tộc (The Tay, The Kinh, The Ede), ta dùng mạo từ 'the'."
      },
      {
        id: "u5-q6",
        type: "grammar",
        question: "Students at my school have to wear _______ uniform on Mondays and Fridays.",
        options: ["A. an", "B. a", "C. the", "D. Ø"],
        answer: 1,
        explanation: "'uniform' bắt đầu bằng chữ 'u' nhưng phát âm là /ˈjuːnɪfɔːm/ (phụ âm /j/) -> phải dùng mạo từ 'a' (a uniform)."
      },
      {
        id: "u5-q7",
        type: "vocabulary",
        question: "We held a _______ ceremony last Sunday to celebrate my grandparents turning 85.",
        options: ["A. longevity", "B. lantern", "C. coastal", "D. martial"],
        answer: 0,
        explanation: "'longevity ceremony': lễ mừng thọ (mừng ông bà 85 tuổi)."
      },
      {
        id: "u5-q8",
        type: "vocabulary",
        question: "People put up a bamboo pole at Tet to _______ away bad luck and evil spirits.",
        options: ["A. worship", "B. chase", "C. release", "D. admire"],
        answer: 1,
        explanation: "Cụm từ cố định: 'chase away bad luck' (xua đuổi vận xui)."
      },
      {
        id: "u5-q9",
        type: "vocabulary",
        question: "_______ ancestors is a core cultural value that shows gratitude to our roots.",
        options: ["A. Worshipping", "B. Chasing", "C. Greeting", "D. Weaving"],
        answer: 0,
        explanation: "'worship ancestors': thờ cúng tổ tiên."
      },
      {
        id: "u5-q10",
        type: "vocabulary",
        question: "Using both hands when giving something to an elder is a good _______ in Viet Nam.",
        options: ["A. costume", "B. custom", "C. offering", "D. lantern"],
        answer: 1,
        explanation: "'custom': phong tục, thói quen ứng xử tốt đẹp (không nhầm với 'costume' là trang phục)."
      },
      {
        id: "u5-q11",
        type: "grammar",
        question: "Wait for me! I will be ready in half _______ hour.",
        options: ["A. a", "B. an", "C. the", "D. Ø"],
        answer: 1,
        explanation: "'hour' có chữ 'h' câm, phát âm bắt đầu bằng nguyên âm /ˈaʊə(r)/ -> dùng 'an' (half an hour: nửa tiếng)."
      },
      {
        id: "u5-q12",
        type: "grammar",
        question: "Find the mistake: My father <u>usually</u> plays <u>the</u> badminton <u>with</u> his neighbours <u>in</u> the afternoon.",
        options: ["A. usually", "B. the", "C. with", "D. in"],
        answer: 1,
        explanation: "Trước tên các môn thể thao (badminton, football, chess) KHÔNG dùng mạo từ 'the' -> bỏ 'the' (plays badminton)."
      }
    ]
  },

  // ==========================================
  // UNIT 6: LIFESTYLES
  // ==========================================
  {
    id: "unit-6",
    number: 6,
    semester: 1,
    title: "Lifestyles",
    viTitle: "Lối sống",
    icon: "🌍",
    color: "#7C3AED",
    summary: "Từ vựng về cách chào hỏi, ẩm thực đường phố, lối sống hiện đại & truyền thống; Ngữ âm /br/ và /pr/; Thì Tương lai đơn (Will) và Câu điều kiện loại 1 (First Conditional).",
    pronunciation: {
      sounds: ["/br/ (bờ-r)", "/pr/ (pờ-r)"],
      explanation: [
        {
          sound: "/br/",
          desc: "Tổ hợp phụ âm /br/: khép môi phát âm /b/ (hữu thanh) rồi cuộn lưỡi nhanh sang âm /r/.",
          examples: ["breakfast /ˈbrekfəst/", "bridge /brɪdʒ/", "broccoli /ˈbrɒkəli/", "brush /brʌʃ/", "celebrate /ˈselɪbreɪt/", "eyebrow /ˈaɪbraʊ/", "bracelet /ˈbreɪslət/"]
        },
        {
          sound: "/pr/",
          desc: "Tổ hợp phụ âm /pr/: bật hơi âm /p/ (vô thanh) rồi chuyển nhanh sang âm /r/.",
          examples: ["practice /ˈpræktɪs/", "present /ˈpreznt/", "precious /ˈpreʃəs/", "prepare /prɪˈpeə(r)/", "improve /ɪmˈpruːv/", "apricot /ˈeɪprɪkɒt/", "express /ɪkˈspres/"]
        }
      ]
    },
    vocabulary: [
      { id: "u6-v1", word: "lifestyle", ipa: "/ˈlaɪfstaɪl/", type: "n", meaning: "lối sống, phong cách sống", example: "Doing exercise regularly is part of a healthy lifestyle.", exampleVi: "Tập thể dục đều đặn là một phần của lối sống lành mạnh.", tip: "healthy lifestyle (lối sống lành mạnh), nomadic lifestyle (lối sống du mục)" },
      { id: "u6-v2", word: "greet / greeting", ipa: "/ɡriːt/ - /ˈɡriːtɪŋ/", type: "v, n", meaning: "chào hỏi / lời chào, cách chào", example: "Japanese people usually bow to greet each other.", exampleVi: "Người Nhật thường cúi đầu để chào nhau.", tip: "bow (cúi chào), shake hands (bắt tay), hug (ôm)" },
      { id: "u6-v3", word: "in the habit of", ipa: "/ɪn ðə ˈhæbɪt əv/", type: "phr", meaning: "có thói quen làm gì", example: "My grandfather is in the habit of drinking green tea every morning.", exampleVi: "Ông tôi có thói quen uống trà xanh mỗi sáng.", tip: "be in the habit of + V-ing!" },
      { id: "u6-v4", word: "in a hurry", ipa: "/ɪn ə ˈhʌri/", type: "phr", meaning: "đang vội vàng, gấp gáp", example: "City dwellers often eat street food when they are in a hurry.", exampleVi: "Người dân thành phố thường ăn đồ ăn đường phố khi họ đang vội.", tip: "Cụm cố định: in a hurry" },
      { id: "u6-v5", word: "dogsled", ipa: "/ˈdɒɡsled/", type: "n", meaning: "xe trượt tuyết do chó kéo", example: "In Alaska, people still use dogsleds to travel across the snow.", exampleVi: "Ở Alaska, người ta vẫn dùng xe chó kéo để di chuyển trên tuyết.", tip: "musher (n): người điều khiển xe trượt tuyết chó kéo; igloo (n): lều tuyết" },
      { id: "u6-v6", word: "native art", ipa: "/ˈneɪtɪv ɑːt/", type: "n.phr", meaning: "nghệ thuật bản địa", example: "Tourists are fascinated by the native art of the local tribes.", exampleVi: "Du khách bị cuốn hút bởi nghệ thuật bản địa của các bộ tộc địa phương.", tip: "tribal dance: điệu nhảy bộ tộc" },
      { id: "u6-v7", word: "make crafts", ipa: "/meɪk krɑːfts/", type: "v.phr", meaning: "làm đồ thủ công mỹ nghệ", example: "Villagers earn a living by weaving and making crafts.", exampleVi: "Dân làng kiếm sống bằng nghề dệt và làm đồ thủ công.", tip: "Đi với MAKE: make crafts" },
      { id: "u6-v8", word: "online learning", ipa: "/ˌɒnˈlaɪn ˈlɜːnɪŋ/", type: "n.phr", meaning: "việc học trực tuyến", example: "Online learning allows students to study from anywhere.", exampleVi: "Học trực tuyến cho phép học sinh học từ bất cứ đâu.", tip: "Trái nghĩa với offline / face-to-face learning" },
      { id: "u6-v9", word: "independent", ipa: "/ˌɪndɪˈpendənt/", type: "adj", meaning: "tự lập, độc lập", example: "Studying online helps learners become more independent.", exampleVi: "Học trực tuyến giúp người học trở nên tự lập hơn.", tip: "Trọng âm rơi vào âm tiết thứ 3 /-ˈpen-/" },
      { id: "u6-v10", word: "interactive", ipa: "/ˌɪntərˈæktɪv/", type: "adj", meaning: "có tính tương tác", example: "Teachers use interactive games to make lessons more exciting.", exampleVi: "Giáo viên dùng các trò chơi tương tác để làm bài học thú vị hơn.", tip: "interact (v) -> interaction (n) -> interactive (adj)" },
      { id: "u6-v11", word: "impact", ipa: "/ˈɪmpækt/", type: "n", meaning: "sự tác động, ảnh hưởng", example: "Modern technology has a huge impact on our daily lifestyle.", exampleVi: "Công nghệ hiện đại có tác động to lớn đến lối sống hàng ngày của chúng ta.", tip: "have an impact ON sth = have an effect ON sth" },
      { id: "u6-v12", word: "maintain", ipa: "/meɪnˈteɪn/", type: "v", meaning: "duy trì, giữ gìn", example: "Despite modernization, they still maintain their traditional lifestyle.", exampleVi: "Mặc dù hiện đại hóa, họ vẫn duy trì lối sống truyền thống của mình.", tip: "Trọng âm rơi vào âm 2: /meɪnˈteɪn/" },
      { id: "u6-v13", word: "street food", ipa: "/striːt fuːd/", type: "n.phr", meaning: "ẩm thực / thức ăn đường phố", example: "Vietnamese street food like Pho and Banh Mi is famous worldwide.", exampleVi: "Ẩm thực đường phố Việt Nam như Phở và Bánh mì nổi tiếng toàn thế giới.", tip: "street vendor: người bán hàng rong" },
      { id: "u6-v14", word: "nomadic", ipa: "/nəʊˈmædɪk/", type: "adj", meaning: "thuộc về du mục (nay đây mai đó)", example: "Mongolian herders lead a nomadic life on the steppes.", exampleVi: "Những người chăn gia súc Mông Cổ sống cuộc đời du mục trên thảo nguyên.", tip: "nomad (n: người du mục) -> nomadic (adj: thuộc du mục)" }
    ],
    grammar: [
      {
        title: "1. Thì Tương lai đơn (Future Simple: will / won't + V)",
        rules: [
          "• Công thức: (+) S + will + V(nguyên thể) | (-) S + will not (won't) + V | (?) Will + S + V?",
          "• Cách dùng: Diễn tả dự đoán về tương lai (thường đi với I think, I believe, perhaps, probably, maybe), quyết định ngay tại thời điểm nói, lời hứa (I promise), hoặc lời đề nghị.",
          "• Dấu hiệu: tomorrow, next week/month/year, in the future, soon, in + năm tương lai (in 2030)."
        ],
        examTips: [
          "Sau 'will' hoặc 'won't' động từ LUÔN ở dạng nguyên thể không 'to' (Ví dụ: She will be 14 next month / It won't rain tomorrow)."
        ]
      },
      {
        title: "2. Câu điều kiện loại 1 (First Conditional) — CỰC QUAN TRỌNG CHO THI HỌC KÌ 1",
        rules: [
          "• Dùng để diễn tả sự việc CÓ THỂ XẢY RA ở hiện tại hoặc tương lai.",
          "• Công thức chuẩn: [Mệnh đề IF: If + S + V(hiện tại đơn - V/Vs/es, am/is/are, don't/doesn't + V)], [Mệnh đề chính: S + will / won't (hoặc can / may / should) + V(nguyên thể)].",
          "• Ví dụ: If you study hard, you will pass the final exam easily.",
          "• Ví dụ: If she doesn't hurry, she will miss the school bus.",
          "• CẤU TRÚC UNLESS (Trừ khi / Nếu... không): Unless = If ... not.",
          "• Công thức biến đổi viết lại câu: If + S + don't/doesn't + V, Mệnh đề chính <=> Unless + S + V(khẳng định - nhớ chia s/es nếu chủ ngữ số ít!), Mệnh đề chính giữ nguyên!"
        ],
        examTips: [
          "Bẫy đề thi số 1: TUYỆT ĐỐI KHÔNG dùng 'will / won't' ngay trong mệnh đề chứa 'If' hoặc 'Unless'! (Ví dụ: If it will rain -> SAI, phải là If it rains).",
          "Bẫy đề thi số 2 (Viết lại câu với Unless): Khi đổi 'If she doesn't practice...' sang 'Unless', bỏ 'doesn't' thì phải nhớ thêm '-s/-es' vào động từ: 'Unless she practices...'!",
          "Bẫy đề thi số 3 (Đổi từ câu mệnh lệnh nối bằng OR sang If): 'Hurry up, or you will be late' => 'If you don't hurry up, you will be late' (hoặc 'Unless you hurry up, you will be late')."
        ]
      }
    ],
    practice: [
      {
        id: "u6-q1",
        type: "pronunciation",
        question: "Choose the word that has the /pr/ sound: A. bridge   B. broccoli   C. improve   D. celebrate",
        options: ["A. bridge", "B. broccoli", "C. improve", "D. celebrate"],
        answer: 2,
        explanation: "'improve' (/ɪmˈpruːv/) chứa âm /pr/. Các từ bridge, broccoli, celebrate chứa âm /br/."
      },
      {
        id: "u6-q2",
        type: "grammar",
        question: "If we _______ online classes tomorrow, we won't have to travel to school in the rain.",
        options: ["A. will have", "B. have", "C. had", "D. are having"],
        answer: 1,
        explanation: "Câu điều kiện loại 1: Trong mệnh đề 'If' chia thì Hiện tại đơn (mặc dù có chữ 'tomorrow'!). Chủ ngữ 'we' -> dùng 'have'."
      },
      {
        id: "u6-q3",
        type: "grammar",
        question: "If Minh _______ his homework tonight, his mother won't let him play computer games.",
        options: ["A. won't finish", "B. don't finish", "C. doesn't finish", "D. didn't finish"],
        answer: 2,
        explanation: "Mệnh đề 'If' trong câu điều kiện loại 1 chia Hiện tại đơn. Chủ ngữ 'Minh' là số ít -> dùng 'doesn't finish'."
      },
      {
        id: "u6-q4",
        type: "grammar",
        question: "Unless she _______ early tomorrow morning, she will miss the first train to Sa Pa.",
        options: ["A. leaves", "B. doesn't leave", "C. will leave", "D. leave"],
        answer: 0,
        explanation: "Sau 'Unless' (= If ... not) ta dùng mệnh đề khẳng định ở thì Hiện tại đơn. Chủ ngữ 'she' số ít -> 'leaves'."
      },
      {
        id: "u6-q5",
        type: "vocabulary",
        question: "My grandmother is in the _______ of waking up at 5 a.m. to do morning exercise.",
        options: ["A. custom", "B. tradition", "C. habit", "D. lifestyle"],
        answer: 2,
        explanation: "Cụm từ cố định: 'be in the habit of + V-ing' (có thói quen làm gì)."
      },
      {
        id: "u6-q6",
        type: "vocabulary",
        question: "Sorry, I can't talk right now because I am in a _______ to catch the bus!",
        options: ["A. habit", "B. hurry", "C. lifestyle", "D. greeting"],
        answer: 1,
        explanation: "Cụm từ cố định: 'in a hurry' (đang vội vàng)."
      },
      {
        id: "u6-q7",
        type: "vocabulary",
        question: "In Japan, people usually _______ to greet each other instead of shaking hands.",
        options: ["A. hug", "B. bow", "C. weave", "D. maintain"],
        answer: 1,
        explanation: "'bow': cúi đầu chào (phong cách chào hỏi đặc trưng của người Nhật)."
      },
      {
        id: "u6-q8",
        type: "vocabulary",
        question: "Modern technology has a strong _______ on the way teenagers communicate today.",
        options: ["A. impact", "B. habit", "C. hurry", "D. dogsled"],
        answer: 0,
        explanation: "Cụm từ 'have a strong impact on sth': có tác động/ảnh hưởng mạnh mẽ lên cái gì."
      },
      {
        id: "u6-q9",
        type: "grammar",
        question: "I think people _______ more interactive devices for learning in the next 10 years.",
        options: ["A. use", "B. used", "C. will use", "D. are using"],
        answer: 2,
        explanation: "'I think ... in the next 10 years' diễn tả dự đoán trong tương lai -> dùng thì Tương lai đơn 'will use'."
      },
      {
        id: "u6-q10",
        type: "vocabulary",
        question: "Even though many young people move to cities, the villagers still _______ their traditional craft of weaving.",
        options: ["A. maintain", "B. greet", "C. interact", "D. hurry"],
        answer: 0,
        explanation: "'maintain': duy trì, giữ gìn (nghề dệt truyền thống)."
      },
      {
        id: "u6-q11",
        type: "grammar",
        question: "Rewrite check: 'Study hard, or you won't pass the final exam.' means _______.",
        options: [
          "A. If you study hard, you won't pass the final exam.",
          "B. If you don't study hard, you won't pass the final exam.",
          "C. Unless you don't study hard, you won't pass the final exam.",
          "D. If you won't study hard, you don't pass the final exam."
        ],
        answer: 1,
        explanation: "'Hãy học chăm chỉ, nếu không bạn sẽ không đỗ kì thi' = 'Nếu bạn không học chăm chỉ (If you don't study hard), bạn sẽ không đỗ kì thi'."
      },
      {
        id: "u6-q12",
        type: "grammar",
        question: "Find the mistake: If the weather <u>will be</u> fine this weekend, our family <u>will go</u> camping <u>by</u> the <u>lake</u>.",
        options: ["A. will be", "B. will go", "C. by", "D. lake"],
        answer: 0,
        explanation: "Trong mệnh đề 'If' của câu điều kiện loại 1 không dùng 'will be', phải chia Hiện tại đơn -> sửa 'will be' thành 'is'."
      }
    ]
  }
);
