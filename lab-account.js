/* GEO-Апгрейд — lab-account.js v4.
   «ЛК» — маленький бейдж в ПРАВОМ ВЕРХНЕМ углу шапки (позиция absolute, меню не трогает и не ломает).
   Вход/регистрация — отдельная страница login.html; кабинет — cabinet.html.
   Плюс кнопка «♡ В избранное» слева снизу (fixed, вёрстку не двигает). */
(function(){
  function session(){
    try{
      var e=JSON.parse(localStorage.getItem('geo_lab_session')||'null');
      if(!e)return null;
      var u=JSON.parse(localStorage.getItem('geo_lab_users')||'{}')[e];
      return u?{email:e,name:u.name}:null;
    }catch(_){return null}
  }
  var s=session();
  var page=location.pathname.split('/').pop();
  if(/^(cabinet\.html|login\.html)$/.test(page))return;
  var header=document.querySelector('header');
  if(header&&!document.getElementById('lab-lk-btn')){
    var a=document.createElement('a');
    a.id='lab-lk-btn';
    a.href='cabinet.html';
    a.setAttribute('aria-label','Личный кабинет');
    a.textContent=s&&s.name?('ЛК · '+String(s.name).slice(0,12)):'ЛК';
    a.style.cssText='position:absolute;top:10px;right:14px;z-index:61;padding:6px 11px;border-radius:999px;border:1px solid rgba(212,184,150,.55);background:rgba(13,6,24,.92);color:#FFD66E;font:600 12px/1.2 system-ui,-apple-system,sans-serif;letter-spacing:.03em;text-decoration:none;white-space:nowrap;box-shadow:0 0 10px rgba(255,214,110,.22)';
    if(getComputedStyle(header).position==='static')header.style.position='relative';
    header.appendChild(a);
  }
  /* «♡ В избранное» — fixed-кнопка слева снизу, вёрстку не двигает */
  if(!document.getElementById('lab-fav-btn')&&/\.html$/.test(page)){
    var btn=document.createElement('button');
    btn.id='lab-fav-btn';
    btn.type='button';
    btn.setAttribute('aria-label','В избранное');
    btn.style.cssText='position:fixed;left:14px;bottom:14px;z-index:60;width:34px;height:34px;border-radius:50%;border:1px solid rgba(212,184,150,.45);background:rgba(13,6,24,.85);color:#C9B27F;font-size:15px;line-height:1;cursor:pointer;box-shadow:0 0 10px rgba(255,214,110,.18)';
    function favs(){try{return JSON.parse(localStorage.getItem('geo_lab_fav')||'[]')}catch(_){return []}}
    function save(f){try{localStorage.setItem('geo_lab_fav',JSON.stringify(f))}catch(_){}}
    function mark(){
      var inlist=favs().some(function(f){return f.url===page});
      btn.textContent=inlist?'♥':'♡';
      btn.title=inlist?'Убрать из избранного':'В избранное';
      btn.style.color=inlist?'#FFD66E':'#C9B27F';
    }
    mark();
    btn.onclick=function(){
      var who=session();
      if(!who){location.href='login.html?fav=1';return}
      var L=favs(),i=-1;
      L.forEach(function(f,ix){if(f.url===page)i=ix});
      if(i>=0){L.splice(i,1)}
      else{
        var t=document.querySelector('h1');
        L.push({url:page,title:t?t.textContent.trim():page,at:new Date().toISOString().slice(0,10)});
      }
      save(L);mark();
    };
    document.body.appendChild(btn);
  }
})();
