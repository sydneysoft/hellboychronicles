const translations={
  en:{chapter:'CHAPTER 01',chooseFormat:'CHOOSE YOUR FORMAT',series:'THE STONES OF SPARTA',title:'THE FIRST<br>AWAKENING',description:'Misha chooses Sparta—and begins a journey across Europe to recover the stones capable of protecting it from the Dark Empire.',illustratedEdition:'ILLUSTRATED EDITION',readComic:'READ THE COMIC',textEdition:'TEXT EDITION',readNovel:'READ THE NOVEL',precisionRhythm:'PRECISION & RHYTHM',comicHint:'Scroll to read · Tap any page to focus',endChapter:'END OF CHAPTER 01',journeyBegun:'THE JOURNEY HAS JUST BEGUN.',followNext:'Follow the chronicle for the next stone.',followInstagram:'FOLLOW ON INSTAGRAM',page:'PAGE',of:'OF'},
  uk:{chapter:'РОЗДІЛ 01',chooseFormat:'ОБЕРІТЬ ФОРМАТ',series:'КАМЕНІ СПАРТИ',title:'ПЕРШЕ<br>ПРОБУДЖЕННЯ',description:'Міша обирає Спарту й вирушає в подорож Європою, щоб знайти камені, здатні захистити її від Темної Імперії.',illustratedEdition:'ІЛЮСТРОВАНЕ ВИДАННЯ',readComic:'ЧИТАТИ КОМІКС',textEdition:'ТЕКСТОВЕ ВИДАННЯ',readNovel:'ЧИТАТИ РОМАН',precisionRhythm:'ТОЧНІСТЬ І РИТМ',comicHint:'Гортайте для читання · Натисніть сторінку, щоб збільшити',endChapter:'КІНЕЦЬ РОЗДІЛУ 01',journeyBegun:'ПОДОРОЖ ЛИШЕ ПОЧАЛАСЯ.',followNext:'Стежте за хронікою, щоб побачити наступний камінь.',followInstagram:'СТЕЖИТИ В INSTAGRAM',page:'СТОРІНКА',of:'З'},
};
const params=new URLSearchParams(location.search);
const requested=params.get('lang');
const saved=localStorage.getItem('hellboy-language');
const browserLanguage=(navigator.languages||[navigator.language||'']).some(language=>/^(uk|ru)(-|$)/i.test(language))?'uk':'en';
const isUkrainianRoute=/^\/ua(?:\/|$)/.test(location.pathname);
const pathLanguage=isUkrainianRoute?'uk':null;
let siteLanguage=pathLanguage||(requested==='uk'||requested==='en'?requested:(saved||browserLanguage));
if(!translations[siteLanguage])siteLanguage='en';
if(!isUkrainianRoute&&siteLanguage==='uk')location.replace('/ua/hellboy/comic');
if(isUkrainianRoute){
  const canonical=document.querySelector('link[rel="canonical"]');
  if(canonical)canonical.href='https://hellboychronicles.vercel.app/ua/hellboy/comic';
}
const select=document.getElementById('languageSelect');
const applyLanguage=language=>{
  siteLanguage=language;
  localStorage.setItem('hellboy-language',language);
  document.documentElement.lang=language;
  document.body.classList.toggle('lang-uk',language==='uk');
  document.querySelectorAll('[data-i18n]').forEach(element=>{const value=translations[language][element.dataset.i18n];if(value)element.textContent=value});
  document.querySelectorAll('[data-i18n-html]').forEach(element=>{const value=translations[language][element.dataset.i18nHtml];if(value)element.innerHTML=value});
  const novelLink=document.getElementById('novelLink');
  if(novelLink)novelLink.href=language==='uk'?'/ua/novel':'/novel';
  document.dispatchEvent(new CustomEvent('languagechange',{detail:{language,labels:translations[language]}}));
};
select.value=siteLanguage;
select.onchange=()=>{
  const language=select.value;
  localStorage.setItem('hellboy-language',language);
  location.href=language==='uk'?'/ua/hellboy/comic':'/hellboy/comic';
};
applyLanguage(siteLanguage);
