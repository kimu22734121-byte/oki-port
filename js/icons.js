/* 説明文に合わせたネオン風アイコンを自動で作る（画像ファイルを用意していないアプリ用）
   window.OkiIcons.make(名前, 説明文) → SVGのデータURL */
(() => {
  'use strict';

  // [キーワード（日本語・英語）, ネオン色, 絵柄]。上にあるものほど優先（具体的なものを先に）。
  const GLYPHS = [
    [/戦略|ヘックス|ヘクス|シミュレーション|strategy|hex/i, '#cdbcff',
      `<path d="M60 22 L73 29.5 V44.5 L60 52 L47 44.5 V29.5 Z"/><path d="M47 52 L60 59.5 V74.5 L47 82 L34 74.5 V59.5 Z"/><path d="M73 52 L86 59.5 V74.5 L73 82 L60 74.5 V59.5 Z"/>`],
    [/ロボット|メカ|robot|mecha/i, '#ff8a5c',
      `<rect x="32" y="46" width="56" height="44" rx="14"/><path d="M60 46 V32"/><circle cx="60" cy="27" r="4.5"/><path d="M24 60 V76 M96 60 V76 M47 65 V72 M73 65 V72 M50 81 H70"/>`],
    [/ゲーム|RPG|シューティング|パズル|アクション|game|puzzle|arcade/i, '#ff9e6a',
      `<rect x="18" y="40" width="84" height="44" rx="22"/><path d="M40 53 V71 M31 62 H49"/><circle cx="76" cy="57" r="2.6"/><circle cx="86" cy="67" r="2.6"/>`],
    [/動画|YouTube|ユーチューブ|プレイリスト|映画|再生|video|movie|player/i, '#5ff2ff',
      `<rect x="22" y="33" width="76" height="54" rx="15"/><path d="M52 47 L75 60 L52 73 Z"/>`],
    [/録音|音声|マイク|議事録|文字起こし|ボイス|ポッドキャスト|record|voice|podcast|speech/i, '#ff7ad9',
      `<rect x="48" y="24" width="24" height="42" rx="12"/><path d="M36 58 a24 24 0 0 0 48 0 M60 82 V95 M47 95 H73"/>`],
    [/タイマー|ストップウォッチ|ラップ|計測|カウントダウン|ポモドーロ|timer|stopwatch|countdown|pomodoro/i, '#7dffb0',
      `<circle cx="60" cy="67" r="29"/><path d="M60 67 V49 M60 67 L72 74 M52 27 H68 M60 27 V38 M86 40 L92 34"/>`],
    [/音楽|楽曲|曲|MIDI|楽器|ピアノ|作曲|サウンド|シンセ|music|song|audio|piano|synth/i, '#ffd35a',
      `<circle cx="38" cy="86" r="8"/><circle cx="74" cy="78" r="8"/><path d="M46 86 V40 L82 32 V78 M46 53 L82 45"/>`],
    [/宇宙|惑星|天体|星座|space|planet|galaxy|cosmos/i, '#9fe8ff',
      `<circle cx="60" cy="60" r="20"/><ellipse cx="60" cy="60" rx="40" ry="13" transform="rotate(-24 60 60)"/>`],
    [/家計簿|お金|支出|収入|予算|会計|貯金|money|budget|expense|finance|wallet/i, '#b6ff6a',
      `<circle cx="60" cy="60" r="33"/><path d="M46 42 L60 62 L74 42 M60 62 V82 M49 68 H71 M49 76 H71"/>`],
    [/写真|カメラ|画像|スキャン|photo|camera|image|scan/i, '#7ad7ff',
      `<rect x="22" y="42" width="76" height="50" rx="12"/><circle cx="60" cy="67" r="14"/><path d="M45 42 L50 32 H70 L75 42"/>`],
    [/カレンダー|予定|スケジュール|日程|予約|calendar|schedule|booking/i, '#ff8fa8',
      `<rect x="24" y="34" width="72" height="62" rx="12"/><path d="M24 54 H96 M42 26 V40 M78 26 V40"/><circle cx="48" cy="73" r="2.6"/><circle cx="60" cy="73" r="2.6"/><circle cx="72" cy="73" r="2.6"/>`],
    [/天気|気温|予報|weather|forecast/i, '#ffd35a',
      `<circle cx="60" cy="60" r="16"/><path d="M60 26 V34 M60 86 V94 M26 60 H34 M86 60 H94 M36 36 L42 42 M78 78 L84 84 M84 36 L78 42 M42 78 L36 84"/>`],
    [/地図|位置|場所|ナビ|旅行|散歩|map|location|travel|gps/i, '#62e0c0',
      `<path d="M60 96 C60 96 34 70 34 52 a26 26 0 0 1 52 0 C86 70 60 96 60 96 Z"/><circle cx="60" cy="52" r="9"/>`],
    [/電卓|計算|数式|算数|単位|calc|math|convert/i, '#8ab8ff',
      `<rect x="32" y="24" width="56" height="72" rx="10"/><rect x="42" y="34" width="36" height="14" rx="3"/><path d="M45 62 H49 M60 62 H64 M75 62 H79 M45 74 H49 M60 74 H64 M75 74 H79 M45 86 H49 M60 86 H64"/>`],
    [/勉強|学習|単語|辞書|読書|クイズ|教材|暗記|study|quiz|learn|dictionary|flashcard/i, '#c4f46a',
      `<path d="M60 40 C50 32 36 32 24 36 V86 C36 82 50 82 60 90 C70 82 84 82 96 86 V36 C84 32 70 32 60 40 Z"/><path d="M60 40 V90"/>`],
    [/買い物|ショッピング|商品|在庫|レシート|shop|cart|store|inventory/i, '#ff9ec7',
      `<path d="M22 32 H34 L42 74 H88 L96 44 H38"/><circle cx="50" cy="90" r="5"/><circle cx="82" cy="90" r="5"/>`],
    [/健康|運動|筋トレ|体重|ダイエット|歩数|ランニング|health|fitness|workout|running/i, '#ff6b8a',
      `<path d="M60 92 C30 70 24 52 32 40 C40 30 54 32 60 44 C66 32 80 30 88 40 C96 52 90 70 60 92 Z"/>`],
    [/チャット|メッセージ|会話|翻訳|相談|chat|message|translate|talk/i, '#7affd0',
      `<path d="M26 34 H94 a8 8 0 0 1 8 8 V68 a8 8 0 0 1 -8 8 H66 L48 94 V76 H26 a8 8 0 0 1 -8 -8 V42 a8 8 0 0 1 8 -8 Z"/><path d="M38 52 H82 M38 62 H66"/>`],
    [/ToDo|タスク|チェックリスト|習慣|task|todo|checklist|habit/i, '#9be7ff',
      `<rect x="28" y="26" width="64" height="70" rx="10"/><path d="M40 48 L46 54 L56 42 M62 50 H80 M40 72 L46 78 L56 66 M62 74 H80"/>`],
    [/メモ|ノート|日記|テキスト|エディタ|文章|note|memo|diary|editor|text/i, '#ffe27a',
      `<rect x="32" y="26" width="56" height="70" rx="10"/><path d="M44 46 H76 M44 60 H76 M44 74 H64"/>`],
    [/車|マイコンカー|レース|car|race|drive/i, '#ffb35a',
      `<path d="M24 74 V64 a6 6 0 0 1 5 -6 L40 56 L48 42 a6 6 0 0 1 5 -3 H70 a6 6 0 0 1 5 3 L84 56 L92 58 a6 6 0 0 1 4 6 V74 Z"/><path d="M44 56 H84"/><circle cx="42" cy="76" r="8" fill="BG"/><circle cx="80" cy="76" r="8" fill="BG"/>`],
    [/検索|探す|search|finder/i, '#a5b4ff',
      `<circle cx="54" cy="54" r="22"/><path d="M71 71 L92 92"/>`],
  ];

  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  function hash(str) {
    let h = 0;
    for (const ch of String(str)) h = (h * 31 + ch.codePointAt(0)) % 360;
    return h;
  }

  function glyphFor(desc) {
    const d = String(desc || '').trim();
    if (!d) return null;
    return GLYPHS.find(g => g[0].test(d)) || null;
  }

  function make(name, desc) {
    const h = hash(name);
    const c1 = `hsl(${222 + (h % 24)},62%,27%)`;   // 下地は紺〜紫に固定
    const c2 = `hsl(${262 + (h % 20)},58%,38%)`;
    const g = glyphFor(desc);
    let neon, inner;
    if (g) {
      neon = g[1];
      inner = `<g filter="url(#g)" fill="none" stroke="${neon}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${g[2].replace(/"BG"/g, `"${c1}"`)}</g>`;
    } else {                                        // 説明がない／当てはまらない時は頭文字
      neon = `hsl(${h},100%,72%)`;
      const letter = esc(([...String(name).trim()][0] || '?').toUpperCase());
      inner = `<g filter="url(#g)" fill="none" stroke="${neon}" stroke-width="5"><circle cx="60" cy="60" r="36"/></g>` +
        `<text x="60" y="61" text-anchor="middle" dominant-baseline="central" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="44" font-weight="700" fill="${neon}" filter="url(#g)">${letter}</text>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs>` +
      `<linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` +
      `<filter id="g" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3" result="x"/><feMerge><feMergeNode in="x"/><feMergeNode in="x"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>` +
      `<rect width="120" height="120" rx="27" fill="url(#b)"/>` +
      `<rect x="1.5" y="1.5" width="117" height="117" rx="25.5" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.5"/>` +
      inner + `</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  window.OkiIcons = { make, glyphFor };
})();
