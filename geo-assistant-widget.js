/*!
 * GEO-Апгрейд — AI-ассистент, виджет v1.2.1
 *
 * Подключение (вставить перед </body> на всех страницах):
 *   <script>window.GEO_ASSISTANT_CONFIG={endpoint:"https://ВАШ-WORKER.workers.dev"};</script>
 *   <script src="/geo-assistant-widget.js" defer></script>
 *
 * Если endpoint не задан — виджет работает в демо-режиме с заготовленными ответами.
 */
(function () {
  'use strict';
  var CFG = Object.assign({
    endpoint: '',
    title: 'GEO-АПГРЕЙД · AI-АССИСТЕНТ',
    subtitle: 'Главный лаборант',
    accent: '#00F0FF',
    welcome: 'Здравствуйте! Я главный лаборант GEO-Апгрейд, аватар Дарьи Жарких. Препарирую материалы лаборатории: AI-видимость, услуги, цены, термины. Что фиксируем?',
    chips: ['Сколько стоит аудит?', 'Что такое цифровой призрак?', 'Что входит в GEO-сканер?'],
    storageKey: 'geo_as_history_v1',
    maxHistory: 30
  }, window.GEO_ASSISTANT_CONFIG || {});

  var MOCK = [
    { re: /цен|стоим|стои[тт]|сколько|тариф|прайс|руб/i,
      text: 'По прайсу лаборатории: GEO-сканер Лайт — 8 000–12 000 ₽ (5–7 дней), GEO-сканер Полный — 12 000–20 000 ₽ (7–10 дней), GEO-тест-драйв — 30 000–55 000 ₽ (4–6 недель). Бесплатный мини-аудит: 3 запроса × 2 нейросети — заявку можно оставить на geo-upgrade.ru/contacts.html.',
      sources: [{ t: 'Услуги GEO-Апгрейда', u: 'https://geo-upgrade.ru/services.html' }] },
    { re: /призрак/i,
      text: 'Цифровой призрак — авторский термин GEO-Апгрейд: бренд, который в классическом поиске на виду, но в ответах нейросетей (ChatGPT, Нейро, Алиса AI) либо отсутствует, либо искажён. Клиент спрашивает у AI — а AI его не рекомендует. Призрака «оживляют» контентом, структурированными данными и упоминаниями — это и есть GEO.',
      sources: [{ t: 'Что такое цифровой призрак', u: 'https://geo-upgrade.ru/blog-post-digital-ghost.html' }] },
    { re: /сканер|аудит|проверк/i,
      text: 'GEO-сканер — аудит AI-видимости: проверяем, как ChatGPT, Нейро, Алиса AI и другие системы видят и рекомендуют ваш бренд. Лайт — 3 категории × 6 запросов, Полный — до 4 категорий × 12–20 запросов + разбор 3–5 конкурентов. Результат: карта слепых зон и план решений.',
      sources: [{ t: 'Услуги GEO-Апгрейда', u: 'https://geo-upgrade.ru/services.html' }] },
    { re: /geo|видимост|нейросет|ai|и[иi]/i,
      text: 'GEO (Generative Engine Optimization) — оптимизация сайта под то, чтобы нейросети находили бренд и рекомендовали его в ответах. Это про «то, что говорят о вас ChatGPT, Алиса и Perplexity», а не про позиции в выдаче. Лаборатория GEO-Апгрейд делает аудит, стратегию и контент для такой видимости.',
      sources: [{ t: 'Что такое GEO простыми словами', u: 'https://geo-upgrade.ru/blog-post-what-is-geo.html' }] },
    { re: /контакт|связ|заявк|позвон|телефон|telegram/i,
      text: 'Связаться с лабораторией: форма на geo-upgrade.ru/contacts.html (бесплатный мини-аудит), Telegram t.me/geoupgrade, почта geo.upgrade@bk.ru. Работаем Пн–Пт, 12:00–20:00 (UTC+7), Томск.',
      sources: [{ t: 'Контакты GEO-Апгрейд', u: 'https://geo-upgrade.ru/contacts.html' }] },
    { re: /.*/,
      text: 'Пока я в демо-режиме — работаю по заготовленным карточкам. Спросите про цены, услуги, термины (цифровой призрак, зона слепоты) или контакты. Полный доступ к базе лаборатории включится после подключения бэкенда из пакета.',
      sources: [] }
  ];
  function mockAnswer(q) {
    for (var i = 0; i < MOCK.length; i++) if (MOCK[i].re.test(q)) return MOCK[i];
    return MOCK[MOCK.length - 1];
  }

  var btn = null, panel = null, msgs = null, input = null, busy = false, history = [];

  function store(load) {
    try {
      if (load) history = JSON.parse(localStorage.getItem(CFG.storageKey) || '[]') || [];
      else localStorage.setItem(CFG.storageKey, JSON.stringify(history.slice(-CFG.maxHistory)));
    } catch (e) { history = load ? [] : history.slice(-CFG.maxHistory); }
  }

  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  function addMsg(role, text, sources, save) {
    var m = document.createElement('div');
    m.className = 'geoas-m geoas-' + (role === 'user' ? 'u' : 'a');
    m.innerHTML = esc(text).replace(/(https?:\/\/[^\s<]+)/g, function (_, u) {
      var t = u.replace(/[.,;:!?)]+$/, '');
      if (!t) t = u;
      return '<a href="' + t + '" target="_blank" rel="noopener" style="color:#00F0FF">' + t + '</a>' + u.slice(t.length);
    });
    msgs.appendChild(m);
    if (sources && sources.length) {
      var sm = document.createElement('div');
      sm.className = 'geoas-src';
      sm.innerHTML = 'Источник: ' + sources.map(function (s) {
        return '<a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t || s.u) + '</a>';
      }).join(' · ');
      msgs.appendChild(sm);
    }
    msgs.scrollTop = msgs.scrollHeight;
    if (save !== false) { history.push({ role: role, text: text, sources: sources || [] }); store(false); }
  }

  function typing(on) {
    var old = msgs.querySelector('.geoas-typing'); if (old) old.remove();
    if (on) {
      var t = document.createElement('div');
      t.className = 'geoas-typing';
      t.innerHTML = 'Ассистент <span>·</span><span>·</span><span>·</span>';
      msgs.appendChild(t); msgs.scrollTop = msgs.scrollHeight;
    }
  }

  function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    addMsg('user', text);
    busy = true; typing(true);
    if (CFG.demoMode) {
      setTimeout(function () {
        typing(false); busy = false;
        var m = mockAnswer(text);
        addMsg('assistant', m.text, m.sources);
      }, 500 + Math.random() * 600);
      return;
    }
    var ctrl = new AbortController();
    var to = setTimeout(function () { ctrl.abort(); }, 60000);
    fetch(CFG.endpoint.replace(/\/$/, '') + '/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: history.slice(-8).map(function (h) { return { role: h.role, text: h.text }; }) }),
      signal: ctrl.signal
    }).then(function (r) {
      clearTimeout(to);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      typing(false); busy = false;
      if (d.error) {
        addMsg('assistant', 'Техническая пауза на стороне ассистента. Попробуйте ещё раз — или оставьте заявку напрямую: https://geo-upgrade.ru/contacts.html',
          [{ t: 'Контакты GEO-Апгрейд', u: 'https://geo-upgrade.ru/contacts.html' }]);
      } else {
        addMsg('assistant', d.answer || 'Не удалось получить ответ.', d.sources || []);
      }
    }).catch(function () {
      clearTimeout(to); typing(false); busy = false;
      addMsg('assistant', 'Связь с лабораторией прервалась. Попробуйте ещё раз — или оставьте заявку напрямую: https://geo-upgrade.ru/contacts.html',
        [{ t: 'Контакты GEO-Апгрейд', u: 'https://geo-upgrade.ru/contacts.html' }]);
    });
  }

  function build() {
    var root = document.createElement('div'); root.id = 'geoas-root';
    btn = document.createElement('button'); btn.id = 'geoas-btn'; btn.setAttribute('aria-label', 'Открыть чат с ассистентом');
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/><path d="M8.5 10.5h7M8.5 13.5h4.5"/></svg>';
    panel = document.createElement('div'); panel.id = 'geoas-panel';
    var head = document.createElement('div'); head.id = 'geoas-head';
    head.innerHTML = '<div class="geoas-logo"></div><div><div class="geoas-t">' + esc(CFG.title) + '</div><div class="geoas-s">' + esc(CFG.subtitle) + '</div></div>' +
      (CFG.demoMode ? '<span id="geoas-badge">ДЕМО</span>' : '') + '<button id="geoas-close" aria-label="Закрыть">×</button>';
    msgs = document.createElement('div'); msgs.id = 'geoas-msgs';
    var chips = document.createElement('div'); chips.id = 'geoas-chips';
    (CFG.chips || []).forEach(function (c) {
      var b = document.createElement('button'); b.className = 'geoas-chip'; b.textContent = c;
      b.addEventListener('click', function () { send(c); });
      chips.appendChild(b);
    });
    var row = document.createElement('div'); row.id = 'geoas-inputrow';
    input = document.createElement('input'); input.id = 'geoas-input'; input.type = 'text';
    input.placeholder = 'Ваш вопрос…';
    var sendB = document.createElement('button'); sendB.id = 'geoas-send'; sendB.setAttribute('aria-label', 'Отправить');
    sendB.innerHTML = '<svg viewBox="0 0 24 24"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
    row.appendChild(input); row.appendChild(sendB);
    panel.appendChild(head); panel.appendChild(msgs); panel.appendChild(chips); panel.appendChild(row);
    root.appendChild(btn); root.appendChild(panel);
    document.body.appendChild(root);

    btn.addEventListener('click', function () {
      var open = panel.classList.toggle('geoas-open');
      if (open && msgs.children.length === 0) addMsg('assistant', CFG.welcome, []);
      if (open) input.focus();
    });
    head.querySelector('#geoas-close').addEventListener('click', function () { panel.classList.remove('geoas-open'); });
    sendB.addEventListener('click', function () { send(input.value); input.value = ''; });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { send(input.value); input.value = ''; } });
  }

  function injectCss() {
    var s = document.createElement('style');
    s.textContent = [
      '#geoas-root,#geoas-root *{box-sizing:border-box;margin:0;padding:0}',
      '#geoas-root{position:relative;z-index:2147483000;font-family:"Exo 2",-apple-system,"Segoe UI",sans-serif;line-height:1.45}',
      '#geoas-btn{position:fixed;right:22px;bottom:22px;width:58px;height:58px;border-radius:50%;border:1px solid rgba(0,240,255,.6);cursor:pointer;z-index:2147483001;background:linear-gradient(140deg,#16092A,#1B0B31);box-shadow:0 0 22px rgba(0,240,255,.45),0 4px 18px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;transition:transform .18s ease, box-shadow .18s ease}',
      '#geoas-btn:hover{transform:scale(1.07);box-shadow:0 0 30px rgba(0,240,255,.65),0 4px 18px rgba(0,0,0,.5)}',
      '#geoas-btn svg{width:26px;height:26px;stroke:#00F0FF;fill:none;stroke-width:1.8}',
      '#geoas-panel{position:fixed;right:22px;bottom:92px;width:min(384px,calc(100vw - 24px));height:min(560px,calc(100vh - 120px));z-index:2147483002;border-radius:18px;border:1px solid rgba(0,240,255,.35);background:linear-gradient(160deg,#16092A 0%,#0D0618 55%,#1B0B31 100%);box-shadow:0 0 28px rgba(0,240,255,.22),0 12px 40px rgba(0,0,0,.6);display:none;flex-direction:column;overflow:hidden}',
      '#geoas-panel.geoas-open{display:flex;animation:geoasIn .22s ease}',
      '@keyframes geoasIn{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}',
      '#geoas-head{padding:14px 16px 12px;border-bottom:1px solid rgba(0,240,255,.18);display:flex;align-items:center;gap:10px;background:rgba(0,240,255,.05)}',
      '#geoas-head .geoas-logo{width:34px;height:34px;border-radius:50%;flex:none;background:radial-gradient(circle at 35% 30%,#00F0FF 0%,#1B0B31 70%);box-shadow:0 0 12px rgba(0,240,255,.6)}',
      '#geoas-head .geoas-t{color:#fff;font-family:Orbitron,"Exo 2",sans-serif;font-size:12px;letter-spacing:.06em}',
      '#geoas-head .geoas-s{color:rgba(255,255,255,.55);font-size:11px}',
      '#geoas-badge{margin-left:auto;font-size:9px;color:#0D0618;background:#00F0FF;border-radius:8px;padding:2px 7px;letter-spacing:.08em;font-family:Orbitron,sans-serif}',
      '#geoas-close{background:none;border:none;color:rgba(255,255,255,.6);font-size:20px;cursor:pointer;padding:2px 6px;line-height:1}',
      '#geoas-close:hover{color:#00F0FF}',
      '#geoas-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:rgba(0,240,255,.4) transparent}',
      '.geoas-m{max-width:88%;padding:9px 12px;border-radius:12px;font-size:13.5px;color:#fff;white-space:pre-wrap;word-break:break-word}',
      '.geoas-a{align-self:flex-start;background:rgba(0,240,255,.08);border-left:2px solid rgba(0,240,255,.7);border-radius:4px 12px 12px 12px}',
      '.geoas-u{align-self:flex-end;background:rgba(255,255,255,.09);border-radius:12px 4px 12px 12px}',
      '.geoas-src{align-self:flex-start;max-width:88%;font-size:11px;color:rgba(255,255,255,.5)}',
      '.geoas-src a{color:#00F0FF;text-decoration:none;opacity:.85}',
      '.geoas-src a:hover{text-decoration:underline;opacity:1}',
      '.geoas-typing{align-self:flex-start;color:rgba(255,255,255,.6);font-size:13px;padding:4px 2px}',
      '.geoas-typing span{animation:geoasBlink 1.2s infinite}',
      '.geoas-typing span:nth-child(2){animation-delay:.2s}',
      '.geoas-typing span:nth-child(3){animation-delay:.4s}',
      '@keyframes geoasBlink{0%,60%,100%{opacity:.25}30%{opacity:1}}',
      '#geoas-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px}',
      '.geoas-chip{font-size:11.5px;color:#00F0FF;border:1px solid rgba(0,240,255,.4);border-radius:999px;padding:5px 11px;cursor:pointer;background:rgba(0,240,255,.05);font-family:"Exo 2",sans-serif}',
      '.geoas-chip:hover{background:rgba(0,240,255,.16)}',
      '#geoas-inputrow{display:flex;gap:8px;padding:10px 12px;border-top:1px solid rgba(0,240,255,.18);background:rgba(0,0,0,.25)}',
      '#geoas-input{flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(0,240,255,.25);border-radius:10px;color:#fff;font-size:13.5px;padding:10px 12px;outline:none;font-family:"Exo 2",sans-serif}',
      '#geoas-input::placeholder{color:rgba(255,255,255,.35)}',
      '#geoas-input:focus{border-color:rgba(0,240,255,.6);box-shadow:0 0 8px rgba(0,240,255,.25)}',
      '#geoas-send{width:42px;border-radius:10px;border:1px solid rgba(0,240,255,.5);background:linear-gradient(140deg,rgba(0,240,255,.25),rgba(27,11,49,.6));cursor:pointer;display:flex;align-items:center;justify-content:center}',
      '#geoas-send:hover{background:rgba(0,240,255,.3)}',
      '#geoas-send svg{width:18px;height:18px;stroke:#00F0FF;fill:none;stroke-width:2}',
      '@media (max-width:480px){#geoas-panel{right:12px;bottom:80px}#geoas-btn{right:14px;bottom:14px}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function init() {
    CFG.demoMode = (CFG.demoMode === undefined) ? !CFG.endpoint : !!CFG.demoMode;
    injectCss(); store(true); build();
    if (history.length) history.forEach(function (h) { addMsg(h.role, h.text, h.sources, false); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
