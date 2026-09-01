const copy=document.querySelector('.novel-copy');
const progressBar=document.getElementById('progressBar');
const progressText=document.getElementById('novelProgress');
const novelLanguage=document.body.dataset.novelLanguage||'en';
const languageSelect=document.getElementById('languageSelect');
const savedLanguage=localStorage.getItem('hellboy-language');
const browserLanguage=(navigator.languages||[navigator.language||'']).some(language=>/^(uk|ru)(-|$)/i.test(language))?'uk':'en';
if(!savedLanguage&&novelLanguage==='en'&&browserLanguage==='uk')location.replace('novel-uk.html');
languageSelect.value=novelLanguage;
languageSelect.onchange=()=>{
  const language=languageSelect.value;
  localStorage.setItem('hellboy-language',language);
  location.href=language==='uk'?'novel-uk.html':'novel.html';
};
const setProgress=()=>{
  const available=document.documentElement.scrollHeight-innerHeight;
  const percent=available>0?Math.min(100,Math.max(0,scrollY/available*100)):0;
  progressBar.style.width=`${percent}%`;
  progressText.textContent=novelLanguage==='uk'?`${Math.round(percent)}% ПРОЧИТАНО`:`${Math.round(percent)}% READ`;
  localStorage.setItem('hellboy-novel-progress',String(scrollY));
};
addEventListener('scroll',setProgress,{passive:true});
document.getElementById('fontDown').onclick=()=>{
  const size=Math.max(16,parseFloat(getComputedStyle(copy).fontSize)-1);
  copy.style.fontSize=`${size}px`;
  localStorage.setItem('hellboy-font-size',String(size));
};
document.getElementById('fontUp').onclick=()=>{
  const size=Math.min(28,parseFloat(getComputedStyle(copy).fontSize)+1);
  copy.style.fontSize=`${size}px`;
  localStorage.setItem('hellboy-font-size',String(size));
};
const savedSize=localStorage.getItem('hellboy-font-size');
if(savedSize)copy.style.fontSize=`${savedSize}px`;
const savedProgress=Number(localStorage.getItem('hellboy-novel-progress'));
if(savedProgress>0)setTimeout(()=>scrollTo({top:savedProgress}),120);
setProgress();
