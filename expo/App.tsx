import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Lang = 'en' | 'uk';
type Story = {
  id: number;
  title: { en: string; uk: string };
  subtitle: { en: string; uk: string };
  text: { en: string[]; uk: string[] };
  glyph: string;
};

type SavedWord = { word: string; lang: Lang; storyId: number };

const STORIES: Story[] = [
  {
    id: 1,
    glyph: '🌱',
    title: { en: 'The Turnip', uk: 'Ріпка' },
    subtitle: { en: 'The strength of every hand', uk: 'Сила кожної руки' },
    text: {
      en: [
        'Grandfather planted a turnip seed beside the house. Rain fell, the sun warmed the garden, and the turnip grew until its leaves were broad and its golden shoulder rose above the soil.',
        'Grandfather pulled, then Grandmother, their granddaughter, the dog, the cat, and finally the tiny mouse joined the line. Together they pulled once more, and the enormous turnip flew free. Everyone learned that even the smallest helper can complete a great task.'
      ],
      uk: [
        'Дід посадив насінину ріпки біля хати. Падав дощ, сонце зігрівало город, і ріпка росла, доки її листя не стало широким, а золоте плече не піднялося над землею.',
        'Тягнув дід, потім баба, онучка, собачка, кіт і нарешті маленька мишка стали в один ряд. Вони потягнули разом, і велика ріпка вискочила із землі. Усі зрозуміли, що навіть найменший помічник може завершити велику справу.'
      ]
    }
  },
  {
    id: 2,
    glyph: '🧤',
    title: { en: 'The Mitten', uk: 'Рукавичка' },
    subtitle: { en: 'Room for kindness', uk: 'Місце для доброти' },
    text: {
      en: [
        'On a freezing winter day an old man lost a woolen mitten in the forest. A mouse found it first, then a frog, rabbit, fox, wolf, boar, and bear asked to come inside.',
        'The mitten stretched as the animals made room for one another. When the old man’s dog returned and barked, the animals scattered into the snowy forest, remembering that warmth grows when it is shared.'
      ],
      uk: [
        'Морозного зимового дня дід загубив у лісі вовняну рукавичку. Першою її знайшла мишка, а потім жабка, зайчик, лисичка, вовк, кабан і ведмідь попросилися всередину.',
        'Рукавичка розтягувалася, поки звірі давали місце одне одному. Коли повернувся дідусів пес і загавкав, усі розбіглися засніженим лісом, пам’ятаючи, що тепло множиться, коли ним діляться.'
      ]
    }
  },
  {
    id: 3,
    glyph: '🐂',
    title: { en: 'The Straw Bull', uk: 'Солом’яний бичок' },
    subtitle: { en: 'A clever household', uk: 'Кмітливе господарство' },
    text: {
      en: [
        'An old couple made a little bull from straw and coated its back with sticky tar. A bear, wolf, and fox each touched the bull and became stuck.',
        'The animals promised gifts in exchange for freedom and later kept their word. The old couple learned that a humble idea, joined with patience and wit, can bring unexpected abundance.'
      ],
      uk: [
        'Старенькі зробили маленького бичка із соломи й намазали його спину липкою смолою. Ведмідь, вовк і лисиця торкнулися бичка та прилипли.',
        'Звірі пообіцяли подарунки за свободу й потім дотримали слова. Старенькі зрозуміли, що проста ідея разом із терпінням та кмітливістю може принести несподіваний достаток.'
      ]
    }
  },
  {
    id: 4,
    glyph: '🐐',
    title: { en: 'Goat-Dereza', uk: 'Коза-Дереза' },
    subtitle: { en: 'Courage clears the house', uk: 'Сміливість перемагає страх' },
    text: {
      en: [
        'Goat-Dereza frightened a rabbit from his own cottage and boasted that nobody could remove her. Bear, wolf, and fox all backed away from her threats.',
        'A tiny crayfish entered without fear and pinched the goat until she ran away. The forest animals discovered that loud threats can be weaker than quiet courage.'
      ],
      uk: [
        'Коза-Дереза вигнала зайчика з його хатинки й вихвалялася, що ніхто не зможе її прогнати. Ведмідь, вовк і лисиця злякалися її погроз.',
        'Маленький рак без страху зайшов до хатинки й ущипнув козу, поки вона не втекла. Лісові звірі зрозуміли, що гучні погрози часто слабші за тиху сміливість.'
      ]
    }
  },
  {
    id: 5,
    glyph: '🦊',
    title: { en: 'The Fox and Misha', uk: 'Лисичка та Міша' },
    subtitle: { en: 'A bargain beneath red leaves', uk: 'Угода під червоним листям' },
    text: {
      en: [
        'Misha followed a forest path while a fox offered to guide him toward the lights beyond the ridge. He noticed that she kept circling the same crooked pine.',
        'Instead of arguing, Misha used his compass and climbed a rock to find the true direction. The fox admitted her trick and then showed him a safe path through the reeds. Cleverness became useful only when both travelers reached their destination.'
      ],
      uk: [
        'Міша йшов лісовою стежкою, коли лисичка запропонувала провести його до вогнів за пагорбом. Він помітив, що вона весь час кружляє біля тієї самої кривої сосни.',
        'Замість сварки Міша скористався компасом і піднявся на камінь, щоб побачити правильний напрямок. Лисичка зізналася у хитрощах і показала безпечну стежку через очерет. Справжня кмітливість допомагає обом мандрівникам дійти до мети.'
      ]
    }
  },
  {
    id: 6,
    glyph: '🐈',
    title: { en: 'Pan Kotskyi', uk: 'Пан Коцький' },
    subtitle: { en: 'The fearsome little cat', uk: 'Грізний маленький кіт' },
    text: {
      en: [
        'A house cat was left in the forest, where a fox introduced him as the mysterious Pan Kotskyi. Wolf, bear, and boar imagined that the small stranger must be terribly powerful.',
        'At a feast the cat chased a beetle and accidentally terrified everyone. His reputation grew from the animals’ own fear, proving that imagination can make a small shadow look enormous.'
      ],
      uk: [
        'Домашнього кота залишили в лісі, де лисиця представила його як загадкового Пана Коцького. Вовк, ведмідь і кабан уявили, що маленький незнайомець має страшну силу.',
        'На бенкеті кіт погнався за жуком і випадково налякав усіх. Його слава виросла зі страху самих звірів, показавши, як уява може зробити маленьку тінь велетенською.'
      ]
    }
  },
  {
    id: 7,
    glyph: '🪿',
    title: { en: 'Ivasyk-Telesyk', uk: 'Івасик-Телесик' },
    subtitle: { en: 'The faithful voice', uk: 'Вірний голос' },
    text: {
      en: [
        'Ivasyk-Telesyk fished from a golden boat and came ashore only when he heard his mother’s special song. A dragoness copied the melody and captured him.',
        'Ivasyk escaped and called to geese flying overhead. A tired young goose finally carried him home. He learned to listen not only to words, but to the love and truth inside a familiar voice.'
      ],
      uk: [
        'Івасик-Телесик ловив рибу в золотому човнику й причалював лише тоді, коли чув особливу мамину пісню. Змія підробила мелодію та схопила його.',
        'Івасик утік і покликав гусей, що летіли над лісом. Втомлене молоде гусеня нарешті віднесло його додому. Він навчився слухати не лише слова, а й любов та правду в знайомому голосі.'
      ]
    }
  },
  {
    id: 8,
    glyph: '🫛',
    title: { en: 'Kotyhoroshko', uk: 'Котигорошко' },
    subtitle: { en: 'The pea-born hero', uk: 'Герой, народжений з горошини' },
    text: {
      en: [
        'Kotyhoroshko grew into a hero of extraordinary strength and carried an iron mace to the dragon’s stone palace. He defeated the monster and freed his family.',
        'After betrayal left him trapped, he helped young eaglets and was carried back to the upper world by their grateful mother. His greatest strength was rising again without becoming cruel.'
      ],
      uk: [
        'Котигорошко виріс надзвичайно сильним богатирем і поніс залізну булаву до кам’яного палацу змія. Він переміг чудовисько та визволив свою родину.',
        'Після зради він опинився в пастці, але врятував маленьких орлят, і вдячна орлиця винесла його назад у світ. Його найбільшою силою було вміння піднятися знову й не стати жорстоким.'
      ]
    }
  },
  {
    id: 9,
    glyph: '🦆',
    title: { en: 'The Lame Duck', uk: 'Кривенька качечка' },
    subtitle: { en: 'The gift that must be trusted', uk: 'Дар, якому треба довіряти' },
    text: {
      en: [
        'An old couple rescued an injured duck. Whenever they left home, someone mysteriously cleaned the house, baked bread, and worked at the loom.',
        'They discovered the duck could become a young woman, but their impatience broke the quiet magic. They learned that love gives shelter without forcing every mystery to reveal itself.'
      ],
      uk: [
        'Старенькі врятували поранену качечку. Щоразу, коли вони виходили з дому, хтось таємничо прибирав хату, пік хліб і працював за ткацьким верстатом.',
        'Вони дізналися, що качечка могла ставати молодою дівчиною, але їхня нетерплячість зруйнувала тихе диво. Вони зрозуміли, що любов дає притулок і не примушує кожну таємницю відкриватися.'
      ]
    }
  },
  {
    id: 10,
    glyph: '🐕',
    title: { en: 'Sirko', uk: 'Сірко' },
    subtitle: { en: 'Old friends', uk: 'Старі друзі' },
    text: {
      en: [
        'Old Sirko was driven from the farm when his legs grew weak. A wolf helped him stage a brave rescue so the family would welcome the dog home again.',
        'Sirko later repaid the wolf with a secret wedding feast and protected him when the guests discovered him. Each friend saved the other when the world considered him useless.'
      ],
      uk: [
        'Старого Сірка вигнали з двору, коли його ноги ослабли. Вовк допоміг йому влаштувати удаваний героїчний порятунок, щоб родина знову прийняла собаку додому.',
        'Пізніше Сірко віддячив вовкові таємним частуванням на весіллі й захистив його, коли гості помітили незваного друга. Кожен урятував іншого тоді, коли світ вважав його непотрібним.'
      ]
    }
  },
  {
    id: 11,
    glyph: '🐓',
    title: { en: 'The Cat and the Rooster', uk: 'Котик і Півник' },
    subtitle: { en: 'Listen to a true friend', uk: 'Слухай справжнього друга' },
    text: {
      en: [
        'A cat warned his rooster friend never to open the door while a fox prowled nearby. The fox sang beautiful promises until curiosity made the rooster forget the warning.',
        'The cat followed the trail and rescued him. The rooster finally understood that a true friend’s caution may sound ordinary, but it can be more valuable than a stranger’s sweetest song.'
      ],
      uk: [
        'Котик попередив Півника не відчиняти двері, поки поруч ходить лисиця. Лисиця співала красиві обіцянки, доки цікавість не змусила Півника забути попередження.',
        'Котик пішов по сліду й урятував друга. Півник зрозумів, що проста порада справжнього друга може бути ціннішою за найсолодшу пісню незнайомця.'
      ]
    }
  },
  {
    id: 12,
    glyph: '🌲',
    title: { en: 'Oh', uk: 'Ох' },
    subtitle: { en: 'The spirit beneath the tree', uk: 'Дух під деревом' },
    text: {
      en: [
        'A weary father sighed “Oh!” beneath a tree, and a strange little forest spirit appeared. The spirit agreed to teach the father’s lazy son how to work and endure hardship.',
        'After difficult trials, the young man returned changed: strong, disciplined, and able to choose his own path. What first looked like misfortune became the beginning of his growth.'
      ],
      uk: [
        'Втомлений батько зітхнув «Ох!» під деревом, і перед ним з’явився дивний лісовий дух. Дух погодився навчити ледачого сина працювати й витримувати труднощі.',
        'Після важких випробувань юнак повернувся зміненим: сильним, дисциплінованим і здатним самостійно обирати шлях. Те, що спершу здавалося нещастям, стало початком його зростання.'
      ]
    }
  },
  {
    id: 13,
    glyph: '🚢',
    title: { en: 'The Flying Ship', uk: 'Летючий корабель' },
    subtitle: { en: 'A voyage made by friendship', uk: 'Подорож, створена дружбою' },
    text: {
      en: [
        'A kind young traveler received a flying ship and set out toward the king’s palace. Along the road he welcomed unusual companions, each with a remarkable gift.',
        'When the king demanded impossible tasks, the companions succeeded by combining their abilities. The young traveler won not because he was strongest, but because he valued every person he met along the road.'
      ],
      uk: [
        'Добрий юнак отримав летючий корабель і вирушив до царського палацу. Дорогою він приймав до компанії дивних мандрівників, кожен із надзвичайним даром.',
        'Коли цар поставив неможливі завдання, друзі виконали їх, поєднавши свої здібності. Юнак переміг не тому, що був найсильнішим, а тому, що цінував кожного, кого зустрів у дорозі.'
      ]
    }
  }
];

