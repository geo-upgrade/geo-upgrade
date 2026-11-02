/* GEO-Апгрейд — lab-account.js: шапка (кто зашёл + Личный кабинет) и кнопка «В избранное» */
(function(){
  var CAB='cabinet.html';
  function store(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
  function session(){
    var e=store('geo_lab_session',null);if(!e)return null;
    var u=store('geo_lab_users',{})[e];
    return u?{email:e,name:u.name}:null;
  }
  function linkText(){
    var s=session();
    return s?('Личный кабинет · '+s.name):'Личный кабинет';
  }
  function patchHeader(){
    /* быстрые разделы (desktop) */
    var q=document.querySelector('.jnav-quick');
    if(q&&!q.querySelector('#lab-acc-quick')){
      var a=document.createElement('a');
      a.href=CAB;a.id='lab-acc-quick';a.textContent=linkText();
      var here=q.querySelector('.jnav-here');
      if(here&&here.nextSibling)a.insertBefore(a,here.nextSibling);else q.appendChild(a);
    }
    /* мобильная навигация */
    var n=document.getElementById('jnav-panel');
    if(n&&!n.querySelector('#lab-acc-nav')){
      var a2=document.createElement('a');
      a2.href=CAB;a2.id='lab-acc-nav';a2.textContent=linkText();
      a2.className='hover:text-[#00F0FF]';
      n.appendChild(a2);
    }
  }
  function favToggle(){
    var url=location.origin+location.pathname;
    var f=store('geo_lab_fav',[]);
    var inList=f.some(function(x){return x.url===url});
    var btn=document.getElementById('lab-fav-btn');
    if(inList){btn.textContent='♥ В избранном';btn.classList.add('lab-fav-on')}
    else{btn.textContent='♡ В избранное';btn.classList.remove('lab-fav-on')}
  }
  function mountFav(){
    if(location.pathname.split('/').pop()===''||location.pathname.split('/').pop()==='cabinet.html'||/cabinet\.html$/.test(location.pathname))return;
    if(document.getElementById('lab-fav-btn'))return;
    var b=document.createElement('button');
    b.id='lab-fav-btn';b.type='button';
    b.style.cssText='position:fixed;left:16px;bottom:16px;z-index:40;font-family:inherit;font-size:13px;font-weight:600;padding:9px 14px;border-radius:999px;background:rgba(13,6,24,.92);color:#00F0FF;border:1px solid rgba(0,240,255,.45);cursor:pointer;box-shadow:0 6px 22px rgba(0,0,0,.45)';
    b.addEventListener('click',function(){
      var s=session();
      if(!s){if(confirm('Чтобы сохранять статьи в избранное, нужна бесплатная регистрация в личной лаборатории. Открыть личный кабинет?'))location.href=CAB;return}
      var url=location.origin+location.pathname;
      var f=store('geo_lab_fav',[]);
      if(f.some(function(x){return x.url===url})){
        f=f.filter(function(x){return x.url!==url});
        localStorage.setItem('geo_lab_fav',JSON.stringify(f));
        favToggle();
      }else{
        f.push({t:document.title.replace(/\s*\|\s*GEO-Апгрейд.*$/,'')||document.title,url:url,at:new Date().toISOString().slice(0,10)});
        localStorage.setItem('geo_lab_fav',JSON.stringify(f));
        favToggle();
        if(!store('geo_lab_fav_tip',false)){alert('Статья сохранена — она на полке «Избранное» в вашем личном кабинете.');localStorage.setItem('geo_lab_fav_tip','true')}
      }
    });
    document.body.appendChild(b);
    favToggle();
  }
  function init(){
    patchHeader();
    mountFav();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
