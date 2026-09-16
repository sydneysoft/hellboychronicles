(()=>{
  const VERSION='20260916-6';
  const STATE_KEY=`storylingo:translation-store:${VERSION}:state`;
  const KEY_PREFIX=`storylingo:translation-store:${VERSION}:`;
  const resources={
    vocabulary:'/translations/vocabulary.json?v=6',
    'ru-forms':'/translations/ru/word-forms.json?v=6',
    'ru-glosses':'/translations/ru/story-glosses.json?v=6',
    'ru:lost-key':'/translations/ru/lost-key.json?v=6',
    'ru:iliad':'/translations/ru/iliad.json?v=6',
    'ru:odyssey':'/translations/ru/odyssey.json?v=6'
  };

  const storageKey=name=>`${KEY_PREFIX}${name}`;

  function read(name){
    try{
      const raw=localStorage.getItem(storageKey(name));
      return raw?JSON.parse(raw):null;
    }catch{return null}
  }

  function allPresent(){
    try{
      if(localStorage.getItem(STATE_KEY)!=='1')return false;
      return Object.keys(resources).every(name=>read(name)!==null);
    }catch{return false}
  }

  async function initialize(){
    if(allPresent())return true;

    try{localStorage.setItem(STATE_KEY,'0')}catch{return false}

    try{
      const loaded=await Promise.all(Object.entries(resources).map(async([name,url])=>{
        const response=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'});
        if(!response.ok)throw new Error(`${name}:${response.status}`);
        const value=await response.json();
        return [name,value];
      }));

      for(const [name,value] of loaded){
        localStorage.setItem(storageKey(name),JSON.stringify(value));
      }

      if(!Object.keys(resources).every(name=>read(name)!==null))throw new Error('translation-store-verification-failed');
      localStorage.setItem(STATE_KEY,'1');
      return true;
    }catch(error){
      try{localStorage.setItem(STATE_KEY,'0')}catch{}
      console.error('StoryLingo local translation store initialization failed',error);
      return false;
    }
  }

  const ready=initialize();

  window.StoryLingoTranslationStore={
    version:VERSION,
    ready,
    async get(name){
      const ok=await ready;
      if(!ok)return null;
      return read(name);
    },
    getState(){
      try{return Number(localStorage.getItem(STATE_KEY)||'0')}catch{return 0}
    },
    getResourceCount(){
      try{return Object.keys(resources).filter(name=>read(name)!==null).length}catch{return 0}
    },
    getResourceTotal(){return Object.keys(resources).length},
    reset(){
      try{
        localStorage.setItem(STATE_KEY,'0');
        for(const name of Object.keys(resources))localStorage.removeItem(storageKey(name));
      }catch{}
    }
  };
})();
