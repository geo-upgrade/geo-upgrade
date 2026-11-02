/* GEO-Апгрейд — lab-pay.js v3: кнопки «Оплатить» работают через личный кабинет.
   Клик: не вошёл → login.html?pay=UID (вход/бесплатная регистрация, после входа
   кабинет откроет панель «Заявка и оплата»); вошёл → сразу cabinet.html?pay=UID.
   Заявка в лабораторию уходит при подтверждении в кабинете (postLab: Formspree + канал «Сигнал»),
   вместе с открытием оплаты в Точке. Прямая ссылка на Точку в href — фолбэк, если скрипт не загрузился. */
(function(){
  [].slice.call(document.querySelectorAll('a[href*="tochkaplace.com/ia/"]')).forEach(function(a){
    if(a.getAttribute('data-labpay')==='1')return;
    a.setAttribute('data-labpay','1');
    a.addEventListener('click',function(ev){
      ev.preventDefault();ev.stopPropagation();
      var uid=(a.href.match(/tochkaplace\.com\/ia\/([a-f0-9-]+)/)||[])[1];
      var e=null;try{e=JSON.parse(localStorage.getItem('geo_lab_session')||'null')}catch(_){}
      if(!e){location.href='login.html?pay='+encodeURIComponent(uid||'');return}
      location.href='cabinet.html?pay='+encodeURIComponent(uid||'');
    });
  });
})();
