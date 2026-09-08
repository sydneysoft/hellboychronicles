(()=>{
const popup=document.querySelector('.word-popup'),savedDialog=document.querySelector('.vocab-dialog');
if(!popup||!savedDialog)return;

const source=document.body.dataset.novelLanguage==='uk'?'uk':'en';
const locale=source==='uk'?'uk-UA':'en-US';
const sourceName=source==='uk'?'Ukrainian':'English';
const savedKey=source==='uk'?'hellboy-favorite-words':'hellboy-favorite-words-en';
const statsKey=`hellboy-practice-v2-${source}`;
const definitionKey='hellboy-definition-cache-v2';
const ui=source==='uk'?{
practice:'✎ ПРАКТИКУВАТИ СЛОВО',practiceSaved:'✎ ПРАКТИКУВАТИ ЗБЕРЕЖЕНІ СЛОВА',title:'ПРАКТИКА ПИСЬМА',translation:'ПЕРЕКЛАД',meaning:'ЗНАЧЕННЯ',loading:'Шукаємо значення…',unavailable:'Значення недоступне.',heading:'ПРАКТИКУЙТЕ ПИСЬМО',writeWord:'НАПИШІТЬ УКРАЇНСЬКЕ СЛОВО',correct:'ПРАВИЛЬНО',incorrect:'СПРОБУЙТЕ ЩЕ РАЗ',correctWas:'ПРАВИЛЬНЕ НАПИСАННЯ',sentence:'ВИКОРИСТАЙТЕ СЛОВО У ФРАЗІ АБО РЕЧЕННІ',placeholder:'Напишіть власне речення…',verify:'ПЕРЕВІРИТИ РЕЧЕННЯ',checking:'ПЕРЕВІРЯЄМО…',well:'НАПИСАНО ПРАВИЛЬНО',useWord:'Використайте практиковане слово у реченні.',short:'Напишіть щонайменше три слова.',capital:'Почніть речення з великої літери.',punctuation:'Додайте розділовий знак наприкінці.',spacing:'Приберіть зайві пробіли.',grammarDown:'Основні перевірки пройдено, але повна перевірка граматики зараз недоступна.',next:'НАСТУПНЕ СЛОВО',finish:'ЗАВЕРШИТИ',word:'СЛОВО',learned:'ВИВЧЕНО',noWords:'Спочатку збережіть хоча б одне слово.'
}:{
practice:'✎ PRACTICE WORD',practiceSaved:'✎ PRACTICE SAVED WORDS',title:'WRITING PRACTICE',translation:'TRANSLATION',meaning:'MEANING',loading:'Finding the meaning…',unavailable:'Meaning unavailable.',heading:'PRACTICE YOUR WRITING',writeWord:'WRITE THE ENGLISH WORD',correct:'CORRECT',incorrect:'TRY AGAIN',correctWas:'CORRECT SPELLING',sentence:'USE THE WORD IN A PHRASE OR SENTENCE',placeholder:'Write your own sentence…',verify:'VERIFY SENTENCE',checking:'CHECKING…',well:'WELL WRITTEN',useWord:'Use the practiced word in your sentence.',short:'Write at least three words.',capital:'Start the sentence with a capital letter.',punctuation:'Add punctuation at the end.',spacing:'Remove repeated spaces.',grammarDown:'The basic checks passed, but full grammar checking is temporarily unavailable.',next:'NEXT WORD',finish:'FINISH',word:'WORD',learned:'LEARNED',noWords:'Save at least one word before practicing.'
};

const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const comparable=value=>String(value||'').trim().replace(/[’`]/g,"'").replace(/\s+/g,' ').toLocaleLowerCase(locale);

const style=document.createElement('style');
style.textContent=`.word-practice-v2{width:100%;margin-top:9px;border:0;background:#7b1c22;color:#fff;padding:12px;font:800 13px 'Barlow Condensed',sans-serif;letter-spacing:.1em;cursor:pointer}.word-practice-v2:disabled{opacity:.45;cursor:not-allowed}.practice-v2-dialog .practice-meaning{text-align:left;letter-spacing:0}.practice-v2-dialog .practice-meaning span{display:block;margin-bottom:5px;color:var(--v-blue);font:800 10px Georgia,serif;letter-spacing:.12em}.practice-v2-dialog .practice-meaning b{display:block;color:#493722;font:700 15px/1.45 'Cormorant Garamond',Georgia,serif}.practice-v2-dialog .practice-language{margin:8px 0 0;color:#6f5a3d;font:700 10px Georgia,serif;letter-spacing:.08em}`;
document.head.append(style);

const directButton=document.createElement('button');
directButton.type='button';directButton.className='word-practice-v2';directButton.textContent=ui.practice;popup.append(directButton);

const oldSavedPractice=savedDialog.querySelector('.vocab-practice-open');
let savedPracticeButton=null;
if(oldSavedPractice){savedPracticeButton=oldSavedPractice.cloneNode(true);savedPracticeButton.textContent=ui.practiceSaved;oldSavedPractice.replaceWith(savedPracticeButton)}

const dialog=document.createElement('dialog');
dialog.className='practice-dialog practice-v2-dialog';
dialog.innerHTML=`<div class="practice-head"><div><span class="practice-v2-progress"></span><h2>${ui.title}</h2></div><button class="practice-v2-close" aria-label="Close">×</button></div><div class="practice-body"><section class="practice-prompt"><p class="practice-label">${ui.translation}</p><strong class="practice-translation practice-v2-cue"></strong><p class="practice-language"></p><p class="practice-meaning"><span>${ui.meaning}</span><b class="practice-v2-definition">${ui.loading}</b></p></section><section class="practice-word-step"><p class="practice-kicker">✦ ${ui.heading}</p><label for="practiceV2Word">${ui.writeWord}</label><div class="practice-input-row"><input id="practiceV2Word" type="text" autocomplete="off" autocapitalize="none" spellcheck="false"><button class="practice-v2-check-word" type="button" aria-label="Check word">→</button></div><div class="practice-word-feedback practice-v2-word-feedback" role="status"></div></section><section class="practice-sentence-step practice-v2-sentence-step" hidden><label for="practiceV2Sentence"><span>${ui.sentence}</span> “<b class="practice-v2-answer"></b>”</label><textarea id="practiceV2Sentence" rows="4" placeholder="${ui.placeholder}"></textarea><button class="practice-check-sentence practice-v2-check-sentence" type="button">${ui.verify} →</button><div class="practice-sentence-feedback practice-v2-sentence-feedback" role="status"></div></section><div class="practice-actions"><button class="practice-next practice-v2-next" type="button" hidden>${ui.next} →</button><button class="practice-finish practice-v2-finish" type="button">${ui.finish}</button></div></div>`;
document.body.append(dialog);
const q=selector=>dialog.querySelector(selector);
let queue=[],index=0,current=null,stats=read(statsKey,{}),definitions=read(definitionKey,{});

function selectedEntry(){
 const word=popup.querySelector('.word-popup-word')?.textContent?.trim()||'';
 const lemma=popup.querySelector('.word-lemma')?.textContent?.trim()||word;
 const translation=popup.querySelector('.word-popup-translation')?.textContent?.trim()||'';
 const example=popup.querySelector('.word-example')?.textContent?.trim()||'';
 if(!word||!translation||/TRANSLAT|ПЕРЕКЛАД|UNAVAILABLE|НЕДОСТУП/i.test(translation))return null;
 return{word,lemma,translation,example};
}
function savedEntries(){return read(savedKey,[]).filter(item=>item&&item.word&&item.translation)}
function firstTranslation(value){return String(value||'').split(/\s*(?:\/|;|,)\s*/u).find(Boolean)?.trim()||String(value||'').trim()}

async function definition(entry){
 const key=`${source}:${comparable(entry.lemma||entry.word)}:${comparable(entry.translation)}`;
 if(definitions[key])return definitions[key];
 try{
  const englishTerm=source==='en'?(entry.lemma||entry.word):firstTranslation(entry.translation);
  const response=await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(englishTerm)}`);
  if(!response.ok)throw 0;
  const data=await response.json();
  let value=data?.[0]?.meanings?.flatMap(m=>m.definitions||[])?.map(d=>d.definition)?.find(Boolean);
  if(!value)throw 0;
  if(source==='uk'){
   const translationResponse=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(value)}&langpair=en|uk`);
   const translationData=await translationResponse.json();
   value=translationData?.responseData?.translatedText||value;
  }
  definitions[key]=value;write(definitionKey,definitions);return value;
 }catch{return ui.unavailable}
}

function openPractice(entries){
 if(!entries.length)return;
 queue=entries;index=0;if(savedDialog.open)savedDialog.close();loadCurrent();dialog.showModal();setTimeout(()=>q('#practiceV2Word').focus(),60);
}
async function loadCurrent(){
 current=queue[index];
 q('.practice-v2-progress').textContent=`${ui.word} ${index+1} / ${queue.length} · ${Object.values(stats).filter(Boolean).length} ${ui.learned}`;
 q('.practice-v2-cue').textContent=String(current.translation).toLocaleUpperCase(source==='uk'?'en-US':'uk-UA');
 q('.practice-language').textContent=`${sourceName.toUpperCase()} ${ui.word}`;
 q('.practice-v2-definition').textContent=ui.loading;
 q('#practiceV2Word').value='';q('#practiceV2Sentence').value='';q('.practice-v2-word-feedback').innerHTML='';q('.practice-v2-sentence-feedback').innerHTML='';q('.practice-v2-sentence-step').hidden=true;q('.practice-v2-next').hidden=true;q('.practice-v2-check-word').disabled=false;q('#practiceV2Word').disabled=false;q('.practice-v2-answer').textContent=current.word;
 const value=await definition(current);if(current===queue[index])q('.practice-v2-definition').textContent=value;
}

function checkWord(){
 const typed=q('#practiceV2Word').value.trim(),given=comparable(typed),answers=[current.word,current.lemma].map(comparable).filter(Boolean),feedback=q('.practice-v2-word-feedback');
 if(given&&answers.includes(given)){
  feedback.innerHTML=`<p class="practice-success">✓ ${ui.correct}</p>`;q('.practice-v2-sentence-step').hidden=false;q('.practice-v2-check-word').disabled=true;q('#practiceV2Word').disabled=true;setTimeout(()=>q('#practiceV2Sentence').focus(),80);return;
 }
 const expected=current.word;let first=0;while(first<typed.length&&first<expected.length&&comparable(typed[first])===comparable(expected[first]))first++;
 feedback.innerHTML=`<p class="practice-error">× ${ui.incorrect}</p><p>${ui.correctWas}: <strong>${esc(expected)}</strong>${typed?` · ${esc(typed.slice(0,first))}<mark>${esc(typed.slice(first)||'…')}</mark>`:''}</p>`;
}
function localSentenceErrors(value){
 const errors=[],sentence=value.trim(),lower=comparable(sentence),forms=[current.word,current.lemma].map(comparable).filter(Boolean);
 if(!forms.some(form=>lower.includes(form)))errors.push(ui.useWord);
 if(sentence.split(/\s+/u).filter(Boolean).length<3)errors.push(ui.short);
 if(!(source==='uk'?/^[А-ЯІЇЄҐ]/u:/^[A-Z]/u).test(sentence))errors.push(ui.capital);
 if(!/[.!?…]$/u.test(sentence))errors.push(ui.punctuation);
 if(/\s{2,}/u.test(value))errors.push(ui.spacing);
 return errors;
}
async function grammarErrors(value){
 const body=new URLSearchParams({text:value,language:source==='uk'?'uk-UA':'en-US'}),response=await fetch('https://api.languagetool.org/v2/check',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
 if(!response.ok)throw 0;const data=await response.json();
 return(data.matches||[]).slice(0,8).map(match=>{const fragment=value.slice(match.offset,match.offset+match.length)||value,suggestion=match.replacements?.[0]?.value;return`${fragment}: ${match.message}${suggestion?` → ${suggestion}`:''}`});
}
async function checkSentence(){
 const value=q('#practiceV2Sentence').value.trim(),feedback=q('.practice-v2-sentence-feedback'),button=q('.practice-v2-check-sentence');button.disabled=true;button.textContent=ui.checking;
 let errors=localSentenceErrors(value),service=true;if(!errors.length){try{errors=[...new Set(await grammarErrors(value))]}catch{service=false}}
 button.disabled=false;button.textContent=`${ui.verify} →`;
 if(errors.length){feedback.innerHTML=`<p class="practice-error">× ${ui.incorrect}</p><ul>${errors.map(error=>`<li>${esc(error)}</li>`).join('')}</ul>`;return}
 if(!service){feedback.innerHTML=`<p class="practice-warning">! ${ui.grammarDown}</p>`;return}
 stats[comparable(current.lemma||current.word)]=true;write(statsKey,stats);feedback.innerHTML=`<p class="practice-success">✓ ${ui.well}</p>`;q('.practice-v2-next').hidden=queue.length<2;q('.practice-v2-progress').textContent=`${ui.word} ${index+1} / ${queue.length} · ${Object.values(stats).filter(Boolean).length} ${ui.learned}`;
}

directButton.onclick=()=>{const entry=selectedEntry();if(entry)openPractice([entry])};
if(savedPracticeButton){
 const refresh=()=>{const entries=savedEntries();savedPracticeButton.disabled=!entries.length;savedPracticeButton.title=entries.length?'':ui.noWords};
 savedPracticeButton.onclick=()=>openPractice(savedEntries());document.querySelector('#openVocabulary')?.addEventListener('click',()=>setTimeout(refresh,0));savedDialog.addEventListener('click',()=>setTimeout(refresh,0));refresh();
}
q('.practice-v2-close').onclick=()=>dialog.close();q('.practice-v2-finish').onclick=()=>dialog.close();q('.practice-v2-check-word').onclick=checkWord;q('#practiceV2Word').addEventListener('keydown',event=>{if(event.key==='Enter')checkWord()});q('.practice-v2-check-sentence').onclick=checkSentence;q('.practice-v2-next').onclick=()=>{index=(index+1)%queue.length;loadCurrent();setTimeout(()=>q('#practiceV2Word').focus(),60)};dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
const observer=new MutationObserver(()=>{directButton.disabled=!selectedEntry()});observer.observe(popup,{subtree:true,childList:true,characterData:true,attributes:true});directButton.disabled=!selectedEntry();
})();
