(()=>{
  const VERSION='20260916-7';
  const STATE_KEY=`storylingo:translation-store:${VERSION}:state`;
  const KEY_PREFIX=`storylingo:translation-store:${VERSION}:`;
  const resources={
    vocabulary:'/translations/vocabulary.json?v=7',
    'en-glosses':'/translations/en/story-glosses.json?v=7',
    'ru-forms':'/translations/ru/word-forms.json?v=7',
    'ru-glosses':'/translations/ru/story-glosses.json?v=7',
    'ru:lost-key':'/translations/ru/lost-key.json?v=7',
    'ru:iliad':'/translations/ru/iliad.json?v=7',
    'ru:odyssey':'/translations/ru/odyssey.json?v=7'
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

    const irregular={
      'left':'leave','seen':'see','seeing':'see','looking':'look','looks':'look','heard':'hear','hearing':'hear',
      'speaking':'speak','says':'say','saying':'say','asking':'ask','asks':'ask','answers':'answer','answered':'answer',
      'knows':'know','knowing':'know','thinking':'think','thinks':'think','wanted':'want','wants':'want','needed':'need','needs':'need',
      'giving':'give','gives':'give','taking':'take','takes':'take','finding':'find','finds':'find','losing':'lose','loses':'lose',
      'opening':'open','opens':'open','closing':'close','closes':'close','putting':'put','leaving':'leave','waiting':'wait','waited':'wait',
      'walking':'walk','walks':'walk','running':'run','runs':'run','buying':'buy','buys':'buy','eating':'eat','drinking':'drink',
      'calling':'call','called':'call','helping':'help','helped':'help','remembered':'remember','remembering':'remember','working':'work',
      'sitting':'sit','standing':'stand','moving':'move','moved':'move','laughing':'laugh','smiling':'smile','starting':'start','started':'start',
      'stopping':'stop','stopped':'stop','keeping':'keep','kept':'keep','paying':'pay','making':'make','getting':'get','gotten':'get',
      'houses':'house','apartments':'apartment','doors':'door','streets':'street','cities':'city','mornings':'morning','days':'day','nights':'night',
      'phones':'phone','pockets':'pocket','coats':'coat','bags':'bag','friends':'friend','shops':'shop','men':'man','women':'woman',
      'buses':'bus','tables':'table','chairs':'chair','windows':'window','messages':'message','floors':'floor','coins':'coin','tickets':'ticket',
      'pens':'pen','hands':'hand','cars':'car','drivers':'driver','boys':'boy','stations':'station','books':'book','rooms':'room','trains':'train',
      'keys':'key','people':'people','bottles':'bottle','pieces':'piece','minutes':'minute','moments':'moment','walls':'wall','roads':'road',
      'passengers':'passenger','fingers':'finger','problems':'problem','cups':'cup'
    };
    for(const [alias,source] of Object.entries(irregular))addAlias(entries,alias,source);

    const originals=Object.keys(entries);
    for(const source of originals){
      if(!/^[a-z]+$/.test(source)||source.length<4)continue;
      if(source.endsWith('e')){
        addAlias(entries,source.slice(0,-1)+'ing',source);
        addAlias(entries,source+'d',source);
      }else{
        addAlias(entries,source+'ing',source);
        addAlias(entries,source+'ed',source);
      }
      addAlias(entries,source+'s',source);
    }
    return vocabulary;
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

      const values=Object.fromEntries(loaded);
      values.vocabulary=expandEnglishVocabulary(values.vocabulary,values['en-glosses']);

      for(const [name,value] of Object.entries(values)){
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
