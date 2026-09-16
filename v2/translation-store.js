(()=>{
  const VERSION='v2-20260916-1';
  const RESET_KEY='storylingo:v2:reset:v1';
  const STATE_KEY='storylingo:v2:state';
  const KEY_PREFIX='storylingo:v2:resource:';
  const resources={
    vocabulary:'/translations/vocabulary.json?v=v2-1',
    'en-glosses':'/translations/en/story-glosses.json?v=v2-1',
    'ru-forms':'/translations/ru/word-forms.json?v=v2-1',
    'ru-glosses':'/translations/ru/story-glosses.json?v=v2-1',
    'ru:lost-key':'/translations/ru/lost-key.json?v=v2-1',
    'ru:iliad':'/translations/ru/iliad.json?v=v2-1',
    'ru:odyssey':'/translations/ru/odyssey.json?v=v2-1'
  };

  const storageKey=name=>`${KEY_PREFIX}${name}`;
  const safeGet=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const safeSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};

  function read(name){
    try{
      const raw=localStorage.getItem(storageKey(name));
      return raw?JSON.parse(raw):null;
    }catch{return null}
  }

  function resetOldStoryLingoCacheOnce(){
    if(safeGet(RESET_KEY)==='1')return;
    try{
      const remove=[];
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i)||'';
        if(
          k.startsWith('storylingo:translation-store:') ||
          k.startsWith('storylingo:vocabulary:') ||
          k.startsWith('storylingo:translations:') ||
          k.startsWith('storylingo:v2:resource:') ||
          k==='storylingo:v2:state'
        ) remove.push(k);
      }
      remove.forEach(k=>localStorage.removeItem(k));
      localStorage.removeItem('hellboy-universal-vocabulary');
      localStorage.setItem(RESET_KEY,'1');
    }catch{}
  }

  function allPresent(){
    if(safeGet(STATE_KEY)!=='1')return false;
    return Object.keys(resources).every(name=>read(name)!==null);
  }

  function addAlias(entries,alias,source){
    if(!alias||entries[alias]||!entries[source])return;
    entries[alias]={...entries[source]};
  }

  function expandEnglishVocabulary(vocabulary,glosses){
    if(!vocabulary||typeof vocabulary!=='object')vocabulary={version:1,languages:['es','de','fr','pl','ru'],entries:{}};
    if(!vocabulary.entries||typeof vocabulary.entries!=='object')vocabulary.entries={};
    const entries=vocabulary.entries;
    for(const [word,value] of Object.entries(glosses?.entries||{})){
      if(value&&typeof value==='object')entries[word.toLowerCase()]={...value};
    }
    const aliases={
      left:'leave',seen:'see',seeing:'see',looking:'look',looks:'look',heard:'hear',hearing:'hear',
      speaking:'speak',says:'say',saying:'say',asking:'ask',asks:'ask',answers:'answer',answered:'answer',
      knows:'know',knowing:'know',thinking:'think',thinks:'think',wanted:'want',wants:'want',needed:'need',needs:'need',
      giving:'give',gives:'give',taking:'take',takes:'take',finding:'find',finds:'find',losing:'lose',loses:'lose',
      opening:'open',opens:'open',closing:'close',closes:'close',putting:'put',leaving:'leave',waiting:'wait',waited:'wait',
      walking:'walk',walks:'walk',running:'run',runs:'run',buying:'buy',buys:'buy',eating:'eat',drinking:'drink',
      calling:'call',called:'call',helping:'help',helped:'help',remembered:'remember',remembering:'remember',working:'work',
      sitting:'sit',standing:'stand',moving:'move',moved:'move',laughing:'laugh',smiling:'smile',starting:'start',started:'start',
      stopping:'stop',stopped:'stop',keeping:'keep',kept:'keep',paying:'pay',making:'make',getting:'get',gotten:'get',
      houses:'house',apartments:'apartment',doors:'door',streets:'street',cities:'city',mornings:'morning',days:'day',nights:'night',
      phones:'phone',pockets:'pocket',coats:'coat',bags:'bag',friends:'friend',shops:'shop',men:'man',women:'woman',
      buses:'bus',tables:'table',chairs:'chair',windows:'window',messages:'message',floors:'floor',coins:'coin',tickets:'ticket',
      pens:'pen',hands:'hand',cars:'car',drivers:'driver',boys:'boy',stations:'station',books:'book',rooms:'room',trains:'train',
      keys:'key',bottles:'bottle',pieces:'piece',minutes:'minute',moments:'moment',walls:'wall',roads:'road',
      passengers:'passenger',fingers:'finger',problems:'problem',cups:'cup'
    };
    for(const [alias,source] of Object.entries(aliases))addAlias(entries,alias,source);
    return vocabulary;
  }

  async function initialize(){
    resetOldStoryLingoCacheOnce();
    if(allPresent())return true;
    if(!safeSet(STATE_KEY,'0'))return false;

    try{
      const loaded=await Promise.all(Object.entries(resources).map(async([name,url])=>{
        const response=await fetch(url,{headers:{Accept:'application/json'},cache:'reload'});
        if(!response.ok)throw new Error(`${name}:${response.status}`);
        return [name,await response.json()];
      }));
      const values=Object.fromEntries(loaded);
      values.vocabulary=expandEnglishVocabulary(values.vocabulary,values['en-glosses']);
      for(const [name,value] of Object.entries(values)){
        localStorage.setItem(storageKey(name),JSON.stringify(value));
      }
      if(!Object.keys(resources).every(name=>read(name)!==null))throw new Error('v2-store-verification-failed');
      localStorage.setItem(STATE_KEY,'1');
      return true;
    }catch(error){
      try{localStorage.setItem(STATE_KEY,'0')}catch{}
      console.error('StoryLingo v2 local cache initialization failed',error);
      return false;
    }
  }

  const ready=initialize();
  window.StoryLingoTranslationStore={
    version:VERSION,
    ready,
    async get(name){const ok=await ready;return ok?read(name):null},
    getState(){return Number(safeGet(STATE_KEY)||'0')},
    getResourceCount(){return Object.keys(resources).filter(name=>read(name)!==null).length},
    getResourceTotal(){return Object.keys(resources).length},
    reset(){
      try{
        localStorage.setItem(STATE_KEY,'0');
        for(const name of Object.keys(resources))localStorage.removeItem(storageKey(name));
      }catch{}
    }
  };
})();
