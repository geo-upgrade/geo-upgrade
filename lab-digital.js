/* GEO-Апгрейд — lab-digital.js v1: покупка цифровых продуктов со страницы digital-products.html.
  Работает со всеми кнопками a.dg-buy: создаёт заказ в digital_orders до оплаты, открывает оплату в Точке,
  объясняет гостю про вход и докупает после возврата с login.html (pending-заявка).
  Кнопки мини-услуг («Оплатить») остаются под управлением lab-pay.js. */
/* GEO-Апгрейд · заказ цифрового продукта v2: заявка в digital_orders до оплаты; понятные ошибки (сессия/RLS/сеть) */
(function(){
  var SB='https://cpaevaypyplwcdjrfzpj.supabase.co';
  var KEY='sb_publishable_XgpZnxkWQTSSwPaP6ClKPw_YzV2r5Z-';
  var TO=location.pathname.split('/').pop().replace('.html','');
  function sess(){try{var j=JSON.parse(localStorage.getItem('geo_lab_auth')||'null');return j&&j.token?j:null}catch(e){return null}}
  function pending(){try{return JSON.parse(localStorage.getItem('geo_lab_dg_pending')||'null')}catch(e){return null}}
  function setPending(v){try{if(v)localStorage.setItem('geo_lab_dg_pending',JSON.stringify(v));else localStorage.removeItem('geo_lab_dg_pending')}catch(e){}}
  function toast(t){var d=document.createElement('div');d.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:26px;z-index:130;background:#241950;border:1px solid rgba(0,240,255,.5);color:#fff;font:13px \'Exo 2\',sans-serif;padding:12px 18px;border-radius:12px;box-shadow:0 0 18px rgba(0,240,255,.25)';d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove()},5200)}
  function panel(html,border){var d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:120;background:rgba(6,3,14,.78);display:flex;align-items:center;justify-content:center;padding:20px';d.innerHTML='<div style="max-width:460px;background:#16092A;border:1px solid '+border+';border-radius:16px;padding:24px;color:#F5F7FA;font-family:\'Exo 2\',sans-serif">'+html+'</div>';document.body.appendChild(d);return d}
  function relogin(){try{localStorage.removeItem('geo_lab_auth')}catch(e){};location.href='login.html?to='+TO}
  async function rtxt(r){try{var j=await r.json();return (j&&(j.message||j.error_description||j.msg||j.hint))||''}catch(e){return ''}}
  function localSess(){try{return JSON.parse(localStorage.getItem('geo_lab_session')||'null')}catch(e){return null}}
  function authObj(){try{return JSON.parse(localStorage.getItem('geo_lab_auth')||'null')}catch(e){return null}}
  function dlgGuest(a){
    var stale=(function(){var ao=authObj();if(ao&&!ao.token)return true;if(localSess()&&!sess())return true;return false})();
    var d=panel('<div style="color:#00F0FF;font-size:10px;letter-spacing:.22em;text-transform:uppercase;font-family:Orbitron,sans-serif">'+(stale?'НУЖЕН ВХОД ПО EMAIL':'ЦИФРОВОЙ ПРОДУКТ')+'</div>'
      +'<h3 style="font-family:Orbitron,sans-serif;font-size:17px;margin:8px 0">'+a.name+'</h3>'
      +'<p style="font-size:13.5px;color:#c8cbe0;margin:0 0 16px">'+(stale
        ?'У вас открыт старый локальный вход («ЛК» в шапке) — у него нет ключа базы лаборатории, поэтому заказ не создаётся. Введите email и пароль ещё раз: база выдаст ключ автоматически, и покупка сразу попадёт в кабинет и в админку. Если пароль забыли — зарегистрируйтесь заново с тем же email, база подтвердит учётную запись сама, без письма.'
        :'Чтобы заказ появился в личном кабинете, а после подтверждения открылся доступ, нужен вход. Если оплатить без входа — лаборатория всё равно увидит платёж и подтвердит вручную по чеку.')+'</p>'
      +'<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="dg-l" href="login.html?to='+TO+'" style="background:#00F0FF;color:#0D0618;font-family:Orbitron,sans-serif;font-size:11.5px;letter-spacing:.08em;border-radius:12px;padding:11px 18px;text-decoration:none;font-weight:700">ВОЙТИ И КУПИТЬ &rarr;</a>'
      +'<a class="dg-p" href="'+a.pay+'" target="_blank" rel="noopener" style="color:#c8cbe0;border:1px solid rgba(184,188,198,.4);font-family:Orbitron,sans-serif;font-size:11.5px;letter-spacing:.08em;border-radius:12px;padding:11px 18px;text-decoration:none;font-weight:700">ПРОСТО ОПЛАТИТЬ &rarr;</a>'
      +'<button class="dg-c" style="color:#c8cbe0;border:1px solid rgba(184,188,198,.4);background:transparent;font-family:Orbitron,sans-serif;font-size:11.5px;letter-spacing:.08em;border-radius:12px;padding:11px 18px;cursor:pointer;font-weight:700">ОТМЕНА</button></div>');
    d.querySelector('.dg-l').addEventListener('click',function(){setPending({code:a.code})});
    d.querySelector('.dg-c').addEventListener('click',function(){d.remove()});
  }
  function dlgPay(a,title,text){
    panel('<div style="color:#00F0FF;font-size:10px;letter-spacing:.22em;text-transform:uppercase;font-family:Orbitron,sans-serif">'+title+'</div>'
      +'<p style="font-size:13.5px;color:#c8cbe0;margin:10px 0 16px">'+text+'</p>'
      +'<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="dg-p" href="'+a.pay+'" target="_blank" rel="noopener" style="background:#00F0FF;color:#0D0618;font-family:Orbitron,sans-serif;font-size:11.5px;letter-spacing:.08em;border-radius:12px;padding:11px 18px;text-decoration:none;font-weight:700">ПЕРЕЙТИ К ОПЛАТЕ &rarr;</a>'
      +'<a href="cabinet.html" style="color:#c8cbe0;border:1px solid rgba(184,188,198,.4);font-family:Orbitron,sans-serif;font-size:11.5px;letter-spacing:.08em;border-radius:12px;padding:11px 18px;text-decoration:none;font-weight:700">В КАБИНЕТ</a></div>','rgba(0,240,255,.45)');
  }
  function dlgErr(a,status,msg){
    var isAuth=(status===401||/invalid jwt|jwt expired/i.test(msg||''));
    var text;
    if(isAuth){
      text='<div style="color:#FFD66E;font-size:10px;letter-spacing:.22em;text-transform:uppercase;font-family:Orbitron,sans-serif">СЕССИЯ УСТАРЕЛА</div>'
        +'<p style="font-size:13.5px;color:#c8cbe0;margin:10px 0 16px">База лаборатории ответила 401 — вход в кабинет устарел. Войдите заново и повторите покупку: заявка тогда попадёт в кабинет и в админку. Можно и просто оплатить по ссылке — лаборатория подтвердит вручную по чеку.</p>'
        +'<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="dg-rl" style="background:#00F0FF;color:#0D0618;font-family:Orbitron,sans-serif;font-size:11.5px;letter-spacing:.08em;border-radius:12px;padding:11px 18px;cursor:pointer;font-weight:700">ВОЙТИ ЗАНОВО &rarr;</button>'
        +'<a class="dg-p" href="'+a.pay+'" target="_blank" rel="noopener" style="color:#c8cbe0;border:1px solid rgba(184,188,198,.4);font-family:Orbitron,sans-serif;font-size:11.5px;letter-spacing:.08em;border-radius:12px;padding:11px 18px;text-decoration:none;font-weight:700">ПРОСТО ОПЛАТИТЬ &rarr;</a></div>';
    } else {
      text='<div style="color:#FF4FD8;font-size:10px;letter-spacing:.22em;text-transform:uppercase;font-family:Orbitron,sans-serif">ОШИБКА БАЗЫ · '+status+'</div>'
        +'<p style="font-size:13.5px;color:#c8cbe0;margin:10px 0 16px">'+(msg?msg+'. ':'')+'Заказ сейчас не создался — сообщите лаборатории номер ошибки. Пока можно оплатить по прямой ссылке, покупку подтвердят вручную по чеку.</p>'
        +'<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="dg-p" href="'+a.pay+'" target="_blank" rel="noopener" style="background:#FFD66E;color:#0D0618;font-family:Orbitron,sans-serif;font-size:11.5px;letter-spacing:.08em;border-radius:12px;padding:11px 18px;text-decoration:none;font-weight:700">ПРОСТО ОПЛАТИТЬ &rarr;</a>'
        +'<button class="dg-c" style="color:#c8cbe0;border:1px solid rgba(184,188,198,.4);background:transparent;font-family:Orbitron,sans-serif;font-size:11.5px;letter-spacing:.08em;border-radius:12px;padding:11px 18px;cursor:pointer;font-weight:700">ЗАКРЫТЬ</button></div>';
    }
    var d=panel(text,'rgba(255,79,216,.5)');
    var rl=d.querySelector('.dg-rl');
    if(rl)rl.addEventListener('click',function(){d.remove();relogin()});
    var c=d.querySelector('.dg-c');
    if(c)c.addEventListener('click',function(){d.remove()});
  }
  async function dgBuy(a,silent){
    var s=sess();
    if(!s){ dlgGuest(a); return false; }
    try{
      var q=SB+'/rest/v1/digital_orders?email=eq.'+encodeURIComponent(String(s.email||'').toLowerCase())+'&product_id=eq.'+a.code;
      var r=await fetch(q,{headers:{apikey:KEY,Authorization:'Bearer '+s.token}});
      if(!r.ok){ var m0=await rtxt(r); dlgErr(a,r.status,m0); return false; }
      var rows=await r.json().catch(function(){return []});
      if((rows||[]).some(function(x){return x.status==='confirmed'})){
        dlgPay(a,'УЖЕ КУПЛЕНО','Этот продукт уже куплен и подтверждён — доступ открыт в личном кабинете, секция «Мои цифровые продукты».');
        return true;
      }
      var alreadyPending=(rows||[]).some(function(x){return x.status==='pending'});
      if(!alreadyPending){
        var body={email:String(s.email||'').toLowerCase(),user_id:s.uid||null,product_id:a.code,product_name:a.name,amount:a.amount,status:'pending',paid_at:null,note:null};
        var r2=await fetch(SB+'/rest/v1/digital_orders',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+s.token,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(body)});
        if(!r2.ok){ var m2=await rtxt(r2); dlgErr(a,r2.status,m2); return false; }
      }
      if(silent){
        dlgPay(a,'ЗАКАЗ СОЗДАН',(alreadyPending?'Заказ уже ждёт подтверждения — можно завершить или повторить оплату. ':'Заявка создана и уже видна в личном кабинете. '));
      } else {
        window.open(a.pay,'_blank','noopener');
        toast(alreadyPending?'Заказ уже ждёт подтверждения. Завершите оплату — доступ откроется после подтверждения лабораторией.':'Заявка создана и видна в личном кабинете. Завершите оплату на странице Точки.');
      }
      return true;
    }catch(e){
      panel('<div style="color:#FF4FD8;font-size:10px;letter-spacing:.22em;text-transform:uppercase;font-family:Orbitron,sans-serif">НЕТ СВЯЗИ</div>'
        +'<p style="font-size:13.5px;color:#c8cbe0;margin:10px 0 16px">Не получилось связаться с базой лаборатории ('+String(e.message||e).slice(0,120)+'). Проверьте интернет и повторите, либо оплатите по прямой ссылке — покупку подтвердят вручную по чеку.</p>'
        +'<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="dg-p" href="'+a.pay+'" target="_blank" rel="noopener" style="background:#FFD66E;color:#0D0618;font-family:Orbitron,sans-serif;font-size:11.5px;letter-spacing:.08em;border-radius:12px;padding:11px 18px;text-decoration:none;font-weight:700">ПРОСТО ОПЛАТИТЬ &rarr;</a>'
        +'<button class="dg-c" style="color:#c8cbe0;border:1px solid rgba(184,188,198,.4);background:transparent;font-family:Orbitron,sans-serif;font-size:11.5px;letter-spacing:.08em;border-radius:12px;padding:11px 18px;cursor:pointer;font-weight:700">ЗАКРЫТЬ</button></div>','rgba(255,79,216,.5)');
      return false;
    }
  }
  document.addEventListener('click',function(e){
    var t=e.target;
    var a=t&&t.closest?t.closest('a.dg-buy'):null;
    if(!a) return;
    e.preventDefault();
    dgBuy({code:a.dataset.code,name:a.dataset.name,amount:parseInt(a.dataset.amount,10)||0,pay:a.href},false);
  });
  (function resume(){
    var p=pending(); if(!p) return;
    if(!sess()||!/login\.html/.test(document.referrer)) return;
    setPending(null);
    var a=document.querySelector('a.dg-buy[data-code="'+p.code+'"]');
    if(!a) return;
    dgBuy({code:a.dataset.code,name:a.dataset.name,amount:parseInt(a.dataset.amount,10)||0,pay:a.href},true);
  })();
})();