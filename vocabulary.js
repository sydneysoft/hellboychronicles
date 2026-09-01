(()=>{
  const article=document.querySelector('.novel-copy');
  const openButton=document.getElementById('openVocabulary');
  const countElement=document.getElementById('vocabCount');
  if(!article||!openButton)return;

  const FAVORITES_KEY='hellboy-favorite-words';
  const CACHE_KEY='hellboy-translation-cache';
  const ukrainianWord=/^[А-Яа-яІіЇїЄєҐґ’'-]+$/u;
  let activeEntry=null;
  let favorites=readJSON(FAVORITES_KEY,[]);
  let translationCache=readJSON(CACHE_KEY,{});

  const popup=document.createElement('aside');
  popup.className='word-popup';
  popup.hidden=true;
  popup.setAttribute('role','dialog');
  popup.setAttribute('aria-label','Переклад вибраного слова');
  popup.innerHTML=`
    <button class="word-popup-close" type="button" aria-label="Закрити">×</button>
    <p class="word-popup-label">ВИБРАНЕ СЛОВО</p>
    <h2 class="word-popup-word"></h2>
    <p class="word-popup-translation">ПЕРЕКЛАДАЄМО…</p>
    <dl class="word-details">
      <div><dt>СЛОВНИКОВА ФОРМА</dt><dd data-field="lemma"></dd></div>
      <div><dt>ЧАСТИНА МОВИ</dt><dd data-field="pos"></dd></div>
    </dl>
    <p class="word-example-label">ПРИКЛАД ІЗ РОЗДІЛУ</p>
    <blockquote class="word-example"></blockquote>
    <button class="word-save" type="button">☆ ЗБЕРЕГТИ СЛОВО</button>`;
  document.body.append(popup);

  const dialog=document.createElement('dialog');
  dialog.className='vocab-dialog';
  dialog.innerHTML=`
    <div class="vocab-dialog-head">
      <div><span>МІЙ СЛОВНИК</span><h2>ЗБЕРЕЖЕНІ СЛОВА</h2></div>
      <button type="button" data-close aria-label="Закрити">×</button>
    </div>
    <p class="vocab-dialog-intro">Слова зберігаються на цьому пристрої, щоб ви могли повторити їх пізніше.</p>
    <div class="vocab-list"></div>`;
  document.body.append(dialog);

  const wordElement=popup.querySelector('.word-popup-word');
  const translationElement=popup.querySelector('.word-popup-translation');
  const lemmaElement=popup.querySelector('[data-field="lemma"]');
  const posElement=popup.querySelector('[data-field="pos"]');
  const exampleElement=popup.querySelector('.word-example');
  const saveButton=popup.querySelector('.word-save');
  const listElement=dialog.querySelector('.vocab-list');

  function readJSON(key,fallback){
    try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}
  }

  function normalizeWord(value){
    return value.trim().replace(/^[^А-Яа-яІіЇїЄєҐґ]+|[^А-Яа-яІіЇїЄєҐґ’'-]+$/gu,'').toLocaleLowerCase('uk-UA');
  }

  function partOfSpeech(lemma){
    if(/ти(ся)?$/u.test(lemma))return 'ДІЄСЛОВО · VERB';
    if(/(ий|ій|ський|цький|зький|ний|овий|евий|євий)$/u.test(lemma))return 'ПРИКМЕТНИК · ADJECTIVE';
    if(/(о|е)$/u.test(lemma))return 'ПРИСЛІВНИК / ІНШЕ · ADVERB / OTHER';
    return 'ІМЕННИК / ІНШЕ · NOUN / OTHER';
  }

  function sentenceFor(node,word){
    const element=node?.nodeType===Node.ELEMENT_NODE?node:node?.parentElement;
    const container=element?.closest('p, blockquote');
    const text=(container?.textContent||'').trim().replace(/\s+/g,' ');
    if(!text)return '';
    const sentences=text.match(/[^.!?…]+[.!?…]?/gu)||[text];
    return (sentences.find(sentence=>sentence.toLocaleLowerCase('uk-UA').includes(word))||text).trim();
  }

  function isSaved(word){return favorites.some(item=>item.word===word)}

  function updateSaveButton(){
    const saved=activeEntry&&isSaved(activeEntry.word);
    saveButton.textContent=saved?'★ ЗБЕРЕЖЕНО':'☆ ЗБЕРЕГТИ СЛОВО';
    saveButton.classList.toggle('is-saved',Boolean(saved));
  }

  function positionPopup(rect){
    popup.hidden=false;
    const gap=12;
    const width=Math.min(360,innerWidth-24);
    popup.style.width=`${width}px`;
    let left=rect.left+rect.width/2-width/2;
    left=Math.max(12,Math.min(left,innerWidth-width-12));
    popup.style.left=`${left}px`;
    const measured=popup.getBoundingClientRect().height;
    const above=rect.top-measured-gap;
    popup.style.top=`${above>12?above:Math.min(rect.bottom+gap,innerHeight-measured-12)}px`;
  }

  async function translate(entry){
    const cacheKey=entry.lemma;
    if(translationCache[cacheKey]){
      setTranslation(entry.word,translationCache[cacheKey]);
      return;
    }
    try{
      const endpoint=`https://api.mymemory.translated.net/get?q=${encodeURIComponent(entry.lemma)}&langpair=uk|en`;
      const response=await fetch(endpoint);
      if(!response.ok)throw new Error('Translation unavailable');
      const payload=await response.json();
      const translated=String(payload?.responseData?.translatedText||'').trim();
      if(!translated||/MYMEMORY WARNING/i.test(translated))throw new Error('Translation unavailable');
      translationCache[cacheKey]=translated;
      localStorage.setItem(CACHE_KEY,JSON.stringify(translationCache));
      setTranslation(entry.word,translated);
    }catch{
      setTranslation(entry.word,'TRANSLATION UNAVAILABLE');
    }
  }

  function setTranslation(word,translation){
    if(!activeEntry||activeEntry.word!==word)return;
    activeEntry.translation=translation;
    translationElement.textContent=translation.toLocaleUpperCase('en-US');
    translationElement.classList.toggle('is-error',translation==='TRANSLATION UNAVAILABLE');
    const saved=favorites.find(item=>item.word===activeEntry.word);
    if(saved){
      saved.translation=translation;
      persistFavorites();
    }
  }

  function showSelection(){
    const selection=getSelection();
    if(!selection||selection.isCollapsed||!selection.rangeCount)return;
    const raw=selection.toString().trim();
    if(!ukrainianWord.test(raw))return;
    const range=selection.getRangeAt(0);
    const common=range.commonAncestorContainer;
    const owner=common.nodeType===Node.ELEMENT_NODE?common:common.parentElement;
    if(!owner||!article.contains(owner))return;
    const word=normalizeWord(raw);
    if(!word)return;
    const lemma=window.UA_LEMMAS?.[word]||word;
    activeEntry={word,lemma,partOfSpeech:partOfSpeech(lemma),example:sentenceFor(selection.anchorNode,word),translation:''};
    wordElement.textContent=raw;
    lemmaElement.textContent=lemma;
    posElement.textContent=activeEntry.partOfSpeech;
    exampleElement.textContent=activeEntry.example;
    translationElement.textContent='ПЕРЕКЛАДАЄМО…';
    translationElement.classList.remove('is-error');
    updateSaveButton();
    positionPopup(range.getBoundingClientRect());
    translate(activeEntry);
  }

  function persistFavorites(){
    localStorage.setItem(FAVORITES_KEY,JSON.stringify(favorites));
    countElement.textContent=String(favorites.length);
    renderFavorites();
  }

  function toggleFavorite(){
    if(!activeEntry)return;
    const index=favorites.findIndex(item=>item.word===activeEntry.word);
    if(index>=0)favorites.splice(index,1);
    else favorites.unshift({...activeEntry,savedAt:Date.now()});
    persistFavorites();
    updateSaveButton();
  }

  function renderFavorites(){
    listElement.replaceChildren();
    if(!favorites.length){
      const empty=document.createElement('div');
      empty.className='vocab-empty';
      empty.innerHTML='<span>☆</span><strong>СЛІВ ЩЕ НЕМАЄ</strong><p>Виділіть слово в українському тексті та натисніть «Зберегти».</p>';
      listElement.append(empty);
      return;
    }
    favorites.forEach(item=>{
      const card=document.createElement('article');
      card.className='vocab-card';
      const top=document.createElement('div');
      const words=document.createElement('div');
      const word=document.createElement('h3');
      const translation=document.createElement('strong');
      const meta=document.createElement('p');
      const example=document.createElement('blockquote');
      const remove=document.createElement('button');
      word.textContent=item.word;
      translation.textContent=item.translation||'TRANSLATION PENDING';
      meta.textContent=`${item.lemma} · ${item.partOfSpeech}`;
      example.textContent=item.example;
      remove.type='button';
      remove.textContent='ВИДАЛИТИ';
      remove.setAttribute('aria-label',`Видалити слово ${item.word}`);
      remove.onclick=()=>{
        favorites=favorites.filter(saved=>saved.word!==item.word);
        persistFavorites();
        updateSaveButton();
      };
      words.append(word,translation);
      top.append(words,remove);
      card.append(top,meta,example);
      listElement.append(card);
    });
  }

  let selectionTimer;
  document.addEventListener('selectionchange',()=>{
    clearTimeout(selectionTimer);
    selectionTimer=setTimeout(showSelection,120);
  });
  popup.querySelector('.word-popup-close').onclick=()=>{popup.hidden=true};
  saveButton.onclick=toggleFavorite;
  openButton.onclick=()=>{renderFavorites();dialog.showModal()};
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
  addEventListener('resize',()=>{popup.hidden=true},{passive:true});
  addEventListener('scroll',()=>{popup.hidden=true},{passive:true});
  countElement.textContent=String(favorites.length);
  renderFavorites();
})();
