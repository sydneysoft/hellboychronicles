(()=>{
  const strip=s=>(s||'').toLocaleLowerCase('pl-PL').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  const style=document.createElement('style');
  style.textContent=`.sentence-practice{display:none;margin-top:12px;padding-top:12px;border-top:1px solid #7b68463d}.sentence-practice.open{display:block}.sentence-practice label{display:block;color:#d7b65c;font-size:11px;font-weight:900;letter-spacing:.08em;margin-bottom:7px}.sentence-practice textarea{width:100%;min-height:86px;resize:vertical;border:1px solid #b99a5366;border-radius:10px;background:#0f0d0c;color:#fff;padding:11px;font:15px system-ui;line-height:1.45}.sentence-practice button{width:100%;margin-top:8px;border:1px solid #b99a5355;border-radius:10px;padding:11px 13px;background:#7f1d27;color:#fff;font-weight:900;cursor:pointer}.sentence-practice button:disabled{opacity:.65}.sentence-practice .sentence-feedback{min-height:22px;margin-top:8px;font-size:13px}.sentence-practice .hint{color:#9f927f;font-size:12px;margin:6px 0 8px;line-height:1.45}.sentence-practice .corrected{display:block;margin-top:5px;color:#f4e6c8}`;
  document.head.appendChild(style);

  function keyFor(card){
    return card.querySelector('.verb,.noun,.word')?.textContent?.trim().split('/')[0].trim()||'';
  }
  function acceptableForms(card){
    const main=keyFor(card); const out=[main];
    card.querySelectorAll('.form span').forEach(x=>out.push(...x.textContent.split('/')));
    return out.map(strip).filter(x=>x&&x!=='—');
  }
  function containsPracticeWord(text,forms){
    const t=` ${strip(text)} `;
    return forms.some(f=>t.includes(` ${f} `));
  }
  async function languageCheck(text){
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),4500);
    try{
      const body=new URLSearchParams({text,language:'pl-PL'});
      const r=await fetch('https://api.languagetool.org/v2/check',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,signal:controller.signal});
      if(!r.ok)throw new Error('grammar');
      const data=await r.json(); return data.matches||[];
    }catch{return null}finally{clearTimeout(timer)}
  }
  function correctedText(text,matches){
    let result=text;
    [...matches].sort((a,b)=>b.offset-a.offset).forEach(m=>{const replacement=m.replacements?.[0]?.value;if(replacement)result=result.slice(0,m.offset)+replacement+result.slice(m.offset+m.length)});
    return result;
  }
  function install(card){
    if(card.dataset.sentencePractice==='1')return;
    const quiz=card.querySelector('.quiz'); const check=quiz?.querySelector('.check'); if(!quiz||!check)return;
    card.dataset.sentencePractice='1';
    const block=document.createElement('div'); block.className='sentence-practice';
    block.innerHTML=`<label>STEP 2 · WRITE A POLISH PHRASE OR SENTENCE</label><div class="hint">Use the word you just practiced. Write your own Polish phrase or sentence.</div><textarea spellcheck="false" placeholder="Write a Polish phrase or sentence…"></textarea><button type="button">✓ CHECK PHRASE / SENTENCE</button><div class="sentence-feedback"></div>`;
    quiz.appendChild(block);
    const original=check.onclick;
    check.onclick=e=>{if(original)original.call(check,e);setTimeout(()=>{const fb=quiz.querySelector('.feedback');if(fb?.classList.contains('ok')){block.classList.add('open');block.querySelector('textarea').focus()}},0)};
    const input=quiz.querySelector('input');
    input?.addEventListener('keydown',()=>setTimeout(()=>{const fb=quiz.querySelector('.feedback');if(fb?.classList.contains('ok'))block.classList.add('open')},0));
    const btn=block.querySelector('button'),area=block.querySelector('textarea'),fb=block.querySelector('.sentence-feedback');
    btn.onclick=async()=>{
      const text=area.value.trim();
      if(text.length<3){fb.className='sentence-feedback bad';fb.textContent='Write a phrase or sentence first.';return}
      const forms=acceptableForms(card);
      if(forms.length&&!containsPracticeWord(text,forms)){
        fb.className='sentence-feedback bad';fb.textContent=`Use “${keyFor(card)}” (or one of its shown forms) in your phrase.`;return;
      }
      btn.disabled=true;btn.textContent='CHECKING…';fb.className='sentence-feedback';fb.textContent='Checking your Polish…';
      const issues=await languageCheck(text);btn.disabled=false;btn.textContent='✓ CHECK PHRASE / SENTENCE';
      if(issues===null){fb.className='sentence-feedback ok';fb.textContent='✓ WELL WRITTEN — phrase accepted.';localStorage.setItem('hellboy-polish-guide-sentence-'+keyFor(card),'1');return}
      const meaningful=issues.filter(m=>!['WHITESPACE_RULE'].includes(m.rule?.id));
      if(!meaningful.length){fb.className='sentence-feedback ok';fb.textContent='✓ WELL WRITTEN';localStorage.setItem('hellboy-polish-guide-sentence-'+keyFor(card),'1');return}
      const first=meaningful[0],fixed=correctedText(text,meaningful);fb.className='sentence-feedback bad';fb.innerHTML=`${first.message||'Check this phrase again.'}${fixed!==text?`<span class="corrected"><b>Suggested:</b> ${fixed}</span>`:''}`;
    };
  }
  const run=()=>document.querySelectorAll('.card').forEach(install);
  run(); new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
})();