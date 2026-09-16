(()=>{
  const root=document.getElementById('story');
  if(!root)return;

  const names={en:'ENGLISH',ru:'RUSSIAN',pl:'POLISH',fr:'FRENCH',de:'GERMAN',es:'SPANISH'};
  const locales={en:'en-US',ru:'ru-RU',pl:'pl-PL',fr:'fr-FR',de:'de-DE',es:'es-ES'};
  const codes=['es','de','fr','pl','ru'];
  const dictStorageKey='storylingo:vocabulary:v2';
  const ruFormsStorageKey='storylingo:vocabulary:ru-forms:v1';
  let dictionary=null,ruForms=null;
  const reverseMaps=new Map();
  let pop=null,timer=null;

  const style=document.createElement('style');
  style.textContent=`.ucv-pop{position:fixed;z-index:99999;width:min(360px,calc(100vw - 24px));background:#171311;color:#f5e9cf;border:1px solid #c4a255;border-radius:16px;box-shadow:0 18px 50px #000b;padding:14px;font-family:system-ui,-apple-system,sans-serif}.ucv-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.ucv-word{font:800 21px Georgia,serif;color:#fff}.ucv-label{margin-top:3px;color:#d7b65c;font-size:10px;font-weight:900;letter-spacing:.12em}.ucv-close{border:0;background:transparent;color:#c2b5a0;font-size:22px;cursor:pointer}.ucv-translation{margin-top:10px;font-size:18px;line-height:1.4}.ucv-loading{color:#aaa;font-style:italic}.ucv-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.ucv-actions button,.ucv-practice button{border:1px solid #b99a5355;border-radius:10px;padding:10px;background:#2a211d;color:#f4e5c8;font-weight:800;cursor:pointer}.ucv-actions button:disabled{opacity:.45;cursor:not-allowed}.ucv-practice-open{grid-column:1/-1!important;background:#7f1d27!important}.ucv-practice{display:none;margin-top:12px;padding-top:12px;border-top:1px solid #b99a5338}.ucv-practice.open{display:block}.ucv-step{font-size:11px;color:#d7b65c;font-weight:900;letter-spacing:.09em}.ucv-cue{margin:6px 0 9px;font-weight:800}.ucv-practice input{width:100%;border:1px solid #b99a5366;border-radius:10px;background:#0f0d0c;color:#fff;padding:11px;font:15px system-ui}.ucv-feedback{margin-top:7px;font-size:13px}.ucv-ok{color:#76d792}.ucv-bad{color:#f0a19a}.ucv-other{display:grid;gap:5px;margin-top:5px;font-size:14px}.ucv-other b{color:#efd47d}.ucv-missing{color:#8f826e}`;
  document.head.appendChild(style);

  function currentLang(){
    const active=document.querySelector('.langs button.on')?.dataset.lang;
    if(active&&names[active])return active;
    const q=new URLSearchParams(location.search).get('lang');
    if(q&&names[q])return q;
    const path=location.pathname;
    return /^\/fr(?:\/|$)/.test(path)?'fr':/^\/pl(?:\/|$)/.test(path)?'pl':/^\/de(?:\/|$)/.test(path)?'de':/^\/es(?:\/|$)/.test(path)?'es':'en';
  }

  function clean(s){return(s||'').trim().replace(/^[\s“”‘’"'.,!?;:()\[\]{}—–-]+|[\s“”‘’"'.,!?;:()\[\]{}—–-]+$/g,'').replace(/\s+/g,' ')}
  function norm(s){return clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').toLowerCase()}
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function close(){if(pop){pop.remove();pop=null}}
  function speak(text,lang){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=locales[lang]||'en-US';speechSynthesis.speak(u)}

  function validDictionary(value){return value&&value.version===1&&value.entries&&typeof value.entries==='object'}
  function validRuForms(value){return value&&value.version===1&&value.language==='ru'&&value.forms&&typeof value.forms==='object'}

  async function loadDictionary(){
    if(dictionary)return dictionary;
    try{
      const saved=localStorage.getItem(dictStorageKey);
      if(saved){
        const parsed=JSON.parse(saved);
        if(validDictionary(parsed)){dictionary=parsed;return dictionary}
      }
    }catch{}
    try{
      const response=await fetch('/translations/vocabulary.json?v=2',{headers:{Accept:'application/json'},cache:'force-cache'});
      if(!response.ok)throw new Error('dictionary-not-found');
      const parsed=await response.json();
      if(!validDictionary(parsed))throw new Error('invalid-dictionary');
      dictionary=parsed;
      try{localStorage.setItem(dictStorageKey,JSON.stringify(parsed))}catch{}
      return dictionary;
    }catch{return null}
  }

  async function loadRuForms(){
    if(ruForms)return ruForms;
    try{
      const saved=localStorage.getItem(ruFormsStorageKey);
      if(saved){
        const parsed=JSON.parse(saved);
        if(validRuForms(parsed)){ruForms=parsed;return ruForms}
      }
    }catch{}
    try{
      const response=await fetch('/translations/ru/word-forms.json?v=1',{headers:{Accept:'application/json'},cache:'force-cache'});
      if(!response.ok)throw new Error('ru-forms-not-found');
      const parsed=await response.json();
      if(!validRuForms(parsed))throw new Error('invalid-ru-forms');
      ruForms=parsed;
      try{localStorage.setItem(ruFormsStorageKey,JSON.stringify(parsed))}catch{}
      return ruForms;
    }catch{return null}
  }

  function englishEntry(dict,text){
    const wanted=norm(text);
    for(const [english,entry] of Object.entries(dict?.entries||{})){
      if(norm(english)===wanted)return {english,entry};
    }
    return null;
  }

  function reverseMap(dict,lang){
    if(reverseMaps.has(lang))return reverseMaps.get(lang);
    const map=new Map();
    for(const [english,entry] of Object.entries(dict?.entries||{})){
      const value=entry?.[lang];
      if(typeof value==='string'&&value.trim()){
        const k=norm(value);
        if(k&&!map.has(k))map.set(k,english);
      }
    }
    reverseMaps.set(lang,map);
    return map;
  }

  function russianStem(value){
    let s=norm(value).replace(/ё/g,'е');
    if(!s||s.includes(' '))return s;
    const endings=[
      'иями','ями','ами','иями','ого','его','ому','ему','ыми','ими','иях','ях','ах','ов','ев','ей',
      'ую','юю','ая','яя','ое','ее','ые','ие','ый','ий','ой','ым','им','ом','ем','ых','их',
      'ешь','ишь','ете','ите','ют','ут','ят','ат','ет','ит','ем','им','ла','ли','ло','л',
      'ться','ся','ть','ами','ями','ам','ям','ом','ем','ой','ей','ою','ею','а','я','ы','и','у','ю','е','о','ь','й'
    ];
    for(const ending of endings){
      if(s.length-ending.length>=4&&s.endsWith(ending)){
        s=s.slice(0,-ending.length);
        break;
      }
    }
    return s;
  }

  async function russianLookup(dict,text){
    const wanted=norm(text).replace(/ё/g,'е');
    if(!wanted)return null;

    const forms=await loadRuForms();
    if(forms){
      for(const [surface,english] of Object.entries(forms.forms)){
        if(norm(surface).replace(/ё/g,'е')===wanted)return english;
      }
    }

    const exact=reverseMap(dict,'ru').get(wanted);
    if(exact)return exact;

    const wantedStem=russianStem(wanted);
    if(wantedStem.length<4)return null;

    if(forms){
      for(const [surface,english] of Object.entries(forms.forms)){
        if(russianStem(surface)===wantedStem)return english;
      }
    }

    for(const [english,entry] of Object.entries(dict?.entries||{})){
      const value=entry?.ru;
      if(typeof value==='string'&&value.trim()&&russianStem(value)===wantedStem)return english;
    }
    return null;
  }

  async function lookup(text,source,target){
    const dict=await loadDictionary();
    if(!dict)return null;
    if(source==='en')return englishEntry(dict,text)?.entry?.[target]||null;
    if(source==='ru'&&target==='en')return russianLookup(dict,text);
    if(target==='en')return reverseMap(dict,source).get(norm(text))||null;
    return null;
  }

  function save(word,translation,source,target){
    const key='hellboy-universal-vocabulary';
    let items=[];
    try{items=JSON.parse(localStorage.getItem(key)||'[]')}catch{}
    if(!items.some(x=>norm(x.word)===norm(word)&&x.source===source))items.unshift({word,translation,source,target,savedAt:Date.now()});
    localStorage.setItem(key,JSON.stringify(items.slice(0,300)));
  }

  function place(rect){
    if(!pop)return;
    const margin=12,w=Math.min(360,innerWidth-24);
    pop.style.left=`${Math.max(margin,Math.min(innerWidth-w-margin,rect.left+rect.width/2-w/2))}px`;
    let top=rect.bottom+10;
    if(top+360>innerHeight)top=Math.max(margin,rect.top-360);
    pop.style.top=`${top}px`;
    pop.style.maxHeight=`${innerHeight-24}px`;
    pop.style.overflowY='auto';
  }

  async function show(){
    clearTimeout(timer);
    const sel=getSelection();
    if(!sel||sel.isCollapsed||!sel.rangeCount)return;
    const a=sel.anchorNode,f=sel.focusNode;
    if(!root.contains(a)||!root.contains(f))return;
    const word=clean(sel.toString());
    if(!word||word.length>80||word.split(/\s+/).length>5)return;
    const rect=sel.getRangeAt(0).getBoundingClientRect();
    if(!rect.width&&!rect.height)return;
    const source=currentLang();

    close();
    pop=document.createElement('div');
    pop.className='ucv-pop';
    pop.innerHTML=`<div class="ucv-top"><div><div class="ucv-word"></div><div class="ucv-label"></div></div><button class="ucv-close" aria-label="Close">×</button></div><div class="ucv-translation ucv-loading">Checking local dictionary…</div><div class="ucv-actions"><button class="ucv-save">SAVE WORD</button><button class="ucv-listen">🔊 LISTEN</button><button class="ucv-practice-open">✎ PRACTICE WORD</button></div><div class="ucv-practice"></div>`;
    pop.querySelector('.ucv-word').textContent=word;
    pop.querySelector('.ucv-label').textContent=source==='en'?'LOCAL JSON · ENGLISH → ES / DE / FR / PL / RU':source==='ru'?'LOCAL JSON · RUSSIAN WORD FORM → ENGLISH':`LOCAL JSON · ${names[source]} → ENGLISH`;
    document.body.appendChild(pop);
    place(rect);
    pop.querySelector('.ucv-close').onclick=close;
    pop.querySelector('.ucv-listen').onclick=()=>speak(word,source);

    let primary='',target='en';
    if(source==='en'){
      const vals=await Promise.all(codes.map(c=>lookup(word,'en',c)));
      const [es,de,fr,pl,ru]=vals;
      primary=es||de||fr||pl||ru||'';
      target=es?'es':de?'de':fr?'fr':pl?'pl':'ru';
      if(!pop)return;
      const row=(flag,label,value)=>`<div><b>${flag} ${label}:</b> ${value?esc(value):'<span class="ucv-missing">not in local dictionary</span>'}</div>`;
      pop.querySelector('.ucv-translation').innerHTML=`<div class="ucv-other">${row('🇪🇸','Spanish',es)}${row('🇩🇪','German',de)}${row('🇫🇷','French',fr)}${row('🇵🇱','Polish',pl)}${row('🇷🇺','Russian',ru)}</div>`;
    }else{
      primary=await lookup(word,source,'en')||'';
      target='en';
      if(!pop)return;
      pop.querySelector('.ucv-translation').textContent=primary||'Not in the local dictionary yet.';
    }

    pop.querySelector('.ucv-translation').classList.remove('ucv-loading');
    const saveBtn=pop.querySelector('.ucv-save');
    const practiceBtn=pop.querySelector('.ucv-practice-open');
    if(!primary){saveBtn.disabled=true;practiceBtn.disabled=true;return}

    saveBtn.onclick=e=>{save(word,primary,source,target);e.currentTarget.textContent='✓ SAVED'};
    practiceBtn.onclick=()=>{
      save(word,primary,source,target);
      const box=pop.querySelector('.ucv-practice');
      box.classList.add('open');
      if(source==='en'){
        box.innerHTML=`<div class="ucv-step">PRACTICE</div><div class="ucv-cue">Switch to 🇪🇸, 🇩🇪, 🇫🇷, 🇵🇱 or 🇷🇺 to practice writing that language from an English cue.</div>`;
      }else{
        box.innerHTML=`<div class="ucv-step">WRITE THE ${names[source]} WORD</div><div class="ucv-cue">${esc(primary)}</div><input autocomplete="off" spellcheck="false" placeholder="Type the word…"><button type="button" style="margin-top:8px;width:100%">CHECK</button><div class="ucv-feedback"></div>`;
      }
      const input=box.querySelector('input'),checkBtn=box.querySelector('button'),fb=box.querySelector('.ucv-feedback');
      if(checkBtn)checkBtn.onclick=()=>{
        if(norm(input.value)===norm(word)){fb.className='ucv-feedback ucv-ok';fb.textContent='✓ CORRECT'}
        else{fb.className='ucv-feedback ucv-bad';fb.textContent=`Not quite. Correct form: ${word}`}
      };
      place(rect);
    };
  }

  root.addEventListener('mouseup',()=>timer=setTimeout(show,25));
  root.addEventListener('touchend',()=>timer=setTimeout(show,180),{passive:true});
  document.addEventListener('selectionchange',()=>{
    clearTimeout(timer);
    timer=setTimeout(()=>{const s=getSelection();if(s&&!s.isCollapsed&&root.contains(s.anchorNode))show()},350);
  });
  document.querySelectorAll('.langs button').forEach(b=>b.addEventListener('click',close));
  document.addEventListener('pointerdown',e=>{if(pop&&!pop.contains(e.target)&&!root.contains(e.target))close()});
})();
