(()=>{
  const load=src=>new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    script.onload=resolve;
    script.onerror=reject;
    document.body.appendChild(script);
  });
  const idle=()=>new Promise(resolve=>{
    if('requestIdleCallback' in window)requestIdleCallback(()=>resolve(),{timeout:800});
    else setTimeout(resolve,180);
  });
  const boot=async()=>{
    try{
      await idle();
      await load('/vocabulary.js?v=practice-1');
      await load('/vocabulary-practice-v2.js?v=selected-word-2');
      await idle();
      await load('/folk-audio-web.js?v=web-audio-1');
      await idle();
      await load('/story-shooting-game.js?v=vintage-1');
    }catch(error){console.warn('Optional reader feature failed to load',error)}
  };
  if(document.readyState==='complete')boot();
  else addEventListener('load',boot,{once:true});
})();
