/* GEO-Апгрейд — lab-pay.js v2: «два в одном» надёжно.
   Клик «Оплатить через Точку»: 1) окно Точки открывается СРАЗУ (в рамках жеста — не блокируется);
   2) параллельно уходит заявка в лабораторию: fetch с keepalive (переживает закрытие вкладки)
   + фолбэк navigator.sendBeacon; 3) если клиент вошёл в кабинет — заказ «На проверке» в «Мои покупки».
   Если popup-блокировщик не дал открыть окно — срабатывает обычный переход по ссылке. */
(function(){
  var LAB_PAY_SVC = {'a3d554e5-f2ff-4b4e-b34a-dafcf14b4356':{n:'GEO-сканер Лайт',a:10000},'c1a2c754-db6b-43c1-beff-597bc5e24bc6':{n:'GEO-сканер Полный — базовый',a:15000},'d70420cc-931f-4a87-a6ea-b1d949d91cd9':{n:'GEO-сканер Полный — расширенный',a:18000},'94eafa1f-e876-48aa-b3ec-351590dd44a7':{n:'GEO-лаборатория Лайт',a:15000},'a2d467d7-769e-44e9-99ab-b0419fb7eb90':{n:'GEO-лаборатория Полная',a:25000},'3e166060-634c-4649-b82f-a857225f5c65':{n:'GEO-маршрут',a:22000},'d3aa7d9a-b536-469b-b7d5-0a7e46f3da95':{n:'GEO-тест-драйв',a:45000},'f278bd15-e4d1-4ea6-b917-788f1303bd88':{n:'GEO-штурвал — стандарт',a:65000},'c29f38f8-d69d-4962-8469-fa4a7c37b4bd':{n:'GEO-штурвал — расширенный',a:80000},'4be969e7-1b46-459c-a836-cad98855ed07':{n:'Промпт-компас',a:10000},'67888f26-4dcd-478d-954b-d79bd738d407':{n:'Промпт-карта бренда',a:20000},'da2f1197-194b-4ba9-bcde-d5a6619267b2':{n:'AI-экспедиция Лайт',a:6000},'907ebde7-b765-4b99-b977-11dcce78ca5b':{n:'AI-экспедиция Полная',a:15000},'743611db-c37e-4f0a-bbd1-835d48209e51':{n:'Навигатор отзывов',a:9000},'f21f6d66-72a6-4154-bb1a-bde7f246a66f':{n:'GEO-Зеркало',a:2500},'3212b98b-5246-4ab8-9ca5-92eebe5db3be':{n:'GEO-Детектор конкурента',a:3000},'a95d9286-5649-47b9-8d17-d21f64edccbc':{n:'AI-Паспорт компании',a:3500},'4302aab9-a9ac-4e11-8b06-17b07c99ea67':{n:'GEO-Техблок',a:5000},'47467f79-e966-45c1-a97e-31b74fdf993c':{n:'GEO-Статья (шт)',a:3000}};
  var FORMSPREE='https://formspree.io/f/mljdyaqo';
  function jget(k,d){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(_){return d}}
  function session(){var e=jget('geo_lab_session',null);if(!e)return null;var u=jget('geo_lab_users',{})[e];return u?{email:e,name:u.name}:null}
  function jget(k,d){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(_){return d}}
  function session(){var e=jget('geo_lab_session',null);if(!e)return null;var u=jget('geo_lab_users',{})[e];return u?{email:e,name:u.name}:null}
  function fmt(n){return n>0?n.toLocaleString('ru-RU')+' ₽':''}
  function post(subject,text){
    var body=JSON.stringify({subject:subject,text:text,from:'site@geo-upgrade.ru'});
    var done=false;
    function beacon(){try{navigator.sendBeacon(FORMSPREE,new Blob([body],{type:'application/json'}))}catch(_){}}
    try{
      fetch(FORMSPREE,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:body,keepalive:true})
        .then(function(r){if(!r.ok)beacon()}).catch(beacon);
    }catch(_){beacon()}
  }
  function toast(){var d=document.createElement('div');d.style.cssText='position:fixed;right:16px;bottom:16px;z-index:9999;max-width:340px;padding:12px 16px;border-radius:10px;background:rgba(13,6,24,.95);border:1px solid rgba(0,240,255,.4);color:#F4F4FA;font-size:13px;line-height:1.5;box-shadow:0 0 18px rgba(0,240,255,.25)';d.textContent='Заявка ушла в лабораторию, оплата открылась в новой вкладке. После оплаты укажите номер чека в личном кабинете.';d.onclick=function(){d.remove()};document.body.appendChild(d);setTimeout(function(){d.remove()},8000)}
  var page=location.pathname.split('/').pop();
  function fire(uid,svc){
    var nm=svc?svc.n:(uid?('Услуга GEO-Апгрейд'):'Услуга GEO-Апгрейд');
    var am=svc?svc.a:0;
    var t=new Date().toLocaleString('ru-RU');
    var who=session();
    if(who){
      var list=jget('geo_lab_orders',[]);
      var today=new Date().toISOString().slice(0,10);
      var dup=list.some(function(o){return o.uid===uid&&o.email===who.email&&o.isodate===today});
      if(!dup){
        list.push({id:'o'+Date.now(),uid:uid,name:nm,amount:am,email:who.email,name2:who.name||'',note:'',date:t,isodate:today,status:'На проверке'});
        try{localStorage.setItem('geo_lab_orders',JSON.stringify(list))}catch(_){}
      }
      post('[Сайт] ОПЛАТА — '+nm+' — '+(who.name||'')+' — '+who.email,
        'Клиент оплатил со страницы '+page+'.\nУслуга: '+nm+(am?('\nСумма: '+fmt(am)):'')+'\nИмя: '+(who.name||'')+'\nEmail: '+who.email+'\nВремя: '+t);
    } else {
      post('[Сайт] ЗАЯВКА (гость) — '+nm,
        'Гость кликнул «Оплатить» со страницы '+page+'.\nУслуга: '+nm+(am?('\nСумма: '+fmt(am)):'')+'\nАккаунт не создан — связаться с клиентом.\nВремя: '+t);
    }
    toast();
  }
  [].slice.call(document.querySelectorAll('a[href*="tochkaplace.com/ia/"]')).forEach(function(a){
    if(a.getAttribute('data-labpay')==='1')return;
    a.setAttribute('data-labpay','1');
    if(!a.getAttribute('target'))a.setAttribute('target','_blank');
    if(!a.getAttribute('rel'))a.setAttribute('rel','noopener');
    a.addEventListener('click',function(ev){
      var uid=(a.href.match(/tochkaplace\.com\/ia\/([a-f0-9-]+)/)||[])[1];
      var svc=uid?LAB_PAY_SVC[uid]:null;
      var w=null;
      try{w=window.open(a.href,'_blank','noopener')}catch(_){}
      if(!w){fire(uid,svc);return}
      ev.preventDefault();ev.stopPropagation();
      fire(uid,svc);
    });
  });
})();
