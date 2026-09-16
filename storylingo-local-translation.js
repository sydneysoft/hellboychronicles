(()=>{
  const packs=new Map();
  const NS='storylingo:translation:v1';
  const BAD=/MYMEMORY WARNING|TRANSLATED\.NET|FREE TRANSLATIONS|QUERY LENGTH LIMIT|TRANSLATION SERVICE IS TEMPORARILY UNAVAILABLE/i;
  const REMOTE_TRANSLATION=/^(?:https?:\/\/)?(?:api\.mymemory\.translated\.net|translate\.googleapis\.com)(?:\/|$)/i;
  const clean=value=>typeof value==='string'?value.trim():'';
  const valid=value=>{const v=clean(value);return !!v&&!BAD.test(v)};
  const key=(story,lang,index)=>`${NS}:${story}:${lang}:${index}`;
  const legacyKeys=(story,lang,index)=>story==='lost-key'?[`hc-core-lost-key-${lang}-${index}`,`hc-core-lost-key-${lang}-v3-${index}`]:[`storylingo-universal-${story}-${lang}-${index}`];

  // Translation is local-only. Old code paths are prevented from sending text
  // to the former remote translation providers while the site migrates.
  if(typeof window.fetch==='function'&&!window.__storylingoLocalFetchGuard){
    const nativeFetch=window.fetch.bind(window);
    window.fetch=(input,init)=>{
      const url=typeof input==='string'?input:(input&&typeof input.url==='string'?input.url:'');
      if(REMOTE_TRANSLATION.test(url))return Promise.reject(new Error('StoryLingo remote translation is disabled'));
      return nativeFetch(input,init);
    };
    window.__storylingoLocalFetchGuard=true;
  }

  // Remove quota/error messages accidentally cached by the old remote translator.
  try{
    for(let i=localStorage.length-1;i>=0;i--){
      const k=localStorage.key(i),v=k?localStorage.getItem(k):'';
      if(k&&(k.startsWith('hc-core-')||k.startsWith('storylingo-universal-')||k.startsWith(NS))&&!valid(v))localStorage.removeItem(k);
    }
  }catch{}

  function persist(story,lang,index,value){
    const v=clean(value);if(!valid(v))return false;
    try{
      localStorage.setItem(key(story,lang,index),v);
      // Keep compatibility with the old readers so they consume the bundled
      // local value and never reach a network translator.
      legacyKeys(story,lang,index).forEach(k=>localStorage.setItem(k,v));
      return true;
    }catch{return false}
  }
  function registerStory(story,lang,paragraphs){
    if(!story||!lang||!Array.isArray(paragraphs))return;
    const pack=paragraphs.map(clean);
    packs.set(`${story}:${lang}`,pack);
    pack.forEach((value,index)=>{if(valid(value))persist(story,lang,index,value)});
  }
  function get(story,lang,index,source=''){
    if(lang==='en')return source;
    try{
      const saved=localStorage.getItem(key(story,lang,index));
      if(valid(saved))return saved;
      if(saved)localStorage.removeItem(key(story,lang,index));
      for(const oldKey of legacyKeys(story,lang,index)){
        const old=localStorage.getItem(oldKey);
        if(valid(old)){
          persist(story,lang,index,old);
          return old;
        }
        if(old)localStorage.removeItem(oldKey);
      }
    }catch{}
    const pack=packs.get(`${story}:${lang}`),local=pack?.[index];
    if(valid(local)){persist(story,lang,index,local);return local}
    return source;
  }
  function put(story,lang,index,value){return persist(story,lang,index,value)}
  function hasPack(story,lang){return packs.has(`${story}:${lang}`)}
  function clearStory(story,lang){
    try{
      for(let i=localStorage.length-1;i>=0;i--){
        const k=localStorage.key(i);
        if(k&&(k.startsWith(`${NS}:${story}:${lang}:`)||legacyKeys(story,lang,'').some(prefix=>k.startsWith(prefix))))localStorage.removeItem(k)
      }
    }catch{}
  }
  window.StoryLingoLocalTranslation={registerStory,get,put,hasPack,clearStory,isValid:valid,namespace:NS,localOnly:true};
})();
