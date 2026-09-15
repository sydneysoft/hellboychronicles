(()=>{
  const path=location.pathname;
  const lang=/^\/ua(?:\/|$)/.test(path)?'uk':/^\/pl(?:\/|$)/.test(path)?'pl':/^\/fr(?:\/|$)/.test(path)?'fr':/^\/de(?:\/|$)/.test(path)?'de':/^\/es(?:\/|$)/.test(path)?'es':'en';
  const t={
    en:{lib:'STORYLINGO LIBRARY',choose:'FIND YOUR NEXT STORY',title:'STORYLINGO LIBRARY',intro:'Pick a story you genuinely want to read. Translation, vocabulary and practice stay close at hand when you need them.',core:'THE LOST KEY',copy:'Read The Lost Key in any of six languages, then switch versions whenever you want to compare a phrase or revisit a familiar scene.',read:'OPEN THE STORY'},
    uk:{lib:'БІБЛІОТЕКА STORYLINGO',choose:'ОБЕРІТЬ НАСТУПНУ ІСТОРІЮ',title:'БІБЛІОТЕКА STORYLINGO',intro:'Оберіть історію, яку справді хочеться читати. Переклад, словник і практика завжди поруч, коли вони потрібні.',core:'ЗАГУБЛЕНИЙ КЛЮЧ',copy:'Читайте «Загублений ключ» однією з шести мов і перемикайтеся між версіями, коли хочете порівняти фразу або повернутися до знайомої сцени.',read:'ВІДКРИТИ ІСТОРІЮ'},
    pl:{lib:'BIBLIOTEKA STORYLINGO',choose:'WYBIERZ KOLEJNĄ OPOWIEŚĆ',title:'BIBLIOTEKA STORYLINGO',intro:'Wybierz historię, którą naprawdę chcesz przeczytać. Tłumaczenie, słownictwo i ćwiczenia są pod ręką, kiedy ich potrzebujesz.',core:'ZGUBIONY KLUCZ',copy:'Przeczytaj „Zgubiony klucz” w jednym z sześciu języków i przełączaj wersje, gdy chcesz porównać zwrot albo wrócić do znanej sceny.',read:'OTWÓRZ OPOWIEŚĆ'},
    fr:{lib:'BIBLIOTHÈQUE STORYLINGO',choose:'CHOISISSEZ VOTRE PROCHAINE HISTOIRE',title:'BIBLIOTHÈQUE STORYLINGO',intro:'Choisissez une histoire que vous avez vraiment envie de lire. Traduction, vocabulaire et pratique restent à portée de main.',core:'LA CLÉ PERDUE',copy:'Lisez La Clé perdue dans l’une des six langues, puis changez de version pour comparer une expression ou retrouver une scène familière.',read:'OUVRIR L’HISTOIRE'},
    de:{lib:'STORYLINGO-BIBLIOTHEK',choose:'WÄHLE DEINE NÄCHSTE GESCHICHTE',title:'STORYLINGO-BIBLIOTHEK',intro:'Wähle eine Geschichte, die du wirklich lesen möchtest. Übersetzung, Wortschatz und Übungen bleiben griffbereit.',core:'DER VERLORENE SCHLÜSSEL',copy:'Lies Der verlorene Schlüssel in einer von sechs Sprachen und wechsle zwischen den Versionen, wenn du einen Ausdruck vergleichen möchtest.',read:'GESCHICHTE ÖFFNEN'},
    es:{lib:'BIBLIOTECA STORYLINGO',choose:'ELIGE TU PRÓXIMA HISTORIA',title:'BIBLIOTECA STORYLINGO',intro:'Elige una historia que de verdad quieras leer. La traducción, el vocabulario y la práctica están cerca cuando los necesites.',core:'LA LLAVE PERDIDA',copy:'Lee La llave perdida en uno de seis idiomas y cambia de versión cuando quieras comparar una frase o volver a una escena conocida.',read:'ABRIR LA HISTORIA'}
  }[lang];
  document.documentElement.lang=lang;
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
  set('libraryLabel',t.lib);set('chooseLabel',t.choose);set('libraryTitle',t.title);set('libraryCopy',t.intro);set('coreCopy',t.copy);set('coreRead',t.read);
  const coreTitle=document.getElementById('coreTitle');if(coreTitle)coreTitle.innerHTML=t.core.replace(' ','<br>');
  const fantasy=document.getElementById('fantasyShelf'),ua=document.getElementById('ukrainianShelf'),pl=document.getElementById('polishShelf'),frShelf=document.getElementById('frenchShelf');
  if(lang==='uk'){if(fantasy)fantasy.hidden=true;if(pl)pl.hidden=true;if(frShelf)frShelf.hidden=true}
  else if(lang==='pl'){if(fantasy)fantasy.hidden=true;if(ua)ua.hidden=true;if(frShelf)frShelf.hidden=true}
  else if(lang==='fr'){
    if(fantasy)fantasy.hidden=true;if(ua)ua.hidden=true;if(pl)pl.hidden=true;
    set('frenchShelfKicker','Classiques de la tradition des contes français');set('frenchShelfTitle','CONTES POPULAIRES FRANÇAIS');set('frenchBadge','BILINGUE FR / EN · VOLUME I');
    const h=document.getElementById('frenchCardTitle');if(h)h.innerHTML='SIX<br>CONTES';set('frenchCopy','Cendrillon, Le Petit Chaperon rouge, Le Chat botté, La Belle au bois dormant, Les Trois Petits Cochons et La Barbe bleue réunis dans une collection bilingue.');set('frenchComic','ÉDITION ILLUSTRÉE');set('frenchText','ÉDITION TEXTE');
    const a=document.getElementById('frenchComic');if(a)a.href='/fr/french-folk-tales/collection/comic';const b=document.getElementById('frenchText');if(b)b.href='/fr/french-folk-tales/collection';
  } else if(lang==='de'){
    if(fantasy)fantasy.hidden=true;if(ua)ua.hidden=true;if(pl)pl.hidden=true;if(frShelf)frShelf.hidden=true;
    const main=document.querySelector('.library-main');
    if(main&&!document.getElementById('germanShelf')){
      const s=document.createElement('section');s.className='shelf';s.id='germanShelf';
      s.innerHTML=`<div class="shelf-head"><span>KLASSISCHE MÄRCHEN AUS DEUTSCHLAND</span><h2>DEUTSCHE VOLKSMÄRCHEN</h2></div><article class="book-card"><div class="book-cover"><span>5 GRAPHIC NOVELS · 5 TEXTFASSUNGEN</span><h3>DEUTSCHE<br>MÄRCHEN</h3></div><div class="book-info"><p>Hänsel und Gretel, Schneewittchen, Rotkäppchen, Frau Holle und Die Bremer Stadtmusikanten — mit Misha in einer neuen StoryLingo-Fassung.</p><div class="book-actions"><a href="/de/german-folk-tales/collection/comic">GRAPHIC NOVEL</a><a href="/de/german-folk-tales/collection">NOVEL</a></div></div></article>`;
      main.appendChild(s);
    }
  } else if(lang==='es'){if(fantasy)fantasy.hidden=true;if(ua)ua.hidden=true;if(pl)pl.hidden=true;if(frShelf)frShelf.hidden=true}
  const core=document.getElementById('coreRead');if(core)core.href=(lang==='uk'?'/ua':lang==='pl'?'/pl':lang==='fr'?'/fr':lang==='de'?'/de':lang==='es'?'/es':'')+'/universal-stories/lost-key';
  const sel=document.getElementById('languageSelect');
  if(sel){
    const labels={en:'🇬🇧',uk:'🇺🇦',pl:'🇵🇱',fr:'🇫🇷',de:'🇩🇪',es:'🇪🇸'};
    Object.entries(labels).forEach(([v,label])=>{if(![...sel.options].some(o=>o.value===v)){const o=document.createElement('option');o.value=v;o.textContent=label;sel.appendChild(o)}});
    sel.value=lang;sel.onchange=()=>location.href=sel.value==='uk'?'/ua':sel.value==='pl'?'/pl':sel.value==='fr'?'/fr':sel.value==='de'?'/de':sel.value==='es'?'/es':'/';
  }
})();
