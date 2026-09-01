const totalPages=20;
const comicLanguage=/^\/ua(?:\/|$)/.test(location.pathname)?'uk':'en';
const pagesFolder=comicLanguage==='uk'?'/pages-uk':'/pages';
const pages=document.getElementById('pages');
for(let page=1;page<=totalPages;page++){
  const number=String(page).padStart(2,'0');
  const figure=document.createElement('figure');
  figure.className='comic-page';
  figure.dataset.page=page;
  figure.innerHTML=`<img loading="${page<3?'eager':'lazy'}" decoding="async" src="${pagesFolder}/page-${number}.webp" alt="Hellboy Chronicles chapter 1, page ${page}"><figcaption>${translations[siteLanguage].page} ${number}</figcaption>`;
  pages.appendChild(figure);
}
const figures=[...document.querySelectorAll('.comic-page')];
let currentPage=1;
const updateStatus=page=>{
  currentPage=page;
  const labels=translations[siteLanguage];
  document.getElementById('progressText').textContent=`${labels.page} ${page} ${labels.of} ${totalPages}`;
  document.getElementById('controlPage').textContent=`${page} / ${totalPages}`;
  document.getElementById('progressBar').style.width=`${page/totalPages*100}%`;
  history.replaceState(null,'',`#page-${page}`);
};
const observer=new IntersectionObserver(entries=>{
  const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if(visible)updateStatus(Number(visible.target.dataset.page));
},{threshold:[.2,.45,.7]});
figures.forEach(figure=>observer.observe(figure));
const goTo=page=>figures[Math.max(0,Math.min(totalPages-1,page-1))].scrollIntoView({behavior:'smooth',block:'start'});
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
