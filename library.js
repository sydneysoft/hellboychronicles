(()=>{
  const path=location.pathname;
  const lang=/^\/ua(?:\/|$)/.test(path)?'uk':/^\/pl(?:\/|$)/.test(path)?'pl':/^\/fr(?:\/|$)/.test(path)?'fr':/^\/de(?:\/|$)/.test(path)?'de':/^\/es(?:\/|$)/.test(path)?'es':'en';
  const t={
    en:{lib:'STORYLINGO LIBRARY',choose:'FIND YOUR NEXT STORY',title:'STORYLINGO LIBRARY',intro:'Pick a story you genuinely want to read. Translation, vocabulary and practice stay close at hand when you need them.',core:'UNIVERSAL STORIES',copy:'Read The Lost Key, The Iliad and The Odyssey in any of six languages. Switch languages while keeping the same paragraph and use translation, listening and practice tools as you read.',read:'OPEN COLLECTION'},
    uk:{lib:'БІБЛІОТЕКА STORYLINGO',choose:'ОБЕРІТЬ НАСТУПНУ ІСТОРІЮ',title:'БІБЛІОТЕКА STORYLINGO',intro:'Оберіть історію, яку справді хочеться читати. Переклад, словник і практика завжди поруч, коли вони потрібні.',core:'УНІВЕРСАЛЬНІ ІСТОРІЇ',copy:'Читайте «Загублений ключ», «Іліаду» та «Одіссею» однією з шести мов. Перемикайте мову, залишаючись на тому самому абзаці, і використовуйте переклад, аудіо та практику.',read:'ВІДКРИТИ КОЛЕКЦІЮ'},
    pl:{lib:'BIBLIOTEKA STORYLINGO',choose:'WYBIERZ KOLEJNĄ OPOWIEŚĆ',title:'BIBLIOTEKA STORYLINGO',intro:'Wybierz historię, którą naprawdę chcesz przeczytać. Tłumaczenie, słownictwo i ćwiczenia są pod ręką, kiedy ich potrzebujesz.',core:'HISTORIE UNIWERSALNE',copy:'Czytaj „Zgubiony klucz”, „Iliadę” i „Odyseję” w jednym z sześciu języków. Zmieniaj język, pozostając przy tym samym akapicie, i korzystaj z tłumaczenia, odsłuchu i ćwiczeń.',read:'OTWÓRZ KOLEKCJĘ'},
    fr:{lib:'BIBLIOTHÈQUE STORYLINGO',choose:'CHOISISSEZ VOTRE PROCHAINE HISTOIRE',title:'BIBLIOTHÈQUE STORYLINGO',intro:'Choisissez une histoire que vous avez vraiment envie de lire. Traduction, vocabulaire et pratique restent à portée de main.',core:'HISTOIRES UNIVERSELLES',copy:'Lisez La Clé perdue, L’Iliade et L’Odyssée dans l’une des six langues. Changez de langue tout en restant au même paragraphe et utilisez traduction, écoute et exercices.',read:'OUVRIR LA COLLECTION'},
    de:{lib:'STORYLINGO-BIBLIOTHEK',choose:'WÄHLE DEINE NÄCHSTE GESCHICHTE',title:'STORYLINGO-BIBLIOTHEK',intro:'Wähle eine Geschichte, die du wirklich lesen möchtest. Übersetzung, Wortschatz und Übungen bleiben griffbereit.',core:'UNIVERSELLE GESCHICHTEN',copy:'Lies Der verlorene Schlüssel, Die Ilias und Die Odyssee in einer von sechs Sprachen. Wechsle die Sprache, ohne den Absatz zu verlieren, und nutze Übersetzung, Audio und Übungen.',read:'SAMMLUNG ÖFFNEN'},
    es:{lib:'BIBLIOTECA STORYLINGO',choose:'ELIGE TU PRÓXIMA HISTORIA',title:'BIBLIOTECA STORYLINGO',intro:'Elige una historia que de verdad quieras leer. La traducción, el vocabulario y la práctica están cerca cuando los necesites.',core:'HISTORIAS UNIVERSALES',copy:'Lee La llave perdida, La Ilíada y La Odisea en cualquiera de los seis idiomas. Cambia de idioma manteniendo el mismo párrafo y usa traducción, audio y práctica.',read:'ABRIR COLECCIÓN'}
  }[lang];
  document.documentElement.lang=lang;
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
  const hide=e=>{if(e)e.hidden=true};
  set('libraryLabel',t.lib);set('chooseLabel',t.choose);set('libraryTitle',t.title);set('libraryCopy',t.intro);set('coreCopy',t.copy);set('coreRead',t.read);
  const coreTitle=document.getElementById('coreTitle');if(coreTitle)coreTitle.innerHTML=t.core.replace(' ','<br>');
  const fantasy=document.getElementById('fantasyShelf'),ua=document.getElementById('ukrainianShelf'),pl=document.getElementById('polishShelf'),frShelf=document.getElementById('frenchShelf'),deShelf=document.getElementById('germanShelf');
  if(lang==='uk'){hide(fantasy);hide(pl);hide(frShelf);hide(deShelf)}
  else if(lang==='pl'){hide(fantasy);hide(ua);hide(frShelf);hide(deShelf)}
  else if(lang==='fr'){
    hide(fantasy);hide(ua);hide(pl);hide(deShelf);
    set('frenchShelfKicker','Classiques de la tradition des contes français');set('frenchShelfTitle','CONTES POPULAIRES FRANÇAIS');set('frenchBadge','BILINGUE FR / EN · VOLUME I');
    const h=document.getElementById('frenchCardTitle');if(h)h.innerHTML='SIX<br>CONTES';set('frenchCopy','Cendrillon, Le Petit Chaperon rouge, Le Chat botté, La Belle au bois dormant, Les Trois Petits Cochons et La Barbe bleue réunis dans une collection bilingue.');set('frenchComic','ÉDITION ILLUSTRÉE');set('frenchText','ÉDITION TEXTE');
    const a=document.getElementById('frenchComic');if(a)a.href='/fr/french-folk-tales/collection/comic';const b=document.getElementById('frenchText');if(b)b.href='/fr/french-folk-tales/collection';
  } else if(lang==='de'){
    hide(fantasy);hide(ua);hide(pl);hide(frShelf);
    set('germanShelfKicker','Klassische Märchen aus der deutschen Tradition');set('germanShelfTitle','DEUTSCHE VOLKSMÄRCHEN');set('germanBadge','5 GRAPHIC NOVELS · 5 TEXTFASSUNGEN');
    const h=document.getElementById('germanCardTitle');if(h)h.innerHTML='FÜNF<br>MÄRCHEN';
    set('germanCopy','Hänsel und Gretel, Schneewittchen, Rotkäppchen, Frau Holle und Die Bremer Stadtmusikanten — mit Misha in einer neuen StoryLingo-Fassung.');set('germanComic','GRAPHIC NOVEL');set('germanText','NOVEL');
  } else if(lang==='es'){hide(fantasy);hide(ua);hide(pl);hide(frShelf);hide(deShelf)}
  const core=document.getElementById('coreRead');if(core)core.href=(lang==='uk'?'/ua':lang==='pl'?'/pl':lang==='fr'?'/fr':lang==='de'?'/de':lang==='es'?'/es':'')+'/universal-stories/lost-key';
  const sel=document.getElementById('languageSelect');
  if(sel){const labels={en:'🇬🇧',uk:'🇺🇦',pl:'🇵🇱',fr:'🇫🇷',de:'🇩🇪',es:'🇪🇸'};Object.entries(labels).forEach(([v,label])=>{if(![...sel.options].some(o=>o.value===v)){const o=document.createElement('option');o.value=v;o.textContent=label;sel.appendChild(o)}});sel.value=lang;sel.onchange=()=>location.href=sel.value==='uk'?'/ua':sel.value==='pl'?'/pl':sel.value==='fr'?'/fr':sel.value==='de'?'/de':sel.value==='es'?'/es':'/';}
})();
