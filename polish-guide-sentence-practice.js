(()=>{
  const strip=s=>(s||'').toLocaleLowerCase('pl-PL').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  const style=document.createElement('style');
  style.textContent=`.sentence-practice{display:none;margin-top:12px;padding-top:12px;border-top:1px solid #7b68463d}.sentence-practice.open{display:block}.sentence-practice label{display:block;color:#d7b65c;font-size:11px;font-weight:900;letter-spacing:.08em;margin-bottom:7px}.sentence-practice textarea{width:100%;min-height:86px;resize:vertical;border:1px solid #b99a5366;border-radius:10px;background:#0f0d0c;color:#fff;padding:11px;font:15px system-ui;line-height:1.45}.sentence-practice button{width:100%;margin-top:8px;border:1px solid #b99a5355;border-radius:10px;padding:11px 13px;background:#7f1d27;color:#fff;font-weight:900;cursor:pointer}.sentence-practice button:disabled{opacity:.65}.sentence-practice .sentence-feedback{min-height:22px;margin-top:8px;font-size:13px;line-height:1.45}.sentence-practice .hint{color:#9f927f;font-size:12px;margin:6px 0 8px;line-height:1.45}.sentence-practice .corrected{display:block;margin-top:5px;color:#f4e6c8}.sentence-practice .why{display:block;margin-top:4px;color:#d7b65c}`;
  document.head.appendChild(style);

  const pronouns=['ja','ty','on','ona','ono','my','wy','oni','one'];
  const conjugations={
    'byc':['jestem','jesteś','jest','jest','jest','jesteśmy','jesteście','są','są'],
    'miec':['mam','masz','ma','ma','ma','mamy','macie','mają','mają'],
    'isc':['idę','idziesz','idzie','idzie','idzie','idziemy','idziecie','idą','idą'],
    'przyjsc':['przychodzę','przychodzisz','przychodzi','przychodzi','przychodzi','przychodzimy','przychodzicie','przychodzą','przychodzą'],
    'wrocic':['wracam','wracasz','wraca','wraca','wraca','wracamy','wracacie','wracają','wracają'],
    'widziec':['widzę','widzisz','widzi','widzi','widzi','widzimy','widzicie','widzą','widzą'],
    'patrzec':['patrzę','patrzysz','patrzy','patrzy','patrzy','patrzymy','patrzycie','patrzą','patrzą'],
    'mowic':['mówię','mówisz','mówi','mówi','mówi','mówimy','mówicie','mówią','mówią'],
    'slyszec':['słyszę','słyszysz','słyszy','słyszy','słyszy','słyszymy','słyszycie','słyszą','słyszą'],
    'myslec':['myślę','myślisz','myśli','myśli','myśli','myślimy','myślicie','myślą','myślą'],
    'wiedziec':['wiem','wiesz','wie','wie','wie','wiemy','wiecie','wiedzą','wiedzą'],
    'chciec':['chcę','chcesz','chce','chce','chce','chcemy','chcecie','chcą','chcą'],
    'moc':['mogę','możesz','może','może','może','możemy','możecie','mogą','mogą'],
    'musiec':['muszę','musisz','musi','musi','musi','musimy','musicie','muszą','muszą'],
    'dac':['daję','dajesz','daje','daje','daje','dajemy','dajecie','dają','dają'],
    'brac':['biorę','bierzesz','bierze','bierze','bierze','bierzemy','bierzecie','biorą','biorą'],
    'znalezc':['znajdę','znajdziesz','znajdzie','znajdzie','znajdzie','znajdziemy','znajdziecie','znajdą','znajdą'],
    'szukac':['szukam','szukasz','szuka','szuka','szuka','szukamy','szukacie','szukają','szukają'],
    'walczyc':['walczę','walczysz','walczy','walczy','walczy','walczymy','walczycie','walczą','walczą'],
    'pokonac':['pokonam','pokonasz','pokona','pokona','pokona','pokonamy','pokonacie','pokonają','pokonają'],
    'uciec':['uciekam','uciekasz','ucieka','ucieka','ucieka','uciekamy','uciekacie','uciekają','uciekają'],
    'ratowac':['ratuję','ratujesz','ratuje','ratuje','ratuje','ratujemy','ratujecie','ratują','ratują'],
    'obiecac':['obiecuję','obiecujesz','obiecuje','obiecuje','obiecuje','obiecujemy','obiecujecie','obiecują','obiecują'],
    'pamietac':['pamiętam','pamiętasz','pamięta','pamięta','pamięta','pamiętamy','pamiętacie','pamiętają','pamiętają']
  };
  const adjectiveForms={
    'stary':['stary','stara','stare','starzy','stare'],
    'mlody':['młody','młoda','młode','młodzi','młode'],
    'wielki':['wielki','wielka','wielkie','wielcy','wielkie'],
    'maly':['mały','mała','małe','mali','małe'],
    'dobry':['dobry','dobra','dobre','dobrzy','dobre'],
    'zly':['zły','zła','złe','źli','złe'],
    'odwazny':['odważny','odważna','odważne','odważni','odważne'],
    'straszny':['straszny','straszna','straszne','straszni','straszne'],
    'piekny':['piękny','piękna','piękne','piękni','piękne'],
    'bogaty':['bogaty','bogata','bogate','bogaci','bogate'],
    'biedny':['biedny','biedna','biedne','biedni','biedne'],
    'zloty':['złoty','złota','złote','złoci','złote'],
    'ciemny':['ciemny','ciemna','ciemne','ciemni','ciemne'],
    'wysoki':['wysoki','wysoka','wysokie','wysocy','wysokie'],
    'silny':['silny','silna','silne','silni','silne'],
    'sprytny':['sprytny','sprytna','sprytne','sprytni','sprytne']
  };
  const adjectiveSubjectIndex={on:0,ona:1,ono:2,ja:null,ty:null,my:null,wy:null,oni:3,one:4};
  const adjectiveIndex={};
  Object.entries(adjectiveForms).forEach(([base,forms])=>forms.forEach(form=>{const n=strip(form);(adjectiveIndex[n]||(adjectiveIndex[n]=new Set())).add(base)}));
  const formIndex={};
  Object.entries(conjugations).forEach(([verb,forms])=>forms.forEach(form=>{const n=strip(form);(formIndex[n]||(formIndex[n]=new Set())).add(verb)}));

  function keyFor(card){return card.querySelector('.verb,.noun,.word')?.textContent?.trim().split('/')[0].trim()||''}
  function acceptableForms(card){const main=keyFor(card),out=[main];card.querySelectorAll('.form span').forEach(x=>out.push(...x.textContent.split('/')));return out.map(strip).filter(x=>x&&x!=='—')}
  function containsPracticeWord(text,forms){const t=` ${strip(text)} `;return forms.some(f=>t.includes(` ${f} `))}
  function tokenize(text){const raw=text.match(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+/g)||[];return {raw,words:raw.map(strip)}}

  function localConjugationCheck(text){
    const {raw:rawWords,words}=tokenize(text);
    for(let i=0;i<words.length-1;i++){
      const pIndex=pronouns.indexOf(words[i]);if(pIndex<0)continue;
      const typed=words[i+1],possibleVerbs=formIndex[typed];if(!possibleVerbs)continue;
      for(const verb of possibleVerbs){const expected=conjugations[verb][pIndex];if(strip(expected)!==typed){const pattern=new RegExp(`\\b${rawWords[i]}\\s+${rawWords[i+1]}\\b`,'i');const fixed=text.replace(pattern,`${rawWords[i]} ${expected}`);return {pronoun:rawWords[i],typed:rawWords[i+1],expected,fixed}}}
    }
    return null;
  }

  function localAdjectiveCheck(text){
    const {raw,words}=tokenize(text);
    for(let i=0;i<words.length;i++){
      const pronoun=words[i];
      if(!(pronoun in adjectiveSubjectIndex))continue;
      let expectedIndex=adjectiveSubjectIndex[pronoun];
      if(expectedIndex===null)continue;
      for(let j=i+1;j<Math.min(words.length,i+5);j++){
        if(j===i+1&&formIndex[words[j]]&&!formIndex[words[j]].has('byc'))break;
        const candidates=adjectiveIndex[words[j]];if(!candidates)continue;
        for(const base of candidates){
          const expected=adjectiveForms[base][expectedIndex];
          if(strip(expected)!==words[j]){
            const escaped=raw[j].replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
            const pattern=new RegExp(`\\b${escaped}\\b`,'i');
            const fixed=text.replace(pattern,expected);
            return {pronoun:raw[i],typed:raw[j],expected,fixed};
          }
        }
        return null;
      }
    }
    return null;
  }

  async function languageCheck(text){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4500);try{const body=new URLSearchParams({text,language:'pl-PL'});const r=await fetch('https://api.languagetool.org/v2/check',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,signal:controller.signal});if(!r.ok)throw new Error('grammar');const data=await r.json();return data.matches||[]}catch{return null}finally{clearTimeout(timer)}}
  function correctedText(text,matches){let result=text;[...matches].sort((a,b)=>b.offset-a.offset).forEach(m=>{const replacement=m.replacements?.[0]?.value;if(replacement)result=result.slice(0,m.offset)+replacement+result.slice(m.offset+m.length)});return result}

  function install(card){
    if(card.dataset.sentencePractice==='1')return;const quiz=card.querySelector('.quiz'),check=quiz?.querySelector('.check');if(!quiz||!check)return;card.dataset.sentencePractice='1';
    const block=document.createElement('div');block.className='sentence-practice';block.innerHTML=`<label>STEP 2 · WRITE A POLISH PHRASE OR SENTENCE</label><div class="hint">Use the word you just practiced. Write your own Polish phrase or sentence.</div><textarea spellcheck="false" placeholder="Write a Polish phrase or sentence…"></textarea><button type="button">✓ CHECK PHRASE / SENTENCE</button><div class="sentence-feedback"></div>`;quiz.appendChild(block);
    const original=check.onclick;check.onclick=e=>{if(original)original.call(check,e);setTimeout(()=>{const f=quiz.querySelector('.feedback');if(f?.classList.contains('ok')){block.classList.add('open');block.querySelector('textarea').focus()}},0)};
    const input=quiz.querySelector('input');input?.addEventListener('keydown',()=>setTimeout(()=>{const f=quiz.querySelector('.feedback');if(f?.classList.contains('ok'))block.classList.add('open')},0));
    const btn=block.querySelector('button'),area=block.querySelector('textarea'),fb=block.querySelector('.sentence-feedback');
    btn.onclick=async()=>{
      const text=area.value.trim();if(text.length<3){fb.className='sentence-feedback bad';fb.textContent='Write a phrase or sentence first.';return}
      const forms=acceptableForms(card);if(forms.length&&!containsPracticeWord(text,forms)){fb.className='sentence-feedback bad';fb.textContent=`Use “${keyFor(card)}” (or one of its shown forms) in your phrase.`;return}
      const conjugationIssue=localConjugationCheck(text);if(conjugationIssue){fb.className='sentence-feedback bad';fb.innerHTML=`Not quite. With <b>“${conjugationIssue.pronoun}”</b>, use <b>“${conjugationIssue.expected}”</b>, not “${conjugationIssue.typed}”.<span class="corrected"><b>Suggested:</b> ${conjugationIssue.fixed}</span>`;return}
      const adjectiveIssue=localAdjectiveCheck(text);if(adjectiveIssue){fb.className='sentence-feedback bad';fb.innerHTML=`Not quite. The adjective must agree with <b>“${adjectiveIssue.pronoun}”</b>. Use <b>“${adjectiveIssue.expected}”</b>, not “${adjectiveIssue.typed}”.<span class="corrected"><b>Suggested:</b> ${adjectiveIssue.fixed}</span>`;return}
      btn.disabled=true;btn.textContent='CHECKING…';fb.className='sentence-feedback';fb.textContent='Checking your Polish…';const issues=await languageCheck(text);btn.disabled=false;btn.textContent='✓ CHECK PHRASE / SENTENCE';
      if(issues===null){fb.className='sentence-feedback ok';fb.textContent='✓ WELL WRITTEN — phrase accepted.';localStorage.setItem('hellboy-polish-guide-sentence-'+keyFor(card),'1');return}
      const meaningful=issues.filter(m=>!['WHITESPACE_RULE'].includes(m.rule?.id));if(!meaningful.length){fb.className='sentence-feedback ok';fb.textContent='✓ WELL WRITTEN';localStorage.setItem('hellboy-polish-guide-sentence-'+keyFor(card),'1');return}
      const first=meaningful[0],fixed=correctedText(text,meaningful);fb.className='sentence-feedback bad';fb.innerHTML=`${first.message||'Check this phrase again.'}${fixed!==text?`<span class="corrected"><b>Suggested:</b> ${fixed}</span>`:''}`;
    };
  }
  const run=()=>document.querySelectorAll('.card').forEach(install);run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
})();