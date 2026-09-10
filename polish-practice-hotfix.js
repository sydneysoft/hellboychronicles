(()=>{
  const normalize=s=>(s||'').trim().normalize('NFKC').toLocaleLowerCase(/^\/pl(?:\/|$)/.test(location.pathname)?'pl-PL':'en-US').replace(/[“”„«»'.,!?;:()\[\]{}—–-]/g,'').replace(/\s+/g,' ');
  const source=/^\/pl(?:\/|$)/.test(location.pathname)?'pl':'en';
  const key='hellboy-polish-vocabulary';
  const markSentence=word=>{
    let items=[];try{items=JSON.parse(localStorage.getItem(key)||'[]')}catch{}
    let item=items.find(x=>normalize(x.word)===normalize(word)&&x.source===source);
    if(!item){item={word,translation:'',source,target:source==='pl'?'en':'pl',savedAt:Date.now(),practice:{}};items.unshift(item)}
    item.practice=item.practice||{};item.practice.sentence=true;item.practicedAt=Date.now();
    localStorage.setItem(key,JSON.stringify(items.slice(0,250)));
  };
  const grammarCheck=async text=>{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),4500);
    try{
      const body=new URLSearchParams({text,language:source==='pl'?'pl-PL':'en-US'});
      const r=await fetch('https://api.languagetool.org/v2/check',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,signal:controller.signal});
      if(!r.ok)throw new Error('grammar unavailable');
      const j=await r.json();return j.matches||[];
    }catch{return null}finally{clearTimeout(timeout)}
  };
  document.addEventListener('click',async e=>{
    const btn=e.target.closest('.plv-check-sentence');if(!btn)return;
    e.preventDefault();e.stopImmediatePropagation();
    const practice=btn.closest('.plv-practice');if(!practice)return;
    const sentence=practice.querySelector('.plv-sentence');
    const feedback=practice.querySelector('.plv-sentence-feedback');
    const popup=btn.closest('.plv-pop');
    const word=popup?.querySelector('.plv-word')?.textContent?.trim()||'';
    const text=sentence?.value?.trim()||'';
    const show=(message,kind='')=>{
      if(feedback){feedback.className=`plv-feedback plv-sentence-feedback ${kind}`;feedback.textContent=message;feedback.style.display='block';feedback.style.marginBottom='8px'}
    };
    if(text.length<4){show(source==='pl'?'Napisz najpierw pełne zdanie.':'Write a complete sentence first.','plv-bad');return}
    if(word&&!normalize(text).includes(normalize(word))){show(source==='pl'?`Użyj słowa „${word}” w zdaniu.`:`Use “${word}” in your sentence.`,'plv-bad');return}
    const old=btn.textContent;btn.disabled=true;btn.textContent=source==='pl'?'SPRAWDZANIE…':'CHECKING…';show(source==='pl'?'Sprawdzam zdanie…':'Checking your sentence…');
    const issues=await grammarCheck(text);
    btn.disabled=false;btn.textContent=old||'✓ CHECK SENTENCE';
    if(issues===null){show(source==='pl'?'✓ Zdanie zaakceptowane.':'✓ Sentence accepted.','plv-ok');markSentence(word);return}
    const serious=issues.filter(m=>!['typographical','misspelling','style'].includes((m.rule?.issueType||'').toLowerCase())).slice(0,2);
    if(!serious.length){show(source==='pl'?'✓ DOBRE ZDANIE':'✓ GOOD SENTENCE','plv-ok');markSentence(word)}
    else show(serious.map(m=>m.message).join(' · '),'plv-bad');
    feedback?.scrollIntoView({block:'nearest',behavior:'smooth'});
  },true);
})();