(()=>{
  const pending=new Map();
  const load=src=>{
    if(pending.has(src))return pending.get(src);
    const task=new Promise((resolve,reject)=>{
      if(document.querySelector(`script[src="${src}"]`)){resolve();return}
      const script=document.createElement('script');
      script.src=src;
      script.async=false;
      script.onload=resolve;
      script.onerror=reject;
      document.body.appendChild(script);
    });
    pending.set(src,task);
    return task;
  };
  const loadStyle=href=>{
    if(pending.has(href))return pending.get(href);
    const task=new Promise(resolve=>{
      if(document.querySelector(`link[href="${href}"]`)){resolve();return}
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=href;
      link.onload=resolve;
      link.onerror=resolve;
      document.head.appendChild(link);
    });
    pending.set(href,task);
    return task;
  };
  const idle=(timeout=2200)=>new Promise(resolve=>{
    if('requestIdleCallback' in window)requestIdleCallback(()=>resolve(),{timeout});
    else setTimeout(resolve,900);
  });

  let vocabularyReady=false;
  let vocabularyTask=null;
  const ensureVocabulary=()=>{
    if(vocabularyReady)return Promise.resolve();
    if(vocabularyTask)return vocabularyTask;
    vocabularyTask=(async()=>{
      await load('/vocabulary.js?v=practice-1');
      await load('/vocabulary-practice-v2.js?v=selected-word-2');
      vocabularyReady=true;
    })().catch(error=>{
      vocabularyTask=null;
      console.warn('Vocabulary feature failed to load',error);
      throw error;
    });
    return vocabularyTask;
  };

  const saved=document.getElementById('openVocabulary');
  if(saved)saved.addEventListener('click',async event=>{
    if(vocabularyReady)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    saved.disabled=true;
    try{
      await ensureVocabulary();
      saved.disabled=false;
      saved.click();
    }catch{
      saved.disabled=false;
    }
  },true);

  const reader=document.getElementById('storyReader');
  if(reader){
    const prepareSelection=()=>{
      const selection=getSelection();
      if(!selection||selection.isCollapsed||!selection.toString().trim())return;
      ensureVocabulary().then(()=>{
        reader.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,cancelable:true}));
      }).catch(()=>{});
    };
    reader.addEventListener('pointerup',prepareSelection,{passive:true});
    document.addEventListener('selectionchange',()=>{
      const selection=getSelection();
      if(!selection||selection.isCollapsed||!selection.toString().trim())return;
      if(reader.contains(selection.anchorNode))ensureVocabulary().catch(()=>{});
    });
  }

  const loadAudio=()=>load('/folk-audio-web.js?v=web-audio-1').catch(error=>console.warn('Audiobook feature failed to load',error));
  idle(2600).then(loadAudio);

  const loadGame=async()=>{
    try{
      await loadStyle('/story-shooting-game.css?v=vintage-1');
      await load('/story-shooting-game.js?v=vintage-1');
    }catch(error){console.warn('Story challenge failed to load',error)}
  };
  const chapterEnd=reader?.querySelector('.chapter-end');
  if(chapterEnd&&'IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){
        observer.disconnect();
        loadGame();
      }
    },{rootMargin:'900px 0px'});
    observer.observe(chapterEnd);
  }else idle(5000).then(loadGame);
})();
