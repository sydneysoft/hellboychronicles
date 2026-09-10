(()=>{
  const root=document.getElementById('story');
  if(!root)return;
  const names={en:'ENGLISH',uk:'UKRAINIAN',pl:'POLISH',fr:'FRENCH'};
  const locales={en:'en-US',uk:'uk-UA',pl:'pl-PL',fr:'fr-FR'};
  const cache=new Map();
  let pop=null,timer=null;
  const style=document.createElement('style');
  style.textContent=`.ucv-pop{position:fixed;z-index:99999;width:min(360px,calc(100vw - 24px));background:#171311;color:#f5e9cf;border:1px solid #c4a255;border-radius:16px;box-shadow:0 18px 50px #000b;padding:14px;font-family:system-ui,-apple-system,sans-serif}.ucv-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.ucv-word{font:800 21px Georgia,serif;color:#fff}.ucv-label{margin-top:3px;color:#d7b65c;font-size:10px;font-weight:900;letter-spacing:.12em}.ucv-close{border:0;background:transparent;color:#c2b5a0;font-size:22px;cursor:pointer}.ucv-translation{margin-top:10px;font-size:18px;line-height:1.4}.ucv-loading{color:#aaa;font-style:italic}.ucv-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.ucv-actions button,.ucv-practice button{border:1px solid #b99a5355;border-radius:10px;padding:10px;background:#2a211d;color:#f4e5c8;font-weight:800;cursor:pointer}.ucv-practice-open{grid-column:1/-1!important;background:#7f1d27!important}.ucv-practice{display:none;margin-top:12px;padding-top:12px;border-top:1px solid #b99a5338}.ucv-practice.open{display:block}.ucv-step{font-size:11px;color:#d7b65c;font-weight:900;letter-spacing:.09em}.ucv-cue{margin:6px 0 9px;font-weight:800}.ucv-practice input{width:100%;border:1px solid #b99a5366;border-radius:10px;background:#0f0d0c;color:#fff;padding:11px;font:15px system-ui}.ucv-feedback{margin-top:7px;font-size:13px}.ucv-ok{color:#76d792}.ucv-bad{color:#f0a19a}.ucv-other{display:grid;gap:5px;margin-top:5px;font-size:14px}.ucv-other b{color:#efd47d}`;
  document.head.appendChild(style);
  function currentLang(){return document.querySelector('.langs button.on')?.dataset.lang||'en'}
  function clean(s){return (s||'').trim().replace(/^[\s“”‘’"'.,!?;:()\[\]{}—–-]+|[\s“”‘’"'.,!?;:()\[\]{}—–-]+$/g,'').replace(/\s+/g,' ')}
  function norm(s){return clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function close(){if(pop){pop.remove();pop=null}}
  function speak(text,lang){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=locales[lang]||'en-US';speechSynthesis.speak(u)}
  async function translate(text,source,target){const k=`${source}:${target}:${text.toLowerCase()}`;if(cache.has(k))return cache.get(k);const r=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`,{headers:{Accept:'application/json'}});if(!r.ok)throw 0;const j=await r.json();const value=j?.responseData?.translatedText?.trim();if(!value)throw 0;cache.set(k,value);return value}
  function save(word,translation,source,target){const key='hellboy-universal-vocabulary';let items=[];try{items=JSON.parse(localStorage.getItem(key)||'[]')}catch{};if(!items.some(x=>norm(x.word)===norm(word)&&x.source===source))items.unshift({word,translation,source,target,savedAt:Date.now()});localStorage.setItem(key,JSON.stringify(items.slice(0,300)))}
  function place(rect){if(!pop)return;const margin=12,w=Math.min(360,innerWidth-24);let left=Math.max(margin,Math.min(innerWidth-w-margin,rect.left+rect.width/2-w/2));let top=rect.bottom+10;if(top+360>innerHeight)top=Math.max(margin,rect.top-360);pop.style.left=`${left}px`;pop.style.top=`${top}px`;pop.style.maxHeight=`${innerHeight-24}px`;pop.style.overflowY='auto'}
  async function show(){clearTimeout(timer);const sel=getSelection();if(!sel||sel.isCollapsed||!sel.rangeCount)return;const a=sel.anchorNode,f=sel.focusNode;if(!root.contains(a)||!root.contains(f))return;const word=clean(sel.toString());if(!word||word.length>80||word.split(/\s+/).length>5)return;const rect=sel.getRangeAt(0).getBoundingClientRect();if(!rect.width&&!rect.height)return;const source=currentLang();close();pop=document.createElement('div');pop.className='ucv-pop';pop.innerHTML=`<div class="ucv-top"><div><div class="ucv-word"></div><div class="ucv-label"></div></div><button class="ucv-close" aria-label="Close">×</button></div><div class="ucv-translation ucv-loading">Translating…</div><div class="ucv-actions"><button class="ucv-save">SAVE WORD</button><button class="ucv-listen">🔊 LISTEN</button><button class="ucv-practice-open">✎ PRACTICE WORD</button></div><div class="ucv-practice"></div>`;pop.querySelector('.ucv-word').textContent=word;pop.querySelector('.ucv-label').textContent=source==='en'?'ENGLISH → FR / PL / UA':`${names[source]} → ENGLISH`;document.body.appendChild(pop);place(rect);pop.querySelector('.ucv-close').onclick=close;pop.querySelector('.ucv-listen').onclick=()=>speak(word,source);
    try{
      let primary='',target='en';
      if(source==='en'){
        const [fr,pl,uk]=await Promise.all([translate(word,'en','fr'),translate(word,'en','pl'),translate(word,'en','uk')]);
        primary=fr;target='fr';
        if(!pop)return;
        pop.querySelector('.ucv-translation').innerHTML=`<div class="ucv-other"><div><b>🇫🇷 French:</b> ${fr}</div><div><b>🇵🇱 Polish:</b> ${pl}</div><div><b>🇺🇦 Ukrainian:</b> ${uk}</div></div>`;
      }else{
        primary=await translate(word,source,'en');target='en';if(!pop)return;pop.querySelector('.ucv-translation').textContent=primary;
      }
      pop.querySelector('.ucv-translation').classList.remove('ucv-loading');
      pop.querySelector('.ucv-save').onclick=e=>{save(word,primary,source,target);e.currentTarget.textContent='✓ SAVED'};
      pop.querySelector('.ucv-practice-open').onclick=()=>{
        save(word,primary,source,target);const box=pop.querySelector('.ucv-practice');box.classList.add('open');
        if(source==='en')box.innerHTML=`<div class="ucv-step">PRACTICE</div><div class="ucv-cue">Switch to 🇫🇷, 🇵🇱 or 🇺🇦 to practice writing that language from an English cue.</div>`;
        else box.innerHTML=`<div class="ucv-step">WRITE THE ${names[source]} WORD</div><div class="ucv-cue">${primary}</div><input autocomplete="off" spellcheck="false" placeholder="Type the word…"><button type="button" style="margin-top:8px;width:100%">CHECK</button><div class="ucv-feedback"></div>`;
        const input=box.querySelector('input'),btn=box.querySelector('button'),fb=box.querySelector('.ucv-feedback');if(btn)btn.onclick=()=>{if(norm(input.value)===norm(word)){fb.className='ucv-feedback ucv-ok';fb.textContent='✓ CORRECT'}else{fb.className='ucv-feedback ucv-bad';fb.textContent=`Not quite. Correct form: ${word}`}};place(rect)
      };
    }catch{if(pop){pop.querySelector('.ucv-translation').classList.remove('ucv-loading');pop.querySelector('.ucv-translation').textContent='Translation service is temporarily unavailable.'}}
  }
  root.addEventListener('mouseup',()=>timer=setTimeout(show,25));
  root.addEventListener('touchend',()=>timer=setTimeout(show,180),{passive:true});
  document.addEventListener('selectionchange',()=>{clearTimeout(timer);timer=setTimeout(()=>{const s=getSelection();if(s&&!s.isCollapsed&&root.contains(s.anchorNode))show()},350)});
  document.querySelectorAll('.langs button').forEach(b=>b.addEventListener('click',close));
  document.addEventListener('pointerdown',e=>{if(pop&&!pop.contains(e.target)&&!root.contains(e.target))close()});
})();