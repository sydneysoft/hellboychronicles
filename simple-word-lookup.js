(()=>{
  const root=document.getElementById('story');
  const store=window.StoryLingoTranslationStore;
  if(!root||!store)return;

  const names={en:'English',es:'Spanish',de:'German',fr:'French',pl:'Polish',ru:'Russian'};
  const flags={es:'🇪🇸',de:'🇩🇪',fr:'🇫🇷',pl:'🇵🇱',ru:'🇷🇺'};
  const locales={en:'en-US',es:'es-ES',de:'de-DE',fr:'fr-FR',pl:'pl-PL',ru:'ru-RU'};
  let dict=null,ruGlosses=null,pop=null,timer=null;

  const style=document.createElement('style');
  style.textContent=`.swl-pop{position:fixed;z-index:100000;width:min(300px,calc(100vw - 24px));background:#171311;color:#f5e9cf;border:1px solid #c4a255;border-radius:14px;box-shadow:0 16px 40px #000a;padding:12px;font-family:system-ui,-apple-system,sans-serif}.swl-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.swl-word{font:800 20px Georgia,serif;color:#fff}.swl-lang{font-size:10px;color:#d7b65c;font-weight:800;letter-spacing:.08em;margin-top:2px}.swl-close{border:0;background:transparent;color:#c8baa2;font-size:20px;cursor:pointer}.swl-result{margin-top:9px;font-size:18px;line-height:1.35}.swl-list{display:grid;gap:4px}.swl-list div{display:flex;gap:7px;align-items:baseline}.swl-list b{min-width:22px}.swl-actions{display:flex;gap:7px;margin-top:10px}.swl-actions button{border:1px solid #b99a5355;border-radius:9px;padding:8px 10px;background:#2a211d;color:#f4e5c8;font-weight:700;cursor:pointer}.swl-empty{color:#9f927e;font-size:14px}`;
  document.head.appendChild(style);

  const clean=s=>(s||'').trim().replace(/^[\s“”‘’"'.,!?;:()\[\]{}—–-]+|[\s“”‘’"'.,!?;:()\[\]{}—–-]+$/g,'').replace(/\s+/g,' ');
  const norm=s=>clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').toLowerCase();
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isRu=s=>/[\u0400-\u04FF]/.test(s||'');

  function sourceLang(word){
    if(isRu(word))return 'ru';
    const active=document.querySelector('.langs button.on')?.dataset.lang;
    if(active)return active;
    const q=new URLSearchParams(location.search).get('lang');
    return q||'en';
  }

  function close(){if(pop){pop.remove();pop=null}}
  function speak(text,lang){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=locales[lang]||'en-US';speechSynthesis.speak(u)}
  function place(rect){
    if(!pop)return;
    const margin=12,w=Math.min(300,innerWidth-24);
    pop.style.left=`${Math.max(margin,Math.min(innerWidth-w-margin,rect.left+rect.width/2-w/2))}px`;
    let top=rect.bottom+9;
    if(top+230>innerHeight)top=Math.max(margin,rect.top-230);
    pop.style.top=`${top}px`;
  }

  async function load(){
    await store.ready;
    if(!dict)dict=await store.get('vocabulary');
    if(!ruGlosses)ruGlosses=await store.get('ru-glosses');
  }

  function splitAlternatives(value){
    if(typeof value!=='string')return [];
    const stripped=value.replace(/\([^)]*\)/g,' ').replace(/[—–]/g,' ');
    const out=[];
    for(const piece of stripped.split(/\s*[/;,]\s*/)){
      const p=clean(piece);
      if(!p)continue;
      out.push(p);
      if(p.includes(' '))p.split(/\s+/).forEach(x=>{if(x.length>1)out.push(x)});
    }
    return [...new Set(out.map(norm).filter(Boolean))];
  }

  function stem(word,lang){
    let w=norm(word);
    if(w.length<4)return w;
    const endings={
      de:['ern','em','en','er','es','e','n','s'],
      fr:['ements','ement','ées','és','ée','ent','ons','ez','es','e','s'],
      es:['amientos','imiento','iendo','ando','ados','adas','ido','ada','ado','es','os','as','o','a','s'],
      pl:['owego','owej','emu','ami','ach','owie','iego','ymi','ego','ów','om','ie','ą','ę','y','i','a','u'],
    }[lang]||[];
    for(const e of endings){if(w.endsWith(e)&&w.length-e.length>=3)return w.slice(0,-e.length)}
    return w;
  }

  function englishEntry(word){
    const k=norm(word);
    const entries=dict?.entries||{};
    if(entries[k])return entries[k];
    for(const [en,entry] of Object.entries(entries))if(norm(en)===k)return entry;
    return null;
  }

  function reverseLookup(word,lang){
    const wanted=norm(word);
    const wantedStem=stem(word,lang);
    let stemHit=null;
    for(const [english,entry] of Object.entries(dict?.entries||{})){
      const value=entry?.[lang];
      if(typeof value!=='string')continue;
      const alternatives=splitAlternatives(value);
      if(alternatives.includes(wanted))return english;
      if(!stemHit&&wantedStem.length>=3){
        for(const alt of alternatives){
          const aStem=stem(alt,lang);
          if(aStem.length>=3&&aStem===wantedStem){stemHit=english;break}
        }
      }
    }
    return stemHit;
  }

  function ruLookup(word){
    const wanted=norm(word).replace(/ё/g,'е');
    for(const [surface,en] of Object.entries(ruGlosses?.words||{}))if(norm(surface).replace(/ё/g,'е')===wanted)return en;
    const candidates=Object.entries(ruGlosses?.stems||{}).map(([s,en])=>[norm(s).replace(/ё/g,'е'),en]).sort((a,b)=>b[0].length-a[0].length);
    for(const [s,en] of candidates)if(s.length>=3&&wanted.startsWith(s))return en;
    return reverseLookup(word,'ru');
  }

  async function show(){
    clearTimeout(timer);
    const sel=getSelection();
    if(!sel||sel.isCollapsed||!sel.rangeCount)return;
    if(!root.contains(sel.anchorNode)||!root.contains(sel.focusNode))return;
    const word=clean(sel.toString());
    if(!word||word.length>50||word.split(/\s+/).length>2)return;
    const range=sel.getRangeAt(0),rect=range.getBoundingClientRect();
    if(!rect.width&&!rect.height)return;
    const lang=sourceLang(word);

    await load();
    close();
    pop=document.createElement('div');
    pop.className='swl-pop';
    pop.innerHTML=`<div class="swl-head"><div><div class="swl-word">${esc(word)}</div><div class="swl-lang">${esc(names[lang]||lang)}${lang==='en'?'':' → English'}</div></div><button class="swl-close">×</button></div><div class="swl-result"></div><div class="swl-actions"><button class="swl-listen">🔊</button></div>`;
    document.body.appendChild(pop);
    place(rect);
    pop.querySelector('.swl-close').onclick=close;
    pop.querySelector('.swl-listen').onclick=()=>speak(word,lang);
    const box=pop.querySelector('.swl-result');

    if(lang==='en'){
      const entry=englishEntry(word);
      const rows=['es','de','fr','pl','ru'].filter(c=>entry?.[c]).map(c=>`<div><b>${flags[c]}</b><span>${esc(splitAlternatives(entry[c])[0]||entry[c])}</span></div>`).join('');
      box.innerHTML=rows?`<div class="swl-list">${rows}</div>`:'<span class="swl-empty">—</span>';
    }else{
      const english=lang==='ru'?ruLookup(word):reverseLookup(word,lang);
      box.textContent=english||'—';
    }
  }

  root.addEventListener('mouseup',()=>timer=setTimeout(show,20));
  root.addEventListener('touchend',()=>timer=setTimeout(show,160),{passive:true});
  document.addEventListener('selectionchange',()=>{clearTimeout(timer);timer=setTimeout(()=>{const s=getSelection();if(s&&!s.isCollapsed&&root.contains(s.anchorNode))show()},300)});
  document.querySelectorAll('.langs button').forEach(b=>b.addEventListener('click',close));
  document.addEventListener('pointerdown',e=>{if(pop&&!pop.contains(e.target)&&!root.contains(e.target))close()});
})();
