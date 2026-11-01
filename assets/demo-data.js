/* =====================================================================
   聚場示範資料（單一來源）
   - 瀏覽器示範模式直接讀這份
   - tools/gen-seed.js 也讀這份，產生 sql/seed_demo.sql 給正式資料庫用
   'ME' 代表「你自己」：示範模式是示範帳號，正式資料庫是你註冊的 Email
   時間一律用「幾小時前」表示，負數代表未來
   ===================================================================== */
(function (root) {
  const D = 24;
  const users = [
    ['u01', '林小薇', 52], ['u02', '陳柏宇', 50], ['u03', '王思涵', 47], ['u04', '張家豪', 41],
    ['u05', '李珮瑜', 38], ['u06', '黃志明', 33], ['u07', '吳宜庭', 26], ['u08', '蔡明軒', 19],
    ['u09', '許雅婷', 11], ['u10', '鄭宇翔', 4]
  ].map(([id, name, days]) => ({ id, name, email: `demo-${id}@juchang.demo`, hoursAgo: days * D }));
  const BIOS = {
    u01: '上班族，記帳第 2 年。目標是 35 歲前存到第一個 100 萬。',
    u02: 'HYROX 選手、健身教練。正在努力把學貸和車貸還完。',
    u03: '網站接案者，用 AI 工具做形象網站。',
    u04: '業務，收入起伏大，正在學怎麼抓預備金。',
    u05: '接案美髮設計師，也在經營自己的 IG 作品集。',
    u06: '工程師，喜歡手沖咖啡跟讀理財書。',
    u07: '剛開始學理財的社會新鮮人。',
    u10: '新竹工程師，想開始認真管理自己的錢。'
  };
  users.forEach(u => { u.bio = BIOS[u.id] || ''; });

  const LV = ['新手', '學徒', '行動者', '實踐者', '推手', '導師', '領航者', '大師', '傳奇'];

  const communities = [
    {
      key: 'c1', slug: 'money-awakening', name: '財商覺醒俱樂部', category: '財商理財', theme: '#FFC933',
      tagline: '從現金流三張表開始，一步步建立被動收入', is_private: false, featured: true, owner: 'ME', days: 48,
      description: '這裡是一起練習財商的地方。\n\n每週四晚上直播 Q&A，課程從記帳、現金流量表一路走到資產配置。別人幫你的貼文或留言按讚就會加分，升到等級 3 會解鎖「資產配置實戰」。\n\n本社群分享的是財商知識與個人經驗，不構成任何投資建議。',
      levels: ['記帳新手', '看見現金流', '存下第一桶', '配置入門', '穩健前行', '現金流玩家', '資產建築師', '財務自由路上', '覺醒傳奇'],
      categories: [['公告', true], ['一般討論'], ['成果分享'], ['提問'], ['讀書會']],
      members: [['u01', 'admin', 45], ['u02', 'member', 40], ['u03', 'member', 36], ['u04', 'member', 30],
                ['u05', 'member', 24], ['u06', 'member', 18], ['u07', 'member', 9], ['u10', 'member', 3]],
      pending: [['u08', 0.3], ['u09', 5]],
      questions: ['你為什麼想加入這個社群？', '你現在有記帳的習慣嗎？大概多久了？'],
      answers: {
        u08: ['朋友推薦的，想學怎麼存到第一桶金', '還沒有，這次想從記帳開始'],
        u09: ['剛出社會，薪水總是月光', '用 App 記了兩個月，但常常忘記'],
        u07: ['想搞懂保險跟理財的差別', '每天都有記，快半年了'],
        u10: ['想開始認真管理自己的錢', '還沒有']
      },
      welcome: '嗨 {名字}，歡迎加入{社群}！🎉\n\n建議你先做這三件事：\n1. 到「課程」看第一堂〈為什麼要記帳〉\n2. 在「成果分享」貼出你這週的支出分類\n3. 報名週四晚上的直播 Q&A\n\n有任何問題直接回覆這則訊息就可以。',
      bonus: { ME: 22, u01: 71, u05: 30, u02: 9, u04: 15, u03: 4 },
      posts: [
        { k: 'p1', by: 'ME', cat: '公告', d: 14, pin: true, likes: 8, title: '歡迎加入！先從這三件事開始',
          body: '1. 到「課程」看第一堂：為什麼要記帳\n2. 在「成果分享」貼出你這個月的支出分類\n3. 報名週四晚上的直播 Q&A\n\n別人幫你按讚就會加分，升到等級 3 會解鎖「資產配置實戰」。',
          c: [['u07', '已報名週四直播！', 20, 2]] },
        { k: 'p2', by: 'u01', cat: '成果分享', d: 3.2, likes: 7, title: '連續記帳 30 天，終於看懂自己的錢去哪了',
          body: '原本以為每個月花在吃的大概一萬，實際是一萬七，外送就佔了六千多。\n\n這個月開始每週只叫兩次外送，省下來的錢直接轉進緊急預備金帳戶。',
          c: [['u06', '外送真的是隱形殺手。', 5, 2], ['u04', '我也是，看到數字才嚇到', 9, 1, [['u01', '一起加油，下個月互相檢查！', 2, 1]]]] },
        { k: 'p3', by: 'u04', cat: '提問', d: 2.1, likes: 3, title: '收入不固定，緊急預備金要放幾個月才夠？',
          body: '我是業務，收入每個月落差很大。看到有人說 3 個月，也有人說 12 個月，大家都怎麼抓？',
          c: [['u01', '收入不固定的話，我會建議至少 6 個月。', 4, 4,
                [['ME', '同意，而且要用「收入最低的那幾個月」來估支出缺口，不要用平均。', 2, 5]]]] },
        { k: 'p4', by: 'u05', cat: '成果分享', d: 5, likes: 6, title: '分享我的資產負債表模板',
          body: '把課程裡的格式做成試算表了。重點是負債那欄要把信用卡分期也算進去，很多人會漏掉。\n\n需要的人留言，我再私訊給你。',
          c: [['u03', '需要！謝謝分享', 3, 1], ['u02', '+1，想要一份', 6, 1]] },
        { k: 'p5', by: 'u02', cat: '一般討論', d: 1.1, likes: 5, title: '第一次算出自己的淨資產，是負的',
          body: '很震撼，但至少知道起點在哪裡了。學貸還有 28 萬、車貸 41 萬。給自己的目標是兩年內轉正。',
          c: [['u07', '敢面對就是第一步，加油！', 3, 3]] },
        { k: 'p6', by: 'u03', cat: '提問', d: 0.4, likes: 2, title: '保本型工具跟定存差在哪？',
          body: '課程第二章看到一半有點卡住，有人可以用白話解釋一下嗎？',
          c: [['ME', '週四直播我會專門講這題，記得報名。', 1.5, 3]] },
        { k: 'p7', by: 'u06', cat: '讀書會', d: 7, likes: 4, title: '《富爸爸，窮爸爸》第三章筆記',
          body: '這章最大的收穫：資產是會把錢放進你口袋的東西，負債是把錢從口袋拿走的東西。\n\n我回頭檢查，原本以為是資產的車，其實每個月都在讓我付錢。', c: [] },
        { k: 'p8', by: 'u10', cat: '一般討論', d: 0.15, likes: 1, title: '新人報到！',
          body: '大家好，我是宇翔，在新竹當工程師。想開始認真管理自己的錢，請多指教。', c: [] },
        { k: 'p9', by: 'u07', cat: '一般討論', d: 0.06, likes: 0, title: '免費送飆股名單，加 LINE 領取',
          body: '老師帶單每月穩賺 30%，名額有限，私訊我 LINE 就送明牌！', c: [] }
      ],
      reports: [['u03', 'p9', 'scam', '叫大家加 LINE 拿明牌，很像投資詐騙', 1], ['u01', 'p9', 'spam', '', 0.5]],
      courses: [
        { title: '新手入門：現金流三張表', description: '記帳、現金流量表、資產負債表，一次建立。', unlock: 1, modules: [
          { title: '第一章　看見你的錢', drip: 0, lessons: [
            ['為什麼要記帳', '記帳不是為了省錢，是為了看見。\n\n這一堂的作業：連續 7 天，把每一筆支出記下來，週末在「成果分享」貼出你的分類結果。', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
            ['支出分類的三個層次', '固定支出、變動支出、可省支出。\n\n先分大類，不要一開始就分太細，分太細的人通常撐不過兩週。']] },
          { title: '第二章　三張表', drip: 0, lessons: [
            ['現金流量表', '每月收入 − 每月支出 = 自由現金流。\n\n自由現金流是你所有理財行動的燃料。'],
            ['資產負債表', '資產 − 負債 = 淨資產。\n\n信用卡分期、車貸、學貸都要列進負債。'],
            ['收支表的月度檢查', '每月 5 號花 20 分鐘，對照上個月的三張表，寫下一個要調整的地方。']] }] },
        { title: '資產配置實戰', description: '緊急預備金、保本工具與長期投資的分配方法。', unlock: 3, modules: [
          { title: '第一章　安全網', drip: 0, lessons: [
            ['緊急預備金怎麼算', '以每月必要支出 × 6 為基準，收入不穩定的人拉到 9–12 個月。'],
            ['保險先盤點再買', '先列出現有保單，再看缺口。']] },
          { title: '第二章　配置比例', drip: 7, lessons: [
            ['保本工具與定存的差異', '比較流動性、報酬率與到期條件。'],
            ['依人生階段調整配置', '25 歲、35 歲、45 歲各自的重點不同。']] }] },
        { title: '被動收入系統', description: '把現金流變成可以自己運轉的系統。', unlock: 5, modules: [
          { title: '第一章　系統思維', drip: 0, lessons: [['從主動收入到系統收入', '收入的四種型態與轉換路徑。']] }] }
      ],
      progress: [['ME', 0, 0, 0, 10], ['ME', 0, 0, 1, 8],
        ['u01', 0, 0, 0, 40], ['u01', 0, 0, 1, 38], ['u01', 0, 1, 0, 30], ['u01', 0, 1, 1, 25], ['u01', 0, 1, 2, 20], ['u01', 1, 0, 0, 12], ['u01', 1, 0, 1, 6],
        ['u02', 0, 0, 0, 35], ['u02', 0, 0, 1, 30], ['u02', 0, 1, 0, 2],
        ['u03', 0, 0, 0, 20],
        ['u04', 0, 0, 0, 25], ['u04', 0, 0, 1, 24], ['u04', 0, 1, 0, 18], ['u04', 0, 1, 1, 9],
        ['u05', 0, 0, 0, 22], ['u05', 0, 0, 1, 21], ['u05', 0, 1, 0, 15], ['u05', 0, 1, 1, 14], ['u05', 0, 1, 2, 5], ['u05', 1, 0, 0, 1],
        ['u06', 0, 0, 0, 16], ['u06', 0, 0, 1, 11],
        ['u07', 0, 0, 0, 3]],
      events: [
        { title: '每週直播 Q&A', description: '本週主題：保本工具與定存的差異。會前可以先在「提問」分類留問題。', day: 1, at: '20:30', min: 60, url: 'https://meet.google.com/', rsvp: 5 },
        { title: '現金流三張表工作坊', description: '帶著你上個月的記帳資料，現場一起完成三張表。', day: 9, at: '14:00', min: 120, url: '', rsvp: 4 },
        { title: '每週直播 Q&A', description: '主題：緊急預備金。', day: -6, at: '20:30', min: 60, url: '', rsvp: 6 }
      ]
    },
    {
      key: 'c2', slug: 'hyrox-taipei', name: 'HYROX 台北訓練營', category: '運動健身', theme: '#FF7A59',
      tagline: '8 公里跑步 × 8 個功能站的備賽社群', is_private: false, featured: true, owner: 'u02', days: 40,
      description: '一起準備 HYROX 的跑者與健身愛好者。\n\n分享課表、配速和比賽心得，每月一次線上分站技術課。',
      levels: ['新兵', '跑者', '推雪橇', '划船手', '衝刺者', '鐵人', '隊長', '教頭', '傳奇'],
      categories: [['公告', true], ['課表分享'], ['比賽心得'], ['提問']],
      members: [['ME', 'member', 30], ['u04', 'admin', 38], ['u06', 'member', 29], ['u07', 'member', 20], ['u10', 'member', 3]],
      pending: [], bonus: { u02: 40, u04: 22 },
      posts: [
        { k: 'p1', by: 'u02', cat: '公告', d: 4, pin: true, likes: 4, title: '十二月模擬賽報名開放',
          body: '地點在內湖，限額 40 人，會完整跑一次 8 站流程，現場有計時。', c: [['u06', '報名了！', 6, 1]] },
        { k: 'p2', by: 'u04', cat: '比賽心得', d: 2, likes: 4, title: '雪橇推進終於破 2 分鐘',
          body: '關鍵是重心壓低、步伐變小，手臂打直不要彎。', c: [['u07', '恭喜！我還卡在 2:40', 3, 1]] },
        { k: 'p3', by: 'u06', cat: '課表分享', d: 1, likes: 3, title: '本週間歇課表：1K × 5 + 牆球',
          body: '1K 配速 4:50，中間休息 90 秒。結束後牆球 100 下，分 4 組。', c: [] },
        { k: 'p4', by: 'ME', cat: '提問', d: 0.6, likes: 2, title: '划船機 1000 公尺怎麼配速比較好？',
          body: '我前 500 都衝太快，後面就掉速，有沒有建議的分段配速？',
          c: [['u02', '前 250 稍快、中間 500 穩定、最後 250 再拉上去。', 1, 3]] }
      ],
      courses: [
        { title: '八站技術總覽', description: '每一站的動作要點與常見失誤。', unlock: 1, modules: [
          { title: '前四站', drip: 0, lessons: [['滑雪機', '腿先發力，手臂最後收。'], ['推雪橇', '重心壓低，小步快推。']] },
          { title: '後四站', drip: 0, lessons: [['划船機', '腿、背、手的發力順序。'], ['牆球', '深蹲到底再出手。']] }] },
        { title: '比賽日策略', description: '補給、轉換區與配速策略。', unlock: 2, modules: [
          { title: '比賽日', drip: 0, lessons: [['轉換區的 30 秒', '提前想好每一站的進出路線。']] }] }
      ],
      progress: [],
      events: [
        { title: '分站技術課：雪橇', description: '線上直播，帶你看推拉雪橇的常見錯誤。', day: 4, at: '19:00', min: 90, url: 'https://meet.google.com/', rsvp: 3 },
        { title: '內湖模擬賽', description: '完整 8 站流程，現場計時。', day: 30, at: '08:00', min: 180, url: '', rsvp: 4 }
      ]
    },
    {
      key: 'c3', slug: 'ai-freelance-lab', name: 'AI 接案實驗室', category: '創業副業', theme: '#9B7BFF',
      tagline: '用 AI 工具接到第一個網站案子', is_private: true, featured: false, owner: 'u03', days: 22,
      description: '私密社群，加入需要版主審核。\n\n每週一起拆解一個真實案子：報價、溝通、交付。',
      levels: LV,
      categories: [['公告', true], ['案子分享'], ['工具交流'], ['提問']],
      members: [['ME', 'member', 15], ['u01', 'member', 20], ['u05', 'admin', 21], ['u08', 'member', 10]],
      pending: [['u09', 20]], bonus: { u03: 28, u05: 12 },
      posts: [
        { k: 'p1', by: 'u03', cat: '公告', d: 10, pin: true, likes: 3, title: '本週案子拆解：牙醫診所形象網站',
          body: '預算 3 萬、兩週交付。這週直播會從報價單開始講。', c: [] },
        { k: 'p2', by: 'u08', cat: '案子分享', d: 1.5, likes: 3, title: '接到第一個案子了！',
          body: '幫朋友的咖啡店做一頁式網站，報價 8,000。雖然不多，但是第一步。',
          c: [['u01', '恭喜！第一個案子最難', 2, 2]] },
        { k: 'p3', by: 'u05', cat: '工具交流', d: 3, likes: 2, title: '我目前的接案工具組',
          body: '設計稿用 Figma，切版請 AI 幫忙，部署用 GitHub Pages，客戶溝通用 Notion 做進度頁。', c: [] }
      ],
      courses: [
        { title: '接案從 0 到 1', description: '作品集、報價、合約與交付。', unlock: 1, modules: [
          { title: '準備', drip: 0, lessons: [['做出三個作品', '先幫身邊的人做，作品比履歷有用。'], ['報價怎麼開', '用工時 × 時薪，再加上 20% 的溝通成本。']] }] }
      ],
      progress: [],
      events: [{ title: '案子拆解直播', description: '牙醫診所形象網站的報價與時程。', day: 2, at: '21:00', min: 60, url: 'https://meet.google.com/', rsvp: 3 }]
    },
    {
      key: 'c4', slug: 'salon-growth', name: '美髮設計師獲客學院', category: '美業', theme: '#FF6FA3',
      tagline: '讓客人主動預約、回訪、升級服務', is_private: false, featured: false, owner: 'u05', days: 16,
      description: '給接案設計師與小型沙龍的經營社群。\n\n主題包含 IG 作品集、預約流程、提高客單價與回訪率。',
      levels: ['助理', '新秀', '設計師', '人氣設計師', '資深設計師', '店長', '總監', '品牌主理人', '傳奇'],
      categories: [['公告', true], ['作品分享'], ['經營心得'], ['提問']],
      members: [['u07', 'member', 14], ['u09', 'member', 10], ['u06', 'member', 8], ['u10', 'member', 2]],
      pending: [], bonus: { u05: 18, u07: 6 },
      posts: [
        { k: 'p1', by: 'u05', cat: '公告', d: 15, pin: true, likes: 3, title: '開學了！先填一下你的現況',
          body: '請在留言回答：你一個月大概服務幾位客人？回訪率大概多少？', c: [['u07', '每月約 60 位，回訪率我沒算過😅', 4, 1]] },
        { k: 'p2', by: 'u09', cat: '經營心得', d: 2, likes: 3, title: '結帳時多問一句，護髮加購率變兩倍',
          body: '以前都等客人問，現在洗頭時就先摸髮質，結帳前說明一次護髮的差別，這個月加購從 12% 變 25%。', c: [] },
        { k: 'p3', by: 'u07', cat: '作品分享', d: 0.8, likes: 2, title: '奶茶灰挑染',
          body: '底色先退到 8 度，挑染再補一層冷色，客人很滿意。', c: [] }
      ],
      courses: [
        { title: 'IG 作品集經營', description: '拍照、排版、文案，讓作品自己帶客人來。', unlock: 1, modules: [
          { title: '拍出好作品照', drip: 0, lessons: [['自然光怎麼找', '靠窗、側光、避開頂燈。']] }] }
      ],
      progress: [],
      events: [{ title: '客單價提升工作坊', description: '加購與升級的話術演練。', day: 6, at: '10:30', min: 90, url: '', rsvp: 3 }]
    },
    {
      key: 'c5', slug: 'pour-over-lab', name: '手沖咖啡研究室', category: '生活興趣', theme: '#2BC48A',
      tagline: '從磨豆到萃取，每天一杯更好喝的咖啡', is_private: false, featured: false, owner: 'u06', days: 6,
      description: '分享豆子、器材和沖煮參數，每月一次線上杯測。',
      levels: ['路人', '入坑', '磨豆手', '控溫者', '萃取師', '烘豆迷', '杯測師', '職人', '傳奇'],
      categories: [['公告', true], ['沖煮紀錄'], ['器材'], ['豆子推薦']],
      members: [['u08', 'member', 5], ['u10', 'member', 3], ['u01', 'member', 2]],
      pending: [], bonus: {},
      posts: [
        { k: 'p1', by: 'u06', cat: '沖煮紀錄', d: 1, likes: 2, title: '衣索比亞日曬：1:15、92 度、2 分 30 秒',
          body: '莓果味很明顯，第二段注水放慢一點，尾韻比較乾淨。', c: [['u08', '明天來試試這個參數', 3, 1]] },
        { k: 'p2', by: 'u10', cat: '器材', d: 0.5, likes: 1, title: '入門磨豆機推薦？',
          body: '預算 5,000 以內，主要手沖用。', c: [] }
      ],
      courses: [],
      progress: [],
      events: [{ title: '線上杯測：三支淺焙豆', description: '先寄豆子給報名的人，當天一起喝。', day: 12, at: '15:00', min: 90, url: '', rsvp: 2 }]
    }
  ];

  // 示範私訊（'ME' = 你自己）
  const DMS = [
    ['u01', 'ME', '週四直播我會準時到！想先問：緊急預備金放高利活存可以嗎？', 30, true],
    ['ME', 'u01', '可以，重點是隨時領得出來。直播時我也會講到這題', 29, true],
    ['u05', 'ME', '想請問資產負債表模板，我可以分享到我的 IG 嗎？', 3, false],
    ['u04', 'ME', '謝謝你回答預備金的問題，超有幫助 🙏', 1.2, false]
  ];

  /* ---------- 展開成資料列 ---------- */
  function expand() {
    let seed = 20261030;
    const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const out = { users, communities: [], memberships: [], categories: [], posts: [], comments: [], likes: [], point_events: [],
      courses: [], modules: [], lessons: [], progress: [], events: [], rsvps: [], reports: [], answers: [], platform_admins: ['ME'] };
    const r1 = n => Math.round(n * 100) / 100;

    for (const c of communities) {
      const cid = c.key;
      out.communities.push({ id: cid, slug: c.slug, name: c.name, tagline: c.tagline, description: c.description,
        category: c.category, theme_color: c.theme, is_private: c.is_private, featured: c.featured, status: 'active',
        owner_id: c.owner, hoursAgo: c.days * D, level_names: c.levels, price_monthly: 0,
        join_questions: c.questions || [], welcome_message: c.welcome || '' });
      Object.entries(c.answers || {}).forEach(([u, a]) => {
        const m = [...c.members, ...c.pending.map(([pu, d]) => [pu, 'member', d])].find(x => x[0] === u);
        out.answers.push({ community_id: cid, user_id: u, answers: (c.questions || []).map((q, i) => ({ q, a: a[i] })), hoursAgo: Math.round((m ? m[2] : 1) * D * 10) / 10 });
      });
      const active = [[c.owner, 'owner', c.days], ...c.members];
      active.forEach(([u, role, days]) => out.memberships.push({ community_id: cid, user_id: u, role, status: 'active', joined_hoursAgo: days * D, points: 0 }));
      c.pending.forEach(([u, days]) => out.memberships.push({ community_id: cid, user_id: u, role: 'member', status: 'pending', joined_hoursAgo: days * D, points: 0 }));
      const memberIds = active.map(a => a[0]);
      const catId = {};
      c.categories.forEach(([name, adminOnly], i) => { const id = `${cid}-cat${i}`; catId[name] = id;
        out.categories.push({ id, community_id: cid, name, sort: i, admin_only: !!adminOnly }); });

      const addPoints = (user, delta, hoursAgo) => {
        out.point_events.push({ community_id: cid, user_id: user, delta, hoursAgo: r1(hoursAgo) });
        const m = out.memberships.find(x => x.community_id === cid && x.user_id === user && x.status === 'active');
        if (m) m.points += delta;
      };
      const like = (type, id, author, ago, n) => {
        const pool = shuffle(memberIds.filter(u => u !== author)).slice(0, n);
        for (const u of pool) {
          const lag = Math.min(1 + rnd() * 30, ago * 0.9);
          const t = r1(Math.max(0.05, ago - lag));
          out.likes.push({ user_id: u, target_type: type, target_id: id, community_id: cid, recipient_id: author, hoursAgo: t });
          addPoints(author, 1, t);
        }
      };
      Object.entries(c.bonus).forEach(([u, n]) => addPoints(u, n, 40 * D + rnd() * 5 * D));

      for (const p of c.posts) {
        const pid = `${cid}-${p.k}`, pAgo = p.d * D;
        out.posts.push({ id: pid, community_id: cid, author_id: p.by, category_id: catId[p.cat], title: p.title, body: p.body, pinned: !!p.pin, hoursAgo: r1(pAgo) });
        like('post', pid, p.by, pAgo, p.likes);
        (p.c || []).forEach(([by, body, hAfter, likes, replies], i) => {
          const kid = `${pid}-k${i}`, kAgo = Math.max(0.1, pAgo - hAfter);
          out.comments.push({ id: kid, post_id: pid, community_id: cid, author_id: by, parent_id: null, body, hoursAgo: r1(kAgo) });
          like('comment', kid, by, kAgo, likes || 0);
          (replies || []).forEach(([rby, rbody, rAfter, rlikes], j) => {
            const rid = `${kid}-r${j}`, rAgo = Math.max(0.05, kAgo - rAfter);
            out.comments.push({ id: rid, post_id: pid, community_id: cid, author_id: rby, parent_id: kid, body: rbody, hoursAgo: r1(rAgo) });
            like('comment', rid, rby, rAgo, rlikes || 0);
          });
        });
      }

      (c.reports || []).forEach(([by, k, reason, note, hours]) => out.reports.push({ community_id: cid, reporter_id: by, target_type: 'post',
        target_id: `${cid}-${k}`, reason, note, hoursAgo: hours }));

      c.courses.forEach((k, ki) => {
        const kid = `${cid}-k${ki}`;
        out.courses.push({ id: kid, community_id: cid, title: k.title, description: k.description, unlock_level: k.unlock, sort: ki, published: true, hoursAgo: (c.days - 1) * D });
        k.modules.forEach((m, mi) => {
          const mid = `${kid}-m${mi}`;
          out.modules.push({ id: mid, course_id: kid, title: m.title, sort: mi, drip_days: m.drip });
          m.lessons.forEach(([title, body, video], li) => out.lessons.push({ id: `${mid}-l${li}`, module_id: mid, course_id: kid, community_id: cid, title, body, video_url: video || '', sort: li }));
        });
      });
      c.progress.forEach(([u, ki, mi, li, days]) => out.progress.push({ user_id: u, lesson_id: `${cid}-k${ki}-m${mi}-l${li}`, hoursAgo: days * D }));

      c.events.forEach((e, ei) => {
        const eid = `${cid}-e${ei}`, [hh, mm] = e.at.split(':').map(Number);
        out.events.push({ id: eid, community_id: cid, title: e.title, description: e.description, dayOffset: e.day, hh, mm,
          duration_min: e.min, location_url: e.url, created_by: c.owner, created_hoursAgo: Math.max(1, (-e.day + 5)) * D });
        shuffle(memberIds).slice(0, e.rsvp).forEach(u => out.rsvps.push({ event_id: eid, user_id: u }));
      });
    }
    out.messages = DMS.map(([from, to, body, hoursAgo, read], i) => ({ id: 'dm' + i, from, to, body, hoursAgo, read }));
    return out;
  }

  const api = { users, communities, expand };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JC_DEMO = api;
})(typeof window !== 'undefined' ? window : globalThis);
