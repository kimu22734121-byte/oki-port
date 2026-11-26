(() => {
  'use strict';
  const K_FAV = 'oki-port:favorites';
  const K_HIDE = 'oki-port:hidden';
  const K_REPOS = 'oki-port:repos';
  const TTL = 30 * 60 * 1000;
  const DEFAULT_ICON = 'icons/default.svg';

  const listEl = document.getElementById('list');
  const msgEl = document.getElementById('msg');
  const toastEl = document.getElementById('toast');
  const toolsEl = document.getElementById('tools');
  const editBtn = document.getElementById('edit');

  let cfg = { github: '', ignore: [], hidden: [], apps: [] };
  let repos = [];            // GitHubから取得したリポジトリ
  let favs = new Set(read(K_FAV, []));
  let localHidden = new Set(read(K_HIDE, []));
  let editing = false;

  function read(key, def) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v ?? def; } catch { return def; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* 保存できない環境では無視 */ }
  }
  const lc = s => String(s || '').toLowerCase();

  // 専用アイコンがないアプリ用：名前から色と頭文字を決めて、ネオン風アイコンを自動生成
  function autoIcon(name) {
    let h = 0;
    for (const ch of String(name)) h = (h * 31 + ch.codePointAt(0)) % 360;
    const neon = `hsl(${h},100%,72%)`;
    const c1 = `hsl(${222 + (h % 24)},62%,27%)`, c2 = `hsl(${262 + (h % 20)},58%,38%)`;   // 下地は紺〜紫に固定
    const letter = ([...String(name).trim()][0] || '?').toUpperCase().replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs>` +
      `<linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` +
      `<filter id="g" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3" result="x"/><feMerge><feMergeNode in="x"/><feMergeNode in="x"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>` +
      `<rect width="120" height="120" rx="27" fill="url(#b)"/>` +
      `<rect x="1.5" y="1.5" width="117" height="117" rx="25.5" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.5"/>` +
      `<g filter="url(#g)" fill="none" stroke="${neon}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">` +
      `<circle cx="60" cy="60" r="36"/></g>` +
      `<text x="60" y="61" text-anchor="middle" dominant-baseline="central" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="44" font-weight="700" fill="${neon}" filter="url(#g)">${letter}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ---------- 一覧の組み立て ---------- */
  // 手動(apps.json) → 自動(GitHub Pagesを公開しているリポジトリ) の順。手動が同名なら上書き。
  function build() {
    const ignore = new Set(cfg.ignore.map(lc));
    const manual = cfg.apps.map(a => ({ ...a, id: lc(a.id) }));
    const seen = new Set(manual.map(a => a.id));
    const auto = repos
      .filter(r => !r.fork && !r.archived && r.has_pages && !ignore.has(lc(r.name)) && !seen.has(lc(r.name)))
      .sort((a, b) => (b.pushed_at || '').localeCompare(a.pushed_at || ''))
      .map(r => ({
        id: lc(r.name), name: r.name, desc: r.description || '',
        url: `https://${lc(cfg.github)}.github.io/${r.name}/`, icon: autoIcon(r.name), auto: true
      }));
    return [...manual, ...auto].filter(a => !ignore.has(a.id));
  }

  const hiddenByFile = id => cfg.hidden.map(lc).includes(id);
  const isHidden = id => hiddenByFile(id) || localHidden.has(id);

  function ordered() {
    const all = build();
    const shown = all.filter(a => !isHidden(a.id));
    const out = [...shown.filter(a => favs.has(a.id)), ...shown.filter(a => !favs.has(a.id))];
    return { out, hidden: all.filter(a => isHidden(a.id)) };
  }

  /* ---------- 描画 ---------- */
  const ICON_STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1L3.2 9.6l6.1-.8z"/></svg>';
  const ICON_SHARE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3.5M7.5 8L12 3.5 16.5 8"/><path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7"/></svg>';
  const ICON_HIDE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-6.5 9-6.5S21 12 21 12s-3.5 6.5-9 6.5S3 12 3 12z"/><circle cx="12" cy="12" r="2.8"/><path d="M4 4l16 16"/></svg>';
  const ICON_SHOW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-6.5 9-6.5S21 12 21 12s-3.5 6.5-9 6.5S3 12 3 12z"/><circle cx="12" cy="12" r="2.8"/></svg>';

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function btn(cls, act, html, label) {
    const b = el('button', 'btn ' + cls, html);
    b.type = 'button'; b.dataset.act = act; b.setAttribute('aria-label', label);
    return b;
  }

  function row(a, { hiddenRow = false } = {}) {
    const fav = favs.has(a.id);
    const soon = !!a.comingSoon || !a.url;
    const li = el('li', 'row' + (fav && !hiddenRow ? ' fav' : '') + (soon ? ' soon' : '') + (hiddenRow ? ' dim' : ''));
    li.dataset.id = a.id;

    // 通常時のみリンク。整理中・隠し・準備中はタップしても開かない
    const main = (soon || editing || hiddenRow) ? el('div', 'main') : el('a', 'main');
    if (main.tagName === 'A') main.href = a.url;
    const img = el('img', 'icon'); img.src = a.icon || DEFAULT_ICON; img.alt = ''; img.width = 58; img.height = 58;
    img.onerror = () => { img.onerror = null; img.src = DEFAULT_ICON; };
    const txt = el('div', 'txt');
    const name = el('div', 'name'); name.textContent = a.name;
    if (soon) { const b = el('span', 'badge'); b.textContent = '準備中'; name.append(b); }
    const desc = el('div', 'desc'); desc.textContent = a.desc || '';
    txt.append(name, desc);
    main.append(img, txt);

    const btns = el('div', 'btns');
    if (hiddenRow) {
      if (hiddenByFile(a.id) && !localHidden.has(a.id)) {
        const n = el('span', 'filehide'); n.textContent = 'apps.jsonで非表示'; btns.append(n);
      } else {
        btns.append(btn('restore', 'unhide', ICON_SHOW + '<span>戻す</span>', a.name + 'を一覧に戻す'));
      }
    } else if (editing) {
      btns.append(btn('hide', 'hide', ICON_HIDE + '<span>隠す</span>', a.name + 'を隠す'));
    } else {
      const star = btn('star', 'star', ICON_STAR, a.name + 'をお気に入り' + (fav ? 'から外す' : 'に追加'));
      star.setAttribute('aria-pressed', fav ? 'true' : 'false');
      btns.append(star);
      if (!soon) btns.append(btn('share', 'share', ICON_SHARE, a.name + 'を共有'));
    }
    li.append(main, btns);
    return li;
  }

  function render() {
    const { out, hidden } = ordered();
    listEl.textContent = '';
    for (const a of out) listEl.append(row(a));
    if (editing && hidden.length) {
      const h = el('li', 'sec'); h.textContent = '隠しているアプリ（「戻す」で一覧に復活）'; listEl.append(h);
      for (const a of hidden) listEl.append(row(a, { hiddenRow: true }));
    }
    document.body.classList.toggle('editing', editing);
    editBtn.textContent = editing ? '完了' : (hidden.length ? `整理する（隠し ${hidden.length}）` : '整理する');
    toolsEl.hidden = false;
    if (!out.length && !hidden.length) { msgEl.hidden = false; msgEl.textContent = '表示できるアプリがありません。'; }
    else msgEl.hidden = true;
  }

  /* ---------- 操作 ---------- */
  let toastTimer;
  function toast(t) {
    toastEl.textContent = t; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* fallthrough */ }
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove(); return ok;
  }
  async function share(a) {
    const url = new URL(a.url, location.href).href;
    if (navigator.share) {
      try { await navigator.share({ title: a.name, text: a.desc || a.name, url }); } catch { /* キャンセル */ }
      return;
    }
    toast((await copyText(url)) ? 'URLをコピーしました' : 'コピーできませんでした');
  }

  listEl.addEventListener('click', e => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const id = b.closest('.row').dataset.id;
    const act = b.dataset.act;
    if (act === 'star') {
      favs.has(id) ? favs.delete(id) : favs.add(id); write(K_FAV, [...favs]); render();
      const nb = listEl.querySelector(`.row[data-id="${CSS.escape(id)}"] .star`); if (nb) nb.focus({ preventScroll: true });
    } else if (act === 'share') {
      const a = build().find(x => x.id === id); if (a) share(a);
    } else if (act === 'hide') {
      localHidden.add(id); write(K_HIDE, [...localHidden]); render(); toast('隠しました');
    } else if (act === 'unhide') {
      localHidden.delete(id); write(K_HIDE, [...localHidden]); render();
    }
  });
  editBtn.addEventListener('click', () => { editing = !editing; render(); });

  const resync = () => { favs = new Set(read(K_FAV, [])); localHidden = new Set(read(K_HIDE, [])); render(); };
  window.addEventListener('pageshow', e => { if (e.persisted) resync(); });
  window.addEventListener('storage', e => { if ([K_FAV, K_HIDE].includes(e.key)) resync(); });

  /* ---------- 読み込み ---------- */
  async function fetchRepos() {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cfg.github)}/repos?per_page=100&sort=pushed`,
      { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error('github ' + res.status);
    const data = await res.json();
    return data.map(r => ({ name: r.name, description: r.description, fork: r.fork, archived: r.archived, has_pages: r.has_pages, pushed_at: r.pushed_at }));
  }

  async function init() {
    try {
      const res = await fetch('apps.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status);
      const j = await res.json();
      cfg = { github: j.github || '', ignore: j.ignore || [], hidden: j.hidden || [], apps: j.apps || [] };
    } catch {
      msgEl.hidden = false; msgEl.textContent = 'アプリ一覧を読み込めませんでした。'; return;
    }
    const cache = read(K_REPOS, null);
    if (cache && Array.isArray(cache.data)) repos = cache.data;
    render();                                   // まず手動分＋前回の取得分を即表示
    if (!cfg.github) return;
    if (cache && Date.now() - cache.t < TTL) return;
    try {                                       // 失敗しても前回分で動き続ける
      repos = await fetchRepos();
      write(K_REPOS, { t: Date.now(), data: repos });
      render();
    } catch { /* オフライン・上限超過など */ }
  }
  init();
})();
