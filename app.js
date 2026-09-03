const comicLanguage=siteLanguage;
const totalPages=comicLanguage==='uk'?20:21;
const pagesFolder=comicLanguage==='uk'?'/pages-uk':'/pages';
const pageDimensions=[[864,1821],[863,1822],[864,1820],[864,1821],[864,1821],[1024,1536],[1024,1536],[971,1620],[1013,1552],[1013,1552],[1014,1551],[1013,1552],[1014,1551],[1014,1551],[1013,1552],[1014,1551],[1014,1551],[1014,1551],[1014,1551],[1014,1551],[864,1821]];
if(comicLanguage==='uk'){
  document.getElementById('comicChapterRange').textContent='РОЗДІЛ 01';
  document.getElementById('comicReaderRange').textContent='РОЗДІЛ 01';
  document.getElementById('comicReaderTitle').textContent='ТОЧНІСТЬ І РИТМ';
  document.getElementById('comicEndingLabel').textContent='КІНЕЦЬ РОЗДІЛУ 01';
  document.getElementById('comicEndingTitle').textContent='ПОДОРОЖ ЛИШЕ ПОЧАЛАСЯ.';
  document.getElementById('comicChapter1Jump').textContent='РОЗДІЛ 1';
  document.getElementById('comicChapter2Jump').hidden=true;
}
document.body.dataset.comicLanguage=comicLanguage;
const pages=document.getElementById('pages');
for(let page=1;page<=totalPages;page++){
  if(page===21){
    const divider=document.createElement('div');
    divider.className='comic-chapter-break';
    divider.innerHTML='<span>CHAPTER 02</span><strong>THE GARDEN BESIDE THE BUS STOP</strong>';
    pages.appendChild(divider);
  }
  const number=String(page).padStart(2,'0');
  const [imageWidth,imageHeight]=pageDimensions[page-1];
  const figure=document.createElement('figure');
  figure.className='comic-page';
  figure.id=`page-${page}`;
  figure.dataset.page=page;
  figure.innerHTML=`<img width="${imageWidth}" height="${imageHeight}" loading="${page<3?'eager':'lazy'}" decoding="async" src="${pagesFolder}/page-${number}.webp" alt="${comicLanguage==='uk'?'Хроніки Геллбоя, розділ 1, сторінка':'Hellboy Chronicles chapter 1, page'} ${page}"><figcaption>${translations[siteLanguage].page} ${number}</figcaption>`;
  pages.appendChild(figure);
}
const figures=[...document.querySelectorAll('.comic-page')];
document.getElementById('controlPage').textContent=`1 / ${totalPages}`;
let currentPage=1;
const updateStatus=page=>{
  currentPage=page;
  const labels=translations[siteLanguage];
  document.getElementById('progressText').textContent=`${labels.page} ${page} ${labels.of} ${totalPages}`;
  document.getElementById('controlPage').textContent=`${page} / ${totalPages}`;
  document.getElementById('progressBar').style.width=`${page/totalPages*100}%`;
  document.getElementById('comicChapter1Jump').classList.toggle('is-active',page<21);
  document.getElementById('comicChapter2Jump').classList.toggle('is-active',page>=21);
  history.replaceState(null,'',`#page-${page}`);
};
const observer=new IntersectionObserver(entries=>{
  const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if(visible)updateStatus(Number(visible.target.dataset.page));
},{threshold:[.2,.45,.7]});
figures.forEach(figure=>observer.observe(figure));
const goTo=page=>figures[Math.max(0,Math.min(totalPages-1,page-1))].scrollIntoView({behavior:'smooth',block:'start'});
document.getElementById('comicChapter1Jump').onclick=event=>{event.preventDefault();goTo(1)};
document.getElementById('comicChapter2Jump').onclick=event=>{event.preventDefault();goTo(21)};
document.getElementById('previousPage').onclick=()=>goTo(currentPage-1);
document.getElementById('nextPage').onclick=()=>goTo(currentPage+1);
document.getElementById('toTop').onclick=()=>scrollTo({top:0,behavior:'smooth'});
document.getElementById('startReading').onclick=()=>goTo(1);
const lightbox=document.getElementById('lightbox');
const lightboxImage=document.getElementById('lightboxImage');
figures.forEach(figure=>figure.querySelector('img').onclick=event=>{lightboxImage.src=event.currentTarget.src;lightbox.showModal()});
document.getElementById('closeLightbox').onclick=()=>lightbox.close();
lightbox.onclick=event=>{if(event.target===lightbox)lightbox.close()};
addEventListener('keydown',event=>{if(event.key==='ArrowLeft')goTo(currentPage-1);if(event.key==='ArrowRight')goTo(currentPage+1);if(event.key==='Escape'&&lightbox.open)lightbox.close()});
const initial=location.hash.match(/page-(\d+)/);
if(initial)setTimeout(()=>goTo(Number(initial[1])),200);
document.addEventListener('languagechange',event=>{
  figures.forEach((figure,index)=>figure.querySelector('figcaption').textContent=`${event.detail.labels.page} ${String(index+1).padStart(2,'0')}`);
  updateStatus(currentPage);
});
