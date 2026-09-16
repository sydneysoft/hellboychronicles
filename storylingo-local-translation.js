(()=>{
  const packs=new Map();
  const NS='storylingo:translation:v1';
  const BAD=/MYMEMORY WARNING|TRANSLATED\.NET|FREE TRANSLATIONS|QUERY LENGTH LIMIT|TRANSLATION SERVICE IS TEMPORARILY UNAVAILABLE/i;
  const clean=value=>typeof value==='string'?value.trim():'';
  const valid=value=>{const v=clean(value);return !!v&&!BAD.test(v)};
  const key=(story,lang,index)=>`${NS}:${story}:${lang}:${index}`;
  const legacyKeys=(story,lang,index)=>story==='lost-key'?[`hc-core-lost-key-${lang}-${index}`,`hc-core-lost-key-${lang}-v3-${index}`]:[`storylingo-universal-${story}-${lang}-${index}`];

  // Remove quota/error messages accidentally cached by the old remote translator.
  try{
    for(let i=localStorage.length-1;i>=0;i--){
      const k=localStorage.key(i),v=k?localStorage.getItem(k):'';
      if(k&&(k.startsWith('hc-core-')||k.startsWith('storylingo-universal-')||k.startsWith(NS))&&!valid(v))localStorage.removeItem(k);
    }
  }catch{}

  function registerStory(story,lang,paragraphs){
    if(!story||!lang||!Array.isArray(paragraphs))return;
    packs.set(`${story}:${lang}`,paragraphs.map(clean));
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
          localStorage.setItem(key(story,lang,index),old);
          return old;
        }
        if(old)localStorage.removeItem(oldKey);
      }
    }catch{}
    const pack=packs.get(`${story}:${lang}`),local=pack?.[index];
    if(valid(local)){
      try{localStorage.setItem(key(story,lang,index),local)}catch{}
      return local;
    }
    return source;
  }
  function put(story,lang,index,value){
    const v=clean(value);if(!valid(v))return false;
    try{localStorage.setItem(key(story,lang,index),v);return true}catch{return false}
  }
  function hasPack(story,lang){return packs.has(`${story}:${lang}`)}
  function clearStory(story,lang){
    try{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.startsWith(`${NS}:${story}:${lang}:`))localStorage.removeItem(k)}}catch{}
  }
  window.StoryLingoLocalTranslation={registerStory,get,put,hasPack,clearStory,isValid:valid,namespace:NS};
})();
