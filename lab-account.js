/* GEO-Апгрейд — lab-account.js v7. Избранное синхронизируется в базу (lab_fav) — видно в админке.
   «ЛК» — пилюля в правом нижнем углу НАД кнопкой ассистента (58px @ right:22/bottom:22):
   bottom:88px — не наезжает ни на меню, ни на ассистента.
   «♡ В избранное» — 44px, простая плоская, слева снизу (SVG-сердце без свечения). */
(function(){
  function session(){
    try{
      var e=JSON.parse(localStorage.getItem('geo_lab_session')||'null');
      if(!e)return null;
      var u=JSON.parse(localStorage.getItem('geo_lab_users')||'{}')[e];
      return u?{email:e,name:u.name}:null;
    }catch(_){return null}
  }
  function labAuth(){
    try{
      var a=JSON.parse(localStorage.getItem('geo_lab_auth')||'null');
      if(a&&a.token&&a.email)return a;
    }catch(_){}
    return null;
  }
  function favSync(action,url,title){
    try{
      var a=labAuth();
      if(!a)return;
      var H={apikey:'sb_publishable_XgpZnxkWQTSSwPaP6ClKPw_YzV2r5Z-',Authorization:'Bearer '+a.token,'Content-Type':'application/json'};
      if(action==='add'){
        fetch('https://cpaevaypyplwcdjrfzpj.supabase.co/rest/v1/lab_fav',{method:'POST',headers:H,body:JSON.stringify({email:a.email,user_id:a.uid||null,url:url,title:title||url})}).catch(function(){});
      }else{
        fetch('https://cpaevaypyplwcdjrfzpj.supabase.co/rest/v1/lab_fav?email=eq.'+encodeURIComponent((a.email||'').toLowerCase())+'&url=eq.'+encodeURIComponent(url),{method:'DELETE',headers:{apikey:H.apikey,Authorization:H.Authorization}}).catch(function(){});
      }
    }catch(_){}
  }
  var s=session();
  var page=location.pathname.split('/').pop();
  if(/^(cabinet\.html|login\.html)$/.test(page))return;
  if(!document.getElementById('lab-lk-btn')){
    var a=document.createElement('a');
    a.id='lab-lk-btn';
    a.href='cabinet.html';
    a.setAttribute('aria-label','Личный кабинет');
    a.textContent=s&&s.name?('ЛК · '+String(s.name).slice(0,12)):'ЛК';
    a.style.cssText='position:fixed;right:14px;bottom:88px;z-index:60;padding:9px 16px;border-radius:999px;border:1px solid rgba(212,184,150,.55);background:rgba(13,6,24,.94);color:#FFD66E;font:600 13px/1.2 system-ui,-apple-system,sans-serif;letter-spacing:.04em;text-decoration:none;white-space:nowrap;cursor:pointer';
    document.body.appendChild(a);
  }
  /* «♡ В избранное» — слева снизу, 44px, плоская */
  if(!document.getElementById('lab-fav-btn')&&/\.html$/.test(page)){
    var btn=document.createElement('button');
    btn.id='lab-fav-btn';
    btn.type='button';
    btn.setAttribute('aria-label','В избранное');
    btn.style.cssText='position:fixed;left:16px;bottom:16px;z-index:60;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.30);background:#150B26;color:#F4F4FA;cursor:pointer;display:flex;align-items:center;justify-content:center';
    var heartOn='<svg viewBox="0 0 24 24" width="20" height="20" fill="#FFD66E" stroke="#FFD66E" stroke-width="1.6" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9C1 8.6 2.9 5.4 6.2 5.1c2-.2 3.9.9 4.8 2.6l1 1.7 1-1.7c.9-1.7 2.8-2.8 4.8-2.6 3.3.3 5.2 3.5 3.7 6.9-2 4.4-9.5 9-9.5 9z"/></svg>';
    var heartOff='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#F4F4FA" stroke-width="1.6" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9C1 8.6 2.9 5.4 6.2 5.1c2-.2 3.9.9 4.8 2.6l1 1.7 1-1.7c.9-1.7 2.8-2.8 4.8-2.6 3.3.3 5.2 3.5 3.7 6.9-2 4.4-9.5 9-9.5 9z"/></svg>';
    function favs(){try{return JSON.parse(localStorage.getItem('geo_lab_fav')||'[]')}catch(_){return []}}
    function save(f){try{localStorage.setItem('geo_lab_fav',JSON.stringify(f))}catch(_){}}
    function mark(){
      var inlist=favs().some(function(f){return f.url===page});
      btn.innerHTML=inlist?heartOn:heartOff;
      btn.title=inlist?'Убрать из избранного':'В избранное';
    }
    mark();
    btn.onclick=function(){
      var who=session();
      if(!who){location.href='login.html?fav=1';return}
      var L=favs(),i=-1;
      L.forEach(function(f,ix){if(f.url===page)i=ix});
      var t=document.querySelector('h1');
      var tt=t?t.textContent.trim():page;
      if(i>=0){L.splice(i,1);favSync('del',page)}
      else{L.push({url:page,title:tt,at:new Date().toISOString().slice(0,10)});favSync('add',page,tt)}
      save(L);mark();
    };
    document.body.appendChild(btn);
  }
})();
