(function(){
  /* GEO-Апгрейд — тихий дубль заявки в закрытый бот «Сигнал» (v2, 19.10.2026)
     Форма продолжает уходить на Formspree как раньше; параллельно теми же полями
     шлём копию на воркер-приёмник. Ошибка дубля не мешает основной отправке.
     v2: секрет передаётся в запросе (?secret=...) — раньше не передавался вовсе
     и воркер возвращал 403; подписка на событие submit формы (а не только на
     кнопку — так ловится и отправка клавишей Enter); повторяем валидацию
     и сборку «источника» один в один с основным обработчиком формы;
     keepalive — чтобы запрос не обрывался.
     Секрет FORM_SECRET уже вписан в SECRET — менять в этом файле ничего не нужно.
     Если адрес воркера изменится при пересоздании — поправить INBOX. */
  var INBOX = 'https://geo-upgrade-inbox.dafna-acid.workers.dev/lead';
  var SECRET = 'gu_-8LBI_jtmp8EF4vLHt2Xx1I3A6YZ_7Az';

  function sourceTextOf() {
    var sel = document.getElementById('source');
    var custom = document.getElementById('source-custom');
    var t = '';
    if (sel && sel.value) {
      t = sel.value;
      if (t === 'Другое (свой вариант)' && custom) {
        var sct = custom.value.trim();
        t = sct ? 'Другое — ' + sct : 'Другое';
      }
    }
    return t;
  }

  function fire() {
    try {
      var f = document.getElementById('contactForm');
      if (!f || f.dataset.relay === '1') return;
      f.dataset.relay = '1';
      f.addEventListener('submit', function(){
        try {
          var nameEl = document.getElementById('name');
          var emailEl = document.getElementById('email');
          var msgEl = document.getElementById('message');
          var consentEl = document.getElementById('consent');
          var name = nameEl ? nameEl.value.trim() : '';
          var email = emailEl ? emailEl.value.trim() : '';
          var message = msgEl ? msgEl.value.trim() : '';
          var consent = !!(consentEl && consentEl.checked);
          if (!name || !email || email.indexOf('@') === -1 || !message || !consent) return;
          var gotcha = f.querySelector('[name="_gotcha"]');
          if (gotcha && gotcha.value) return;
          var data = new FormData(f);
          data.set('source', sourceTextOf() || '—');
          data.set('page', 'contacts.html');
          fetch(INBOX + '?secret=' + encodeURIComponent(SECRET), {
            method: 'POST', body: data, keepalive: true
          }).catch(function(){});
        } catch (e) {}
      });
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fire);
  else fire();
})();
