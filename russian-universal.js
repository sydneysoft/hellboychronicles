(()=>{
  const story=document.getElementById('story');
  const btn=document.querySelector('.langs button[data-lang="ru"]');
  const enBtn=document.querySelector('.langs button[data-lang="en"]');
  if(!story||!btn)return;

  const storyName=()=>new URLSearchParams(location.search).get('story')||'lost-key';
  const title=s=>({
    'lost-key':'ПОТЕРЯННЫЙ КЛЮЧ',
    iliad:'ИЛИАДА',
    odyssey:'ОДИССЕЯ'
  }[s]||'STORYLINGO');
  const bundleKey=s=>`storylingo:translations:ru:v1:${s}`;
  const bundleMemory=new Map();

  function rememberEnglish(){
    [...story.querySelectorAll('.txt')].forEach(x=>{
      if(x.textContent&&x.textContent!=='…')x.dataset.en=x.textContent;
    });
  }

  function validBundle(value,s){
    return value&&value.language==='ru'&&value.story===s&&Array.isArray(value.paragraphs)&&value.paragraphs.length>0;
  }

  async function loadBundle(s){
    if(bundleMemory.has(s))return bundleMemory.get(s);

    try{
      const saved=localStorage.getItem(bundleKey(s));
      if(saved){
        const parsed=JSON.parse(saved);
        if(validBundle(parsed,s)){
          bundleMemory.set(s,parsed);
          return parsed;
        }
      }
    }catch{}

    try{
      const response=await fetch(`/translations/ru/${encodeURIComponent(s)}.json?v=1`,{
        headers:{Accept:'application/json'},
        cache:'force-cache'
      });
      if(!response.ok)throw new Error('translation-json-not-found');
      const parsed=await response.json();
      if(!validBundle(parsed,s))throw new Error('invalid-translation-json');
      bundleMemory.set(s,parsed);
      try{localStorage.setItem(bundleKey(s),JSON.stringify(parsed));}catch{}
      return parsed;
    }catch{
      return null;
    }
  }

  async function russian(e){
    if(e){
      e.preventDefault();
      e.stopImmediatePropagation();
    }

    if(enBtn&&!enBtn.classList.contains('on')){
      enBtn.click();
      await new Promise(r=>setTimeout(r,0));
    }

    rememberEnglish();
    const s=storyName();
    const english=[...story.querySelectorAll('.txt')].map(x=>x.dataset.en||x.textContent);
    const bundle=await loadBundle(s);

    document.documentElement.lang='ru';
    document.querySelectorAll('.langs button').forEach(b=>b.classList.toggle('on',b===btn));
    const h=document.querySelector('.title');
    if(h)h.textContent=bundle?.title||title(s);

    story.classList.add('loading');
    const nodes=[...story.querySelectorAll('.txt')];
    for(let i=0;i<english.length;i++){
      const translated=bundle?.paragraphs?.[i];
      if(nodes[i])nodes[i].textContent=(typeof translated==='string'&&translated.trim())?translated:english[i];
    }
    story.classList.remove('loading');
  }

  btn.addEventListener('click',russian,true);
  document.querySelectorAll('.langs button:not([data-lang="ru"])').forEach(b=>b.addEventListener('click',()=>setTimeout(rememberEnglish,0)));

  const listen=document.getElementById('listen');
  if(listen)listen.addEventListener('click',e=>{
    if(btn.classList.contains('on')){
      e.preventDefault();
      e.stopImmediatePropagation();
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance([...story.querySelectorAll('.txt')].map(x=>x.textContent).join(' '));
      u.lang='ru-RU';
      speechSynthesis.speak(u);
    }
  },true);

  document.querySelectorAll('[data-universal-story]').forEach(b=>b.addEventListener('click',e=>{
    if(!btn.classList.contains('on'))return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const s=b.dataset.universalStory;
    location.href=s==='lost-key'?'/universal-stories/lost-key?lang=ru':`/universal-stories/lost-key?story=${s}&lang=ru`;
  },true));

  setTimeout(()=>{
    rememberEnglish();
    if(new URLSearchParams(location.search).get('lang')==='ru')btn.click();
  },0);
})();
