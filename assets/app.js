/* ===========================================================
   app.js — ポケモンユナイト 98体チャレンジ
   ・ユーザー入力は必ず textContent 経由で表示（innerHTML を使わない）
   ・外部への通信は一切なし
   =========================================================== */
(function () {
  'use strict';

  var ROSTER = window.ROSTER || [];
  var ALIAS = window.ALIAS || {};
  var AMBIGUOUS = window.AMBIGUOUS || {};

  var ALL_TOTAL = ROSTER.reduce(function (n, r) { return n + r.list.length; }, 0);
  var TOTAL = ALL_TOTAL;
  var found = new Set();
  var finished = false;
  var startAt = null;
  var timerId = null;
  var currentMode = 'all';

  var $ = function (id) { return document.getElementById(id); };
  var guessEl = $('guess');
  var submitBtn = $('btn-submit');
  var fieldEl = $('field');
  var msgEl = $('msg');
  var rolesEl = $('roles');
  var tabsEl = $('tabs');
  var inputbarEl = document.querySelector('.inputbar');

  function bestKey() { return 'unite-roster-quiz:best:' + currentMode; }
  function roleActive(key) { return currentMode === 'all' || key === currentMode; }
  function activeRoles() { return ROSTER.filter(function (r) { return roleActive(r.key); }); }

  /* ---------- 固定入力バーの実測高さをCSSに反映（隠れ防止のscroll-marginで使う） ---------- */
  function syncBarHeight() {
    document.documentElement.style.setProperty('--bar-h', inputbarEl.offsetHeight + 'px');
  }
  window.addEventListener('resize', syncBarHeight);

  /* ---------- 見つけたマスが画面外なら中央までスクロール ---------- */
  function scrollTileIntoViewIfNeeded(tile) {
    var rect = tile.getBoundingClientRect();
    var top = inputbarEl.getBoundingClientRect().bottom;
    if (rect.top < top || rect.bottom > window.innerHeight) {
      tile.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* ---------- 表記ゆれの吸収 ---------- */
  function norm(s) {
    return String(s == null ? '' : s)
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (c) {
        return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
      })
      .replace(/[ぁ-ゖ]/g, function (c) {
        return String.fromCharCode(c.charCodeAt(0) + 0x60);
      })
      .replace(/[\s\u3000・･()（）「」『』【】、。,.\-‐―ー]/g, '')
      .toUpperCase();
  }

  /* ---------- 索引 ---------- */
  var INDEX = new Map();
  var ENTRY = new Map();
  ROSTER.forEach(function (role) {
    role.list.forEach(function (p) {
      ENTRY.set(p.n, { role: role, data: p });
      INDEX.set(norm(p.n), p.n);
      (ALIAS[p.n] || []).forEach(function (a) { INDEX.set(norm(a), p.n); });
    });
  });
  var AMB = new Map();
  Object.keys(AMBIGUOUS).forEach(function (k) { AMB.set(norm(k), AMBIGUOUS[k]); });

  /* ---------- 型で絞ったモード ---------- */
  var MODES = [{ key: 'all', name: '全' + ALL_TOTAL + '体', color: 'var(--support)' }]
    .concat(ROSTER.map(function (r) { return { key: r.key, name: r.name, color: r.color }; }));

  MODES.forEach(function (m) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tab';
    btn.textContent = m.name;
    btn.dataset.mode = m.key;
    btn.addEventListener('click', function () { switchMode(m.key); });
    tabsEl.appendChild(btn);
  });

  function paintTabs() {
    var tabs = tabsEl.getElementsByClassName('tab');
    for (var i = 0; i < tabs.length; i++) {
      var btn = tabs[i];
      var active = btn.dataset.mode === currentMode;
      btn.classList.toggle('active', active);
      btn.style.background = active ? MODES.filter(function (m) { return m.key === btn.dataset.mode; })[0].color : '';
    }
  }

  function switchMode(key) {
    if (key === currentMode) return;
    currentMode = key;
    paintTabs();
    var label = MODES.filter(function (m) { return m.key === key; })[0].name;
    resetGame(label + ' モードにしました。最初の1文字でタイマーが動きます。');
  }

  /* ---------- 組み立て ---------- */
  function build() {
    TOTAL = activeRoles().reduce(function (n, r) { return n + r.list.length; }, 0);

    rolesEl.textContent = '';
    $('energy').textContent = '';
    $('legend').textContent = '';
    $('all').textContent = String(TOTAL);
    $('total-inline').textContent = String(ALL_TOTAL);

    ROSTER.forEach(function (role) {
      var sec = document.createElement('section');
      sec.className = 'role';
      if (!roleActive(role.key)) sec.style.display = 'none';

      var head = document.createElement('div');
      head.className = 'role-head';

      var chip = document.createElement('span');
      chip.className = 'role-chip';
      chip.style.background = role.color;

      var name = document.createElement('h2');
      name.className = 'role-name';
      name.textContent = role.name;

      var count = document.createElement('span');
      count.className = 'role-count';
      var b = document.createElement('b');
      b.id = 'c-' + role.key;
      b.textContent = '0';
      count.appendChild(b);
      count.appendChild(document.createTextNode(' / ' + role.list.length));

      head.appendChild(chip);
      head.appendChild(name);
      head.appendChild(count);
      sec.appendChild(head);

      var grid = document.createElement('div');
      grid.className = 'grid';
      role.list.forEach(function (p) {
        var t = document.createElement('div');
        t.className = 'tile';
        t.dataset.name = p.n;
        t.dataset.role = role.key;
        t.textContent = '???';
        grid.appendChild(t);
      });
      sec.appendChild(grid);
      rolesEl.appendChild(sec);

      var bar = document.createElement('span');
      bar.id = 'e-' + role.key;
      bar.style.background = role.color;
      if (!roleActive(role.key)) bar.style.display = 'none';
      $('energy').appendChild(bar);

      var li = document.createElement('span');
      if (!roleActive(role.key)) li.style.display = 'none';
      var sw = document.createElement('i');
      sw.style.background = role.color;
      var lb = document.createElement('b');
      lb.id = 'l-' + role.key;
      lb.textContent = '0';
      li.appendChild(sw);
      li.appendChild(document.createTextNode(role.name + ' '));
      li.appendChild(lb);
      li.appendChild(document.createTextNode('/' + role.list.length));
      $('legend').appendChild(li);
    });

    refresh();
    paintTabs();
  }

  function tileOf(name) {
    var tiles = rolesEl.getElementsByClassName('tile');
    for (var i = 0; i < tiles.length; i++) {
      if (tiles[i].dataset.name === name) return tiles[i];
    }
    return null;
  }

  /* ---------- マスを埋める ---------- */
  function paint(name, mode) {
    var t = tileOf(name);
    if (!t) return;
    var e = ENTRY.get(name);

    t.textContent = '';
    t.classList.remove('hinted');

    var img = document.createElement('img');
    img.src = 'images/' + e.data.id + '.png';
    img.alt = '';
    img.width = 38;
    img.height = 38;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', function () {
      // 画像が置かれていない場合は文字だけで表示する
      if (img.parentNode) img.parentNode.removeChild(img);
      t.classList.remove('has-img');
    });
    img.addEventListener('load', function () { t.classList.add('has-img'); });
    t.appendChild(img);

    var label = document.createElement('span');
    label.textContent = name;
    t.appendChild(label);

    if (mode === 'found') {
      t.classList.add('found');
      t.style.background = e.role.color;
      t.title = name;
    } else {
      t.classList.add('revealed');
    }
  }

  function refresh() {
    $('now').textContent = String(found.size);
    ROSTER.forEach(function (role) {
      var n = role.list.filter(function (p) { return found.has(p.n); }).length;
      $('c-' + role.key).textContent = String(n);
      $('l-' + role.key).textContent = String(n);
      $('e-' + role.key).style.width = (n / TOTAL * 100) + '%';
    });
  }

  /* ---------- タイマー ---------- */
  function fmt(ms) {
    var s = Math.floor(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  function startTimer() {
    if (startAt || finished) return;
    startAt = Date.now();
    timerId = setInterval(function () { $('clock').textContent = fmt(Date.now() - startAt); }, 250);
  }
  function elapsed() { return startAt ? Date.now() - startAt : 0; }

  /* ---------- メッセージ ---------- */
  var flashId = null;
  function say(text, kind) {
    msgEl.textContent = text;
    msgEl.className = 'msg' + (kind ? ' ' + kind : '');
    fieldEl.classList.remove('hit', 'miss');
    if (kind === 'ok') fieldEl.classList.add('hit');
    if (kind === 'ng') fieldEl.classList.add('miss');
    clearTimeout(flashId);
    flashId = setTimeout(function () { fieldEl.classList.remove('hit', 'miss'); }, 400);
    syncBarHeight();
  }

  /* ---------- 判定 ---------- */
  function submit(raw) {
    var q = norm(raw);
    if (!q) return false;

    if (AMB.has(q)) { say(AMB.get(q), 'ng'); return true; }

    var hit = INDEX.get(q);
    if (!hit) return false;
    if (!roleActive(ENTRY.get(hit).role.key)) return false;

    if (found.has(hit)) { say(hit + ' はもう出ています。', 'ng'); return true; }

    found.add(hit);
    paint(hit, 'found');
    refresh();
    say(hit + ' ＋1　のこり ' + (TOTAL - found.size) + '体', 'ok');
    var tile = tileOf(hit);
    if (tile) scrollTileIntoViewIfNeeded(tile);
    if (found.size === TOTAL) finish(true);
    return true;
  }

  function updateSubmitState() {
    submitBtn.disabled = finished || !guessEl.value.trim();
  }

  /* ---------- IME変換中に決定されても入力欄が空に戻るようにする ---------- */
  var isComposing = false;
  var wasComposingOnInteract = false;
  guessEl.addEventListener('compositionstart', function () { isComposing = true; });
  guessEl.addEventListener('compositionend', function () { isComposing = false; });
  // ボタンをクリックすると input が blur してから click が発火するため、
  // blur 前（compositionend より前）の時点で変換中だったかを覚えておく。
  submitBtn.addEventListener('mousedown', function () { wasComposingOnInteract = isComposing; });

  function attemptSubmit() {
    if (finished) return;
    var v = guessEl.value;
    if (!v.trim()) return;
    if (!submit(v)) say('そのポケモンは見つかりません。', 'ng');
    guessEl.value = '';
    updateSubmitState();
    if (wasComposingOnInteract) {
      wasComposingOnInteract = false;
      guessEl.blur();
    }
    guessEl.focus();
  }

  guessEl.addEventListener('input', function () {
    startTimer();
    updateSubmitState();
  });

  guessEl.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    attemptSubmit();
  });

  submitBtn.addEventListener('click', function () {
    attemptSubmit();
  });

  /* ---------- ヒント ---------- */
  $('btn-hint').addEventListener('click', function () {
    if (finished) return;
    var tiles = rolesEl.getElementsByClassName('tile');
    for (var i = 0; i < tiles.length; i++) {
      var t = tiles[i];
      if (!roleActive(t.dataset.role)) continue;
      if (t.classList.contains('found') || t.classList.contains('hinted')) continue;
      var n = t.dataset.name;
      var target = t;
      target.textContent = '';
      var letter = document.createElement('span');
      letter.className = 'hint-letter';
      letter.textContent = n.charAt(0);
      var dots = document.createElement('span');
      dots.className = 'hint-dots';
      dots.textContent = '○'.repeat(Math.max(n.length - 1, 1));
      target.appendChild(letter);
      target.appendChild(dots);
      target.classList.add('hinted');
      say('頭文字を1つ表示しました。');
      guessEl.focus();
      target.classList.add('tile-flash');
      setTimeout(function () { target.classList.remove('tile-flash'); }, 1000);
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    say('もう表示できる頭文字がありません。');
    guessEl.focus();
  });

  /* ---------- ギブアップ ---------- */
  $('btn-give').addEventListener('click', function () {
    if (finished) return;
    if (!window.confirm('のこり ' + (TOTAL - found.size) + '体の答えを表示します。よろしいですか？')) return;
    finish(false);
  });

  function rankOf(rate, cleared) {
    if (cleared) return '完全制覇。もはやユナイト事務局の職員です';
    if (rate >= 0.9) return 'ガチ勢。あと少しで全部でした';
    if (rate >= 0.7) return 'かなりの熟練トレーナー';
    if (rate >= 0.5) return '半分以上。普通にすごい';
    if (rate >= 0.3) return 'よく使う型に記憶がかたよっていますね';
    return 'ここからロスターを覚えていきましょう';
  }

  function finish(cleared) {
    finished = true;
    clearInterval(timerId);
    timerId = null;

    activeRoles().forEach(function (role) {
      role.list.forEach(function (p) {
        if (!found.has(p.n)) paint(p.n, 'revealed');
      });
    });

    guessEl.disabled = true;
    guessEl.placeholder = '終了しました';
    $('btn-hint').disabled = true;
    $('btn-give').disabled = true;
    $('btn-save-image').disabled = false;
    updateSubmitState();

    $('r-score').textContent = found.size + ' / ' + TOTAL;

    var detail = $('r-detail');
    detail.textContent = '';
    detail.appendChild(document.createTextNode('タイム ' + fmt(elapsed()) + '　'));
    var rank = document.createElement('span');
    rank.className = 'rank';
    rank.textContent = rankOf(found.size / TOTAL, cleared);
    detail.appendChild(rank);
    detail.appendChild(document.createElement('br'));
    detail.appendChild(document.createTextNode(breakdown()));

    saveBest();
    $('result').classList.add('show');
    $('result').scrollIntoView({ behavior: 'smooth', block: 'center' });
    say(cleared ? '全' + TOTAL + '体クリア。おめでとうございます。'
                : '答えを表示しました。赤いマスが出せなかったポケモンです。');
  }

  function breakdown() {
    return activeRoles().map(function (r) {
      var n = r.list.filter(function (p) { return found.has(p.n); }).length;
      return r.name + ' ' + n + '/' + r.list.length;
    }).join('　');
  }

  /* ---------- 自己ベスト（この端末のブラウザ内にのみ保存） ---------- */
  function loadBest() {
    try {
      var raw = window.localStorage.getItem(bestKey());
      if (!raw) return null;
      var v = JSON.parse(raw);
      if (typeof v.score !== 'number' || typeof v.ms !== 'number') return null;
      return v;
    } catch (e) { return null; }
  }
  function showBest() {
    var b = loadBest();
    var el = $('best');
    el.textContent = '';
    if (!b) { el.textContent = 'この端末の自己ベスト：まだありません'; return; }
    el.appendChild(document.createTextNode('この端末の自己ベスト：'));
    var s = document.createElement('b');
    s.textContent = b.score + ' / ' + TOTAL + '（' + fmt(b.ms) + '）';
    el.appendChild(s);
  }
  function saveBest() {
    try {
      var b = loadBest();
      if (!b || found.size > b.score || (found.size === b.score && elapsed() < b.ms)) {
        window.localStorage.setItem(bestKey(), JSON.stringify({ score: found.size, ms: elapsed() }));
      }
    } catch (e) { /* プライベートモードなどでは保存しない */ }
    showBest();
  }

  /* ---------- 結果コピー ---------- */
  $('btn-copy').addEventListener('click', function () {
    var text = 'ポケモンユナイト 全' + TOTAL + '体、何も見ずに ' + found.size + '体 言えました（'
      + fmt(elapsed()) + '）\n' + breakdown();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        say('結果をコピーしました。', 'ok');
      }, function () {
        say('コピーできませんでした。結果欄を長押しして選択してください。', 'ng');
      });
    } else {
      say('このブラウザではコピーできません。結果欄を選択してください。', 'ng');
    }
  });

  /* ---------- 結果を画像で保存（canvas 直描き。ポケモン名・画像は一切含めない） ---------- */
  var SITE_URL = 'noah-poke.github.io/unite98';

  function resolveColor(v) {
    var m = /var\((--[\w-]+)\)/.exec(v);
    if (!m) return v;
    return getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim();
  }

  function currentModeLabel() {
    return MODES.filter(function (m) { return m.key === currentMode; })[0].name;
  }

  function resultItems() {
    var items = [];
    activeRoles().forEach(function (role) {
      role.list.forEach(function (p) {
        items.push({ id: p.id, ok: found.has(p.n), color: resolveColor(role.color) });
      });
    });
    return items;
  }

  function loadImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  function silhouette(img, color) {
    var off = document.createElement('canvas');
    off.width = img.naturalWidth || img.width;
    off.height = img.naturalHeight || img.height;
    var octx = off.getContext('2d');
    octx.drawImage(img, 0, 0);
    octx.globalCompositeOperation = 'source-in';
    octx.fillStyle = color;
    octx.fillRect(0, 0, off.width, off.height);
    return off;
  }

  var LOGO_ID = '__logo__';

  function drawRoundedImage(ctx, img, x, y, size, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + size, y, x + size, y + size, radius);
    ctx.arcTo(x + size, y + size, x, y + size, radius);
    ctx.arcTo(x, y + size, x, y, radius);
    ctx.arcTo(x, y, x + size, y, radius);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
  }

  function drawResultCanvas(items, images) {
    var W = 1200, H = 630, pad = 60;
    var jpFont = getComputedStyle(document.documentElement).getPropertyValue('--jp').trim();

    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = resolveColor('var(--field)');
    ctx.fillRect(0, 0, W, H);

    /* 1. サイト名（左にロゴアイコン） */
    var logo = images.get(LOGO_ID);
    var titleX = pad;
    if (logo) {
      var logoSize = 64, logoY = 36;
      drawRoundedImage(ctx, logo, pad, logoY, logoSize, 14);
      titleX = pad + logoSize + 16;
    }
    ctx.fillStyle = resolveColor('var(--ink)');
    ctx.font = 'bold 34px ' + jpFont;
    ctx.textAlign = 'left';
    ctx.fillText('ユナイト98', titleX, 78);

    /* 2. スコアとタイム */
    ctx.font = 'bold 84px ' + jpFont;
    ctx.fillStyle = resolveColor('var(--support)');
    var scoreText = String(found.size);
    ctx.fillText(scoreText, pad, 190);
    var scoreW = ctx.measureText(scoreText).width;

    ctx.font = 'bold 40px ' + jpFont;
    ctx.fillStyle = resolveColor('var(--dim)');
    ctx.fillText(' / ' + TOTAL, pad + scoreW, 190);

    ctx.font = '26px ' + jpFont;
    ctx.fillStyle = resolveColor('var(--muted)');
    ctx.textAlign = 'right';
    ctx.fillText('タイム ' + fmt(elapsed()), W - pad, 190);
    ctx.textAlign = 'left';

    /* 3. マス目（正解は型の色＋カラー画像、未正解は暗い背景＋シルエット。名前は描かない） */
    var gridTop = 230, gridBottom = 520;
    var gridW = W - pad * 2, gridH = gridBottom - gridTop, gap = 4;
    var best = { cols: 1, rows: items.length, size: 0 };
    for (var cols = 1; cols <= items.length; cols++) {
      var rows = Math.ceil(items.length / cols);
      var size = Math.min((gridW - gap * (cols - 1)) / cols, (gridH - gap * (rows - 1)) / rows);
      if (size > best.size) best = { cols: cols, rows: rows, size: size };
    }
    var size = Math.floor(best.size);
    var usedW = best.cols * size + (best.cols - 1) * gap;
    var usedH = best.rows * size + (best.rows - 1) * gap;
    var startX = pad + (gridW - usedW) / 2;
    var startY = gridTop + (gridH - usedH) / 2;

    items.forEach(function (item, i) {
      var col = i % best.cols, row = Math.floor(i / best.cols);
      var x = startX + col * (size + gap), y = startY + row * (size + gap);
      ctx.fillStyle = item.ok ? item.color : '#232B60';
      ctx.fillRect(x, y, size, size);

      var img = images.get(item.id);
      if (img) {
        var imgSize = size * 0.72;
        var ix = x + (size - imgSize) / 2, iy = y + (size - imgSize) / 2;
        ctx.drawImage(item.ok ? img : silhouette(img, '#3A4278'), ix, iy, imgSize, imgSize);
      }
    });

    /* 4. 内訳とモード名 */
    ctx.font = '20px ' + jpFont;
    ctx.fillStyle = resolveColor('var(--muted)');
    ctx.fillText(breakdown(), pad, 560);
    ctx.fillText('モード：' + currentModeLabel(), pad, 590);

    /* 5. サイトURL（右下・小さく） */
    ctx.font = '14px ' + jpFont;
    ctx.fillStyle = resolveColor('var(--dim)');
    ctx.textAlign = 'right';
    ctx.fillText(SITE_URL, W - pad, H - 24);
    ctx.textAlign = 'left';

    return canvas;
  }

  $('btn-save-image').addEventListener('click', function () {
    if (!finished) return;
    var items = resultItems();
    var loaders = items.map(function (item) {
      return loadImage('images/' + item.id + '.png').then(function (img) {
        return [item.id, img];
      });
    });
    loaders.push(loadImage('icon-192.png').then(function (img) {
      return [LOGO_ID, img];
    }));
    Promise.all(loaders).then(function (pairs) {
      var images = new Map(pairs);
      var canvas = drawResultCanvas(items, images);
      canvas.toBlob(function (blob) {
        if (!blob) { say('画像の作成に失敗しました。', 'ng'); return; }
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'unite-' + currentMode + '-' + found.size + 'of' + TOTAL + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        say('結果画像を保存しました。', 'ok');
      }, 'image/png');
    });
  });

  /* ---------- リセット ---------- */
  function resetGame(message) {
    found.clear();
    finished = false;
    clearInterval(timerId);
    timerId = null;
    startAt = null;
    $('clock').textContent = '00:00';
    guessEl.disabled = false;
    guessEl.value = '';
    guessEl.placeholder = 'ポケモンの名前を入力（ひらがなでもOK）';
    $('btn-hint').disabled = false;
    $('btn-give').disabled = false;
    $('btn-save-image').disabled = true;
    updateSubmitState();
    $('result').classList.remove('show');
    build();
    showBest();
    say(message);
    guessEl.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $('btn-reset').addEventListener('click', function () {
    resetGame('リセットしました。最初の1文字でタイマーが動きます。');
  });

  build();
  showBest();
  updateSubmitState();
  syncBarHeight();
})();
