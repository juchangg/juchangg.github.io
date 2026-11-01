/* =====================================================================
   聚場核心：共用工具＋資料層（示範模式 / Supabase）
   所有頁面都透過 window.JC.api 讀寫資料，兩種模式的函式名稱完全相同
   ===================================================================== */
(function () {
  const CONFIG = window.JC_CONFIG;

  /* ---------- 共用工具 ---------- */
  const LEVEL_PTS = [0, 5, 20, 65, 155, 515, 2015, 8015, 33015];
  const DEFAULT_LEVEL_NAMES = ['新手', '學徒', '行動者', '實踐者', '推手', '導師', '領航者', '大師', '傳奇'];
  const CATEGORIES = ['財商理財', '運動健身', '創業副業', '美業', '生活興趣', '學習成長', '親子家庭', '其他'];
  const THEMES = [['#FFC933', '陽光黃'], ['#FF7A59', '珊瑚橘'], ['#FF6FA3', '莓果粉'], ['#9B7BFF', '薰衣草紫'], ['#4DA3FF', '天空藍'], ['#2BC48A', '薄荷綠']];
  const levelFor = p => { let l = 1; for (let i = 0; i < 9; i++) if (p >= LEVEL_PTS[i]) l = i + 1; return l; };
  const levelProgress = p => {
    const l = levelFor(p);
    if (l >= 9) return { level: 9, need: 0, pct: 100 };
    const lo = LEVEL_PTS[l - 1], hi = LEVEL_PTS[l];
    return { level: l, need: hi - p, pct: Math.round((p - lo) / (hi - lo) * 100) };
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const newId = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2) + Date.now());
  const nowIso = () => new Date().toISOString();
  const rtf = new Intl.RelativeTimeFormat('zh-TW', { numeric: 'auto' });
  function ago(iso) {
    const s = (new Date(iso) - Date.now()) / 1000, a = Math.abs(s);
    if (a < 60) return '剛剛';
    if (a < 3600) return rtf.format(Math.round(s / 60), 'minute');
    if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour');
    if (a < 86400 * 30) return rtf.format(Math.round(s / 86400), 'day');
    return new Date(iso).toLocaleDateString('zh-TW');
  }
  const fmtDate = iso => new Date(iso).toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' });
  const AV = ['#FFC933', '#FF7A59', '#FF6FA3', '#9B7BFF', '#4DA3FF', '#2BC48A', '#FFB020', '#7AD3FF'];
  const safeImg = u => typeof u === 'string' && (/^https:\/\//.test(u) || /^data:image\/(jpeg|png|webp);base64,/.test(u)) ? u : '';
  function avatar(user, points, size) {
    const name = user?.name || '?';
    let h = 0; for (const ch of String(user?.id || name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const lv = points == null ? '' : `<span class="lv" title="等級 ${levelFor(points)}">${levelFor(points)}</span>`;
    const img = safeImg(user?.avatar);
    return img
      ? `<span class="av${size ? ' ' + size : ''}" aria-hidden="true"><img src="${esc(img)}" alt="" loading="lazy">${lv}</span>`
      : `<span class="av${size ? ' ' + size : ''}" style="background:${AV[h % AV.length]}" aria-hidden="true">${esc(name.trim().charAt(0) || '?')}${lv}</span>`;
  }
  // 把使用者選的圖片裁成 256×256 的正方形 JPEG
  function squareImage(file, size = 256) {
    return new Promise((resolve, reject) => {
      if (!/^image\/(jpeg|png|webp|gif|heic|heif)$/.test(file.type)) return reject(new Error('請選擇 JPG、PNG 或 WebP 圖片'));
      if (file.size > 15 * 1024 * 1024) return reject(new Error('圖片太大了，請選 15MB 以內的圖片'));
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const s = Math.min(img.width, img.height), c = document.createElement('canvas');
        c.width = c.height = size;
        c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        URL.revokeObjectURL(url);
        c.toBlob(b => b ? resolve({ blob: b, dataUrl: c.toDataURL('image/jpeg', 0.85) }) : reject(new Error('圖片處理失敗')), 'image/jpeg', 0.85);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('這張圖片打不開，請換一張')); };
      img.src = url;
    });
  }
  // 貼文圖片：長邊縮到 max 以內的 JPEG
  function shrinkImage(file, max = 1600, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!/^image\/(jpeg|png|webp|gif|heic|heif)$/.test(file.type)) return reject(new Error('請選擇 JPG、PNG 或 WebP 圖片'));
      if (file.size > 20 * 1024 * 1024) return reject(new Error('圖片太大了，請選 20MB 以內的圖片'));
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(b => b ? resolve({ blob: b, dataUrl: c.toDataURL('image/jpeg', quality) }) : reject(new Error('圖片處理失敗')), 'image/jpeg', quality);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('這張圖片打不開，請換一張')); };
      img.src = url;
    });
  }
  const REPORT_REASONS = [['spam', '垃圾訊息或廣告'], ['scam', '詐騙或不實資訊'], ['harassment', '騷擾或霸凌'], ['inappropriate', '不當內容'], ['other', '其他']];
  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800);
  }
  // 單一數列長條圖：最高值直接標數字，其他滑過顯示；附螢幕閱讀器用的表格
  function barChart(items, caption, every = 1) {
    const max = Math.max(1, ...items.map(i => i.value)), peak = items.reduce((a, b, i) => b.value > items[a].value ? i : a, 0);
    return `<figure style="margin:0"><div class="bars" aria-hidden="true">${items.map((it, i) => {
        const h = Math.round(it.value / max * 100);
        const side = i < items.length / 3 ? ' tl' : i >= items.length * 2 / 3 ? ' tr' : '';
        return `<div class="b${side}${it.value ? '' : ' zero'}${i === peak && it.value ? ' peak' : ''}" style="--h:${h}%" tabindex="-1"><i style="height:${Math.max(h, 1.5)}%"></i>${i === peak && it.value ? `<span class="val">${it.value}</span>` : ''}<span class="tip">${esc(it.tip || `${it.label}：${it.value}`)}</span></div>`;
      }).join('')}</div>
      <div class="bar-axis" aria-hidden="true">${items.map((it, i) => `<span>${i % every === 0 || i === items.length - 1 ? esc(it.label) : ''}</span>`).join('')}</div>
      <table class="sr-only"><caption>${esc(caption)}</caption><tbody>${items.map(it => `<tr><th>${esc(it.label)}</th><td>${it.value}</td></tr>`).join('')}</tbody></table></figure>`;
  }
  const versionTag = () => `<a class="ver" href="changelog.html">v${esc(window.JC_VERSION)}</a>`;
  const logo = () => `<a class="brand" href="./"><span class="mark" aria-hidden="true">聚</span><span>${esc(CONFIG.APP_NAME)}</span></a>`;

  /* ---------- 模式判斷 ---------- */
  const host = location.hostname;
  const LIVE = !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY && window.supabase &&
    (/\.github\.io$/.test(host) || (CONFIG.LIVE_HOSTS || []).includes(host)));

  /* =====================================================================
     A. 示範模式（瀏覽器 localStorage）
     ===================================================================== */
  function makeDemoApi() {
    const KEY = 'juchang-demo-v5';
    let db = load();
    function load() { try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {} return seed(); }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
    // 依照資料庫觸發器的規則，替示範帳號產生最近 3 天的通知
    function seedNotifications(x, me, t) {
      const out = [], mine = id => me(id) === 'u-me', recent = h => h < 72;
      const postOf = id => x.posts.find(p => p.id === id), cmtOf = id => x.comments.find(c => c.id === id);
      for (const c of x.comments) {
        if (!recent(c.hoursAgo) || mine(c.author_id)) continue;
        const parent = c.parent_id && cmtOf(c.parent_id), post = postOf(c.post_id);
        if (parent && mine(parent.author_id)) out.push({ type: 'reply', actor: c.author_id, c, post });
        else if (mine(post.author_id)) out.push({ type: 'comment', actor: c.author_id, c, post });
      }
      for (const l of x.likes) {
        if (!recent(l.hoursAgo) || !mine(l.recipient_id) || mine(l.user_id)) continue;
        const c = l.target_type === 'comment' ? cmtOf(l.target_id) : null, post = c ? postOf(c.post_id) : postOf(l.target_id);
        out.push({ type: c ? 'like_comment' : 'like_post', actor: l.user_id, c, post, h: l.hoursAgo });
      }
      return out.map((n, i) => {
        const h = n.h ?? n.c.hoursAgo;
        return { id: 'n' + i, user_id: 'u-me', actor_id: me(n.actor), community_id: n.post.community_id, type: n.type, post_id: n.post.id,
          comment_id: n.c?.id || null, created_at: t(h), read_at: h > 24 ? t(h) : null };
      });
    }
    function seed() {
      const x = window.JC_DEMO.expand(), H = 3600000, t = h => new Date(Date.now() - h * H).toISOString();
      const me = id => id === 'ME' ? 'u-me' : id;
      const at = (d, hh, mm) => { const v = new Date(); v.setDate(v.getDate() + d); v.setHours(hh, mm, 0, 0); return v.toISOString(); };
      return {
        session: 'u-me',
        users: [{ id: 'u-me', name: '示範帳號', email: 'demo@juchang.app', created_at: t(24 * 60), bio: '聚場的示範帳號，也是「財商覺醒俱樂部」的擁有者。', avatar: '', terms_version: CONFIG.TERMS_VERSION },
          ...x.users.map(u => ({ id: u.id, name: u.name, email: u.email, created_at: t(u.hoursAgo), bio: u.bio || '', avatar: '', terms_version: CONFIG.TERMS_VERSION }))],
        reports: (x.reports || []).map(r => ({ id: 'r-' + r.target_id + '-' + r.reporter_id, community_id: r.community_id, reporter_id: me(r.reporter_id), target_type: r.target_type,
          target_id: r.target_id, reason: r.reason, note: r.note || '', status: 'open', created_at: t(r.hoursAgo), resolved_at: null })),
        platform_admins: ['u-me'],
        communities: x.communities.map(c => ({ ...c, owner_id: me(c.owner_id), created_at: t(c.hoursAgo) })),
        memberships: x.memberships.map(m => ({ community_id: m.community_id, user_id: me(m.user_id), role: m.role, status: m.status, points: m.points, joined_at: t(m.joined_hoursAgo) })),
        categories: x.categories,
        posts: x.posts.map(p => ({ ...p, author_id: me(p.author_id), created_at: t(p.hoursAgo) })),
        comments: x.comments.map(c => ({ ...c, author_id: me(c.author_id), created_at: t(c.hoursAgo) })),
        likes: x.likes.map(l => ({ ...l, user_id: me(l.user_id), recipient_id: me(l.recipient_id), created_at: t(l.hoursAgo) })),
        point_events: x.point_events.map(e => ({ ...e, user_id: me(e.user_id), created_at: t(e.hoursAgo) })),
        courses: x.courses.map(k => ({ ...k, created_at: t(k.hoursAgo) })),
        modules: x.modules, lessons: x.lessons,
        progress: x.progress.map(p => ({ user_id: me(p.user_id), lesson_id: p.lesson_id, completed_at: t(p.hoursAgo) })),
        messages: (x.messages || []).map(m => ({ id: m.id, sender_id: me(m.from), recipient_id: me(m.to), body: m.body, created_at: t(m.hoursAgo), read_at: m.read ? t(m.hoursAgo) : null })),
        notifications: seedNotifications(x, me, t),
        events: x.events.map(e => ({ id: e.id, community_id: e.community_id, title: e.title, description: e.description, starts_at: at(e.dayOffset, e.hh, e.mm),
          duration_min: e.duration_min, location_url: e.location_url, created_by: me(e.created_by), created_at: t(e.created_hoursAgo) })),
        rsvps: x.rsvps.map(r => ({ event_id: r.event_id, user_id: me(r.user_id) })),
        answers: (x.answers || []).map(a => ({ community_id: a.community_id, user_id: me(a.user_id), answers: a.answers, created_at: t(a.hoursAgo) }))
      };
    }
    const S = () => db.session;
    const user = id => db.users.find(u => u.id === id) || { id, name: '已離開的成員' };
    const author = id => { const u = user(id); return { id: u.id, name: u.name, avatar: u.avatar || '' }; };
    const mem = (cid, u = S()) => db.memberships.find(m => m.community_id === cid && m.user_id === u);
    const isMember = cid => mem(cid)?.status === 'active';
    const isAdmin = cid => isMember(cid) && mem(cid).role !== 'member';
    const isOwner = cid => mem(cid)?.role === 'owner';
    const isPA = () => db.platform_admins.includes(S());
    const comm = cid => db.communities.find(c => c.id === cid);
    const countLikes = (t, id) => db.likes.filter(l => l.target_type === t && l.target_id === id).length;
    const liked = (t, id) => db.likes.some(l => l.target_type === t && l.target_id === id && l.user_id === S());
    const need = (cond, msg) => { if (!cond) throw new Error(msg || '你沒有權限做這件事'); };
    const since = days => Date.now() - days * 86400000;
    function notify(user, actor, cid, type, post, comment) {
      if (!user || user === actor || mem(cid, user)?.status !== 'active') return;
      db.notifications.push({ id: newId(), user_id: user, actor_id: actor, community_id: cid, type, post_id: post || null, comment_id: comment || null, created_at: nowIso(), read_at: null });
    }
    // 成員加入或審核通過時，用擁有者的名義送出歡迎私訊
    function welcome(cid, uid) {
      const c = comm(cid);
      if (!c || !(c.welcome_message || '').trim() || c.owner_id === uid) return;
      const body = c.welcome_message.split('{名字}').join(user(uid).name).split('{社群}').join(c.name).slice(0, 2000);
      db.messages.push({ id: newId(), sender_id: c.owner_id, recipient_id: uid, body, created_at: nowIso(), read_at: null });
    }
    if (!db.answers) db.answers = [];
    const sharesCommunity = other => db.memberships.some(a => a.user_id === S() && a.status === 'active' &&
      db.memberships.some(b => b.user_id === other && b.status === 'active' && b.community_id === a.community_id));
    const memberCount = cid => db.memberships.filter(m => m.community_id === cid && m.status === 'active').length;
    const dayKey = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
    const weekStart = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };

    return {
      mode: 'demo',
      async getUser() { const u = db.users.find(x => x.id === S()); return u ? { id: u.id, name: u.name, email: u.email, avatar: u.avatar || '', bio: u.bio || '', terms_version: u.terms_version || null, created_at: u.created_at } : null; },
      async signIn(email) {
        const u = db.users.find(x => x.email === email.trim().toLowerCase());
        if (!u) throw new Error('示範模式找不到這個 Email。請用 demo@juchang.app 登入，或改用「註冊」');
        db.session = u.id; save();
      },
      async signUp(email, pw, name) {
        email = email.trim().toLowerCase();
        if (db.users.some(x => x.email === email)) throw new Error('這個 Email 已經註冊過，請直接登入');
        const u = { id: newId(), name: (name || email.split('@')[0]).slice(0, 30), email, created_at: nowIso(), bio: '', avatar: '', terms_version: CONFIG.TERMS_VERSION };
        db.users.push(u); db.session = u.id; save();
      },
      async requestPasswordReset(email) {
        if (!db.users.some(x => x.email === email.trim().toLowerCase())) return; // 不透露 Email 是否存在
      },
      async updatePassword() { need(S(), '請先登入'); },
      onAuthEvent() {},
      async acceptTerms(ver) { const u = db.users.find(x => x.id === S()); need(u, '請先登入'); u.terms_version = ver; save(); },
      async updateProfile(p) {
        const u = db.users.find(x => x.id === S()); need(u, '請先登入');
        if (p.display_name != null) { const n = p.display_name.trim(); if (!n || n.length > 30) throw new Error('名稱要 1～30 個字'); u.name = n; }
        if (p.bio != null) { if (p.bio.length > 300) throw new Error('自我介紹最多 300 字'); u.bio = p.bio; }
        save();
      },
      async uploadAvatar(img) { const u = db.users.find(x => x.id === S()); need(u, '請先登入'); u.avatar = img.dataUrl; save(); return u.avatar; },
      async removeAvatar() { const u = db.users.find(x => x.id === S()); need(u, '請先登入'); u.avatar = ''; save(); },
      async getProfile(uid) { const u = db.users.find(x => x.id === uid); return u ? { id: u.id, name: u.name, avatar: u.avatar || '', bio: u.bio || '', created_at: u.created_at } : null; },
      async signOut() { db.session = null; save(); },
      async reset() { db = seed(); save(); },
      async dbVersion() { return CONFIG.DB_VERSION_REQUIRED; },

      /* 社群 */
      async listCommunities() {
        return db.communities.filter(c => c.status === 'active' || isAdmin(c.id) || isPA())
          .map(c => ({ ...c, member_count: memberCount(c.id) }))
          .sort((a, b) => (b.featured - a.featured) || b.created_at.localeCompare(a.created_at));
      },
      async myMemberships() { return db.memberships.filter(m => m.user_id === S()); },
      async createCommunity(d) {
        need(S(), '請先登入');
        if (!/^[a-z0-9][a-z0-9-]{2,40}$/.test(d.slug)) throw new Error('網址代稱只能用小寫英文、數字和「-」，長度 3–41 字');
        if (db.communities.some(c => c.slug === d.slug)) throw new Error('這個網址代稱已經有人用了，換一個試試');
        const c = { id: newId(), category: '其他', theme_color: '#FFC933', ...d, owner_id: S(), status: 'active', featured: false,
          level_names: [...DEFAULT_LEVEL_NAMES], price_monthly: 0, join_questions: [], welcome_message: '', created_at: nowIso() };
        db.communities.push(c);
        db.memberships.push({ community_id: c.id, user_id: S(), role: 'owner', status: 'active', points: 0, joined_at: nowIso() });
        ['公告', '一般討論', '成果分享', '提問'].forEach((n, i) => db.categories.push({ id: newId(), community_id: c.id, name: n, sort: i, admin_only: i === 0 }));
        save(); return c;
      },
      async updateCommunity(cid, patch) {
        need(isAdmin(cid));
        const allowed = ['name', 'tagline', 'description', 'is_private', 'category', 'theme_color', 'level_names', 'join_questions', 'welcome_message'];
        if (patch.join_questions) {
          need(patch.join_questions.length <= 3, '入會問題最多 3 題');
          need(patch.join_questions.every(q => q.trim() && q.length <= 200), '每個問題請在 1–200 字之間');
        }
        need((patch.welcome_message || '').length <= 1000, '歡迎訊息請在 1000 字以內');
        Object.keys(patch).forEach(k => { if (allowed.includes(k)) comm(cid)[k] = patch[k]; });
        save();
      },
      async deleteCommunity(cid) {
        need(isOwner(cid), '只有擁有者可以刪除社群');
        db.communities = db.communities.filter(c => c.id !== cid);
        for (const k of ['memberships', 'categories', 'posts', 'comments', 'likes', 'point_events', 'courses', 'lessons', 'events', 'answers'])
          db[k] = db[k].filter(r => r.community_id !== cid);
        save();
      },
      async join(cid, answers) {
        need(S(), '請先登入');
        if (mem(cid)?.status === 'banned') throw new Error('你已被這個社群的管理員封鎖，無法加入');
        if (mem(cid)) return mem(cid).status;
        const qs = comm(cid).join_questions || [];
        qs.forEach((q, i) => {
          need((answers?.[i] || '').trim(), '請回答所有入會問題');
          need(answers[i].length <= 500, '每題回答請在 500 字以內');
        });
        const status = comm(cid).is_private ? 'pending' : 'active';
        db.memberships.push({ community_id: cid, user_id: S(), role: 'member', status, points: 0, joined_at: nowIso() });
        if (qs.length) db.answers.push({ community_id: cid, user_id: S(), answers: qs.map((q, i) => ({ q, a: answers[i].trim() })), created_at: nowIso() });
        if (status === 'active') welcome(cid, S());
        save(); return status;
      },
      async listAnswers(cid) { return isAdmin(cid) ? db.answers.filter(a => a.community_id === cid) : []; },
      async leave(cid) { need(mem(cid)?.role !== 'owner', '擁有者不能退出自己的社群'); need(mem(cid)?.status !== 'banned'); db.memberships = db.memberships.filter(m => !(m.community_id === cid && m.user_id === S())); save(); },

      /* 分類 */
      async listCategories(cid) { return db.categories.filter(c => c.community_id === cid).sort((a, b) => a.sort - b.sort); },
      async createCategory(cid, name, admin_only) {
        need(isAdmin(cid));
        db.categories.push({ id: newId(), community_id: cid, name, admin_only: !!admin_only, sort: db.categories.filter(c => c.community_id === cid).length });
        save();
      },
      async updateCategory(id, patch) { const c = db.categories.find(x => x.id === id); need(isAdmin(c.community_id)); Object.assign(c, patch); save(); },
      async deleteCategory(id) {
        const c = db.categories.find(x => x.id === id); need(isAdmin(c.community_id));
        db.categories = db.categories.filter(x => x.id !== id);
        db.posts.forEach(p => { if (p.category_id === id) p.category_id = null; });
        save();
      },

      /* 動態牆 */
      async listPosts(cid) {
        if (!isMember(cid)) return [];
        return db.posts.filter(p => p.community_id === cid).map(p => ({ ...p, author: author(p.author_id), like_count: countLikes('post', p.id), liked: liked('post', p.id),
          comment_count: db.comments.filter(c => c.post_id === p.id).length }))
          .sort((a, b) => (b.pinned - a.pinned) || b.created_at.localeCompare(a.created_at));
      },
      async createPost(d) {
        need(isMember(d.community_id));
        const cat = db.categories.find(c => c.id === d.category_id);
        if (cat?.admin_only && !isAdmin(d.community_id)) throw new Error(`只有管理員可以在「${cat.name}」發文`);
        const p = { id: newId(), images: [], mentions: [], ...d, author_id: S(), pinned: false, created_at: nowIso() };
        db.posts.push(p);
        const done = new Set(p.mentions);
        p.mentions.forEach(u => notify(u, S(), p.community_id, 'mention', p.id));
        if (cat?.admin_only) db.memberships.filter(m => m.community_id === p.community_id && m.status === 'active' && !done.has(m.user_id))
          .forEach(m => notify(m.user_id, S(), p.community_id, 'announcement', p.id));
        save();
      },
      async togglePin(id) { const p = db.posts.find(x => x.id === id); need(isAdmin(p.community_id)); p.pinned = !p.pinned; save(); },
      async updatePost(id, patch) {
        const p = db.posts.find(x => x.id === id); need(p, '找不到這篇貼文'); need(p.author_id === S(), '只能編輯自己的貼文');
        if (patch.category_id && patch.category_id !== p.category_id) {
          const cat = db.categories.find(c => c.id === patch.category_id);
          need(cat && cat.community_id === p.community_id && (!cat.admin_only || isAdmin(p.community_id)), '不能把貼文移到這個分類');
        }
        Object.assign(p, { title: patch.title, body: patch.body, category_id: patch.category_id || p.category_id, images: patch.images ?? p.images ?? [], edited_at: nowIso() }); save();
      },
      async updateComment(id, body) {
        const c = db.comments.find(x => x.id === id); need(c && c.author_id === S(), '只能編輯自己的留言');
        c.body = body; c.edited_at = nowIso(); save();
      },
      async deleteComment(id) {
        const c = db.comments.find(x => x.id === id); need(c && (c.author_id === S() || isAdmin(c.community_id)));
        const ids = [id, ...db.comments.filter(x => x.parent_id === id).map(x => x.id)];
        db.comments = db.comments.filter(x => !ids.includes(x.id));
        db.likes = db.likes.filter(l => !(l.target_type === 'comment' && ids.includes(l.target_id)));
        save();
      },
      async report(type, id, reason, note) {
        const t = (type === 'post' ? db.posts : db.comments).find(x => x.id === id); need(t, '找不到這則內容，可能已經被刪除');
        need(isMember(t.community_id), '只有成員可以檢舉'); need(t.author_id !== S(), '不能檢舉自己的內容');
        db.reports = db.reports.filter(r => !(r.reporter_id === S() && r.target_type === type && r.target_id === id));
        db.reports.push({ id: newId(), community_id: t.community_id, reporter_id: S(), target_type: type, target_id: id, reason, note: (note || '').trim(), status: 'open', created_at: nowIso(), resolved_at: null });
        save();
      },
      async listReports(cid) {
        need(isAdmin(cid), '只有管理員可以查看檢舉');
        return db.reports.filter(r => r.community_id === cid).map(r => {
          const t = (r.target_type === 'post' ? db.posts : db.comments).find(x => x.id === r.target_id);
          return { ...r, post_id: t ? (r.target_type === 'post' ? t.id : t.post_id) : null, reporter_name: user(r.reporter_id).name,
            author_id: t?.author_id, author_name: t ? user(t.author_id).name : '',
            excerpt: t ? (r.target_type === 'post' ? `${t.title}：${t.body}` : t.body).slice(0, 160) : '（內容已刪除）', target_exists: !!t };
        }).sort((a, b) => ((b.status === 'open') - (a.status === 'open')) || b.created_at.localeCompare(a.created_at));
      },
      async resolveReport(rid, act) {
        const r = db.reports.find(x => x.id === rid); need(r, '找不到這筆檢舉'); need(isAdmin(r.community_id), '只有管理員可以處理檢舉');
        if (act === 'remove') { if (r.target_type === 'post') await this.deletePost(r.target_id); else await this.deleteComment(r.target_id); }
        db.reports.filter(x => x.target_type === r.target_type && x.target_id === r.target_id && x.status === 'open')
          .forEach(x => { x.status = act === 'remove' ? 'removed' : 'kept'; x.resolved_at = nowIso(); });
        save();
      },
      async deletePost(id) {
        const p = db.posts.find(x => x.id === id); need(p.author_id === S() || isAdmin(p.community_id));
        const cids = db.comments.filter(c => c.post_id === id).map(c => c.id);
        db.posts = db.posts.filter(x => x.id !== id); db.comments = db.comments.filter(c => c.post_id !== id);
        db.likes = db.likes.filter(l => !(l.target_type === 'post' && l.target_id === id) && !(l.target_type === 'comment' && cids.includes(l.target_id)));
        save();
      },
      async listComments(pid) {
        return db.comments.filter(c => c.post_id === pid).sort((a, b) => a.created_at.localeCompare(b.created_at))
          .map(c => ({ ...c, author: author(c.author_id), like_count: countLikes('comment', c.id), liked: liked('comment', c.id) }));
      },
      async createComment(d) {
        need(isMember(d.community_id));
        const c = { id: newId(), mentions: [], ...d, author_id: S(), created_at: nowIso() };
        db.comments.push(c);
        const done = new Set();
        c.mentions.forEach(u => { if (!done.has(u)) { notify(u, S(), c.community_id, 'mention', c.post_id, c.id); done.add(u); } });
        const parent = c.parent_id && db.comments.find(x => x.id === c.parent_id), post = db.posts.find(x => x.id === c.post_id);
        if (parent && !done.has(parent.author_id)) { notify(parent.author_id, S(), c.community_id, 'reply', c.post_id, c.id); done.add(parent.author_id); }
        if (post && !done.has(post.author_id)) notify(post.author_id, S(), c.community_id, 'comment', c.post_id, c.id);
        save();
      },
      async toggleLike(type, id) {
        const t = (type === 'post' ? db.posts : db.comments).find(x => x.id === id);
        if (!t) throw new Error('找不到這則內容');
        if (t.author_id === S()) throw new Error('不能幫自己按讚');
        need(isMember(t.community_id), '只有成員可以按讚');
        const i = db.likes.findIndex(l => l.target_type === type && l.target_id === id && l.user_id === S());
        const rm = mem(t.community_id, t.author_id);
        const delta = i >= 0 ? -1 : 1;
        if (i >= 0) db.likes.splice(i, 1);
        else {
          db.likes.push({ user_id: S(), target_type: type, target_id: id, community_id: t.community_id, recipient_id: t.author_id, created_at: nowIso() });
          notify(t.author_id, S(), t.community_id, type === 'post' ? 'like_post' : 'like_comment', type === 'post' ? id : t.post_id, type === 'post' ? null : id);
        }
        if (rm) rm.points = Math.max(0, rm.points + delta);
        db.point_events.push({ community_id: t.community_id, user_id: t.author_id, delta, created_at: nowIso() });
        save();
      },
      async leaderboard(cid, days) {
        if (!isMember(cid)) return [];
        const from = days ? since(days) : 0;
        return db.memberships.filter(m => m.community_id === cid && m.status === 'active').map(m => ({
          user_id: m.user_id, name: user(m.user_id).name, avatar: user(m.user_id).avatar || '', total_points: m.points,
          points: days ? db.point_events.filter(e => e.community_id === cid && e.user_id === m.user_id && new Date(e.created_at) >= from).reduce((s, e) => s + e.delta, 0) : m.points
        })).sort((a, b) => b.points - a.points).slice(0, 50);
      },

      /* 成員 */
      async listMembers(cid) {
        if (!isMember(cid)) return [];
        return db.memberships.filter(m => m.community_id === cid && (m.status === 'active' || isAdmin(cid))).map(m => ({ ...m, name: user(m.user_id).name, avatar: user(m.user_id).avatar || '' }));
      },
      async setMemberStatus(cid, uid, status) {
        need(isAdmin(cid), '只有管理員可以管理成員');
        const m = mem(cid, uid); need(m, '找不到這位成員');
        need(m.role !== 'owner', '不能變更擁有者');
        need(m.role !== 'admin' || isOwner(cid), '只有擁有者可以移除管理員');
        if (status === 'removed') { db.memberships = db.memberships.filter(x => x !== m); db.answers = db.answers.filter(a => !(a.community_id === cid && a.user_id === uid)); }
        else {
          const approved = m.status === 'pending' && status === 'active';
          if (approved) m.joined_at = nowIso();
          m.status = status;
          if (approved) { db.notifications.push({ id: newId(), user_id: uid, actor_id: S(), community_id: cid, type: 'approved', post_id: null, comment_id: null, created_at: nowIso(), read_at: null }); welcome(cid, uid); }
        }
        save();
      },
      async setMemberRole(cid, uid, role) {
        need(isOwner(cid), '只有擁有者可以指派管理員');
        const m = mem(cid, uid); need(m && m.role !== 'owner', '找不到這位成員');
        m.role = role; save();
      },
      async communityDashboard(cid) {
        need(isAdmin(cid), '只有管理員可以查看後台數據');
        const s7 = since(7), inC = r => r.community_id === cid, recent = r => new Date(r.created_at) >= s7;
        const posts = db.posts.filter(inC), comments = db.comments.filter(inC), likes = db.likes.filter(inC);
        const active = new Set([...posts.filter(recent).map(p => p.author_id), ...comments.filter(recent).map(c => c.author_id), ...likes.filter(recent).map(l => l.user_id)]);
        const daily = [];
        for (let i = 13; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i); const k = dayKey(d);
          daily.push({ day: k, count: [...posts, ...comments].filter(r => dayKey(r.created_at) === k).length });
        }
        const ms = db.memberships.filter(inC);
        const openReports = new Set(db.reports.filter(r => r.community_id === cid && r.status === 'open').map(r => r.target_type + r.target_id));
        return { members: ms.filter(m => m.status === 'active').length, pending: ms.filter(m => m.status === 'pending').length,
          banned: ms.filter(m => m.status === 'banned').length, reports_open: openReports.size,
          new_members_7d: ms.filter(m => m.status === 'active' && new Date(m.joined_at) >= s7).length,
          posts_7d: posts.filter(recent).length, comments_7d: comments.filter(recent).length, likes_7d: likes.filter(recent).length,
          active_7d: active.size, daily };
      },

      /* 課程 */
      async listCourses(cid) {
        if (!isMember(cid)) return [];
        return db.courses.filter(c => c.community_id === cid && (c.published || isAdmin(cid))).sort((a, b) => a.sort - b.sort).map(c => ({
          ...c, modules: db.modules.filter(m => m.course_id === c.id).sort((a, b) => a.sort - b.sort).map(m => ({
            ...m, lessons: db.lessons.filter(l => l.module_id === m.id).sort((a, b) => a.sort - b.sort).map(l => ({ id: l.id, title: l.title, sort: l.sort }))
          }))
        }));
      },
      async getLesson(id) { return db.lessons.find(l => l.id === id) || null; },
      async listProgress() { return db.progress.filter(p => p.user_id === S()).map(p => p.lesson_id); },
      async toggleComplete(lid) {
        const i = db.progress.findIndex(p => p.user_id === S() && p.lesson_id === lid);
        if (i >= 0) db.progress.splice(i, 1); else db.progress.push({ user_id: S(), lesson_id: lid, completed_at: nowIso() });
        save();
      },
      async createCourse(d) { need(isAdmin(d.community_id)); const c = { id: newId(), published: true, sort: db.courses.length, created_at: nowIso(), ...d }; db.courses.push(c); save(); return c; },
      async updateCourse(id, patch) { const c = db.courses.find(x => x.id === id); need(isAdmin(c.community_id)); Object.assign(c, patch); save(); },
      async createModule(d) { const c = db.courses.find(x => x.id === d.course_id); need(isAdmin(c.community_id)); db.modules.push({ id: newId(), sort: db.modules.length, ...d }); save(); },
      async createLesson(d) {
        need(isAdmin(d.community_id)); need(!d.video_url || /^https?:\/\//i.test(d.video_url), '影片網址要以 https:// 開頭');
        const l = { id: newId(), sort: db.lessons.length, ...d }; db.lessons.push(l); save(); return l;
      },
      async deleteCourse(id) {
        const c = db.courses.find(x => x.id === id); need(c && isAdmin(c.community_id));
        const mids = db.modules.filter(m => m.course_id === id).map(m => m.id), lids = db.lessons.filter(l => l.course_id === id).map(l => l.id);
        db.courses = db.courses.filter(x => x.id !== id); db.modules = db.modules.filter(m => !mids.includes(m.id));
        db.lessons = db.lessons.filter(l => !lids.includes(l.id)); db.progress = db.progress.filter(p => !lids.includes(p.lesson_id)); save();
      },
      async updateModule(id, patch) {
        const m = db.modules.find(x => x.id === id), c = m && db.courses.find(x => x.id === m.course_id); need(c && isAdmin(c.community_id));
        ['title', 'drip_days'].forEach(k => { if (k in patch) m[k] = patch[k]; }); save();
      },
      async deleteModule(id) {
        const m = db.modules.find(x => x.id === id), c = m && db.courses.find(x => x.id === m.course_id); need(c && isAdmin(c.community_id));
        const lids = db.lessons.filter(l => l.module_id === id).map(l => l.id);
        db.modules = db.modules.filter(x => x.id !== id); db.lessons = db.lessons.filter(l => l.module_id !== id); db.progress = db.progress.filter(p => !lids.includes(p.lesson_id)); save();
      },
      async updateLesson(id, patch) {
        const l = db.lessons.find(x => x.id === id); need(l && isAdmin(l.community_id));
        if (patch.module_id) { const md = db.modules.find(x => x.id === patch.module_id); need(md && md.course_id === l.course_id, '單元只能放在同一門課的章節裡'); }
        need(!patch.video_url || /^https?:\/\//i.test(patch.video_url), '影片網址要以 https:// 開頭');
        ['title', 'video_url', 'body', 'module_id'].forEach(k => { if (k in patch) l[k] = patch[k]; }); save();
      },
      async deleteLesson(id) {
        const l = db.lessons.find(x => x.id === id); need(l && isAdmin(l.community_id));
        db.lessons = db.lessons.filter(x => x.id !== id); db.progress = db.progress.filter(p => p.lesson_id !== id); save();
      },
      async reorder(kind, ids) {
        const table = { course: db.courses, module: db.modules, lesson: db.lessons }[kind], rows = ids.map(i => table.find(x => x.id === i));
        need(rows.every(Boolean), '只能排序同一層的項目');
        const parent = r => kind === 'course' ? r.community_id : kind === 'module' ? r.course_id : r.module_id;
        need(new Set(rows.map(parent)).size === 1, '只能排序同一層的項目');
        const cid = kind === 'module' ? db.courses.find(c => c.id === rows[0].course_id).community_id : rows[0].community_id;
        need(isAdmin(cid), '只有管理員可以調整課程順序');
        rows.forEach((r, i) => r.sort = i + 1); save();
      },
      async courseProgress(cid) {
        need(isAdmin(cid), '只有管理員可以查看學員進度');
        const out = new Map();
        for (const p of db.progress) {
          const l = db.lessons.find(x => x.id === p.lesson_id);
          if (!l || l.community_id !== cid || mem(cid, p.user_id)?.status !== 'active') continue;
          const k = p.user_id + '|' + l.course_id, r = out.get(k) || { user_id: p.user_id, course_id: l.course_id, done: 0, last_at: p.completed_at };
          r.done++; if (p.completed_at > r.last_at) r.last_at = p.completed_at; out.set(k, r);
        }
        return [...out.values()];
      },
      async exportMembers(cid) {
        need(isOwner(cid) && isMember(cid), '只有擁有者可以匯出成員名單');
        return db.memberships.filter(m => m.community_id === cid && ['active', 'pending'].includes(m.status))
          .sort((a, b) => a.status.localeCompare(b.status) || a.joined_at.localeCompare(b.joined_at))
          .map(m => ({ user_id: m.user_id, display_name: user(m.user_id).name, email: user(m.user_id).email || '', role: m.role, status: m.status, points: m.points,
            joined_at: m.joined_at, answers: db.answers.find(a => a.community_id === cid && a.user_id === m.user_id)?.answers || [] }));
      },

      /* 行事曆 */
      async listEvents(cid) {
        if (!isMember(cid)) return [];
        return db.events.filter(e => e.community_id === cid).sort((a, b) => a.starts_at.localeCompare(b.starts_at)).map(e => ({
          ...e, going_count: db.rsvps.filter(r => r.event_id === e.id).length, going: db.rsvps.some(r => r.event_id === e.id && r.user_id === S())
        }));
      },
      async createEvent(d) {
        need(isAdmin(d.community_id));
        const e = { id: newId(), created_by: S(), created_at: nowIso(), ...d }; db.events.push(e);
        db.memberships.filter(m => m.community_id === d.community_id && m.status === 'active' && m.user_id !== S()).forEach(m =>
          db.notifications.push({ id: newId(), user_id: m.user_id, actor_id: S(), community_id: d.community_id, type: 'event_new', post_id: null, comment_id: null, event_id: e.id, created_at: nowIso(), read_at: null }));
        save();
      },
      async deleteEvent(id) { const e = db.events.find(x => x.id === id); need(isAdmin(e.community_id)); db.events = db.events.filter(x => x.id !== id); db.rsvps = db.rsvps.filter(r => r.event_id !== id); save(); },
      async toggleRsvp(eid) {
        const i = db.rsvps.findIndex(r => r.event_id === eid && r.user_id === S());
        if (i >= 0) db.rsvps.splice(i, 1); else db.rsvps.push({ event_id: eid, user_id: S() });
        save();
      },

      /* 通知 */
      async unread() {
        // 已報名、24 小時內開始的活動補一則提醒（和資料庫 gen_event_reminders 相同規則）
        const soon = Date.now() + 86400000;
        db.rsvps.filter(r => r.user_id === S()).forEach(r => {
          const e = db.events.find(x => x.id === r.event_id), t = e && new Date(e.starts_at).getTime();
          if (!e || t <= Date.now() || t > soon || !isMember(e.community_id)) return;
          if (db.notifications.some(n => n.user_id === S() && n.event_id === e.id && n.type === 'event_soon')) return;
          db.notifications.push({ id: newId(), user_id: S(), actor_id: null, community_id: e.community_id, type: 'event_soon', post_id: null, comment_id: null, event_id: e.id, created_at: nowIso(), read_at: null });
          save();
        });
        return { notifications: db.notifications.filter(n => n.user_id === S() && !n.read_at).length,
          messages: db.messages.filter(m => m.recipient_id === S() && !m.read_at).length };
      },
      async listNotifications() {
        return db.notifications.filter(n => n.user_id === S()).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 40).map(n => {
          const a = n.actor_id ? user(n.actor_id) : { name: '', avatar: '' }, c = comm(n.community_id), p = db.posts.find(x => x.id === n.post_id), k = db.comments.find(x => x.id === n.comment_id);
          const e = n.event_id ? db.events.find(x => x.id === n.event_id) : null;
          return { ...n, actor_name: a.name, actor_avatar: a.avatar || '', community_slug: c?.slug, community_name: c?.name, post_title: p?.title || null,
            snippet: (k?.body || p?.body || '').slice(0, 80), event_title: e?.title || null, event_starts_at: e?.starts_at || null };
        });
      },
      async markNotificationsRead(ids) {
        db.notifications.forEach(n => { if (n.user_id === S() && !n.read_at && (!ids || ids.includes(n.id))) n.read_at = nowIso(); }); save();
      },
      /* 私訊 */
      async canMessage(other) { return !!S() && other !== S() && sharesCommunity(other); },
      async inbox() {
        const mine = db.messages.filter(m => m.sender_id === S() || m.recipient_id === S()), by = new Map();
        mine.sort((a, b) => b.created_at.localeCompare(a.created_at)).forEach(m => { const o = m.sender_id === S() ? m.recipient_id : m.sender_id; if (!by.has(o)) by.set(o, m); });
        return [...by.entries()].map(([o, m]) => ({ other_id: o, other_name: user(o).name, other_avatar: user(o).avatar || '', last_body: m.body.slice(0, 80), last_at: m.created_at,
          last_from_me: m.sender_id === S(), unread: mine.filter(x => x.sender_id === o && x.recipient_id === S() && !x.read_at).length }));
      },
      async thread(other) {
        return db.messages.filter(m => (m.sender_id === S() && m.recipient_id === other) || (m.sender_id === other && m.recipient_id === S()))
          .sort((a, b) => a.created_at.localeCompare(b.created_at));
      },
      async sendMessage(other, body) {
        need(sharesCommunity(other), '只能傳私訊給跟你在同一個社群的成員');
        body = body.trim(); if (!body) throw new Error('訊息不能是空的'); if (body.length > 2000) throw new Error('訊息最多 2000 字');
        db.messages.push({ id: newId(), sender_id: S(), recipient_id: other, body, created_at: nowIso(), read_at: null }); save();
      },
      async markThreadRead(other) { db.messages.forEach(m => { if (m.sender_id === other && m.recipient_id === S() && !m.read_at) m.read_at = nowIso(); }); save(); },
      /* 圖片與搜尋 */
      async uploadPostImage(img) { need(S(), '請先登入'); return img.dataUrl; },
      async searchPosts(cid, q) {
        need(isMember(cid), '只有成員可以搜尋這個社群');
        q = q.trim().toLowerCase(); if (!q) return [];
        const hit = p => (p.title + ' ' + p.body).toLowerCase().includes(q) || db.comments.some(c => c.post_id === p.id && c.body.toLowerCase().includes(q));
        return (await this.listPosts(cid)).filter(hit);
      },

      /* 總控台 */
      async isPlatformAdmin() { return isPA(); },
      async platformOverview() {
        need(isPA(), '你沒有總控台權限');
        const s7 = since(7), weekly = [], cur = weekStart(new Date());
        for (let i = 7; i >= 0; i--) {
          const w = new Date(cur); w.setDate(w.getDate() - i * 7); const k = dayKey(w);
          weekly.push({ week: k, communities: db.communities.filter(c => dayKey(weekStart(c.created_at)) === k).length,
            users: db.users.filter(u => dayKey(weekStart(u.created_at)) === k).length });
        }
        return { users: db.users.length, users_7d: db.users.filter(u => new Date(u.created_at) >= s7).length,
          communities: db.communities.length, communities_7d: db.communities.filter(c => new Date(c.created_at) >= s7).length,
          posts_7d: db.posts.filter(p => new Date(p.created_at) >= s7).length,
          pending: db.memberships.filter(m => m.status === 'pending').length, db_version: CONFIG.DB_VERSION_REQUIRED, weekly };
      },
      async adminCommunities() {
        need(isPA(), '你沒有總控台權限');
        const s7 = since(7);
        return db.communities.map(c => {
          const posts = db.posts.filter(p => p.community_id === c.id), o = user(c.owner_id);
          const last = [c.created_at, ...posts.map(p => p.created_at), ...db.comments.filter(k => k.community_id === c.id).map(k => k.created_at)].sort().pop();
          return { ...c, owner_name: o.name, owner_email: o.email || '', member_count: memberCount(c.id),
            pending_count: db.memberships.filter(m => m.community_id === c.id && m.status === 'pending').length,
            post_count: posts.length, posts_7d: posts.filter(p => new Date(p.created_at) >= s7).length, last_activity: last };
        }).sort((a, b) => b.created_at.localeCompare(a.created_at));
      },
      async adminRecentUsers(lim = 20) {
        need(isPA(), '你沒有總控台權限');
        return db.users.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, lim).map(u => ({
          id: u.id, display_name: u.name, email: u.email, created_at: u.created_at,
          joined_count: db.memberships.filter(m => m.user_id === u.id && m.status === 'active').length,
          owned_count: db.communities.filter(c => c.owner_id === u.id).length }));
      },
      async adminSetCommunity(cid, patch) {
        need(isPA(), '你沒有總控台權限');
        const c = comm(cid); if (patch.status) c.status = patch.status; if (patch.featured != null) c.featured = patch.featured; save();
      }
    };
  }

  /* =====================================================================
     B. Supabase（正式資料庫）
     ===================================================================== */
  function makeSupabaseApi() {
    const sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    let me = null;
    const translate = m => {
      if (/communities_slug_key|duplicate key.*slug/.test(m)) return '這個網址代稱已經有人用了，換一個試試';
      if (/communities_slug_check/.test(m)) return '網址代稱只能用小寫英文、數字和「-」，長度 3–41 字';
      if (/Invalid login credentials/.test(m)) return 'Email 或密碼不正確';
      if (/Email not confirmed/.test(m)) return '請先到信箱點驗證信，再回來登入';
      if (/User already registered/.test(m)) return '這個 Email 已經註冊過，請直接登入';
      if (/row-level security|permission denied/.test(m)) return '你沒有權限做這件事';
      if (/Could not find the function|does not exist/.test(m)) return '資料庫還沒升級到最新版本，請執行最新的 SQL 升級檔';
      return m;
    };
    const ok = ({ data, error }) => { if (error) throw new Error(translate(error.message)); return data; };
    const prof = p => p ? { id: p.id, name: p.display_name, avatar: p.avatar_url || '' } : { id: null, name: '已離開的成員' };
    const PF = 'id,display_name,avatar_url';
    async function likeInfo(type, ids) {
      const m = {}; if (!ids.length) return m;
      ok(await sb.from('likes').select('target_id,user_id').eq('target_type', type).in('target_id', ids))
        .forEach(r => { m[r.target_id] ??= { n: 0, mine: false }; m[r.target_id].n++; if (r.user_id === me?.id) m[r.target_id].mine = true; });
      return m;
    }
    const toggleRow = async (table, match) => {
      let q = sb.from(table).select('*', { count: 'exact', head: true });
      Object.entries(match).forEach(([k, v]) => q = q.eq(k, v));
      const { count, error } = await q; if (error) throw new Error(translate(error.message));
      if (count) { let d = sb.from(table).delete(); Object.entries(match).forEach(([k, v]) => d = d.eq(k, v)); ok(await d); }
      else ok(await sb.from(table).insert(match));
    };
    return {
      mode: 'supabase',
      async getUser() {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) { me = null; return null; }
        const p = ok(await sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle());
        me = { id: session.user.id, name: p?.display_name || session.user.email, email: session.user.email,
          avatar: p?.avatar_url || '', bio: p?.bio || '', terms_version: p?.terms_version || null, created_at: p?.created_at };
        return me;
      },
      async signIn(email, password) { ok(await sb.auth.signInWithPassword({ email, password })); },
      async signUp(email, password, name) {
        const d = ok(await sb.auth.signUp({ email, password, options: { data: { display_name: name, terms_version: CONFIG.TERMS_VERSION } } }));
        if (!d.session) throw new Error('註冊成功！請到信箱點驗證信，再回來登入');
      },
      async requestPasswordReset(email) {
        ok(await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: location.origin + location.pathname }));
      },
      async updatePassword(password) { ok(await sb.auth.updateUser({ password })); },
      onAuthEvent(fn) { sb.auth.onAuthStateChange((event) => fn(event)); },
      async acceptTerms(ver) { ok(await sb.rpc('accept_terms', { ver })); },
      async updateProfile(p) {
        const patch = {};
        if (p.display_name != null) { const n = p.display_name.trim(); if (!n || n.length > 30) throw new Error('名稱要 1～30 個字'); patch.display_name = n; }
        if (p.bio != null) { if (p.bio.length > 300) throw new Error('自我介紹最多 300 字'); patch.bio = p.bio; }
        ok(await sb.from('profiles').update(patch).eq('id', me.id));
      },
      async uploadAvatar(img) {
        const path = `${me.id}/avatar.jpg`;
        const { error } = await sb.storage.from('avatars').upload(path, img.blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' });
        if (error) throw new Error(/row-level security|Unauthorized/.test(error.message) ? '頭像上傳失敗：沒有權限，請確認已執行 v0.3.0 資料庫升級' : '頭像上傳失敗：' + error.message);
        const url = sb.storage.from('avatars').getPublicUrl(path).data.publicUrl + '?v=' + Date.now();
        ok(await sb.from('profiles').update({ avatar_url: url }).eq('id', me.id));
        return url;
      },
      async removeAvatar() {
        await sb.storage.from('avatars').remove([`${me.id}/avatar.jpg`]);
        ok(await sb.from('profiles').update({ avatar_url: null }).eq('id', me.id));
      },
      async getProfile(uid) {
        const p = ok(await sb.from('profiles').select('id,display_name,avatar_url,bio,created_at').eq('id', uid).maybeSingle());
        return p ? { id: p.id, name: p.display_name, avatar: p.avatar_url || '', bio: p.bio || '', created_at: p.created_at } : null;
      },
      async signOut() { await sb.auth.signOut(); me = null; },
      async dbVersion() {
        const { data, error } = await sb.from('schema_migrations').select('version').order('version', { ascending: false }).limit(1);
        return error ? '0.1.0' : (data[0]?.version || '0.1.0');
      },

      async listCommunities() {
        const cs = ok(await sb.from('communities').select('*').order('featured', { ascending: false }).order('created_at', { ascending: false }));
        const st = Object.fromEntries(ok(await sb.from('community_stats').select('*')).map(s => [s.community_id, s.member_count]));
        return cs.map(c => ({ ...c, member_count: st[c.id] || 0 }));
      },
      async myMemberships() { return me ? ok(await sb.from('memberships').select('*').eq('user_id', me.id)) : []; },
      async createCommunity(d) { return ok(await sb.from('communities').insert({ ...d, owner_id: me.id }).select().single()); },
      async updateCommunity(cid, patch) { ok(await sb.from('communities').update(patch).eq('id', cid)); },
      async deleteCommunity(cid) { ok(await sb.from('communities').delete().eq('id', cid)); },
      async join(cid, answers) { return ok(await sb.rpc('join_community', { cid, p_answers: answers && answers.length ? answers : null })); },
      async listAnswers(cid) { return ok(await sb.from('membership_answers').select('*').eq('community_id', cid)); },
      async leave(cid) { ok(await sb.from('memberships').delete().eq('community_id', cid).eq('user_id', me.id)); },

      async listCategories(cid) { return ok(await sb.from('categories').select('*').eq('community_id', cid).order('sort')); },
      async createCategory(cid, name, admin_only) {
        const n = ok(await sb.from('categories').select('id').eq('community_id', cid)).length;
        ok(await sb.from('categories').insert({ community_id: cid, name, admin_only: !!admin_only, sort: n }));
      },
      async updateCategory(id, patch) { ok(await sb.from('categories').update(patch).eq('id', id)); },
      async deleteCategory(id) { ok(await sb.from('categories').delete().eq('id', id)); },

      async listPosts(cid) {
        const ps = ok(await sb.from('posts').select(`*, author:profiles(${PF})`).eq('community_id', cid)
          .order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(100));
        const ids = ps.map(p => p.id), li = await likeInfo('post', ids), cc = {};
        if (ids.length) ok(await sb.from('comments').select('post_id').in('post_id', ids)).forEach(c => cc[c.post_id] = (cc[c.post_id] || 0) + 1);
        return ps.map(p => ({ ...p, author: prof(p.author), like_count: li[p.id]?.n || 0, liked: !!li[p.id]?.mine, comment_count: cc[p.id] || 0 }));
      },
      async createPost(d) { ok(await sb.from('posts').insert({ images: [], mentions: [], ...d, author_id: me.id })); },
      async togglePin(id) { const p = ok(await sb.from('posts').select('pinned').eq('id', id).single()); ok(await sb.from('posts').update({ pinned: !p.pinned }).eq('id', id)); },
      async deletePost(id) { ok(await sb.from('posts').delete().eq('id', id)); },
      async updatePost(id, patch) {
        const upd = { title: patch.title, body: patch.body, category_id: patch.category_id };
        if (patch.images) upd.images = patch.images;
        const d = ok(await sb.from('posts').update(upd).eq('id', id).select('id'));
        if (!d.length) throw new Error('只能編輯自己的貼文');
      },
      async updateComment(id, body) {
        const d = ok(await sb.from('comments').update({ body }).eq('id', id).select('id'));
        if (!d.length) throw new Error('只能編輯自己的留言');
      },
      async deleteComment(id) { ok(await sb.from('comments').delete().eq('id', id)); },
      async report(type, id, reason, note) { ok(await sb.rpc('report_content', { t_type: type, t_id: id, p_reason: reason, p_note: note || null })); },
      async listReports(cid) { return ok(await sb.rpc('community_reports', { cid })); },
      async resolveReport(rid, act) { ok(await sb.rpc('resolve_report', { rid, act })); },
      async listComments(pid) {
        const cs = ok(await sb.from('comments').select(`*, author:profiles(${PF})`).eq('post_id', pid).order('created_at'));
        const li = await likeInfo('comment', cs.map(c => c.id));
        return cs.map(c => ({ ...c, author: prof(c.author), like_count: li[c.id]?.n || 0, liked: !!li[c.id]?.mine }));
      },
      async createComment(d) { ok(await sb.from('comments').insert({ ...d, author_id: me.id })); },
      async toggleLike(type, id) { await toggleRow('likes', { user_id: me.id, target_type: type, target_id: id }); },
      async leaderboard(cid, days) {
        return ok(await sb.rpc('leaderboard', { cid, days: days || null })).map(r => ({ user_id: r.user_id, name: r.display_name, avatar: r.avatar_url || '', points: Number(r.points), total_points: r.total_points }));
      },

      async listMembers(cid) {
        return ok(await sb.from('memberships').select(`*, profile:profiles(${PF})`).eq('community_id', cid).order('points', { ascending: false }))
          .map(m => ({ ...m, name: m.profile?.display_name || '成員', avatar: m.profile?.avatar_url || '' }));
      },
      async setMemberStatus(cid, uid, status) { ok(await sb.rpc('set_member_status', { cid, uid, p_status: status })); },
      async setMemberRole(cid, uid, role) { ok(await sb.rpc('set_member_role', { cid, uid, p_role: role })); },
      async communityDashboard(cid) { return ok(await sb.rpc('community_dashboard', { cid })); },

      async listCourses(cid) {
        const cs = ok(await sb.from('courses').select('*, modules(*, lessons(id,title,sort))').eq('community_id', cid).order('sort'));
        return cs.map(c => ({ ...c, modules: (c.modules || []).sort((a, b) => a.sort - b.sort).map(m => ({ ...m, lessons: (m.lessons || []).sort((a, b) => a.sort - b.sort) })) }));
      },
      async getLesson(id) { return ok(await sb.from('lessons').select('*').eq('id', id).maybeSingle()); },
      async listProgress() { return ok(await sb.from('lesson_progress').select('lesson_id').eq('user_id', me.id)).map(r => r.lesson_id); },
      async toggleComplete(lid) { await toggleRow('lesson_progress', { user_id: me.id, lesson_id: lid }); },
      async createCourse(d) { return ok(await sb.from('courses').insert(d).select().single()); },
      async updateCourse(id, patch) { ok(await sb.from('courses').update(patch).eq('id', id)); },
      async createModule(d) { ok(await sb.from('modules').insert(d)); },
      async createLesson(d) { return ok(await sb.from('lessons').insert(d).select().single()); },
      async deleteCourse(id) { ok(await sb.from('courses').delete().eq('id', id)); },
      async updateModule(id, patch) { ok(await sb.from('modules').update(patch).eq('id', id)); },
      async deleteModule(id) { ok(await sb.from('modules').delete().eq('id', id)); },
      async updateLesson(id, patch) { ok(await sb.from('lessons').update(patch).eq('id', id)); },
      async deleteLesson(id) { ok(await sb.from('lessons').delete().eq('id', id)); },
      async reorder(kind, ids) { ok(await sb.rpc('reorder_items', { p_kind: kind, p_ids: ids })); },
      async courseProgress(cid) { return ok(await sb.rpc('course_progress', { cid })); },
      async exportMembers(cid) { return ok(await sb.rpc('export_members', { cid })); },

      async listEvents(cid) {
        return ok(await sb.from('events').select('*, rsvps(user_id)').eq('community_id', cid).order('starts_at'))
          .map(e => ({ ...e, going_count: e.rsvps.length, going: e.rsvps.some(r => r.user_id === me.id) }));
      },
      async createEvent(d) { ok(await sb.from('events').insert({ ...d, created_by: me.id })); },
      async deleteEvent(id) { ok(await sb.from('events').delete().eq('id', id)); },
      async toggleRsvp(eid) { await toggleRow('rsvps', { event_id: eid, user_id: me.id }); },

      async unread() { const { data, error } = await sb.rpc('my_unread'); return error ? { notifications: 0, messages: 0 } : data; },
      async listNotifications() { return ok(await sb.rpc('my_notifications', { lim: 40 })); },
      async markNotificationsRead(ids) { ok(await sb.rpc('mark_notifications_read', { ids: ids || null })); },
      async canMessage(other) { const { data, error } = await sb.rpc('can_message', { other }); return !error && !!data; },
      async inbox() { return ok(await sb.rpc('dm_inbox')); },
      async thread(other) { return ok(await sb.rpc('dm_thread', { other, lim: 200 })); },
      async sendMessage(other, body) { ok(await sb.rpc('send_message', { to_user: other, p_body: body })); },
      async markThreadRead(other) { ok(await sb.rpc('mark_thread_read', { other })); },
      async uploadPostImage(img) {
        const path = `${me.id}/${newId()}.jpg`;
        const { error } = await sb.storage.from('post-images').upload(path, img.blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
        if (error) throw new Error(/row-level security|Unauthorized/.test(error.message) ? '圖片上傳失敗：沒有權限，請確認已執行 v0.4.0 資料庫升級' : '圖片上傳失敗：' + error.message);
        return sb.storage.from('post-images').getPublicUrl(path).data.publicUrl;
      },
      async searchPosts(cid, q) {
        const ids = ok(await sb.rpc('search_posts', { cid, q })).map(r => typeof r === 'string' ? r : r.search_posts);
        if (!ids.length) return [];
        const all = await this.listPostsByIds(ids);
        return ids.map(id => all.find(p => p.id === id)).filter(Boolean);
      },
      async listPostsByIds(ids) {
        const ps = ok(await sb.from('posts').select(`*, author:profiles(${PF})`).in('id', ids));
        const li = await likeInfo('post', ids), cc = {};
        ok(await sb.from('comments').select('post_id').in('post_id', ids)).forEach(c => cc[c.post_id] = (cc[c.post_id] || 0) + 1);
        return ps.map(p => ({ ...p, author: prof(p.author), like_count: li[p.id]?.n || 0, liked: !!li[p.id]?.mine, comment_count: cc[p.id] || 0 }));
      },
      async isPlatformAdmin() { const { data, error } = await sb.rpc('is_platform_admin'); return !error && !!data; },
      async platformOverview() { return ok(await sb.rpc('platform_overview')); },
      async adminCommunities() { return ok(await sb.rpc('admin_communities')); },
      async adminRecentUsers(lim = 20) { return ok(await sb.rpc('admin_recent_users', { lim })); },
      async adminSetCommunity(cid, patch) { ok(await sb.rpc('admin_set_community', { cid, p_status: patch.status ?? null, p_featured: patch.featured ?? null })); }
    };
  }

  window.JC = {
    CONFIG, LIVE, api: LIVE ? makeSupabaseApi() : makeDemoApi(),
    LEVEL_PTS, DEFAULT_LEVEL_NAMES, CATEGORIES, THEMES,
    levelFor, levelProgress, esc, ago, fmtDate, avatar, toast, versionTag, logo, barChart, squareImage, shrinkImage, safeImg, REPORT_REASONS,
    verLt: (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0); } return false; }
  };
})();
