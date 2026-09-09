const totalPages=30;
const ukrainian=/^\/ua(?:\/|$)/.test(location.pathname);
const language=ukrainian?'uk':'en';
document.documentElement.lang=language;
document.body.classList.toggle('lang-uk',ukrainian);
const ui={en:{label:'ILLUSTRATED COLLECTION',status:'30 PAGES · 13 STORIES',eyebrow:'BILINGUAL EDITION · VOLUME I',title:'UKRAINIAN<br>FOLK TALES',copy:'Thirteen illustrated stories in English and Ukrainian, adapted by J Mijail.',small:'COMPLETE COLLECTION',start:'START READING',textSmall:'EXPANDED STORIES',textEdition:'TEXT EDITION',volume:'VOLUME I',reader:'THE COMPLETE ILLUSTRATED COLLECTION',hint:'Scroll to read · Tap any page to focus',page:'PAGE',of:'OF',end:'END OF VOLUME I',ending:'GOOD BOOKS. BRIGHTER DAYS.',library:'BACK TO LIBRARY'},uk:{label:'ІЛЮСТРОВАНА ЗБІРКА',status:'30 СТОРІНОК · 13 КАЗОК',eyebrow:'ДВОМОВНЕ ВИДАННЯ · ТОМ I',title:'УКРАЇНСЬКІ<br>НАРОДНІ КАЗКИ',copy:'Тринадцять ілюстрованих казок англійською та українською мовами в адаптації J Mijail.',small:'ПОВНА ЗБІРКА',start:'ПОЧАТИ ЧИТАТИ',textSmall:'РОЗШИРЕНІ КАЗКИ',textEdition:'ТЕКСТОВЕ ВИДАННЯ',volume:'ТОМ I',reader:'ПОВНА ІЛЮСТРОВАНА ЗБІРКА',hint:'Гортайте, щоб читати · Торкніться сторінки, щоб збільшити',page:'СТОРІНКА',of:'З',end:'КІНЕЦЬ ТОМУ I',ending:'ДОБРІ КНИГИ. СВІТЛІШІ ДНІ.',library:'НАЗАД ДО БІБЛІОТЕКИ'}}[language];
const set=(id,value)=>document.getElementById(id).textContent=value;
set('collectionLabel',ui.label);set('progressText',ui.status);set('heroEyebrow',ui.eyebrow);document.getElementById('heroTitle').innerHTML=ui.title;set('heroCopy',ui.copy);set('startSmall',ui.small);set('startText',ui.start);set('textEditionSmall',ui.textSmall);set('textEditionText',ui.textEdition);set('readerLabel',ui.volume);set('readerTitle',ui.reader);set('readerHint',ui.hint);set('endingLabel',ui.end);set('endingTitle',ui.ending);set('backToLibrary',ui.library);set('libraryLink',language==='uk'?'БІБЛІОТЕКА':'LIBRARY');
document.getElementById('textEditionLink').href=language==='uk'?'/ua/folk-tales/collection':'/folk-tales/collection';
for(const id of ['libraryLink','backToLibrary'])document.getElementById(id).href=language==='uk'?'/ua':'/library';

