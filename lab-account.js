/* GEO-Апгрейд — lab-account.js v3.
   Пункт «ЛК» добавляется во ВСЕ места навигации сайта: быстрые ссылки шапки (.jnav-quick, мобильные),
   полосу разделов (.jnav-strip, десктоп) и меню-панель (#jnav-panel).
   Никаких новых блоков над шапкой — вёрстку не двигает. Вход/регистрация — отдельная страница login.html. */
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
  var label=s&&s.name?('ЛК · '+String(s.name).slice(0,14)):'ЛК';
  function addLink(sel,cls){
    var box=document.querySelector(sel);
    if(!box)return;
    var a=document.createElement('a');
    a.href='cabinet.html';
    a.setAttribute('data-lk','1');
    a.className=cls;
    a.textContent=label;
    box.appendChild(a);
  }
  addLink('.jnav-quick','hover:text-[#00F0FF]');
  addLink('.jnav-strip','hover:text-[#00F0FF]');
  addLink('#jnav-panel','text-[#D4B896] font-semibold hover:text-[#E8D5B7]');
  /* «♡ В избранное» — fixed-кнопка слева снизу, вёрстку не двигает */
  var page=location.pathname.split('/').pop();
  if(!document.getElementById('lab-fav-btn')&&/\.html$/.test(page)&&!/^cabinet\.html$|^login\.html$/.test(page)){
    var btn=document.createElement('button');
    btn.id='lab-fav-btn';
    btn.type='button';
    btn.setAttribute('aria-label','В избранное');
    btn.style.cssText='position:fixed;left:14px;bottom:14px;z-index:60;width:40px;height:40px;border-radius:50%;border:1px solid rgba(212,184,150,.45);background:rgba(13,6,24,.85);color:#FFD66E;font-size:17px;line-height:1;cursor:pointer;box-shadow:0 0 10px rgba(255,214,110,.22)';
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
      if(!who){
        location.href='login.html?fav=1';
        return;
      }
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
