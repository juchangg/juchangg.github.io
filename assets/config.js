/* =====================================================================
   聚場設定
   - SUPABASE_URL / SUPABASE_ANON_KEY：Supabase 專案的網址與 Publishable key
     （Publishable key 本來就是公開放在網頁上的；千萬不要放 sb_secret_ 開頭的 Secret key）
   - 網站在 *.github.io 或 LIVE_HOSTS 列出的網域上執行時，連正式資料庫
   - 其他地方（本機預覽、Claude 預覽頁）一律用示範模式，資料只存在瀏覽器
   ===================================================================== */
window.JC_CONFIG = {
  APP_NAME: '聚場',
  SUPABASE_URL: 'https://nlxciibsriyjldisuefr.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_M-a1saZMHa06aZQiQ_e0LA_5y6MXHdN',
  LIVE_HOSTS: [],                 // 之後買了自己的網域，例如 'juchang.app'，加在這裡
  DB_VERSION_REQUIRED: '0.3.0',   // 這版前端需要的資料庫版本

  // 服務條款與隱私權政策（改了條款內容就把版本日期往後改，所有人下次登入會被要求重新同意）
  TERMS_VERSION: '2026-11-01',
  OPERATOR_NAME: '（營運者名稱，上線前填寫）',   // 個人或公司名稱
  CONTACT_EMAIL: 'jess8182002@gmail.com'        // 客服與個資聯絡信箱，可換成專用信箱
};