const perfStyle=document.createElement('style');
perfStyle.textContent='.comic-page img:not(.is-loaded){background:linear-gradient(135deg,#e9dec4,#d8c49a);opacity:.96}.comic-page img.is-loaded{opacity:1;transition:opacity .14s ease}';
document.head.appendChild(perfStyle);
const transparentPixel='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const pageSource=page=>`/folk-collection-pages-lite/page-${String(page).padStart(2,'0')}.webp?v=lite-20260909-2`;
const fallbackSource=page=>`/folk-collection-pages/page-${String(page).padStart(2,'0')}.jpg?v=fallback-20260909-2`;
const pages=document.getElementById('pages');let currentPage=1;
for(let page=1;page<=totalPages;page++){
  const number=String(page).padStart(2,'0');
  const figure=document.createElement('figure');
  figure.className='comic-page';figure.dataset.page=page;figure.id=`page-${page}`;
  figure.innerHTML=`<img width="992" height="1586" src="${transparentPixel}" data-src="${pageSource(page)}" data-page="${page}" fetchpriority="low" loading="lazy" decoding="async" alt="${language==='uk'?'Українські народні казки, сторінка':'Ukrainian Folk Tales, page'} ${page}"><figcaption>${ui.page} ${number}</figcaption>`;
  pages.appendChild(figure);
}
const figures=[...document.querySelectorAll('.comic-page')];
const loadFigure=figure=>{
  if(!figure)return;
  const image=figure.querySelector('img');
  if(!image||image.classList.contains('is-loaded')||image.dataset.loading==='1')return;
  const src=image.dataset.src;
  if(!src)return;
  const page=Number(image.dataset.page||figure.dataset.page||1);
  image.dataset.loading='1';
  image.loading='eager';
  image.fetchPriority='high';
  image.onload=()=>{
    image.classList.add('is-loaded');
    image.removeAttribute('data-src');
    delete image.dataset.loading;
    image.onerror=null;
  };
  image.onerror=()=>{
    if(image.dataset.fallback==='1'){
      delete image.dataset.loading;
      return;
    }
    image.dataset.fallback='1';
    image.src=fallbackSource(page);
  };
  image.src=src;
};
const warmPage=page=>loadFigure(figures[page-1]);
const warmAround=page=>{
  for(let offset=-1;offset<=2;offset++){
    const target=page+offset;
    if(target>=1&&target<=totalPages)warmPage(target);
  }
};
let readerActive=false,imageObserver=null;
const activateReader=(page=1)=>{
  warmAround(page);
  if(readerActive)return;
  readerActive=true;
  if('IntersectionObserver' in window){
    imageObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const page=Number(entry.target.dataset.page);
        warmAround(page);
      });
    },{rootMargin:'1400px 0px',threshold:0.01});
    figures.forEach(figure=>imageObserver.observe(figure));
  }
};
const activateOnScroll=()=>{
  const readerTop=document.getElementById('reader').getBoundingClientRect().top;
  if(readerTop<innerHeight+900){activateReader(1);removeEventListener('scroll',activateOnScroll)}
};
addEventListener('scroll',activateOnScroll,{passive:true});

const goTo=(page,behavior='smooth')=>{
  const target=Math.max(1,Math.min(totalPages,page));
  activateReader(target);
  warmAround(target);
  figures[target-1].scrollIntoView({behavior,block:'start'});
};
const update=page=>{
  currentPage=page;if(readerActive)warmAround(page);
  set('progressText',`${ui.page} ${page} ${ui.of} ${totalPages}`);set('controlPage',`${page} / ${totalPages}`);
  document.getElementById('progressBar').style.width=`${page/totalPages*100}%`;
  history.replaceState(null,'',`#page-${page}`);
};
const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)update(Number(visible.target.dataset.page))},{threshold:[.2,.45,.7]});
figures.forEach(figure=>observer.observe(figure));
document.getElementById('previousPage').onclick=()=>goTo(currentPage-1);document.getElementById('nextPage').onclick=()=>goTo(currentPage+1);document.getElementById('toTop').onclick=()=>scrollTo({top:0,behavior:'smooth'});document.getElementById('startReading').onclick=()=>goTo(1);
const dialog=document.getElementById('lightbox'),focusedImage=document.getElementById('lightboxImage');
figures.forEach(figure=>figure.querySelector('img').onclick=event=>{const page=Number(figure.dataset.page);activateReader(page);warmAround(page);const image=event.currentTarget;focusedImage.src=image.classList.contains('is-loaded')?image.src:(image.dataset.src||image.src);dialog.showModal()});
document.getElementById('closeLightbox').onclick=()=>dialog.close();dialog.onclick=event=>{if(event.target===dialog)dialog.close()};
const select=document.getElementById('languageSelect');select.value=language;select.onchange=()=>{localStorage.setItem('hellboy-language',select.value);location.href=select.value==='uk'?'/ua/folk-tales/collection/comic':'/folk-tales/collection/comic'};
const initial=location.hash.match(/page-(\d+)/);if(initial){const page=Number(initial[1]);activateReader(page);setTimeout(()=>goTo(page,'auto'),120)}
