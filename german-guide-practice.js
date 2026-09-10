(()=>{
const norm=s=>(s||'').toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const pronouns=['ich','du','er','sie','es','wir','ihr','sie'];
const verbs={
'sein':['bin','bist','ist','ist','ist','sind','seid','sind'],
'haben':['habe','hast','hat','hat','hat','haben','habt','haben'],
'gehen':['gehe','gehst','geht','geht','geht','gehen','geht','gehen'],
'kommen':['komme','kommst','kommt','kommt','kommt','kommen','kommt','kommen'],
'sehen':['sehe','siehst','sieht','sieht','sieht','sehen','seht','sehen'],
'sprechen':['spreche','sprichst','spricht','spricht','spricht','sprechen','sprecht','sprechen'],
'sagen':['sage','sagst','sagt','sagt','sagt','sagen','sagt','sagen'],
'fragen':['frage','fragst','fragt','fragt','fragt','fragen','fragt','fragen'],
'wissen':['weiß','weißt','weiß','weiß','weiß','wissen','wisst','wissen'],
'denken':['denke','denkst','denkt','denkt','denkt','denken','denkt','denken'],
'wollen':['will','willst','will','will','will','wollen','wollt','wollen'],
'können':['kann','kannst','kann','kann','kann','können','könnt','können'],
'müssen':['muss','musst','muss','muss','muss','müssen','müsst','müssen'],
'geben':['gebe','gibst','gibt','gibt','gibt','geben','gebt','geben'],
'nehmen':['nehme','nimmst','nimmt','nimmt','nimmt','nehmen','nehmt','nehmen'],
'finden':['finde','findest','findet','findet','findet','finden','findet','finden'],
'verlieren':['verliere','verlierst','verliert','verliert','verliert','verlieren','verliert','verlieren'],
'öffnen':['öffne','öffnest','öffnet','öffnet','öffnet','öffnen','öffnet','öffnen'],
'schließen':['schließe','schließt','schließt','schließt','schließt','schließen','schließt','schließen'],
'laufen':['laufe','läufst','läuft','läuft','läuft','laufen','lauft','laufen'],
'warten':['warte','wartest','wartet','wartet','wartet','warten','wartet','warten'],
'helfen':['helfe','hilfst','hilft','hilft','hilft','helfen','helft','helfen']};
const formIndex={};Object.entries(verbs).forEach(([v,fs])=>fs.forEach(f=>(formIndex[norm(f)]||(formIndex[norm(f)]=new Set())).add(v)));
function tokenise(t){const raw=t.match(/[A-Za-zÄÖÜäöüß]+/g)||[];return{raw,words:raw.map(norm)}}
function conjugation(text){const{raw,words}=tokenise(text);for(let i=0;i<words.length-1;i++){const p=words[i],pi=pronouns.indexOf(p);if(pi<0)continue;const candidates=formIndex[words[i+1]];if(!candidates)continue;for(const v of candidates){const exp=verbs[v][pi];if(norm(exp)!==words[i+1])return{p:raw[i],typed:raw[i+1],expected:exp,fixed:text.replace(raw[i+1],exp)}}}return null}
function cardWord(c){return c.dataset.word||c.querySelector('[data-headword]')?.textContent?.trim().replace(/^(der|die|das)\s+/i,'')||''}
function acceptableForms(word){const w=norm(word),out=new Set([w]);if(verbs[w])verbs[w].forEach(x=>out.add(norm(x)));return out}
function containsPracticeWord(text,word){const n=` ${norm(text)} `;return [...acceptableForms(word)].some(f=>n.includes(` ${f} `))}
async function checkLT(text){const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),4500);try{const body=new URLSearchParams({text,language:'de-DE'}),r=await fetch('https://api.languagetool.org/v2/check',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,signal:ctrl.signal});if(!r.ok)throw 0;return(await r.json()).matches||[]}catch{return null}finally{clearTimeout(timer)}}
function ignorable(m,text){const rule=String(m.rule?.id||'').toUpperCase(),frag=text.slice(m.offset,m.offset+m.length);if(/UPPER|CASING|DIACRIT|UMLAUT/.test(rule))return true;return(m.replacements||[]).some(r=>norm(r.value)===norm(frag))}
function corrected(text,matches){let r=text;[...matches].sort((a,b)=>b.offset-a.offset).forEach(m=>{const x=m.replacements?.[0]?.value;if(x)r=r.slice(0,m.offset)+x+r.slice(m.offset+m.length)});return r}
function install(c){if(c.dataset.dePractice)return;c.dataset.dePractice='1';const q=c.querySelector('.quiz'),step1=q?.querySelector('.check'),input=q?.querySelector('input');if(!q||!step1||!input)return;const b=document.createElement('div');b.className='de-step2';b.innerHTML='<div class="step2-title">STEP 2 · WRITE A GERMAN PHRASE OR SENTENCE</div><div class="step2-hint">Use the word you practiced. Capitalization and umlauts are optional.</div><textarea placeholder="Write a German phrase or sentence…" spellcheck="false"></textarea><button type="button">✓ CHECK PHRASE / SENTENCE</button><div class="sentence-feedback"></div>';q.appendChild(b);const show=()=>{if(q.querySelector('.feedback')?.classList.contains('ok'))b.classList.add('open')};step1.addEventListener('click',()=>setTimeout(show));input.addEventListener('keydown',e=>{if(e.key==='Enter')setTimeout(show)});const area=b.querySelector('textarea'),btn=b.querySelector('button'),fb=b.querySelector('.sentence-feedback');btn.onclick=async()=>{const text=area.value.trim(),word=cardWord(c);if(text.length<3){fb.className='sentence-feedback bad';fb.textContent='Write a phrase or sentence first.';return}if(!containsPracticeWord(text,word)){fb.className='sentence-feedback bad';fb.textContent=`Use “${word}” or one of its conjugated forms in your phrase.`;return}const vi=conjugation(text);if(vi){fb.className='sentence-feedback bad';fb.innerHTML=`Not quite. With <b>${vi.p}</b>, use <b>${vi.expected}</b>, not ${vi.typed}.<span class="suggest"><b>Suggested:</b> ${vi.fixed}</span>`;return}btn.disabled=true;btn.textContent='CHECKING…';const issues=await checkLT(text);btn.disabled=false;btn.textContent='✓ CHECK PHRASE / SENTENCE';if(issues===null){fb.className='sentence-feedback ok';fb.textContent='✓ WELL WRITTEN';return}const meaningful=issues.filter(m=>!ignorable(m,text)&&m.rule?.id!=='WHITESPACE_RULE');if(!meaningful.length){fb.className='sentence-feedback ok';fb.textContent='✓ WELL WRITTEN';localStorage.setItem('hc-de-sentence-'+norm(word),'1');return}const fixed=corrected(text,meaningful);fb.className='sentence-feedback bad';fb.innerHTML=`${meaningful[0].message||'Check this sentence again.'}${fixed!==text?`<span class="suggest"><b>Suggested:</b> ${fixed}</span>`:''}`}}
const css=document.createElement('style');css.textContent='.de-step2{display:none;margin-top:14px;padding-top:14px;border-top:1px solid #b9924533}.de-step2.open{display:block}.step2-title{font:800 11px system-ui;letter-spacing:.08em;color:#e4c36b}.step2-hint{font:12px system-ui;color:#9f927f;margin:6px 0 8px}.de-step2 textarea{width:100%;min-height:82px;padding:10px;background:#0e0c0a;color:#fff;border:1px solid #b9924555;border-radius:9px}.de-step2 button{width:100%;margin-top:8px;padding:10px;border:1px solid #b9924555;border-radius:9px;background:#7f1d27;color:#fff;font-weight:800}.sentence-feedback{font:13px system-ui;margin-top:8px;line-height:1.5}.sentence-feedback.ok{color:#75d28a}.sentence-feedback.bad{color:#ffb4ab}.suggest{display:block;color:#f0ddb0;margin-top:5px}';document.head.appendChild(css);const run=()=>document.querySelectorAll('.study-card').forEach(install);run();new MutationObserver(run).observe(document.body,{subtree:true,childList:true});
})();