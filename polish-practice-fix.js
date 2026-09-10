(()=>{
  const style=document.createElement('style');
  style.textContent=`
    .plv-pop{overscroll-behavior:contain;scrollbar-gutter:stable}
    .plv-sentence-controls{
      position:sticky;
      bottom:0;
      z-index:3;
      margin:10px -2px -2px;
      padding:9px 2px 2px;
      background:linear-gradient(to bottom,rgba(23,19,17,0),#171311 38%);
    }
    .plv-check-sentence{
      width:100%;
      min-height:44px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:14px;
      letter-spacing:.06em;
    }
    @media (min-width:700px){
      .plv-pop{max-height:min(620px,calc(100vh - 24px))!important}
      .plv-practice textarea{min-height:92px;max-height:160px}
    }
  `;
  document.head.appendChild(style);

  const observer=new MutationObserver(()=>{
    document.querySelectorAll('.plv-check-sentence').forEach(button=>{
      if(button.dataset.macFix)return;
      button.dataset.macFix='1';
      button.textContent='✓ CHECK SENTENCE';
      button.setAttribute('aria-label','Check sentence');
    });

    document.querySelectorAll('.plv-sentence').forEach(textarea=>{
      if(textarea.dataset.macFix)return;
      textarea.dataset.macFix='1';
      textarea.addEventListener('focus',()=>{
        setTimeout(()=>{
          const popup=textarea.closest('.plv-pop');
          const controls=popup?.querySelector('.plv-sentence-controls');
          controls?.scrollIntoView({block:'nearest',behavior:'smooth'});
        },80);
      });
    });
  });

  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
})();