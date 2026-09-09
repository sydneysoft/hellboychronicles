(()=>{
  const load=src=>new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    script.onload=resolve;
    script.onerror=reject;
    document.body.appendChild(script);
  });
  const loadStyle=href=>new Promise(resolve=>{
    if(document.querySelector(`link[href="${href}"]`)){resolve();return}
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=href;
    link.onload=resolve;
    link.onerror=resolve;
    document.head.appendChild(link);
  });
  const idle=(timeout=1000)=>new Promise(resolve=>{
    if('requestIdleCallback' in window)requestIdleCallback(()=>resolve(),{timeout});
    else setTimeout(resolve,260);
  });
  const boot=async()=>{
    try{
      await idle(1200);
      await load('/vocabulary.js?v=practice-1');
      await load('/vocabulary-practice-v2.js?v=selected-word-2');
      await idle(1400);
      await load('/folk-audio-web.js?v=web-audio-1');
      await idle(1600);
      await loadStyle('/story-shooting-game.css?v=vintage-1');
      await load('/story-shooting-game.js?v=vintage-1');
    }catch(error){console.warn('Optional reader feature failed to load',error)}
  };
  boot();
})();
