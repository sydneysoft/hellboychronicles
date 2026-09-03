const copy=document.querySelector('.novel-copy');
const progressBar=document.getElementById('progressBar');
const progressText=document.getElementById('novelProgress');
const novelLanguage=document.body.dataset.novelLanguage||'en';
const englishRoute=document.body.dataset.englishRoute||'/novel';
const ukrainianRoute=document.body.dataset.ukrainianRoute||'/ua/novel';
const progressKey=document.body.dataset.progressKey||'hellboy-novel-progress';
const languageSelect=document.getElementById('languageSelect');
const requestedLanguage=new URLSearchParams(location.search).get('lang');
const novelChapterOneJump=document.getElementById('novelChapter1Jump');
const novelChapterTwoJump=document.getElementById('novelChapter2Jump');
const novelChapterOne=document.getElementById('chapter-1');
const novelChapterTwo=document.getElementById('chapter-2');
const savedLanguage=localStorage.getItem('hellboy-language');
const browserLanguage=(navigator.languages||[navigator.language||'']).some(language=>/^(uk|ru)(-|$)/i.test(language))?'uk':'en';
if(requestedLanguage==='en'||requestedLanguage==='uk')localStorage.setItem('hellboy-language',requestedLanguage);
if(novelLanguage==='en'&&requestedLanguage!=='en'&&(savedLanguage==='uk'||(!savedLanguage&&browserLanguage==='uk')))location.replace(ukrainianRoute);
document.body.classList.toggle('lang-uk',novelLanguage==='uk');
languageSelect.value=novelLanguage;
languageSelect.onchange=()=>{
  const language=languageSelect.value;
  localStorage.setItem('hellboy-language',language);
  location.href=language==='uk'?`${ukrainianRoute}?lang=uk`:`${englishRoute}?lang=en`;
};
const jumpToNovelChapter=chapter=>{
  const previousBehavior=document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior='auto';
  chapter.scrollIntoView({behavior:'auto',block:'start'});
  document.documentElement.style.scrollBehavior=previousBehavior;
};
if(novelChapterOneJump&&novelChapterOne)novelChapterOneJump.onclick=event=>{event.preventDefault();jumpToNovelChapter(novelChapterOne);history.replaceState(null,'','#chapter-1')};
if(novelChapterTwoJump&&novelChapterTwo)novelChapterTwoJump.onclick=event=>{event.preventDefault();jumpToNovelChapter(novelChapterTwo);history.replaceState(null,'','#chapter-2')};
const setProgress=()=>{
  const available=document.documentElement.scrollHeight-innerHeight;
  const percent=available>0?Math.min(100,Math.max(0,scrollY/available*100)):0;
  progressBar.style.width=`${percent}%`;
  progressText.textContent=novelLanguage==='uk'?`${Math.round(percent)}% ПРОЧИТАНО`:`${Math.round(percent)}% READ`;
  localStorage.setItem(progressKey,String(scrollY));
  if(novelChapterOneJump&&novelChapterTwoJump&&novelChapterTwo){
    const inChapterTwo=scrollY+220>=novelChapterTwo.offsetTop;
    novelChapterOneJump.classList.toggle('is-active',!inChapterTwo);
    novelChapterTwoJump.classList.toggle('is-active',inChapterTwo);
  }
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
const savedProgress=Number(localStorage.getItem(progressKey));
const requestedChapter=location.hash==='#chapter-2'?novelChapterTwo:location.hash==='#chapter-1'?novelChapterOne:null;
if(requestedChapter)setTimeout(()=>jumpToNovelChapter(requestedChapter),120);
else if(savedProgress>0)setTimeout(()=>scrollTo({top:savedProgress}),120);
setProgress();
