/* GEO-Апгрейд — contacts-lk.js v1 (02.11.2026)
   Форма контактов работает через личный кабинет:
   — гость видит приглашение (форма скрыта), кнопка ведёт на вход/регистрацию;
   — вошедший: поля имя/email предзаполнены из аккаунта;
   — после успешной отправки — через 4 секунды перенесём в кабинет: там каталог
     услуг, заявка и оплата (Formspree + канал «Сигнал» уже шлют заявку). */
(function(){
  function session(){try{var e=JSON.parse(localStorage.getItem('geo_lab_session')||'null');if(!e)return null;var u=(JSON.parse(localStorage.getItem('geo_lab_users')||'{}')||{})[e];return u?{email:e,name:u.name}:null}catch(_){return null}}
  function ready(){
    try{
      var f=document.getElementById('contactForm');if(!f)return;
      var g=document.getElementById('contact-gate');if(!g)return;
      var s=session();
      if(s){
        var nm=document.getElementById('name'),em=document.getElementById('email');
        if(nm&&!nm.value)nm.value=s.name||'';
        if(em&&!em.value)em.value=s.email||'';
        f.style.display='';return;
      }
      g.style.display='';
    }catch(_){}
  }
  window.GEO_LK_AFTER_FORM=function(){
    try{
      var sc=document.getElementById('success');if(!sc)return;
      var box=document.createElement('div');
      box.style.cssText='margin-top:14px;padding:12px 14px;border:1px solid rgba(0,240,255,.35);border-radius:10px;background:rgba(13,6,24,.6);color:#F4F4FA;font-size:14px;line-height:1.6';
      box.innerHTML='Заявка ушла в лабораторию. Через <b id=\"lk-cnt\">4</b> секунды перенесём вас в личный кабинет — там можно сразу выбрать услугу и оплатить. <a href=\"cabinet.html\" style=\"color:#00F0FF;text-decoration:underline\">Перейти сейчас</a>';
      sc.appendChild(box);
      var n=4,el=box.querySelector('#lk-cnt');
      var t=setInterval(function(){n--;if(el)el.textContent=String(n);if(n<=0){clearInterval(t);location.replace('cabinet.html')}},1000);
    }catch(_){}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
