const comicLanguage=siteLanguage;
const totalPages=21;
const pagesFolder=comicLanguage==='uk'?'/pages-uk':'/pages';
const pageDimensions=[[864,1821],[863,1822],[864,1820],[864,1821],[864,1821],[1024,1536],[1024,1536],[971,1620],[1013,1552],[1013,1552],[1014,1551],[1013,1552],[1014,1551],[1014,1551],[1013,1552],[1014,1551],[1014,1551],[1014,1551],[1014,1551],[1014,1551],[864,1821]];
const transparentPixel='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const pageSource=page=>`${pagesFolder}/page-${String(page).padStart(2,'0')}.webp`;
if(comicLanguage==='uk'){
  document.getElementById('comicChapterRange').textContent='РОЗДІЛИ 01–02';
  document.getElementById('comicReaderRange').textContent='РОЗДІЛИ 01–02';
  document.getElementById('comicReaderTitle').textContent='ТОЧНІСТЬ, РИТМ І БЕРЛІНСЬКА НІЧ';
  document.getElementById('comicEndingLabel').textContent='КІНЕЦЬ РОЗДІЛУ 02';
  document.getElementById('comicEndingTitle').textContent='ПОДОРОЖ ТРИВАЄ.';
  document.getElementById('comicChapter1Jump').textContent='РОЗДІЛ 1';
  document.getElementById('comicChapter2Jump').textContent='РОЗДІЛ 2';
}
document.body.dataset.comicLanguage=comicLanguage;
const pages=document.getElementById('pages');
for(let page=1;page<=totalPages;page++){
  if(page===21){
    const divider=document.createElement('div');
    divider.className='comic-chapter-break';
    divider.innerHTML=comicLanguage==='uk'?'<span>РОЗДІЛ 02</span><strong>САД БІЛЯ АВТОБУСНОЇ ЗУПИНКИ</strong>':'<span>CHAPTER 02</span><strong>THE GARDEN BESIDE THE BUS STOP</strong>';
    pages.appendChild(divider);
  }
  const number=String(page).padStart(2,'0');
  const [imageWidth,imageHeight]=pageDimensions[page-1];
  const figure=document.createElement('figure');
  figure.className='comic-page';figure.id=`page-${page}`;figure.dataset.page=page;
  const chapterNumber=page===21?2:1;
  figure.innerHTML=`<img width="${imageWidth}" height="${imageHeight}" loading="lazy" decoding="async" fetchpriority="low" src="${transparentPixel}" data-src="${pageSource(page)}" alt="${comicLanguage==='uk'?`Хроніки Геллбоя, розділ ${chapterNumber}, сторінка`:`Hellboy Chronicles chapter ${chapterNumber}, page`} ${page}"><figcaption>${translations[siteLanguage].page} ${number}</figcaption>`;
  pages.appendChild(figure);
}
const figures=[...document.querySelectorAll('.comic-page')];
const loadFigure=figure=>{if(!figure)return;const image=figure.querySelector('img[data-src]');if(!image)return;image.src=image.dataset.src;image.removeAttribute('data-src')};
const warmPage=page=>loadFigure(figures[page-1]);
let readerActive=false,imageObserver=null;
const activateReader=(page=1)=>{
  warmPage(page);
  if(readerActive)return;
  readerActive=true;
  if('IntersectionObserver' in window){
    imageObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;warmPage(Number(entry.target.dataset.page));imageObserver.unobserve(entry.target)}},{rootMargin:'600px 0px',threshold:.01});
    figures.forEach(figure=>imageObserver.observe(figure));
  }
};
const activateOnScroll=()=>{if(scrollY>24){activateReader(1);removeEventListener('scroll',activateOnScroll)}};
addEventListener('scroll',activateOnScroll,{passive:true});
document.getElementById('controlPage').textContent=`1 / ${totalPages}`;
let currentPage=1;
const updateStatus=page=>{
  currentPage=page;if(readerActive)warmPage(page);
  const labels=translations[siteLanguage];
  document.getElementById('progressText').textContent=`${labels.page} ${page} ${labels.of} ${totalPages}`;
  document.getElementById('controlPage').textContent=`${page} / ${totalPages}`;
  document.getElementById('progressBar').style.width=`${page/totalPages*100}%`;
  document.getElementById('comicChapter1Jump').classList.toggle('is-active',page<21);
  document.getElementById('comicChapter2Jump').classList.toggle('is-active',page>=21);
  history.replaceState(null,'',`#page-${page}`);
};
const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)updateStatus(Number(visible.target.dataset.page))},{threshold:[.2,.45,.7]});
figures.forEach(figure=>observer.observe(figure));
const goTo=(page,behavior='smooth')=>{const target=Math.max(1,Math.min(totalPages,page));activateReader(target);figures[target-1].scrollIntoView({behavior,block:'start'})};
const jumpToChapter=page=>{const previousBehavior=document.documentElement.style.scrollBehavior;document.documentElement.style.scrollBehavior='auto';goTo(page,'auto');document.documentElement.style.scrollBehavior=previousBehavior};
document.getElementById('comicChapter1Jump').onclick=event=>{event.preventDefault();jumpToChapter(1);history.replaceState(null,'','#page-1')};
document.getElementById('comicChapter2Jump').onclick=event=>{event.preventDefault();jumpToChapter(21);history.replaceState(null,'','#page-21')};
document.getElementById('previousPage').onclick=()=>goTo(currentPage-1);document.getElementById('nextPage').onclick=()=>goTo(currentPage+1);document.getElementById('toTop').onclick=()=>scrollTo({top:0,behavior:'smooth'});document.getElementById('startReading').onclick=()=>goTo(1);
const lightbox=document.getElementById('lightbox'),lightboxImage=document.getElementById('lightboxImage');
figures.forEach(figure=>figure.querySelector('img').onclick=event=>{activateReader(Number(figure.dataset.page));const image=event.currentTarget;if(image.dataset.src){image.src=image.dataset.src;image.removeAttribute('data-src')}lightboxImage.src=image.src;lightbox.showModal()});
document.getElementById('closeLightbox').onclick=()=>lightbox.close();lightbox.onclick=event=>{if(event.target===lightbox)lightbox.close()};
addEventListener('keydown',event=>{if(event.key==='ArrowLeft')goTo(currentPage-1);if(event.key==='ArrowRight')goTo(currentPage+1);if(event.key==='Escape'&&lightbox.open)lightbox.close()});
const initial=location.hash.match(/page-(\d+)/);if(initial){const page=Number(initial[1]);activateReader(page);setTimeout(()=>jumpToChapter(page),120)}
document.addEventListener('languagechange',event=>{figures.forEach((figure,index)=>figure.querySelector('figcaption').textContent=`${event.detail.labels.page} ${String(index+1).padStart(2,'0')}`);updateStatus(currentPage)});
