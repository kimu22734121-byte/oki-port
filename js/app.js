(() => {
  'use strict';
  const FAV_KEY = 'oki-port:favorites';
  const listEl = document.getElementById('list');
  const msgEl = document.getElementById('msg');
  const toastEl = document.getElementById('toast');
  let apps = [];
  let favs = new Set(loadFavs());

  function loadFavs() {
    try { const v = JSON.parse(localStorage.getItem(FAV_KEY)); return Array.isArray(v) ? v : []; }
    catch { return []; }
  }
  function saveFavs() {
    try { localStorage.setItem(FAV_KEY, JSON.stringify([...favs])); } catch { /* 保存できない環境では無視 */ }
  }

  const ICON_STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1L3.2 9.6l6.1-.8z"/></svg>';
  const ICON_SHARE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3.5M7.5 8L12 3.5 16.5 8"/><path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7"/></svg>';

  function absUrl(u) { return new URL(u, location.href).href; }

  // お気に入りを上に（それぞれ apps.json の並び順を維持）
  function sorted() {
    return [...apps.filter(a => favs.has(a.id)), ...apps.filter(a => !favs.has(a.id))];
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function render() {
    listEl.textContent = '';
    for (const a of sorted()) {
      const fav = favs.has(a.id);
      const soon = !!a.comingSoon || !a.url;
      const li = el('li', 'row' + (fav ? ' fav' : '') + (soon ? ' soon' : ''));
      li.dataset.id = a.id;

      // アイコン・名前部分（タップで同じタブで開く）
      const main = soon ? el('div', 'main') : el('a', 'main');
      if (!soon) main.href = a.url;
      const img = el('img', 'icon'); img.src = a.icon; img.alt = ''; img.width = 58; img.height = 58;
      const txt = el('div', 'txt');
      const name = el('div', 'name'); name.textContent = a.name;
      if (soon) { const b = el('span', 'badge'); b.textContent = '準備中'; name.append(b); }
      const desc = el('div', 'desc'); desc.textContent = a.desc || '';
      txt.append(name, desc);
      main.append(img, txt);

      // 星・共有（アプリを開かない：リンクの外側に置く独立ボタン）
      const btns = el('div', 'btns');
      const star = el('button', 'btn star', ICON_STAR);
      star.type = 'button'; star.dataset.act = 'star';
      star.setAttribute('aria-pressed', fav ? 'true' : 'false');
      star.setAttribute('aria-label', a.name + 'をお気に入り' + (fav ? 'から外す' : 'に追加'));
      btns.append(star);
      if (!soon) {
        const share = el('button', 'btn share', ICON_SHARE);
        share.type = 'button'; share.dataset.act = 'share';
        share.setAttribute('aria-label', a.name + 'を共有');
        btns.append(share);
      }
      li.append(main, btns);
      listEl.append(li);
    }
  }

  let toastTimer;
  function toast(t) {
    toastEl.textContent = t; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* fallthrough */ }
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.append(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove(); return ok;
  }

  async function share(a) {
    const url = absUrl(a.url);
    if (navigator.share) {
      try { await navigator.share({ title: a.name, text: a.desc || a.name, url }); }
      catch (e) { /* キャンセルは無視 */ }
      return;
    }
    toast((await copyText(url)) ? 'URLをコピーしました' : 'コピーできませんでした');
  }

  listEl.addEventListener('click', e => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    const id = btn.closest('.row').dataset.id;
    if (btn.dataset.act === 'star') {
      favs.has(id) ? favs.delete(id) : favs.add(id);
      saveFavs(); render();
      const nb = listEl.querySelector(`.row[data-id="${CSS.escape(id)}"] .star`);
      if (nb) nb.focus({ preventScroll: true });
    } else {
      const a = apps.find(x => x.id === id);
      if (a) share(a);
    }
  });

  // 戻るボタンで復帰した時・他タブで変更された時もお気に入りを同期
  const resync = () => { favs = new Set(loadFavs()); if (apps.length) render(); };
  window.addEventListener('pageshow', e => { if (e.persisted) resync(); });
  window.addEventListener('storage', e => { if (e.key === FAV_KEY) resync(); });

  async function init() {
    try {
      const res = await fetch('apps.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status);
      apps = (await res.json()).apps || [];
      render();
    } catch (err) {
      msgEl.hidden = false;
      msgEl.textContent = 'アプリ一覧を読み込めませんでした。';
    }
  }
  init();
})();
