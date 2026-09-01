const translations={
  en:{chapter:'CHAPTER 01',chooseFormat:'CHOOSE YOUR FORMAT',series:'THE STONES OF SPARTA',title:'THE FIRST<br>AWAKENING',description:'Misha chooses Sparta—and begins a journey across Europe to recover the stones capable of protecting it from the Dark Empire.',illustratedEdition:'ILLUSTRATED EDITION',readComic:'READ THE COMIC',textEdition:'TEXT EDITION',readNovel:'READ THE NOVEL',precisionRhythm:'PRECISION & RHYTHM',comicHint:'Scroll to read · Tap any page to focus',endChapter:'END OF CHAPTER 01',journeyBegun:'THE JOURNEY HAS JUST BEGUN.',followNext:'Follow the chronicle for the next stone.',followInstagram:'FOLLOW ON INSTAGRAM',page:'PAGE',of:'OF'},
  uk:{chapter:'РОЗДІЛ 01',chooseFormat:'ОБЕРІТЬ ФОРМАТ',series:'КАМЕНІ СПАРТИ',title:'ПЕРШЕ<br>ПРОБУДЖЕННЯ',description:'Міша обирає Спарту й вирушає в подорож Європою, щоб знайти камені, здатні захистити її від Темної Імперії.',illustratedEdition:'ІЛЮСТРОВАНЕ ВИДАННЯ',readComic:'ЧИТАТИ КОМІКС',textEdition:'ТЕКСТОВЕ ВИДАННЯ',readNovel:'ЧИТАТИ РОМАН',precisionRhythm:'ТОЧНІСТЬ І РИТМ',comicHint:'Гортайте для читання · Натисніть сторінку, щоб збільшити',endChapter:'КІНЕЦЬ РОЗДІЛУ 01',journeyBegun:'ПОДОРОЖ ЛИШЕ ПОЧАЛАСЯ.',followNext:'Стежте за хронікою, щоб побачити наступний камінь.',followInstagram:'СТЕЖИТИ В INSTAGRAM',page:'СТОРІНКА',of:'З'},
};
const params=new URLSearchParams(location.search);
const requested=params.get('lang');
const saved=localStorage.getItem('hellboy-language');
let siteLanguage=requested==='uk'||requested==='en'?requested:(saved||'en');
if(!translations[siteLanguage])siteLanguage='en';
const select=document.getElementById('languageSelect');
const applyLanguage=language=>{
  siteLanguage=language;
  localStorage.setItem('hellboy-language',language);
  document.documentElement.lang=language;
  document.querySelectorAll('[data-i18n]').forEach(element=>{const value=translations[language][element.dataset.i18n];if(value)element.textContent=value});
  document.querySelectorAll('[data-i18n-html]').forEach(element=>{const value=translations[language][element.dataset.i18nHtml];if(value)element.innerHTML=value});
  const novelLink=document.getElementById('novelLink');
  if(novelLink)novelLink.href=language==='uk'?'novel-uk.html':'novel.html';
  document.dispatchEvent(new CustomEvent('languagechange',{detail:{language,labels:translations[language]}}));
};
select.value=siteLanguage;
select.onchange=()=>applyLanguage(select.value);
applyLanguage(siteLanguage);
