const totalPages=6;
const pages=document.getElementById('pages');
const language=document.body.dataset.comicLanguage||'en';
const folder=language==='uk'?'/turnip-pages-uk':'/turnip-pages';
const transparentPixel='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const pageSource=page=>`${folder}/page-${String(page).padStart(2,'0')}.webp`;
let currentPage=1;
for(let page=1;page<=totalPages;page++){
  const number=String(page).padStart(2,'0');
  const figure=document.createElement('figure');
  figure.className='comic-page';figure.dataset.page=page;
  const eager=page===1;
  figure.innerHTML=`<img width="992" height="1586" loading="${eager?'eager':'lazy'}" decoding="async" fetchpriority="${eager?'high':'low'}" src="${eager?pageSource(page):transparentPixel}"${eager?'':` data-src="${pageSource(page)}"`} alt="${language==='uk'?'Ріпка':'The Turnip'}, ${language==='uk'?'сторінка':'page'} ${page}"><figcaption>${language==='uk'?'СТОРІНКА':'PAGE'} ${number}</figcaption>`;
  pages.appendChild(figure);
}
const figures=[...document.querySelectorAll('.comic-page')];
const loadFigure=figure=>{
  if(!figure)return;
  const image=figure.querySelector('img[data-src]');
  if(!image)return;
  image.src=image.dataset.src;
  image.removeAttribute('data-src');
};
const warmPages=page=>{
  for(let offset=-1;offset<=2;offset++)loadFigure(figures[page-1+offset]);
};
if('IntersectionObserver' in window){
  const imageObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      warmPages(Number(entry.target.dataset.page));
      imageObserver.unobserve(entry.target);
    }
  },{rootMargin:'900px 0px',threshold:.01});
  figures.slice(1).forEach(figure=>imageObserver.observe(figure));
}else{
  figures.forEach(loadFigure);
}
const goTo=page=>{
  const target=Math.max(1,Math.min(totalPages,page));
  warmPages(target);
  figures[target-1].scrollIntoView({behavior:'smooth',block:'start'});
};
const update=page=>{currentPage=page;warmPages(page);document.getElementById('progressText').textContent=`${language==='uk'?'СТОРІНКА':'PAGE'} ${page} ${language==='uk'?'З':'OF'} ${totalPages}`;document.getElementById('controlPage').textContent=`${page} / ${totalPages}`;document.getElementById('progressBar').style.width=`${page/totalPages*100}%`;history.replaceState(null,'',`#page-${page}`)};
const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)update(Number(visible.target.dataset.page))},{threshold:[.2,.45,.7]});figures.forEach(f=>observer.observe(f));
document.getElementById('previousPage').onclick=()=>goTo(currentPage-1);document.getElementById('nextPage').onclick=()=>goTo(currentPage+1);document.getElementById('toTop').onclick=()=>scrollTo({top:0,behavior:'smooth'});document.getElementById('startReading').onclick=()=>goTo(1);
const dialog=document.getElementById('lightbox'),image=document.getElementById('lightboxImage');figures.forEach(f=>f.querySelector('img').onclick=e=>{const target=e.currentTarget;if(target.dataset.src){target.src=target.dataset.src;target.removeAttribute('data-src')}image.src=target.src;dialog.showModal()});document.getElementById('closeLightbox').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close()};
const select=document.getElementById('languageSelect');select.value=language;select.onchange=()=>{localStorage.setItem('hellboy-language',select.value);location.href=select.value==='uk'?'/ua/folk-tales/turnip/comic':'/folk-tales/turnip/comic'};
const saved=localStorage.getItem('hellboy-language'),browser=(navigator.languages||[navigator.language||'']).some(x=>/^(uk|ru)(-|$)/i.test(x))?'uk':'en';if(language==='en'&&(saved==='uk'||(!saved&&browser==='uk')))location.replace('/ua/folk-tales/turnip/comic');
const initial=location.hash.match(/page-(\d+)/);if(initial){const page=Number(initial[1]);warmPages(page);setTimeout(()=>goTo(page),120)}