const colors = {
  ink: '#25160f',
  walnut: '#24150f',
  walnut2: '#3a2318',
  paper: '#f2e4c6',
  paper2: '#e5d0a5',
  gold: '#e7bc45',
  blue: '#3769a7',
  red: '#9e2f27',
  cream: '#fff4dc',
  muted: '#b9a482'
};

const cleanWord = (value: string) => value.replace(/^[^\p{L}'’-]+|[^\p{L}'’-]+$/gu, '');

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const [tab, setTab] = useState<'library' | 'words'>('library');
  const [story, setStory] = useState<Story | null>(null);
  const [saved, setSaved] = useState<SavedWord[]>([]);
  const [wordSheet, setWordSheet] = useState<{ word: string; storyId: number } | null>(null);
  const [practice, setPractice] = useState('');
  const [speechIndex, setSpeechIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    (async () => {
      const storedLang = await AsyncStorage.getItem('hbc.lang');
      const storedWords = await AsyncStorage.getItem('hbc.words');
      if (storedLang === 'en' || storedLang === 'uk') setLang(storedLang);
      if (storedWords) {
        try { setSaved(JSON.parse(storedWords)); } catch {}
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('hbc.lang', lang).catch(() => {});
  }, [lang]);

  useEffect(() => {
    AsyncStorage.setItem('hbc.words', JSON.stringify(saved)).catch(() => {});
  }, [saved]);

  useEffect(() => () => { Speech.stop(); }, []);

  const locale = lang === 'uk' ? 'uk-UA' : 'en-US';
  const labels = lang === 'uk'
    ? { library: 'БІБЛІОТЕКА', words: 'СЛОВА', collection: 'УКРАЇНСЬКІ НАРОДНІ КАЗКИ', read: 'ЧИТАТИ', saved: 'ЗБЕРЕЖЕНІ СЛОВА', empty: 'Торкнися слова під час читання, щоб зберегти його.', save: 'ЗБЕРЕГТИ', remove: 'ВИДАЛИТИ', close: 'ЗАКРИТИ', practice: 'ПРАКТИКА ПИСЬМА', check: 'ПЕРЕВІРИТИ', listen: 'СЛУХАТИ', pause: 'ПАУЗА', resume: 'ПРОДОВЖИТИ', stop: 'СТОП' }
    : { library: 'LIBRARY', words: 'WORDS', collection: 'UKRAINIAN FOLK TALES', read: 'READ', saved: 'SAVED WORDS', empty: 'Tap a word while reading to save it here.', save: 'SAVE', remove: 'REMOVE', close: 'CLOSE', practice: 'WRITING PRACTICE', check: 'CHECK', listen: 'LISTEN', pause: 'PAUSE', resume: 'RESUME', stop: 'STOP' };

  const currentSaved = useMemo(() => wordSheet ? saved.some(x => x.word.toLocaleLowerCase() === wordSheet.word.toLocaleLowerCase() && x.lang === lang) : false, [saved, wordSheet, lang]);

  const toggleLanguage = () => {
    Speech.stop();
    setSpeaking(false);
    setPaused(false);
    setSpeechIndex(0);
    setLang(v => v === 'en' ? 'uk' : 'en');
  };

  const saveOrRemoveWord = () => {
    if (!wordSheet) return;
    const normalized = wordSheet.word.toLocaleLowerCase();
    if (currentSaved) {
      setSaved(prev => prev.filter(x => !(x.lang === lang && x.word.toLocaleLowerCase() === normalized)));
    } else {
      setSaved(prev => [{ word: wordSheet.word, lang, storyId: wordSheet.storyId }, ...prev]);
    }
  };

  const speakParagraph = (target = speechIndex) => {
    if (!story) return;
    const paragraphs = story.text[lang];
    const index = Math.max(0, Math.min(target, paragraphs.length - 1));
    setSpeechIndex(index);
    setSpeaking(true);
    setPaused(false);
    Speech.stop();
    Speech.speak(paragraphs[index], {
      language: locale,
      rate: 0.88,
      pitch: 1,
      onDone: () => {
        if (index < paragraphs.length - 1) {
          setSpeechIndex(index + 1);
          setTimeout(() => speakParagraph(index + 1), 120);
        } else {
          setSpeaking(false);
          setPaused(false);
        }
      },
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false)
    });
  };

  const toggleSpeech = async () => {
    if (!story) return;
    if (paused) {
      await Speech.resume();
      setPaused(false);
      setSpeaking(true);
      return;
    }
    if (speaking) {
      await Speech.pause();
      setPaused(true);
      return;
    }
    speakParagraph(speechIndex);
  };

  const stopSpeech = () => {
    Speech.stop();
    setSpeaking(false);
    setPaused(false);
    setSpeechIndex(0);
  };

  const openStory = (item: Story) => {
    stopSpeech();
    setStory(item);
  };

  const renderParagraph = (paragraph: string, storyId: number, key: string) => (
    <Text key={key} style={styles.paragraph}>
      {paragraph.split(/(\s+)/).map((token, i) => {
        const word = cleanWord(token);
        if (!word) return <Text key={`${key}-${i}`}>{token}</Text>;
        return (
          <Text
            key={`${key}-${i}`}
            onPress={() => { setPractice(''); setWordSheet({ word, storyId }); }}
            style={styles.word}
          >
            {token}
          </Text>
        );
      })}
    </Text>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.topbar}>
        <View>
          <Text style={styles.kicker}>HELLBOY CHRONICLES</Text>
          <Text style={styles.brand}>{labels.collection}</Text>
        </View>
        <Pressable style={styles.langButton} onPress={toggleLanguage}>
          <Text style={styles.langText}>{lang === 'en' ? 'EN  →  УКР' : 'УКР  →  EN'}</Text>
        </Pressable>
      </View>

      {tab === 'library' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.heroFlower}>✣</Text>
            <Text style={styles.heroTitle}>{lang === 'uk' ? 'КАЗКИ, ЩО ЖИВУТЬ' : 'TALES THAT STILL LIVE'}</Text>
            <Text style={styles.heroCopy}>{lang === 'uk' ? 'Читайте українською та англійською. Торкайтеся слів, зберігайте їх і слухайте кожну історію.' : 'Read in Ukrainian and English. Tap words, save them, and listen to every story.'}</Text>
          </View>
          <View style={styles.grid}>
            {STORIES.map(item => (
              <Pressable key={item.id} style={styles.card} onPress={() => openStory(item)}>
                <View style={styles.cardOrnament}><Text style={styles.cardGlyph}>{item.glyph}</Text></View>
                <Text style={styles.cardNumber}>{String(item.id).padStart(2, '0')}</Text>
                <Text style={styles.cardTitle}>{item.title[lang]}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle[lang]}</Text>
                <Text style={styles.readLabel}>{labels.read}  ›</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>{labels.saved}</Text>
          {!saved.length ? <Text style={styles.empty}>{labels.empty}</Text> : saved.map((entry, i) => {
            const s = STORIES.find(x => x.id === entry.storyId);
            return (
              <Pressable key={`${entry.lang}-${entry.word}-${i}`} style={styles.savedRow} onPress={() => { setLang(entry.lang); setPractice(''); setWordSheet({ word: entry.word, storyId: entry.storyId }); }}>
                <View>
                  <Text style={styles.savedWord}>{entry.word}</Text>
                  <Text style={styles.savedMeta}>{s?.title[entry.lang] ?? ''} · {entry.lang.toUpperCase()}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'library' && styles.tabActive]} onPress={() => setTab('library')}>
          <Text style={[styles.tabText, tab === 'library' && styles.tabTextActive]}>▦  {labels.library}</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'words' && styles.tabActive]} onPress={() => setTab('words')}>
          <Text style={[styles.tabText, tab === 'words' && styles.tabTextActive]}>✎  {labels.words}</Text>
        </Pressable>
      </View>

      <Modal visible={!!story} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { stopSpeech(); setStory(null); }}>
        <SafeAreaView style={styles.readerSafe}>
          <View style={styles.readerTop}>
            <Pressable onPress={() => { stopSpeech(); setStory(null); }}><Text style={styles.close}>‹ {labels.library}</Text></Pressable>
            <Pressable style={styles.readerLang} onPress={toggleLanguage}><Text style={styles.readerLangText}>{lang === 'en' ? 'EN / УКР' : 'УКР / EN'}</Text></Pressable>
          </View>
          {story && (
            <ScrollView contentContainerStyle={styles.readerContent}>
              <Text style={styles.readerGlyph}>{story.glyph}</Text>
              <Text style={styles.readerTitle}>{story.title[lang]}</Text>
              <Text style={styles.readerSubtitle}>{story.subtitle[lang]}</Text>
              <View style={styles.rule}><View /><Text>✣</Text><View /></View>
              {story.text[lang].map((p, i) => renderParagraph(p, story.id, `p-${i}`))}
              <Text style={styles.tapHint}>{lang === 'uk' ? 'Торкнися будь-якого слова, щоб зберегти його.' : 'Tap any word to save it.'}</Text>
              <View style={styles.readerBottomSpace} />
            </ScrollView>
          )}
          <View style={styles.audioBar}>
            <Pressable style={styles.audioMain} onPress={toggleSpeech}>
              <Text style={styles.audioMainText}>{speaking ? (paused ? `▶ ${labels.resume}` : `Ⅱ ${labels.pause}`) : `▶ ${labels.listen}`}</Text>
            </Pressable>
            <Pressable style={styles.audioStop} onPress={stopSpeech}><Text style={styles.audioStopText}>■ {labels.stop}</Text></Pressable>
            {story && <Text style={styles.audioProgress}>{speechIndex + 1}/{story.text[lang].length}</Text>}
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={!!wordSheet} transparent animationType="fade" onRequestClose={() => setWordSheet(null)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setWordSheet(null)}>
          <Pressable style={styles.wordSheet} onPress={() => {}}>
            <Text style={styles.sheetKicker}>{lang === 'uk' ? 'СЛОВО' : 'WORD'}</Text>
            <Text style={styles.sheetWord}>{wordSheet?.word}</Text>
            <View style={styles.sheetActions}>
              <Pressable style={styles.goldButton} onPress={saveOrRemoveWord}><Text style={styles.goldButtonText}>{currentSaved ? labels.remove : labels.save}</Text></Pressable>
              <Pressable style={styles.darkButton} onPress={() => wordSheet && Speech.speak(wordSheet.word, { language: locale, rate: 0.82 })}><Text style={styles.darkButtonText}>🔊 {lang === 'uk' ? 'ВИМОВА' : 'PRONOUNCE'}</Text></Pressable>
            </View>
            <Text style={styles.practiceLabel}>{labels.practice}</Text>
            <TextInput
              value={practice}
              onChangeText={setPractice}
              autoCapitalize="none"
              placeholder={lang === 'uk' ? 'Напиши слово…' : 'Write the word…'}
              placeholderTextColor="#8d785d"
              style={styles.practiceInput}
            />
            {!!practice && <Text style={[styles.practiceResult, practice.trim().toLocaleLowerCase() === wordSheet?.word.toLocaleLowerCase() ? styles.correct : styles.wrong]}>{practice.trim().toLocaleLowerCase() === wordSheet?.word.toLocaleLowerCase() ? '✓' : '↺'}</Text>}
            <Pressable onPress={() => setWordSheet(null)}><Text style={styles.sheetClose}>{labels.close}</Text></Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.walnut },
  topbar: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#604127' },
  kicker: { color: colors.gold, fontSize: 9, letterSpacing: 2.4, fontWeight: '800' },
  brand: { color: colors.cream, fontSize: 18, fontFamily: 'Georgia', fontWeight: '700', marginTop: 4 },
  langButton: { borderWidth: 1, borderColor: colors.gold, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 20 },
  langText: { color: colors.gold, fontSize: 10, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 108 },
  hero: { borderWidth: 1, borderColor: '#775333', backgroundColor: colors.walnut2, padding: 20, borderRadius: 18, marginBottom: 16 },
  heroFlower: { color: colors.gold, fontSize: 28 },
  heroTitle: { color: colors.cream, fontSize: 25, lineHeight: 29, fontFamily: 'Georgia', fontWeight: '700', marginTop: 12 },
  heroCopy: { color: '#d8c6a8', lineHeight: 21, marginTop: 9 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48.2%', minHeight: 220, backgroundColor: colors.paper, borderRadius: 13, padding: 13, marginBottom: 14, borderWidth: 2, borderColor: colors.gold },
  cardOrnament: { height: 72, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blue, borderRadius: 8, borderWidth: 1, borderColor: '#264c7d' },
  cardGlyph: { fontSize: 35 },
  cardNumber: { color: colors.red, fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 10 },
  cardTitle: { color: colors.ink, fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', marginTop: 4 },
  cardSubtitle: { color: '#6b5138', fontSize: 11, lineHeight: 15, marginTop: 5, flex: 1 },
  readLabel: { color: colors.blue, fontWeight: '900', fontSize: 10, letterSpacing: 1, marginTop: 10 },
  sectionTitle: { color: colors.cream, fontFamily: 'Georgia', fontWeight: '700', fontSize: 25, marginBottom: 14 },
  empty: { color: colors.muted, lineHeight: 22 },
  savedRow: { backgroundColor: colors.paper, borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: colors.blue },
  savedWord: { color: colors.ink, fontFamily: 'Georgia', fontWeight: '700', fontSize: 20 },
  savedMeta: { color: '#80664b', fontSize: 10, marginTop: 3 },
  chevron: { color: colors.red, fontSize: 28 },
  tabs: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 12, paddingTop: 8, paddingHorizontal: 14, flexDirection: 'row', gap: 8, backgroundColor: '#1b100c', borderTopWidth: 1, borderTopColor: '#604127' },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#3d281b' },
  tabText: { color: '#9f8a70', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  tabTextActive: { color: colors.gold },
  readerSafe: { flex: 1, backgroundColor: colors.paper },
  readerTop: { paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#d1b98a' },
  close: { color: colors.blue, fontWeight: '900' },
  readerLang: { backgroundColor: colors.walnut, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  readerLangText: { color: colors.gold, fontSize: 10, fontWeight: '900' },
  readerContent: { paddingHorizontal: 24, paddingTop: 22 },
  readerGlyph: { textAlign: 'center', fontSize: 44 },
  readerTitle: { textAlign: 'center', color: colors.ink, fontFamily: 'Georgia', fontWeight: '700', fontSize: 32, marginTop: 10 },
  readerSubtitle: { textAlign: 'center', color: '#79634b', fontStyle: 'italic', marginTop: 5 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 22 },
  rule: undefined as any,
  paragraph: { color: '#35251b', fontFamily: 'Georgia', fontSize: 19, lineHeight: 31, marginBottom: 18 },
  word: { textDecorationLine: 'none' },
  tapHint: { color: colors.blue, textAlign: 'center', fontSize: 11, fontWeight: '800', letterSpacing: .5, marginTop: 8 },
  readerBottomSpace: { height: 110 },
  audioBar: { position: 'absolute', left: 12, right: 12, bottom: 10, backgroundColor: colors.walnut, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  audioMain: { backgroundColor: colors.gold, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12 },
  audioMainText: { color: colors.ink, fontWeight: '900', fontSize: 11 },
  audioStop: { paddingHorizontal: 10, paddingVertical: 12 },
  audioStopText: { color: colors.cream, fontWeight: '900', fontSize: 10 },
  audioProgress: { color: colors.gold, marginLeft: 'auto', marginRight: 5, fontWeight: '800', fontSize: 10 },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(17,10,7,.68)', justifyContent: 'flex-end' },
  wordSheet: { backgroundColor: colors.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 34, borderTopWidth: 3, borderTopColor: colors.gold },
  sheetKicker: { color: colors.red, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  sheetWord: { color: colors.ink, fontFamily: 'Georgia', fontSize: 38, fontWeight: '700', marginTop: 5 },
  sheetActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  goldButton: { backgroundColor: colors.gold, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  goldButtonText: { color: colors.ink, fontWeight: '900', fontSize: 11 },
  darkButton: { backgroundColor: colors.walnut, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  darkButtonText: { color: colors.cream, fontWeight: '900', fontSize: 11 },
  practiceLabel: { color: colors.blue, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginTop: 22, marginBottom: 8 },
  practiceInput: { borderWidth: 1, borderColor: '#b99f72', backgroundColor: '#fff8e9', borderRadius: 10, padding: 14, fontFamily: 'Georgia', color: colors.ink, fontSize: 18 },
  practiceResult: { position: 'absolute', right: 35, bottom: 78, fontSize: 20, fontWeight: '900' },
  correct: { color: '#39744c' },
  wrong: { color: colors.red },
  sheetClose: { textAlign: 'center', color: '#76624b', fontSize: 11, fontWeight: '900', marginTop: 20, letterSpacing: 1.2 }
});

// React Native requires unique style keys; these are assigned separately to keep the ornament rule simple.
(styles as any).rule = { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 22 };
