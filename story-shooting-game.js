(() => {
  const reader = document.getElementById('storyReader');
  if (!reader) return;

  const isUk = /^\/ua(?:\/|$)/.test(location.pathname);
  const lang = isUk ? 'uk' : 'en';
  const STORAGE = 'hellboy-story-challenge-v1';

  const ui = {
    en: {
      kicker: 'AFTER-STORY CHALLENGE', title: 'STORY SHOOTOUT',
      copy: 'Test what you understood. Aim at the character who answers each question.',
      play: 'PLAY STORY CHALLENGE', best: 'BEST', instruction: 'Tap the correct story character',
      correct: '✓ CORRECT SHOT', wrong: 'MISSED — TRY AGAIN', next: 'NEXT ROUND →',
      complete: 'TALE MASTERED', score: 'SCORE', accuracy: 'ACCURACY', streak: 'BEST STREAK',
      replay: 'PLAY AGAIN', close: 'RETURN TO STORY', question: 'ROUND', points: 'PTS',
      noRecord: 'No score yet'
    },
    uk: {
      kicker: 'ВИПРОБУВАННЯ ПІСЛЯ КАЗКИ', title: 'КАЗКОВИЙ ТИР',
      copy: 'Перевірте, як добре ви зрозуміли казку. Влучте в персонажа, який відповідає на запитання.',
      play: 'ГРАТИ У ВИПРОБУВАННЯ', best: 'РЕКОРД', instruction: 'Торкніться правильного персонажа',
      correct: '✓ ТОЧНЕ ВЛУЧАННЯ', wrong: 'ПОВЗ ЦІЛЬ — СПРОБУЙТЕ ЩЕ', next: 'НАСТУПНИЙ РАУНД →',
      complete: 'КАЗКУ ОПАНОВАНО', score: 'РАХУНОК', accuracy: 'ТОЧНІСТЬ', streak: 'НАЙКРАЩА СЕРІЯ',
      replay: 'ГРАТИ ЩЕ РАЗ', close: 'ПОВЕРНУТИСЯ ДО КАЗКИ', question: 'РАУНД', points: 'ОЧКИ',
      noRecord: 'Ще немає результату'
    }
  }[lang];

  const C = (key, en, uk, icon) => ({ key, en, uk, icon });
  const Q = (en, uk, answer) => ({ en, uk, answer });

  const games = [
    {
      id: 'turnip', title: ['The Turnip','Ріпка'],
      cast: [C('grandfather','Grandfather','Дідусь','👴'),C('grandmother','Grandmother','Бабуся','👵'),C('granddaughter','Granddaughter','Онучка','👧'),C('dog','Dog','Собачка','🐕'),C('cat','Cat','Кіт','🐈'),C('mouse','Mouse','Мишка','🐭')],
      q: [Q('Who planted the turnip seed?','Хто посадив насіння ріпки?','grandfather'),Q('Who joined the pulling line last?','Хто останнім приєднався тягнути ріпку?','mouse'),Q('Who held on to Grandmother?','Хто тримався за Бабусю?','granddaughter'),Q("Who gripped the girl's apron?",'Хто вчепився в фартух дівчинки?','dog'),Q('Who received the first spoonful of stew?','Хто отримав першу ложку юшки?','mouse')]
    },
    {
      id: 'mitten', title: ['The Mitten','Рукавичка'],
      cast: [C('oldman','Old Man','Дідусь','👴'),C('dog','Dog','Собака','🐕'),C('mouse','Mouse','Мишка','🐭'),C('frog','Frog','Жабка','🐸'),C('rabbit','Rabbit','Зайчик','🐇'),C('fox','Fox','Лисиця','🦊'),C('wolf','Wolf','Вовк','🐺'),C('boar','Boar','Кабан','🐗'),C('bear','Bear','Ведмідь','🐻')],
      q: [Q('Who found the mitten first?','Хто першим знайшов рукавичку?','mouse'),Q('Who was the last animal to squeeze inside?','Хто з тварин заліз у рукавичку останнім?','bear'),Q('Who followed the tracks back to the mitten?','Хто повернувся слідами до рукавички?','dog'),Q('Who had accidentally dropped the mitten?','Хто випадково загубив рукавичку?','oldman'),Q('Who said kindness could make a small place larger?','Хто сказав, що доброта може зробити маленьке місце просторішим?','mouse')]
    },
    {
      id: 'straw-bull', title: ['The Straw Bull','Солом’яний бичок'],
      cast: [C('oldman','Old Man','Дідусь','👴'),C('oldwoman','Old Woman','Бабуся','👵'),C('bull','Straw Bull','Солом’яний бичок','🐂'),C('bear','Bear','Ведмідь','🐻'),C('wolf','Wolf','Вовк','🐺'),C('fox','Fox','Лисиця','🦊')],
      q: [Q('Who asked for a little straw bull?','Хто попросив зробити солом’яного бичка?','oldwoman'),Q('Who became stuck to the tar first?','Хто першим прилип до смоли?','bear'),Q('Who promised a flock of sheep?','Хто пообіцяв отару овець?','wolf'),Q('Who promised geese and hens?','Хто пообіцяв гусей і курей?','fox'),Q('Who built the strange straw bull?','Хто зробив дивного солом’яного бичка?','oldman')]
    },
    {
      id: 'goat-dereza', title: ['Goat-Dereza','Коза-Дереза'],
      cast: [C('dereza','Goat-Dereza','Коза-Дереза','🐐'),C('master','Master','Господар','🧔'),C('rabbit','Rabbit','Зайчик','🐇'),C('bear','Bear','Ведмідь','🐻'),C('wolf','Wolf','Вовк','🐺'),C('fox','Fox','Лисиця','🦊'),C('crayfish','Crayfish','Рак','🦞')],
      q: [Q("Who took over the rabbit's cottage?",'Хто захопив хатинку Зайчика?','dereza'),Q('Who finally chased Dereza out?','Хто зрештою вигнав Дерезу?','crayfish'),Q('Whose cottage had been taken?','Чию хатинку було захоплено?','rabbit'),Q("Who first believed Dereza's lies?",'Хто спочатку повірив брехні Дерези?','master'),Q('Who walked forward when the larger animals were afraid?','Хто пішов уперед, коли більші звірі боялися?','crayfish')]
    },
    {
      id: 'fox-misha', title: ['The Fox and Misha','Лисичка та Міша'],
      cast: [C('misha','Misha','Міша','🧑🏻‍🦰'),C('fox','Fox','Лисичка','🦊')],
      q: [Q('Who tried to keep the traveler circling in the forest?','Хто намагався водити мандрівника колами лісом?','fox'),Q('Who used a compass to discover the true direction?','Хто скористався компасом, щоб знайти правильний напрямок?','misha'),Q('Who admitted wanting the whole loaf?','Хто зізнався, що хотів отримати весь хліб?','fox'),Q('Who had the distinctive red markings?','Хто мав впізнавані червоні позначки на обличчі?','misha'),Q('Who later showed the safe dry trail?','Хто згодом показав безпечну суху стежку?','fox')]
    },
    {
      id: 'pan-kotskyi', title: ['Pan Kotskyi','Пан Коцький'],
      cast: [C('cat','Pan Kotskyi','Пан Коцький','🐈'),C('fox','Fox','Лисиця','🦊'),C('wolf','Wolf','Вовк','🐺'),C('bear','Bear','Ведмідь','🐻'),C('boar','Boar','Кабан','🐗'),C('squirrel','Squirrel','Білка','🐿️')],
      q: [Q('Who gave the cat the grand name Pan Kotskyi?','Хто дав котові поважне ім’я Пан Коцький?','fox'),Q('Who was Pan Kotskyi really?','Ким насправді був Пан Коцький?','cat'),Q('Who was hiding up in a tree?','Хто ховався на дереві?','bear'),Q('Who dove beneath the table in fear?','Хто від страху пірнув під стіл?','boar'),Q('Who shook a branch and startled the cat?','Хто струсив гілку й налякав кота?','squirrel')]
    },
    {
      id: 'ivasyk', title: ['Ivasyk-Telesyk','Івасик-Телесик'],
      cast: [C('ivasyk','Ivasyk-Telesyk','Івасик-Телесик','👦'),C('mother','Mother','Мати','👩'),C('father','Father','Батько','👨'),C('dragoness','Dragoness','Змія','🐉'),C('daughter','Dragoness’s Daughter','Дочка Змії','👧'),C('goose','Young Goose','Молоде гусеня','🪿')],
      q: [Q('Whose special song brought Ivasyk to shore?','Чия особлива пісня кликала Івасика до берега?','mother'),Q('Who copied the song to capture him?','Хто скопіював пісню, щоб його схопити?','dragoness'),Q('Who finally carried Ivasyk over the forest?','Хто зрештою переніс Івасика над лісом?','goose'),Q('Who carved the boy from wood?','Хто вирізав хлопчика з дерева?','father'),Q('Who escaped by tricking the dragoness’s daughter?','Хто втік, перехитривши дочку Змії?','ivasyk')]
    },
    {
      id: 'kotyhoroshko', title: ['Kotyhoroshko','Котигорошко'],
      cast: [C('hero','Kotyhoroshko','Котигорошко','🦸'),C('mother','Mother','Мати','👩'),C('dragon','Dragon','Змій','🐉'),C('sister','Sister','Сестра','👧'),C('companions','Companions','Товариші','🧑‍🤝‍🧑'),C('eagle','Mother Eagle','Мати-орлиця','🦅')],
      q: [Q('Who swallowed the mysterious pea?','Хто проковтнув чарівну горошину?','mother'),Q('Who fought the dragon with the iron mace?','Хто бився зі Змієм залізною булавою?','hero'),Q('Who had carried away the family’s daughter?','Хто викрав дочку родини?','dragon'),Q('Who carried the hero back toward the upper world?','Хто ніс героя назад до верхнього світу?','eagle'),Q('Who abandoned the hero in the deep pit?','Хто покинув героя в глибокій ямі?','companions')]
    },
    {
      id: 'lame-duck', title: ['The Lame Duck','Кривенька качечка'],
      cast: [C('couple','Old Couple','Стареньке подружжя','👵👴'),C('duck','Lame Duck','Кривенька качечка','🦆'),C('flock','Flock of Ducks','Зграя качок','🦆🦆')],
      q: [Q('Who secretly cleaned, baked, and wove while the couple was away?','Хто таємно прибирав, пік і ткав, коли господарів не було?','duck'),Q('Who hid to discover the helper’s secret?','Хто сховався, щоб дізнатися таємницю помічниці?','couple'),Q('Who stepped out of the feathers as a young woman?','Хто вийшов із пір’я в образі молодої жінки?','duck'),Q('Who called from the sky when she had to leave?','Хто кликав із неба, коли їй довелося піти?','flock'),Q('Who had first shown mercy to the injured bird?','Хто спочатку змилосердився над пораненою пташкою?','couple')]
    },
    {
      id: 'sirko', title: ['Sirko','Сірко'],
      cast: [C('sirko','Sirko','Сірко','🐕'),C('master','Master','Господар','👨'),C('wolf','Wolf','Вовк','🐺'),C('baby','Baby','Дитина','👶'),C('guests','Wedding Guests','Весільні гості','👥')],
      q: [Q('Who drove the old dog from the farm?','Хто вигнав старого собаку з двору?','master'),Q('Who invented the pretend baby-rescue plan?','Хто придумав удаване викрадення дитини?','wolf'),Q('Who secretly invited the wolf to the wedding feast?','Хто таємно запросив Вовка на весілля?','sirko'),Q('Who could not resist howling after the feast?','Хто не втримався й завив після частування?','wolf'),Q('Who pretended to fight the wolf so he could escape?','Хто удав бій із Вовком, щоб той утік?','sirko')]
    },
    {
      id: 'cat-rooster', title: ['The Cat and the Rooster','Котик і Півник'],
      cast: [C('cat','Cat','Котик','🐈'),C('rooster','Rooster','Півник','🐓'),C('fox','Fox','Лисиця','🦊')],
      q: [Q('Who warned his friend not to open the door?','Хто попередив друга не відчиняти двері?','cat'),Q('Who sang outside the cottage?','Хто співав біля хатинки?','fox'),Q('Who opened the latch despite the warning?','Хто все-таки відчинив засув?','rooster'),Q('Who followed the tracks with a fiddle?','Хто пішов слідами з музичним інструментом?','cat'),Q('Who carried the rooster to a distant den?','Хто поніс Півника до далекої нори?','fox')]
    },
    {
      id: 'oh', title: ['Oh','Ох'],
      cast: [C('father','Father','Батько','👨'),C('son','Son','Син','👦'),C('oh','Oh','Ох','🧚'),C('woman','Old Woman','Старенька','👵')],
      q: [Q('Who appeared when the weary father sighed “Oh”?','Хто з’явився, коли втомлений батько зітхнув «Ох»?','oh'),Q('Who began the story avoiding every kind of work?','Хто на початку казки уникав будь-якої роботи?','son'),Q('Who gave the father the clue about the roosters?','Хто підказав батькові, як упізнати сина серед півнів?','woman'),Q('Who forgot the warning and surrendered the bridle?','Хто забув попередження й віддав вуздечку?','father'),Q('Who finally became a hawk and defeated his master?','Хто зрештою перетворився на яструба й переміг господаря?','son')]
    },
    {
      id: 'flying-ship', title: ['The Flying Ship','Летючий корабель'],
      cast: [C('youngman','Younger Brother','Молодший брат','🧑'),C('traveler','Old Traveler','Старий мандрівник','🧙'),C('king','King','Король','🤴'),C('princess','Princess','Принцеса','👸'),C('companions','Ship Companions','Товариші з корабля','👥'),C('guards','Palace Guards','Палацові вартові','💂')],
      q: [Q('Who shared his black bread and water with a stranger?','Хто поділився чорним хлібом і водою з незнайомцем?','youngman'),Q('Who gave the instructions for building the impossible ship?','Хто дав інструкції, як збудувати неймовірний корабель?','traveler'),Q('Who kept inventing impossible tasks?','Хто постійно вигадував неможливі завдання?','king'),Q('Who used their unusual gifts to finish the tasks?','Хто використав свої незвичайні здібності, щоб виконати завдання?','companions'),Q('Who saw beyond the young man’s patched clothes?','Хто побачив справжню цінність хлопця попри його латаний одяг?','princess')]
    }
  ];

  const readStore = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE) || '{}'); } catch { return {}; }
  };
  const writeStore = value => localStorage.setItem(STORAGE, JSON.stringify(value));
  const shuffle = items => {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const currentStoryIndex = () => Math.max(0, Math.min(games.length - 1, Number((location.hash.match(/story-(\d+)/) || [])[1] || 1) - 1));
  const storyTitle = game => game.title[lang === 'uk' ? 1 : 0];
  const characterName = character => character[lang];

  const dialog = document.createElement('dialog');
  dialog.className = 'story-game-dialog';
  dialog.innerHTML = `
    <section class="story-game-frame">
      <button class="story-game-close" type="button" aria-label="Close">×</button>
      <div id="storyGameBody"></div>
    </section>`;
  document.body.appendChild(dialog);
  dialog.querySelector('.story-game-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  let active = null;

  function saveResult(game, state) {
    const store = readStore();
    const previous = store[game.id] || {};
    store[game.id] = {
      attempts: (previous.attempts || 0) + 1,
      bestScore: Math.max(previous.bestScore || 0, state.score),
      bestStreak: Math.max(previous.bestStreak || 0, state.bestStreak),
      bestAccuracy: Math.max(previous.bestAccuracy || 0, Math.round((state.questions.length / (state.questions.length + state.misses)) * 100)),
      completed: true
    };
    writeStore(store);
  }

  function renderQuestion() {
    const body = dialog.querySelector('#storyGameBody');
    const { game, questions, index, score, streak, attempts } = active;
    const question = questions[index];
    const progress = ((index) / questions.length) * 100;
    const cast = shuffle(game.cast);
    body.innerHTML = `
      <div class="story-game-top">
        <span class="story-game-story">${storyTitle(game)} · ${ui.question} ${index + 1}/${questions.length}</span>
        <span class="story-game-score"><span>🔥 ${streak}</span><span>${score} ${ui.points}</span></span>
      </div>
      <div class="story-game-progress" aria-hidden="true"><span style="width:${progress}%"></span></div>
      <h2 class="story-game-question">${question[lang]}</h2>
      <p class="story-game-instruction">🎯 ${ui.instruction}</p>
      <div class="story-targets">
        ${cast.map(c => `<button class="story-target" type="button" data-character="${c.key}"><span class="story-target-icon" aria-hidden="true">${c.icon}</span><span class="story-target-name">${characterName(c)}</span></button>`).join('')}
      </div>
      <p class="story-game-feedback" aria-live="polite"></p>
      <button class="story-game-next" type="button">${ui.next}</button>`;

    body.querySelectorAll('.story-target').forEach(button => button.addEventListener('click', () => shoot(button, question)));
    body.querySelector('.story-game-next').addEventListener('click', nextRound);
  }

  function shoot(button, question) {
    if (!active || active.locked) return;
    const feedback = dialog.querySelector('.story-game-feedback');
    if (button.dataset.character !== question.answer) {
      active.attempts += 1;
      active.misses += 1;
      active.streak = 0;
      active.score = Math.max(0, active.score - 20);
      button.classList.remove('is-wrong');
      requestAnimationFrame(() => button.classList.add('is-wrong'));
      feedback.className = 'story-game-feedback bad';
      feedback.textContent = ui.wrong;
      dialog.querySelector('.story-game-score').innerHTML = `<span>🔥 0</span><span>${active.score} ${ui.points}</span>`;
      return;
    }

    active.locked = true;
    active.streak += 1;
    active.bestStreak = Math.max(active.bestStreak, active.streak);
    active.score += active.attempts === 0 ? 100 : 55;
    button.classList.add('is-hit');
    feedback.className = 'story-game-feedback good';
    feedback.textContent = `${ui.correct} · +${active.attempts === 0 ? 100 : 55}`;
    dialog.querySelector('.story-game-score').innerHTML = `<span>🔥 ${active.streak}</span><span>${active.score} ${ui.points}</span>`;
    dialog.querySelector('.story-game-progress span').style.width = `${((active.index + 1) / active.questions.length) * 100}%`;
    dialog.querySelector('.story-game-next').classList.add('show');
  }

  function nextRound() {
    if (!active?.locked) return;
    if (active.index >= active.questions.length - 1) return renderResults();
    active.index += 1;
    active.attempts = 0;
    active.locked = false;
    renderQuestion();
  }

  function renderResults() {
    const body = dialog.querySelector('#storyGameBody');
    const accuracy = Math.round((active.questions.length / (active.questions.length + active.misses)) * 100);
    saveResult(active.game, active);
    body.innerHTML = `
      <div class="story-game-results">
        <p class="story-challenge-kicker">${storyTitle(active.game)}</p>
        <div class="story-game-medal">${accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🎯' : '📖'}</div>
        <h2>${ui.complete}</h2>
        <p class="story-game-result-score">${active.score} ${ui.points}</p>
        <div class="story-game-result-grid">
          <div><strong>${active.score}</strong><span>${ui.score}</span></div>
          <div><strong>${accuracy}%</strong><span>${ui.accuracy}</span></div>
          <div><strong>${active.bestStreak}</strong><span>${ui.streak}</span></div>
        </div>
        <div class="story-game-actions"><button type="button" class="primary" data-replay>${ui.replay}</button><button type="button" data-close>${ui.close}</button></div>
      </div>`;
    body.querySelector('[data-replay]').addEventListener('click', () => startGame(active.game));
    body.querySelector('[data-close]').addEventListener('click', () => { dialog.close(); enhance(); });
  }

  function startGame(game) {
    active = { game, questions: shuffle(game.q), index: 0, score: 0, streak: 0, bestStreak: 0, attempts: 0, misses: 0, locked: false };
    renderQuestion();
    if (!dialog.open) dialog.showModal();
  }

  function enhance() {
    if (reader.querySelector('.story-challenge-invite')) return;
    const chapterEnd = reader.querySelector('.chapter-end');
    if (!chapterEnd) return;
    const game = games[currentStoryIndex()];
    const record = readStore()[game.id];
    const invite = document.createElement('section');
    invite.className = 'story-challenge-invite';
    invite.innerHTML = `
      <p class="story-challenge-kicker">${ui.kicker}</p>
      <h3>${ui.title}</h3>
      <p>${ui.copy}</p>
      <p class="story-challenge-record">${record ? `${ui.best}: ${record.bestScore || 0} ${ui.points} · 🎯 ${record.bestAccuracy || 0}%` : ui.noRecord}</p>
      <button class="story-challenge-start" type="button">🎯 ${ui.play}</button>`;
    chapterEnd.insertAdjacentElement('afterend', invite);
    invite.querySelector('button').addEventListener('click', () => startGame(game));
  }

  const observer = new MutationObserver(() => enhance());
  observer.observe(reader, { childList: true });
  enhance();
})();
