/* ============================================================
   作品集前端应用  app.js
   ------------------------------------------------------------
   · 从 data.js 读取内容并渲染三大板块
   · 「编辑模式」支持在网页内增删改
   · 改动存 localStorage（即时预览）
   · 可导出 data.js 覆盖提交，或用 GitHub API 直连提交
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- 常量 ---------------- */
  const STORAGE_KEY = 'portfolio:data:v1';
  const CONFIG_KEY = 'portfolio:cfg:v1';
  const DRAFT_BUILD_KEY = 'portfolio:draftBuild:v1';
  const DRAFT_SOURCE_KEY = 'portfolio:draftSource:v1';
  const DEFAULT_PASSWORD = 'admin';

  const DEFAULT_DATA = window.PORTFOLIO_DATA || { site: {}, profile: {}, learning: [], works: [] };

  /* data.js 的构建戳。本地草稿若基于更早的版本，页面会提示「文件已更新」，
     避免出现「改了 data.js 但网页纹丝不动」的情况。 */
  const FILE_BUILD = (DEFAULT_DATA.site && DEFAULT_DATA.site.build) || '';

  /* data.js 的内容指纹。手动改 data.js 忘了更新 build 时，用它判断文件是否已变。 */
  const FILE_SIGNATURE = dataFingerprint(DEFAULT_DATA);

  /* 本地草稿的状态：是否存在、基于哪个构建戳、基于哪个文件指纹 */
  const draftInfo = { hasDraft: false, build: '', source: '', dataSig: '' };

  /* ---------------- 运行时状态 ---------------- */
  let data = null;
  let isAdmin = false;
  let unlocked = sessionStorage.getItem('portfolio:unlocked') === '1';
  let filters = { learningTag: '__all__', learningQ: '', workTag: '__all__' };

  /* ---------------- 小工具 ---------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const uid = (p) => (p || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /* 稳定序列化：对象 key 排序后生成内容指纹，减少 JSON key 顺序造成的误判 */
  function stableStringify(value) {
    if (value === null || typeof value !== 'object') {
      const t = JSON.stringify(value);
      return t === undefined ? 'undefined' : t;
    }
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    return '{' + Object.keys(value).sort().map((k) =>
      JSON.stringify(k) + ':' + stableStringify(value[k])
    ).join(',') + '}';
  }

  function omitSiteBuild(value, key) {
    if (Array.isArray(value)) return value.map((v) => omitSiteBuild(v));
    if (value && typeof value === 'object') {
      const out = {};
      Object.keys(value).forEach((k) => {
        if (key === 'site' && k === 'build') return;
        out[k] = omitSiteBuild(value[k], k);
      });
      return out;
    }
    return value;
  }

  function dataFingerprint(value) {
    const s = stableStringify(omitSiteBuild(value));
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36) + '-' + s.length.toString(36);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function fmtDate(s) {
    if (!s) return '';
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[1] + '.' + m[2] + '.' + m[3] : String(s);
  }

  function todayISO() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  function firstChar(s) {
    const t = String(s || '').trim();
    return t ? t[0].toUpperCase() : 'U';
  }

  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 600);
  }

  function b64EncodeUnicode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(bin);
  }

  /* ---------------- 提示条 ---------------- */
  function toast(msg, type) {
    const wrap = $('#toastWrap');
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s, transform .3s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-10px)';
      setTimeout(() => el.remove(), 320);
    }, type === 'err' ? 4200 : 2400);
  }

  /* ---------------- 简易 Markdown ---------------- */
  function mdInline(s) {
    // 先把行内代码摘出来，避免里面的 * _ ~ 被当成强调语法
    const codes = [];
    let out = s.replace(/`([^`\n]+)`/g, (m, c) => {
      codes.push(c);
      return '\u0000' + (codes.length - 1) + '\u0001';
    });

    out = out
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>');

    return out.replace(/\u0000(\d+)\u0001/g, (m, i) => '<code>' + codes[Number(i)] + '</code>');
  }

  /* 软换行：同一段内的换行。英文之间补空格，中文之间直接相连 */
  function joinSoft(prev, next) {
    if (!prev) return next;
    const a = prev.slice(-1);
    const b = next.charAt(0);
    const isWord = (c) => /[0-9A-Za-z]/.test(c);
    return prev + (isWord(a) && isWord(b) ? ' ' : '') + next;
  }

  function mdToHtml(src) {
    if (!src) return '';
    const lines = esc(String(src).replace(/\r\n/g, '\n')).split('\n');
    const out = [];
    let inUl = false, inOl = false, inCode = false, inTable = false;
    let paraText = '';
    const codeBuf = [];

    const flushPara = () => {
      if (!paraText) return;
      out.push('<p>' + mdInline(paraText) + '</p>');
      paraText = '';
    };
    const closeLists = () => {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (inOl) { out.push('</ol>'); inOl = false; }
    };
    const closeTable = () => {
      if (inTable) { out.push('</tbody></table>'); inTable = false; }
    };
    const closeAll = () => { flushPara(); closeLists(); closeTable(); };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().indexOf('```') === 0) {
        if (inCode) { out.push('<pre><code>' + codeBuf.join('\n') + '</code></pre>'); codeBuf.length = 0; inCode = false; }
        else { closeAll(); inCode = true; }
        continue;
      }
      if (inCode) { codeBuf.push(line); continue; }

      if (!line.trim()) { closeAll(); continue; }

      let m;
      if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
        closeAll();
        const lv = m[1].length;
        out.push('<h' + lv + '>' + mdInline(m[2]) + '</h' + lv + '>');
        continue;
      }

      // 表格：| a | b |  加一行分隔
      if (line.trim().indexOf('|') === 0 && !inTable) {
        const next = lines[i + 1] || '';
        if (/^\s*\|[\s:|-]+\|\s*$/.test(next)) {
          closeAll();
          const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
          out.push('<table><thead><tr>' + cells.map((c) => '<th>' + mdInline(c) + '</th>').join('') + '</tr></thead><tbody>');
          inTable = true;
          i++; // 跳过分隔行
          continue;
        }
      }
      if (inTable && line.trim().indexOf('|') === 0) {
        const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        out.push('<tr>' + cells.map((c) => '<td>' + mdInline(c) + '</td>').join('') + '</tr>');
        continue;
      }
      closeTable();

      if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
        if (!inUl) { closeLists(); out.push('<ul>'); inUl = true; }
        out.push('<li>' + mdInline(m[1]) + '</li>');
        continue;
      }
      if ((m = line.match(/^\s*\d+\.\s+(.*)$/))) {
        if (!inOl) { closeLists(); out.push('<ol>'); inOl = true; }
        out.push('<li>' + mdInline(m[1]) + '</li>');
        continue;
      }
      if ((m = line.match(/^&gt;\s?(.*)$/))) {
        closeAll();
        out.push('<blockquote><p>' + mdInline(m[1]) + '</p></blockquote>');
        continue;
      }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { closeAll(); out.push('<hr>'); continue; }

      // 普通文本：连续多行合并为同一段（Markdown 软换行）
      paraText = paraText ? joinSoft(paraText, line) : line;
    }

    if (inCode) out.push('<pre><code>' + codeBuf.join('\n') + '</code></pre>');
    closeAll();
    return out.join('\n');
  }

  /* ---------------- 文本 ↔ 结构 互转 ---------------- */
  function lines(text) {
    return String(text == null ? '' : text).split('\n').map((l) => l.trim()).filter(Boolean);
  }
  function linesToPairs(text) {
    return lines(text).map((l) => {
      const i = l.indexOf('|');
      if (i < 0) return { label: '链接', url: l };
      return { label: l.slice(0, i).trim(), url: l.slice(i + 1).trim() };
    }).filter((p) => p.url);
  }
  function pairsToLines(arr) {
    return (arr || []).map((p) => p.label + ' | ' + p.url).join('\n');
  }
  function parseTags(text) {
    return String(text == null ? '' : text).split(/[,，、;；\s]+/).map((s) => s.trim()).filter(Boolean);
  }
  function parseStats(text) {
    return lines(text).map((l) => {
      const i = l.indexOf('|');
      return i < 0 ? { value: l, label: '' } : { value: l.slice(0, i).trim(), label: l.slice(i + 1).trim() };
    });
  }
  function parseSkills(text) {
    return lines(text).map((l) => {
      let k = -1;
      for (let i = 0; i < l.length; i++) {
        if (l[i] === ':' || l[i] === '：') { k = i; break; }
      }
      if (k < 0) return { name: l, items: [] };
      return {
        name: l.slice(0, k).trim(),
        items: l.slice(k + 1).split(/[,，、]/).map((s) => s.trim()).filter(Boolean)
      };
    });
  }

  /* ---------------- 数据读写 ---------------- */
  function normalize(d) {
    const base = clone(DEFAULT_DATA);
    const src = d || {};
    const out = Object.assign({}, base, src);
    out.site = Object.assign({}, base.site || {}, src.site || {});
    out.profile = Object.assign({}, base.profile || {}, src.profile || {});
    out.learning = Array.isArray(src.learning) ? src.learning : (base.learning || []);
    out.works = Array.isArray(src.works) ? src.works : (base.works || []);
    return out;
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        draftInfo.hasDraft = true;
        try { draftInfo.build = localStorage.getItem(DRAFT_BUILD_KEY) || ''; } catch (e) { /* 忽略 */ }
        try { draftInfo.source = localStorage.getItem(DRAFT_SOURCE_KEY) || ''; } catch (e) { /* 忽略 */ }
        const draft = normalize(parsed);
        draftInfo.dataSig = dataFingerprint(draft);
        /* 老版本草稿没有来源指纹；如果内容与当前 data.js 一致，直接视为同一版本 */
        if (!draftInfo.source && draftInfo.dataSig === FILE_SIGNATURE) draftInfo.source = FILE_SIGNATURE;
        return draft;
      }
    } catch (e) { /* 忽略损坏的本地数据 */ }
    draftInfo.hasDraft = false;
    draftInfo.build = FILE_BUILD;
    draftInfo.source = FILE_SIGNATURE;
    draftInfo.dataSig = FILE_SIGNATURE;
    return normalize(DEFAULT_DATA);
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      /* 草稿可能基于旧文件：保留它的来源信息，而不是每次保存都标记成当前文件。 */
      const build = draftInfo.hasDraft ? draftInfo.build : FILE_BUILD;
      const source = draftInfo.hasDraft ? draftInfo.source : FILE_SIGNATURE;
      localStorage.setItem(DRAFT_BUILD_KEY, build);
      localStorage.setItem(DRAFT_SOURCE_KEY, source);
      draftInfo.hasDraft = true;
      draftInfo.build = build;
      draftInfo.source = source;
      draftInfo.dataSig = dataFingerprint(data);
      return true;
    } catch (e) {
      toast('本地保存失败：浏览器存储空间不足，请先导出备份', 'err');
      return false;
    }
  }

  /* 把本地草稿标记为「已跟上当前文件」，用于用户主动保留草稿 / 恢复默认 / 加载文件内容 */
  function markDraftCurrent(build, source) {
    const nextBuild = build === undefined ? FILE_BUILD : build;
    const nextSource = source === undefined ? FILE_SIGNATURE : source;
    try {
      localStorage.setItem(DRAFT_BUILD_KEY, nextBuild);
      localStorage.setItem(DRAFT_SOURCE_KEY, nextSource);
      draftInfo.build = nextBuild;
      draftInfo.source = nextSource;
    } catch (e) { /* 忽略 */ }
  }

  function nowStamp() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  function getCfg() {
    let c = {};
    try { c = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}'); } catch (e) { c = {}; }
    return {
      password: c.password || DEFAULT_PASSWORD,
      gh: Object.assign({ owner: '', repo: '', branch: 'main', path: 'data.js', token: '' }, c.gh || {})
    };
  }
  function setCfg(patch) {
    const cur = getCfg();
    const next = Object.assign({}, cur, patch, { gh: Object.assign({}, cur.gh, patch.gh || {}) });
    localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
  }

  /* ============================================================
     渲染
     ============================================================ */

  function renderAll() {
    renderSiteMeta();
    renderProfile();
    renderLearning();
    renderWorks();
    renderFooter();
    observeReveal();
  }

  function renderSiteMeta() {
    const s = data.site || {};
    const title = s.title || '我的作品集';
    document.title = title;
    const og = $('meta[property="og:title"]');
    if (og) og.setAttribute('content', title);

    const p = data.profile || {};
    const brandText = $('#brandText');
    const brandSub = $('#brandSub');
    if (brandText) brandText.textContent = p.name || '作品集';
    if (brandSub) brandSub.textContent = (p.role || 'PORTFOLIO').toUpperCase();
    const mark = $('#brandMark');
    if (mark) mark.textContent = firstChar(p.name);
  }

  function renderProfile() {
    const p = data.profile || {};

    // 头像
    const avatar = $('#avatar');
    avatar.innerHTML = p.avatar
      ? '<img src="' + esc(p.avatar) + '" alt="' + esc(p.name || '头像') + '">'
      : esc(firstChar(p.name));

    // 顶部标签
    const eyebrow = $('#heroRole');
    eyebrow.textContent = p.eyebrow || p.role || 'PORTFOLIO';

    $('#heroName').textContent = p.name || '你的名字';
    $('#heroRoleLine').textContent = p.role || '';

    const tagline = $('#heroTagline');
    tagline.textContent = p.tagline || '';
    tagline.style.display = p.tagline ? '' : 'none';

    // ID / 城市
    const metaBits = [p.handle, p.location].filter(Boolean);
    let metaEl = $('#heroMetaLine');
    if (!metaEl) {
      metaEl = document.createElement('div');
      metaEl.id = 'heroMetaLine';
      metaEl.className = 'chip-mono';
      metaEl.style.cssText = 'font-family:var(--font-mono);font-size:12.5px;color:var(--muted-2);letter-spacing:.04em;margin-top:12px';
      tagline.insertAdjacentElement('afterend', metaEl);
    }
    metaEl.textContent = metaBits.join('  ·  ');
    metaEl.style.display = metaBits.length ? '' : 'none';

    // 状态
    const statusWrap = $('#heroStatusWrap');
    statusWrap.innerHTML = p.status
      ? '<div class="hero-status"><span class="pulse-dot"></span>' + esc(p.status) + '</div>'
      : '';

    // 数据亮点
    const stats = parseStats(p.stats);
    const statsEl = $('#stats');
    statsEl.innerHTML = stats.map((s) => (
      '<div class="stat reveal"><div class="stat-value">' + esc(s.value) + '</div>' +
      '<div class="stat-label">' + esc(s.label) + '</div></div>'
    )).join('');
    statsEl.style.display = stats.length ? '' : 'none';

    // 简介
    $('#heroBio').innerHTML = mdToHtml(p.bio) || '<p style="color:var(--muted)">还没有写简介，点右下角「编辑」补充吧。</p>';

    // 技能
    const groups = parseSkills(p.skills);
    $('#skillGroups').innerHTML = groups.map((g) => (
      '<div class="reveal"><div class="skill-group-title">' + esc(g.name) + '</div>' +
      '<div class="chips">' + g.items.map((it) => '<span class="chip">' + esc(it) + '</span>').join('') + '</div></div>'
    )).join('');
  }

  function renderLearning() {
    renderLearningFilters();
    renderLearningList();
  }

  /* 筛选区：只在标签/数据变化时重绘，避免打断输入法 */
  function renderLearningFilters() {
    const list = data.learning || [];
    const filterWrap = $('#learningFilters');

    const tagCount = {};
    list.forEach((it) => (it.tags || []).forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    const tags = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]);
    if (filters.learningTag !== '__all__' && tags.indexOf(filters.learningTag) < 0) filters.learningTag = '__all__';

    if (!list.length) { filterWrap.innerHTML = ''; return; }

    filterWrap.innerHTML = ['__all__'].concat(tags).map((t) => (
      '<button class="filter-chip' + (filters.learningTag === t ? ' is-on' : '') + '" data-ltag="' + esc(t) + '">' +
      (t === '__all__' ? '全部' : esc(t) + ' <span style="opacity:.55">' + tagCount[t] + '</span>') + '</button>'
    )).join('') +
      '<div class="search-box"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
      '<input type="search" id="learningSearch" placeholder="搜索标题 / 摘要 / 标签" value="' + esc(filters.learningQ) + '"></div>';

    $$('[data-ltag]', filterWrap).forEach((btn) => {
      btn.addEventListener('click', () => {
        filters.learningTag = btn.dataset.ltag;
        renderLearningFilters();
        renderLearningList();
      });
    });

    const search = $('#learningSearch');
    if (search) {
      search.addEventListener('input', () => {
        filters.learningQ = search.value;
        renderLearningList(); // 只重绘列表，输入框保持焦点
      });
    }
  }

  function renderLearningList() {
    const list = data.learning || [];
    const wrap = $('#learningList');

    if (!list.length) {
      wrap.classList.remove('timeline');
      wrap.style.paddingLeft = '0';
      wrap.innerHTML = '<div class="empty"><div class="empty-title">还没有学习记录</div>' +
        '<div>点右下角「编辑」，然后新增第一条吧。</div></div>';
      return;
    }
    wrap.classList.add('timeline');
    wrap.style.paddingLeft = '';

    const q = filters.learningQ.trim().toLowerCase();
    let items = list.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    if (filters.learningTag !== '__all__') items = items.filter((it) => (it.tags || []).indexOf(filters.learningTag) >= 0);
    if (q) {
      items = items.filter((it) => (
        (it.title || '') + ' ' + (it.summary || '') + ' ' + (it.tags || []).join(' ') + ' ' + (it.content || '')
      ).toLowerCase().indexOf(q) >= 0);
    }

    if (!items.length) {
      wrap.innerHTML = '<div class="empty"><div class="empty-title">没有匹配的记录</div><div>换个关键词或标签试试。</div></div>';
      return;
    }

    wrap.innerHTML = items.map((it) => {
      const tagsHtml = (it.tags || []).map((t) => '<span class="chip chip-mono">' + esc(t) + '</span>').join('');
      return '' +
        '<article class="post reveal" data-id="' + esc(it.id) + '">' +
          '<div class="edit-tools">' +
            toolBtn('edit', 'learning', it.id, '编辑') +
            toolBtn('del', 'learning', it.id, '删除', true) +
          '</div>' +
          '<div class="post-head">' +
            '<span class="post-date">' + esc(fmtDate(it.date)) + '</span>' +
            (it.link ? '<span class="chip chip-neutral chip-mono">有参考链接</span>' : '') +
          '</div>' +
          '<h3 class="post-title">' + esc(it.title || '未命名') + '</h3>' +
          (it.summary ? '<p class="post-summary">' + esc(it.summary) + '</p>' : '') +
          '<div class="post-foot">' +
            '<div class="chips">' + tagsHtml + '</div>' +
            '<span class="post-more">阅读全文</span>' +
          '</div>' +
        '</article>';
    }).join('');

    // 绑定
    $$('.post', wrap).forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.edit-tools')) return;
        const item = (data.learning || []).filter((x) => x.id === card.dataset.id)[0];
        if (item) openReader(item);
      });
    });

    observeReveal();
  }

  function renderWorks() {
    const list = data.works || [];
    const wrap = $('#worksList');
    const filterWrap = $('#worksFilters');

    const tagCount = {};
    list.forEach((it) => (it.tags || []).forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    const tags = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]);
    if (filters.workTag !== '__all__' && tags.indexOf(filters.workTag) < 0) filters.workTag = '__all__';

    filterWrap.innerHTML = tags.length
      ? ['__all__'].concat(tags).map((t) => (
          '<button class="filter-chip' + (filters.workTag === t ? ' is-on' : '') + '" data-wtag="' + esc(t) + '">' +
          (t === '__all__' ? '全部作品' : esc(t)) + '</button>'
        )).join('')
      : '';

    let items = list.map((it, i) => ({ it: it, i: i }))
      .sort((a, b) => (b.it.featured ? 1 : 0) - (a.it.featured ? 1 : 0) || String(b.it.year || '').localeCompare(String(a.it.year || '')) || a.i - b.i);
    if (filters.workTag !== '__all__') items = items.filter((x) => (x.it.tags || []).indexOf(filters.workTag) >= 0);

    if (!list.length) {
      wrap.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-title">还没有作品</div>' +
        '<div>点右下角「编辑」，然后新增第一个作品吧。</div></div>';
      return;
    }
    if (!items.length) {
      wrap.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-title">没有匹配的作品</div><div>换个标签试试。</div></div>';
      return;
    }

    wrap.innerHTML = items.map((x) => {
      const it = x.it;
      const idx = (data.works || []).indexOf(it);
      const cover = it.cover
        ? '<img src="' + esc(it.cover) + '" alt="' + esc(it.title || '') + '">'
        : '<div class="work-cover-ph"><div class="work-cover-initial">' + esc(firstChar(it.title)) + '</div>' +
          '<div class="work-cover-year">' + esc(it.year || '') + '</div></div>';
      const desc = String(it.description || '').replace(/[#*`>\-|]/g, ' ').replace(/\s+/g, ' ').trim();
      return '' +
        '<article class="work-card reveal" data-id="' + esc(it.id) + '">' +
          '<div class="edit-tools">' +
            toolBtn('edit', 'works', it.id, '编辑') +
            toolBtn('up', 'works', it.id, '前移', false, idx <= 0) +
            toolBtn('down', 'works', it.id, '后移', false, idx >= (data.works || []).length - 1) +
            toolBtn('del', 'works', it.id, '删除', true) +
          '</div>' +
          '<div class="work-cover">' +
            (it.featured ? '<span class="badge-featured">精选</span>' : '') +
            cover +
          '</div>' +
          '<div class="work-body">' +
            '<h3 class="work-title">' + esc(it.title || '未命名作品') + '</h3>' +
            (it.subtitle ? '<div class="work-sub">' + esc(it.subtitle) + '</div>' : '') +
            (desc ? '<p class="work-desc">' + esc(desc) + '</p>' : '') +
            '<div class="work-tags">' + (it.tags || []).map((t) => '<span class="chip chip-mono">' + esc(t) + '</span>').join('') + '</div>' +
          '</div>' +
        '</article>';
    }).join('');

    $$('.work-card', wrap).forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.edit-tools')) return;
        const item = (data.works || []).filter((x) => x.id === card.dataset.id)[0];
        if (item) openWorkDetail(item);
      });
    });

    $$('[data-wtag]', filterWrap).forEach((btn) => {
      btn.addEventListener('click', () => {
        filters.workTag = btn.dataset.wtag;
        renderWorks();
      });
    });
  }

  function toolBtn(tool, kind, id, title, danger, disabled) {
    const icons = {
      edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
      del: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
      up: '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>',
      down: '<path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/>'
    };
    return '<button class="tool-btn' + (danger ? ' danger' : '') + '" title="' + esc(title) + '"' +
      (disabled ? ' disabled style="opacity:.35;pointer-events:none"' : '') +
      ' data-tool="' + tool + '" data-kind="' + kind + '" data-id="' + esc(id) + '">' +
      '<svg viewBox="0 0 24 24">' + (icons[tool] || '') + '</svg></button>';
  }

  function renderFooter() {
    const s = data.site || {};
    const p = data.profile || {};
    const from = Number(s.startYear) || new Date().getFullYear();
    const now = new Date().getFullYear();
    $('#footerNote').textContent = s.footerNote || '';
    $('#footerCopy').textContent = '© ' + (from === now ? now : from + '–' + now) + ' ' + (p.name || '') +
      ' · 本站由 GitHub Pages 托管';
    const links = linesToPairs(p.links);
    $('#footerLinks').innerHTML = links.map((l) => {
      const ext = /^https?:/i.test(l.url);
      return '<a href="' + esc(l.url) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l.label) + '</a>';
    }).join('');
  }

  /* ---------------- 入场动画 ---------------- */
  let revealObs = null;
  function observeReveal() {
    const els = $$('.reveal:not(.is-in)');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
    if (!revealObs) {
      revealObs = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add('is-in'); revealObs.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    }
    els.forEach((el) => revealObs.observe(el));
  }

  /* ============================================================
     弹层
     ============================================================ */
  const mask = $('#modalMask');
  const modalEl = $('#modal');
  const modalTitleEl = $('#modalTitle');
  const modalSubEl = $('#modalSub');
  const modalBodyEl = $('#modalBody');
  const modalFootEl = $('#modalFoot');
  let onModalClose = null;

  function openModal(opt) {
    onModalClose = opt.onClose || null;
    modalTitleEl.textContent = opt.title || '';
    modalSubEl.textContent = opt.sub || '';
    modalSubEl.style.display = opt.sub ? '' : 'none';
    modalBodyEl.innerHTML = opt.body || '';
    modalFootEl.innerHTML = opt.foot || '';
    modalFootEl.style.display = opt.foot ? '' : 'none';
    modalEl.className = 'modal' + (opt.size ? ' ' + opt.size : '');
    modalBodyEl.scrollTop = 0;
    mask.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    mask.classList.remove('is-open');
    document.body.style.overflow = '';
    const fn = onModalClose;
    onModalClose = null;
    if (fn) fn();
  }

  $('#modalClose').addEventListener('click', closeModal);
  mask.addEventListener('mousedown', (e) => { if (e.target === mask) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mask.classList.contains('is-open')) closeModal();
  });

  /* ---------------- 表单构造 ---------------- */
  function renderField(f, value, state) {
    const v = value == null ? '' : String(value);

    if (f.type === 'image') {
      state.imgs[f.name] = /^data:/.test(v) ? v : '';
      const urlVal = /^data:/.test(v) ? '' : v;
      const preview = v ? '<img src="' + esc(v) + '" alt="">' : '暂无图片';
      return '<div class="field">' +
        '<label class="field-label">' + esc(f.label) + '</label>' +
        '<div class="image-field">' +
          '<div class="image-preview" data-preview="' + f.name + '">' + preview + '</div>' +
          '<div class="image-actions">' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
              '<button type="button" class="btn btn-ghost btn-sm" data-pick="' + f.name + '">上传图片</button>' +
              '<button type="button" class="btn btn-danger btn-sm" data-clearimg="' + f.name + '">清除</button>' +
            '</div>' +
            '<input type="text" class="input" data-imgurl="' + f.name + '" placeholder="或粘贴图片网址 https://…" value="' + esc(urlVal) + '">' +
            (f.hint ? '<div class="field-hint">' + f.hint + '</div>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }

    if (f.type === 'textarea') {
      return '<div class="field">' +
        '<label class="field-label">' + esc(f.label) + '</label>' +
        '<textarea class="textarea' + (f.tall ? ' textarea-tall' : '') + (f.mono ? ' textarea-code' : '') +
          '" name="' + f.name + '" placeholder="' + esc(f.placeholder || '') + '">' + esc(v) + '</textarea>' +
        (f.hint ? '<div class="field-hint">' + f.hint + '</div>' : '') +
      '</div>';
    }

    if (f.type === 'checkbox') {
      return '<div class="field">' +
        '<label class="checkbox-row"><input type="checkbox" name="' + f.name + '"' + (v ? ' checked' : '') + '>' +
        '<span>' + esc(f.label) + '</span></label>' +
        (f.hint ? '<div class="field-hint">' + f.hint + '</div>' : '') +
      '</div>';
    }

    const inputType = f.type === 'password' ? 'password' : (f.type === 'date' ? 'date' : 'text');
    return '<div class="field">' +
      '<label class="field-label">' + esc(f.label) + '</label>' +
      '<input type="' + inputType + '" class="input" name="' + f.name + '" placeholder="' + esc(f.placeholder || '') + '" value="' + esc(v) + '">' +
      (f.hint ? '<div class="field-hint">' + f.hint + '</div>' : '') +
    '</div>';
  }

  function bindFields(fields, state) {
    fields.forEach((f) => {
      if (f.type !== 'image') return;
      const name = f.name;
      const preview = modalBodyEl.querySelector('[data-preview="' + name + '"]');
      const urlInput = modalBodyEl.querySelector('[data-imgurl="' + name + '"]');

      const paint = () => {
        const url = urlInput ? urlInput.value.trim() : '';
        const src = url || state.imgs[name] || '';
        preview.innerHTML = src ? '<img src="' + esc(src) + '" alt="">' : '暂无图片';
      };

      const pick = modalBodyEl.querySelector('[data-pick="' + name + '"]');
      if (pick) {
        pick.onclick = () => pickImage((dataUrl) => {
          state.imgs[name] = dataUrl;
          if (urlInput) urlInput.value = '';
          paint();
          toast('图片已载入并压缩', 'ok');
        });
      }
      const clr = modalBodyEl.querySelector('[data-clearimg="' + name + '"]');
      if (clr) clr.onclick = () => {
        state.imgs[name] = '';
        if (urlInput) urlInput.value = '';
        paint();
      };
      if (urlInput) urlInput.oninput = paint;
    });
  }

  function readFields(fields, state) {
    const out = {};
    fields.forEach((f) => {
      if (f.type === 'image') {
        const urlInput = modalBodyEl.querySelector('[data-imgurl="' + f.name + '"]');
        const url = urlInput ? urlInput.value.trim() : '';
        out[f.name] = url || state.imgs[f.name] || '';
        return;
      }
      const el = modalBodyEl.querySelector('[name="' + f.name + '"]');
      if (!el) { out[f.name] = ''; return; }
      out[f.name] = f.type === 'checkbox' ? el.checked : el.value.trim();
    });
    return out;
  }

  function openForm(opt) {
    const state = { imgs: {} };
    const body = opt.fields.map((f) => renderField(f, opt.values[f.name], state)).join('');
    openModal({
      title: opt.title,
      sub: opt.sub,
      size: 'modal-lg',
      body: body,
      foot: '<button class="btn btn-ghost" data-cancel>取消</button>' +
            '<button class="btn btn-primary" data-submit>' + esc(opt.submitText || '保存') + '</button>'
    });
    bindFields(opt.fields, state);
    $('[data-cancel]', modalFootEl).onclick = closeModal;
    $('[data-submit]', modalFootEl).onclick = () => {
      const out = readFields(opt.fields, state);
      for (let i = 0; i < opt.fields.length; i++) {
        const f = opt.fields[i];
        if (f.required && !out[f.name]) { toast('请填写「' + f.label + '」', 'err'); return; }
      }
      opt.onSubmit(out);
    };
    const first = modalBodyEl.querySelector('input:not([type=hidden]), textarea');
    if (first) setTimeout(() => first.focus(), 80);
  }

  /* ---------------- 图片选择与压缩 ---------------- */
  let imagePickCb = null;
  function pickImage(cb) {
    imagePickCb = cb;
    const picker = $('#imagePicker');
    picker.value = '';
    picker.click();
  }
  $('#imagePicker').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !imagePickCb) return;
    const cb = imagePickCb;
    imagePickCb = null;
    if (!/^image\//.test(file.type)) { toast('请选择图片文件', 'err'); return; }
    if (file.size > 8 * 1024 * 1024) { toast('图片超过 8MB，请先压缩', 'err'); return; }
    compressImage(file).then(cb).catch((err) => toast('图片处理失败：' + err.message, 'err'));
  });

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('读取失败'));
      reader.onload = () => {
        const raw = reader.result;
        if (file.size <= 220 * 1024) { resolve(raw); return; } // 小图直接用原图
        const img = new Image();
        img.onerror = () => reject(new Error('解析失败'));
        img.onload = () => {
          const MAX = 1400;
          const scale = Math.min(1, MAX / img.width);
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = raw;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ============================================================
     阅读器 / 详情
     ============================================================ */
  function openReader(item) {
    const tags = (item.tags || []).map((t) => '<span class="chip chip-mono">' + esc(t) + '</span>').join('');
    const foot = (isAdmin
      ? '<button class="btn btn-ghost" data-edititem>编辑这条</button>'
      : '') +
      '<button class="btn btn-primary" data-close>关闭</button>';

    openModal({
      title: item.title || '未命名',
      size: 'modal-lg',
      body: '<div class="reader-meta">' +
              '<span class="post-date">' + esc(fmtDate(item.date)) + '</span>' +
              '<div class="chips">' + tags + '</div>' +
            '</div>' +
            '<div class="prose reader-body">' + (mdToHtml(item.content || item.summary) || '<p>（暂无正文）</p>') + '</div>' +
            (item.link
              ? '<p style="margin-top:28px"><a class="btn btn-ghost btn-sm" href="' + esc(item.link) + '" target="_blank" rel="noopener">查看参考资料 ↗</a></p>'
              : ''),
      foot: foot
    });

    const eb = modalFootEl.querySelector('[data-edititem]');
    if (eb) eb.onclick = () => { closeModal(); setTimeout(() => openLearningForm(item), 200); };
    const cb = modalFootEl.querySelector('[data-close]');
    if (cb) cb.onclick = closeModal;
  }

  function openWorkDetail(item) {
    const links = linesToPairs(item.links);
    const highlights = lines(item.highlights);
    const cover = item.cover
      ? '<img src="' + esc(item.cover) + '" alt="" style="width:100%;border-radius:12px;border:1px solid var(--line);margin-bottom:22px">'
      : '';

    const body = cover +
      '<div class="reader-meta">' +
        (item.subtitle ? '<span style="color:var(--ink-2);font-weight:600">' + esc(item.subtitle) + '</span>' : '') +
        (item.year ? '<span class="post-date">' + esc(item.year) + '</span>' : '') +
        '<div class="chips">' + (item.tags || []).map((t) => '<span class="chip chip-mono">' + esc(t) + '</span>').join('') + '</div>' +
      '</div>' +
      '<div class="prose reader-body">' + mdToHtml(item.description) + '</div>' +
      (highlights.length
        ? '<h4 style="margin:26px 0 12px;font-size:16px">项目亮点</h4><div class="prose"><ul>' +
          highlights.map((h) => '<li>' + mdInline(esc(h)) + '</li>').join('') + '</ul></div>'
        : '') +
      (links.length
        ? '<div style="margin-top:26px;display:flex;gap:9px;flex-wrap:wrap">' +
          links.map((l, i) => {
            const ext = /^https?:/i.test(l.url);
            return '<a class="btn ' + (i === 0 ? 'btn-primary' : 'btn-ghost') + ' btn-sm" href="' + esc(l.url) + '"' +
              (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l.label) + ' ↗</a>';
          }).join('') + '</div>'
        : '');

    openModal({
      title: item.title || '未命名作品',
      size: 'modal-lg',
      body: body,
      foot: (isAdmin ? '<button class="btn btn-ghost" data-edititem>编辑这个作品</button>' : '') +
            '<button class="btn btn-primary" data-close>关闭</button>'
    });

    const eb = modalFootEl.querySelector('[data-edititem]');
    if (eb) eb.onclick = () => { closeModal(); setTimeout(() => openWorkForm(item), 200); };
    const cb = modalFootEl.querySelector('[data-close]');
    if (cb) cb.onclick = closeModal;
  }

  /* ============================================================
     编辑表单
     ============================================================ */
  const PROFILE_FIELDS = [
    { name: 'name', label: '姓名 / 昵称', type: 'text', required: true, placeholder: '你的名字' },
    { name: 'handle', label: 'ID / 账号名', type: 'text', placeholder: '@yourname' },
    { name: 'eyebrow', label: '顶部小标签', type: 'text', placeholder: 'UNITY CLIENT DEVELOPER', hint: '显示在姓名上方的小字，建议用英文大写。' },
    { name: 'role', label: '职位 / 身份', type: 'text', placeholder: 'Unity 客户端开发工程师' },
    { name: 'tagline', label: '一句话简介', type: 'text', placeholder: '把玩法想法，变成真正能跑起来的东西。' },
    { name: 'avatar', label: '头像', type: 'image', hint: '建议正方形，会自动压缩。留空则显示名字首字母。' },
    { name: 'location', label: '所在城市', type: 'text', placeholder: '中国 · 上海' },
    { name: 'email', label: '邮箱', type: 'text', placeholder: 'you@example.com' },
    { name: 'status', label: '当前状态（可留空）', type: 'text', placeholder: '正在寻找 Unity 客户端相关机会' },
    { name: 'bio', label: '个人简介', type: 'textarea', tall: true, hint: '支持 Markdown：<code>**粗体**</code>、<code>- 列表</code>、<code>## 标题</code>' },
    { name: 'stats', label: '数据亮点', type: 'textarea', mono: true, hint: '一行一条，格式 <code>数值 | 说明</code>，例如 <code>3+ | 年开发经验</code>' },
    { name: 'skills', label: '技能分组', type: 'textarea', mono: true, tall: true, hint: '一行一组，格式 <code>分组名: 技能1, 技能2</code>' },
    { name: 'links', label: '联系方式 / 链接', type: 'textarea', mono: true, hint: '一行一条，格式 <code>标签 | 网址</code>。前三条会显示在顶部按钮区。' }
  ];

  const LEARNING_FIELDS = [
    { name: 'title', label: '标题', type: 'text', required: true, placeholder: '例如：Addressables 入门笔记' },
    { name: 'date', label: '日期', type: 'date' },
    { name: 'tags', label: '标签', type: 'text', hint: '用逗号分隔，例如 <code>性能优化, C#</code>' },
    { name: 'summary', label: '摘要', type: 'textarea', hint: '列表里显示的一两句话。' },
    { name: 'content', label: '正文', type: 'textarea', tall: true, mono: true, hint: '支持 Markdown：<code>## 标题</code>、<code>- 列表</code>、<code>```代码块```</code>、<code>&gt; 引用</code>、<code>| 表格 |</code>' },
    { name: 'link', label: '参考链接（可留空）', type: 'text', placeholder: 'https://…' }
  ];

  const WORK_FIELDS = [
    { name: 'title', label: '项目名称', type: 'text', required: true },
    { name: 'subtitle', label: '副标题', type: 'text', placeholder: '2D 横版动作 · 个人独立项目' },
    { name: 'year', label: '年份', type: 'text', placeholder: '2026' },
    { name: 'tags', label: '标签', type: 'text', hint: '用逗号分隔，例如 <code>Unity, C#, URP</code>' },
    { name: 'cover', label: '封面图', type: 'image', hint: '建议 16:9。留空则用克莱因蓝底 + 首字母占位。' },
    { name: 'description', label: '项目介绍', type: 'textarea', tall: true, mono: true, hint: '支持 Markdown。' },
    { name: 'highlights', label: '亮点清单', type: 'textarea', mono: true, hint: '一行一条。' },
    { name: 'links', label: '相关链接', type: 'textarea', mono: true, hint: '一行一条，格式 <code>标签 | 网址</code>' },
    { name: 'featured', label: '设为精选（卡片左上角显示徽章）', type: 'checkbox' }
  ];

  function openProfileForm() {
    const p = data.profile || {};
    openForm({
      title: '编辑自我介绍',
      sub: '改动会立即生效，并保存在本机浏览器',
      fields: PROFILE_FIELDS,
      values: p,
      onSubmit(out) {
        data.profile = Object.assign({}, p, out);
        persist();
        renderAll();
        closeModal();
        toast('自我介绍已更新', 'ok');
      }
    });
  }

  function openLearningForm(item) {
    const isNew = !item;
    const src = item || { id: uid('l'), date: todayISO(), tags: [], summary: '', content: '', link: '' };
    openForm({
      title: isNew ? '新增学习记录' : '编辑学习记录',
      fields: LEARNING_FIELDS,
      values: {
        title: src.title || '',
        date: src.date || todayISO(),
        tags: (src.tags || []).join(', '),
        summary: src.summary || '',
        content: src.content || '',
        link: src.link || ''
      },
      onSubmit(out) {
        const rec = {
          id: src.id || uid('l'),
          title: out.title,
          date: out.date || todayISO(),
          tags: parseTags(out.tags),
          summary: out.summary,
          content: out.content,
          link: out.link
        };
        data.learning = data.learning || [];
        if (isNew) data.learning.unshift(rec);
        else {
          const i = data.learning.findIndex((x) => x.id === rec.id);
          if (i >= 0) data.learning[i] = rec; else data.learning.unshift(rec);
        }
        persist();
        renderLearning();
        observeReveal();
        closeModal();
        toast(isNew ? '学习记录已添加' : '学习记录已更新', 'ok');
      }
    });
  }

  function openWorkForm(item) {
    const isNew = !item;
    const src = item || { id: uid('w'), year: String(new Date().getFullYear()), tags: [], description: '', highlights: '', links: '', featured: false };
    openForm({
      title: isNew ? '新增作品' : '编辑作品',
      fields: WORK_FIELDS,
      values: {
        title: src.title || '',
        subtitle: src.subtitle || '',
        year: src.year || '',
        tags: (src.tags || []).join(', '),
        cover: src.cover || '',
        description: src.description || '',
        highlights: src.highlights || '',
        links: src.links || '',
        featured: !!src.featured
      },
      onSubmit(out) {
        const rec = {
          id: src.id || uid('w'),
          title: out.title,
          subtitle: out.subtitle,
          year: out.year,
          tags: parseTags(out.tags),
          cover: out.cover,
          description: out.description,
          highlights: out.highlights,
          links: out.links,
          featured: !!out.featured
        };
        data.works = data.works || [];
        if (isNew) data.works.unshift(rec);
        else {
          const i = data.works.findIndex((x) => x.id === rec.id);
          if (i >= 0) data.works[i] = rec; else data.works.unshift(rec);
        }
        persist();
        renderWorks();
        observeReveal();
        closeModal();
        toast(isNew ? '作品已添加' : '作品已更新', 'ok');
      }
    });
  }

  /* ============================================================
     设置 / GitHub 同步
     ============================================================ */
  function openSettings() {
    const cfg = getCfg();
    openForm({
      title: '设置',
      sub: '编辑密码 与 GitHub 直连同步',
      fields: [
        { name: 'password', label: '编辑密码', type: 'password', hint: '进入编辑模式时需输入。默认 <code>admin</code>。忘记可在浏览器中清除本站数据重置。' },
        { name: 'gh_owner', label: 'GitHub 用户名 / 组织', type: 'text', placeholder: 'yourname' },
        { name: 'gh_repo', label: '仓库名', type: 'text', placeholder: 'yourname.github.io' },
        { name: 'gh_branch', label: '分支', type: 'text', placeholder: 'main' },
        { name: 'gh_path', label: 'data.js 在仓库中的路径', type: 'text', placeholder: 'data.js', hint: '如果站点放在子目录，写成 <code>sub/data.js</code>' },
        { name: 'gh_token', label: 'Personal Access Token', type: 'password', hint: '需 <code>repo</code>（经典）或 <code>Contents: Read and write</code>（细粒度）权限。只存在本机浏览器，不会上传到任何地方。' }
      ],
      values: {
        password: cfg.password,
        gh_owner: cfg.gh.owner,
        gh_repo: cfg.gh.repo,
        gh_branch: cfg.gh.branch,
        gh_path: cfg.gh.path,
        gh_token: cfg.gh.token
      },
      onSubmit(out) {
        setCfg({
          password: out.password || DEFAULT_PASSWORD,
          gh: {
            owner: out.gh_owner.trim(),
            repo: out.gh_repo.trim(),
            branch: out.gh_branch.trim() || 'main',
            path: out.gh_path.trim() || 'data.js',
            token: out.gh_token.trim()
          }
        });
        closeModal();
        toast('设置已保存', 'ok');
      }
    });
  }

  function buildDataJs() {
    data.site = data.site || {};
    data.site.build = nowStamp();
    markDraftCurrent(data.site.build, dataFingerprint(data));
    return '/* ============================================================\n' +
      '   作品集内容数据  data.js\n' +
      '   由网页编辑器导出 · ' + new Date().toLocaleString('zh-CN') + '\n' +
      '   ============================================================ */\n' +
      'window.PORTFOLIO_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
  }

  async function shortErr(res) {
    try {
      const j = await res.json();
      return j && j.message ? j.message : '';
    } catch (e) { return ''; }
  }

  async function githubPush() {
    const cfg = getCfg();
    const g = cfg.gh;
    if (!g.owner || !g.repo || !g.token) {
      toast('请先填写 GitHub 配置', 'err');
      openSettings();
      return;
    }
    const branch = g.branch || 'main';
    const pathEnc = String(g.path || 'data.js').split('/').map(encodeURIComponent).join('/');
    const api = 'https://api.github.com/repos/' + encodeURIComponent(g.owner) + '/' + encodeURIComponent(g.repo) + '/contents/' + pathEnc;
    const headers = {
      'Authorization': 'Bearer ' + g.token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const btn = $('#btnGithub');
    const oldText = btn.textContent;
    btn.textContent = '提交中…';
    btn.disabled = true;

    try {
      let sha = null;
      const getRes = await fetch(api + '?ref=' + encodeURIComponent(branch), { headers: headers, cache: 'no-store' });
      if (getRes.ok) {
        sha = (await getRes.json()).sha;
      } else if (getRes.status !== 404) {
        const msg = await shortErr(getRes);
        throw new Error('读取失败 ' + getRes.status + (msg ? '：' + msg : ''));
      }

      const body = {
        message: '更新作品集数据 · ' + new Date().toLocaleString('zh-CN'),
        content: b64EncodeUnicode(buildDataJs()),
        branch: branch
      };
      if (sha) body.sha = sha;

      const putRes = await fetch(api, {
        method: 'PUT',
        headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
        body: JSON.stringify(body)
      });
      if (!putRes.ok) {
        const msg = await shortErr(putRes);
        throw new Error('提交失败 ' + putRes.status + (msg ? '：' + msg : ''));
      }
      toast('已提交到 GitHub，Pages 约 1 分钟后自动更新', 'ok');
    } catch (err) {
      toast(String(err && err.message ? err.message : err), 'err');
    } finally {
      btn.textContent = oldText;
      btn.disabled = false;
    }
  }

  /* ============================================================
     构建戳漂移提示
     data.js 被外部更新、而浏览器里还留着基于旧版本的草稿时，
     在页面顶部给一条可操作的提示，避免「改了文件却看不到变化」。
     ============================================================ */
  function checkBuildDrift() {
    if (!draftInfo.hasDraft) return;
    const buildChanged = !!(FILE_BUILD && draftInfo.build && draftInfo.build !== FILE_BUILD);
    const sourceChanged = draftInfo.source
      ? draftInfo.source !== FILE_SIGNATURE
      : draftInfo.dataSig !== FILE_SIGNATURE;
    if (!buildChanged && !sourceChanged) return;
    showDriftBar();
  }

  function showDriftBar() {
    if ($('#driftBar')) return;
    const bar = document.createElement('div');
    bar.id = 'driftBar';
    bar.className = 'drift-bar';
    bar.innerHTML =
      '<div class="drift-msg">' +
        '<strong>data.js 已更新或与草稿不一致</strong>' +
        '<span>页面当前显示的是浏览器草稿，不是当前 data.js 的内容。' +
          (draftInfo.build && FILE_BUILD ? '草稿构建：' + esc(draftInfo.build) + '，文件构建：' + esc(FILE_BUILD) + '。' : '') +
        '</span>' +
      '</div>' +
      '<div class="drift-actions">' +
        '<button class="btn btn-sm btn-primary" id="driftUseFile">加载文件内容</button>' +
        '<button class="btn btn-sm btn-ghost" id="driftKeepDraft">保留我的草稿</button>' +
      '</div>';
    document.body.appendChild(bar);
    $('#driftUseFile').addEventListener('click', driftUseFile);
    $('#driftKeepDraft').addEventListener('click', driftKeepDraft);
  }

  function driftUseFile() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      markDraftCurrent(FILE_BUILD);
    } catch (e) { /* 忽略 */ }
    location.reload();
  }

  function driftKeepDraft() {
    markDraftCurrent(FILE_BUILD);
    const bar = $('#driftBar');
    if (bar) bar.remove();
    toast('已保留本地草稿。想改用文件内容，可在编辑模式里点「恢复默认」', 'ok');
  }

  /* ============================================================
     编辑模式
     ============================================================ */
  function enterAdmin(opts) {
    isAdmin = true;
    sessionStorage.setItem('portfolio:unlocked', '1');
    document.body.classList.add('is-admin');
    $('#adminBar').classList.add('is-on');
    $('#adminFab').classList.add('is-on');
    $('#adminFabText').textContent = '编辑中';
    document.body.style.paddingBottom = '68px';
    renderLearning();
    renderWorks();
    observeReveal();
    if (!(opts && opts.silent)) toast('已进入编辑模式，改动会自动保存在本机', 'ok');
  }

  function exitAdmin() {
    isAdmin = false;
    document.body.classList.remove('is-admin');
    $('#adminBar').classList.remove('is-on');
    $('#adminFab').classList.remove('is-on');
    $('#adminFabText').textContent = '编辑';
    document.body.style.paddingBottom = '';
    renderLearning();
    renderWorks();
    observeReveal();
  }

  function askPassword() {
    const cfg = getCfg();
    const hint = cfg.password === DEFAULT_PASSWORD
      ? '首次使用，默认密码是 <code>admin</code>，进去后可在「设置」里修改。'
      : '请输入编辑密码。';
    openForm({
      title: '进入编辑模式',
      sub: '改动只保存在本机浏览器，可随时导出或同步到 GitHub',
      fields: [{ name: 'pwd', label: '编辑密码', type: 'password', required: true }],
      values: { pwd: '' },
      submitText: '进入',
      onSubmit(out) {
        if (out.pwd === getCfg().password) {
          closeModal();
          setTimeout(enterAdmin, 160);
        } else {
          toast('密码不对', 'err');
        }
      }
    });
    const hintEl = document.createElement('div');
    hintEl.className = 'field-hint';
    hintEl.style.marginTop = '-6px';
    hintEl.innerHTML = hint;
    modalBodyEl.appendChild(hintEl);
  }

  /* ============================================================
     事件绑定
     ============================================================ */
  function handleTool(tool, kind, id) {
    const listKey = kind === 'learning' ? 'learning' : 'works';
    const list = data[listKey] || [];
    const i = list.findIndex((x) => x.id === id);
    if (i < 0) return;

    if (tool === 'edit') {
      if (kind === 'learning') openLearningForm(list[i]);
      else openWorkForm(list[i]);
      return;
    }
    if (tool === 'del') {
      const name = kind === 'learning' ? '这条学习记录' : '这个作品';
      if (!confirm('确定删除' + name + '「' + (list[i].title || '未命名') + '」吗？\n删除后可在本机撤销（重新导出前请先备份）。')) return;
      list.splice(i, 1);
      persist();
      renderAll();
      toast('已删除', 'ok');
      return;
    }
    if (tool === 'up' && i > 0) {
      const t = list[i - 1]; list[i - 1] = list[i]; list[i] = t;
      persist(); renderWorks(); observeReveal();
      return;
    }
    if (tool === 'down' && i < list.length - 1) {
      const t = list[i + 1]; list[i + 1] = list[i]; list[i] = t;
      persist(); renderWorks(); observeReveal();
    }
  }

  function bindEvents() {
    // 浮动编辑按钮
    $('#adminFab').addEventListener('click', () => {
      if (isAdmin) { exitAdmin(); return; }
      if (unlocked) { enterAdmin(); return; }
      askPassword();
    });

    // 工具栏
    $('#btnExit').addEventListener('click', exitAdmin);

    $('#btnExportJs').addEventListener('click', () => {
      download('data.js', buildDataJs(), 'text/javascript;charset=utf-8');
      toast('已导出 data.js，用它覆盖仓库里的同名文件即可', 'ok');
    });

    $('#btnExportJson').addEventListener('click', () => {
      download('portfolio-backup-' + todayISO() + '.json', JSON.stringify(data, null, 2), 'application/json');
      toast('已导出备份 JSON', 'ok');
    });

    $('#btnImport').addEventListener('click', () => {
      const picker = $('#filePicker');
      picker.value = '';
      picker.click();
    });

    $('#filePicker').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = parseImport(String(reader.result));
          if (!parsed || typeof parsed !== 'object') throw new Error('内容不是有效对象');
          data = normalize(parsed);
          persist();
          renderAll();
          toast('数据已导入', 'ok');
        } catch (err) {
          toast('导入失败：' + err.message, 'err');
        }
      };
      reader.readAsText(file, 'utf-8');
    });

    $('#btnReset').addEventListener('click', () => {
      if (!confirm('恢复为 data.js 里的初始内容？\n当前浏览器中的改动会丢失。')) return;
      localStorage.removeItem(STORAGE_KEY);
      data = normalize(DEFAULT_DATA);
      markDraftCurrent(FILE_BUILD);
      const bar = $('#driftBar');
      if (bar) bar.remove();
      renderAll();
      toast('已恢复初始内容', 'ok');
    });

    $('#btnGithub').addEventListener('click', githubPush);

    // 设置入口
    $('#btnSettings').addEventListener('click', openSettings);

    // 委托：卡片工具 / 新增 / 编辑
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-tool]');
      if (t) {
        e.preventDefault();
        handleTool(t.dataset.tool, t.dataset.kind, t.dataset.id);
        return;
      }
      const a = e.target.closest('[data-add]');
      if (a) { e.preventDefault(); (a.dataset.add === 'learning' ? openLearningForm(null) : openWorkForm(null)); return; }
      const ed = e.target.closest('[data-edit]');
      if (ed) { e.preventDefault(); openProfileForm(); }
    });
  }

  function parseImport(text) {
    const t = String(text).trim();
    try { return JSON.parse(t); } catch (e) { /* 继续尝试 */ }
    const s = t.indexOf('{');
    const e2 = t.lastIndexOf('}');
    if (s >= 0 && e2 > s) return JSON.parse(t.slice(s, e2 + 1));
    throw new Error('无法识别文件内容');
  }

  /* ---------------- 滚动交互 ---------------- */
  function initScroll() {
    const header = $('#siteHeader');
    const bar = $('#progressBar');
    const navLinks = $$('#nav a');
    const sections = ['about', 'learning', 'works'].map((id) => document.getElementById(id)).filter(Boolean);

    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
      let active = null;
      const probe = y + 140;
      sections.forEach((s) => { if (s.offsetTop <= probe) active = s.id; });
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + active));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ============================================================
     启动
     ============================================================ */
  function init() {
    data = loadData();
    bindEvents();
    renderAll();
    initScroll();
    checkBuildDrift();
    if (unlocked) enterAdmin.call(null, { silent: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
