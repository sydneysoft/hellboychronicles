(()=>{document.documentElement.classList.add('storylingo-block-rest');if(!document.querySelector('link[data-storylingo-block-rest]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/storylingo-block-rest.css?v=20260912-2';l.dataset.storylingoBlockRest='1';document.head.appendChild(l)}if(!document.querySelector('script[data-storylingo-cookie]')){const s=document.createElement('script');s.src='/storylingo-cookie.js?v=20260912-2';s.dataset.storylingoCookie='1';document.body.appendChild(s)}})();
(()=>{
  const pending=new Map();
  const load=src=>{if(pending.has(src))return pending.get(src);const task=new Promise((resolve,reject)=>{if(document.querySelector(`script[src="${src}"]`)){resolve();return}const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)});pending.set(src,task);return task};
  const loadStyle=href=>{if(pending.has(href))return pending.get(href);const task=new Promise(resolve=>{if(document.querySelector(`link[href="${href}"]`)){resolve();return}const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.onload=resolve;link.onerror=resolve;document.head.appendChild(link)});pending.set(href,task);return task};
  const idle=(timeout=2200)=>new Promise(resolve=>{'requestIdleCallback'in window?requestIdleCallback(()=>resolve(),{timeout}):setTimeout(resolve,900)});

  if(document.getElementById('story')&&/polish-folk-tales/.test(location.pathname)){
    const top=document.querySelector('.top');
    const lang=top?.querySelector('.lang');
    if(top&&!document.getElementById('polishGuideLinks')){
      const guides=document.createElement('div');
      guides.id='polishGuideLinks';
      guides.style.cssText='display:flex;gap:6px;flex-wrap:wrap;justify-content:center';
      const isPL=/^\/pl(?:\/|$)/.test(location.pathname);
      const verb=document.createElement('a');
      verb.href=isPL?'/pl/polish-verbs':'/polish-verbs';
      verb.textContent='📘 VERBS';
      const noun=document.createElement('a');
      noun.href=isPL?'/pl/polish-nouns':'/polish-nouns';
      noun.textContent='📗 NOUNS';
      const grammar=document.createElement('a');
      grammar.href=isPL?'/pl/polish-grammar':'/polish-grammar';
      grammar.textContent='📙 GRAMMAR';
      [verb,noun,grammar].forEach(link=>{link.style.cssText='color:#e4bf68;text-decoration:none;font:bold 13px system-ui;padding:8px 10px;border:1px solid #b9954b66;border-radius:10px;background:#29201b;white-space:nowrap';guides.appendChild(link)});
      if(lang)top.insertBefore(guides,lang);else top.appendChild(guides);
    }
    load('/polish-vocabulary.js?v=pl-practice-3')
      .then(()=>load('/polish-practice-ux.js?v=macbook-1'))
      .then(()=>load('/polish-practice-hotfix.js?v=sentence-check-1'))
      .then(()=>load('/polish-word-diacritics.js?v=optional-1'))
      .catch(error=>console.warn('Polish vocabulary failed to load',error));
  }

  let vocabularyReady=false,vocabularyTask=null;
  const ensureVocabulary=()=>{if(vocabularyReady)return Promise.resolve();if(vocabularyTask)return vocabularyTask;vocabularyTask=(async()=>{await load('/vocabulary.js?v=practice-1');await load('/vocabulary-practice-v2.js?v=selected-word-2');vocabularyReady=true})().catch(error=>{vocabularyTask=null;console.warn('Vocabulary feature failed to load',error);throw error});return vocabularyTask};
  const saved=document.getElementById('openVocabulary');if(saved)saved.addEventListener('click',async event=>{if(vocabularyReady)return;event.preventDefault();event.stopImmediatePropagation();saved.disabled=true;try{await ensureVocabulary();saved.disabled=false;saved.click()}catch{saved.disabled=false}},true);
  const reader=document.getElementById('storyReader');if(reader){const prepareSelection=()=>{const selection=getSelection();if(!selection||selection.isCollapsed||!selection.toString().trim())return;ensureVocabulary().then(()=>reader.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,cancelable:true}))).catch(()=>{})};reader.addEventListener('pointerup',prepareSelection,{passive:true});document.addEventListener('selectionchange',()=>{const selection=getSelection();if(!selection||selection.isCollapsed||!selection.toString().trim())return;if(reader.contains(selection.anchorNode))ensureVocabulary().catch(()=>{})})}
  const loadAudio=async()=>{try{await load('/folk-audio-web.js?v=web-audio-2');const audio=document.querySelector('.folk-audio-player');if(audio&&document.body.classList.contains('collection-text-body')){audio.style.bottom='calc(96px + env(safe-area-inset-bottom))';audio.style.zIndex='23'}}catch(error){console.warn('Audiobook feature failed to load',error)}};idle(5200).then(loadAudio);
  const loadGame=async()=>{try{await loadStyle('/story-shooting-game.css?v=vintage-1');await load('/story-shooting-game.js?v=vintage-1')}catch(error){console.warn('Story challenge failed to load',error)}};const chapterEnd=reader?.querySelector('.chapter-end');if(chapterEnd&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();loadGame()}},{rootMargin:'900px 0px'});observer.observe(chapterEnd)}else idle(5000).then(loadGame);
})();