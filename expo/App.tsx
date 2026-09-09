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
  icon: string;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  paragraphs: Record<Lang, string[]>;
};
type SavedWord = { word: string; lang: Lang; storyId: number };

const stories: Story[] = [
  { id: 1, icon: '🌱', title: { en: 'The Turnip', uk: 'Ріпка' }, subtitle: { en: 'The strength of every hand', uk: 'Сила кожної руки' }, paragraphs: { en: ['Grandfather planted a turnip beside the house. It grew so large that he could not pull it from the earth alone.', 'Grandmother, their granddaughter, the dog, the cat, and finally the tiny mouse joined him. Together they pulled, and the great turnip came free.'], uk: ['Дід посадив ріпку біля хати. Вона виросла такою великою, що він не зміг витягнути її сам.', 'Баба, онучка, собачка, кіт і нарешті маленька мишка приєдналися до нього. Разом вони потягнули, і велика ріпка вискочила із землі.'] } },
  { id: 2, icon: '🧤', title: { en: 'The Mitten', uk: 'Рукавичка' }, subtitle: { en: 'Room for kindness', uk: 'Місце для доброти' }, paragraphs: { en: ['An old man lost a woolen mitten in the snowy forest. A mouse found it, then a frog, rabbit, fox, wolf, boar, and bear asked to come inside.', 'The mitten stretched as everyone made room. When the dog returned, the animals scattered, remembering that warmth grows when it is shared.'], uk: ['Дід загубив вовняну рукавичку в засніженому лісі. Її знайшла мишка, а потім жабка, зайчик, лисичка, вовк, кабан і ведмідь попросилися всередину.', 'Рукавичка розтягувалася, поки всі давали місце одне одному. Коли повернувся пес, звірі розбіглися, пам’ятаючи, що тепло множиться, коли ним діляться.'] } },
  { id: 3, icon: '🐂', title: { en: 'The Straw Bull', uk: 'Солом’яний бичок' }, subtitle: { en: 'A clever household', uk: 'Кмітливе господарство' }, paragraphs: { en: ['An old couple made a bull from straw and covered its back with sticky tar. A bear, wolf, and fox became stuck to it.', 'The animals promised gifts for their freedom and kept their word. A simple idea, patience, and wit brought abundance to the little household.'], uk: ['Старенькі зробили бичка із соломи й намазали його спину липкою смолою. Ведмідь, вовк і лисиця прилипли до нього.', 'Звірі пообіцяли подарунки за свободу й дотримали слова. Проста ідея, терпіння та кмітливість принесли достаток у маленьке господарство.'] } },
  { id: 4, icon: '🐐', title: { en: 'Goat-Dereza', uk: 'Коза-Дереза' }, subtitle: { en: 'Quiet courage', uk: 'Тиха сміливість' }, paragraphs: { en: ['Goat-Dereza frightened a rabbit from his own cottage. Bear, wolf, and fox all backed away from her loud threats.', 'A tiny crayfish entered without fear and chased the goat away. The animals learned that loud words can be weaker than quiet courage.'], uk: ['Коза-Дереза вигнала зайчика з його хатинки. Ведмідь, вовк і лисиця злякалися її гучних погроз.', 'Маленький рак без страху зайшов усередину й прогнав козу. Звірі зрозуміли, що гучні слова можуть бути слабшими за тиху сміливість.'] } },
  { id: 5, icon: '🦊', title: { en: 'The Fox and Misha', uk: 'Лисичка та Міша' }, subtitle: { en: 'A bargain beneath red leaves', uk: 'Угода під червоним листям' }, paragraphs: { en: ['Misha followed a forest path while a fox offered to guide him toward the lights beyond the ridge. He noticed she kept circling the same crooked pine.', 'Misha used his compass to find the true direction. The fox admitted her trick and finally showed him a safe path through the reeds.'], uk: ['Міша йшов лісовою стежкою, коли лисичка запропонувала провести його до вогнів за пагорбом. Він помітив, що вона кружляє біля тієї самої кривої сосни.', 'Міша скористався компасом і знайшов правильний напрямок. Лисичка зізналася у хитрощах і показала безпечну стежку через очерет.'] } },
  { id: 6, icon: '🐈', title: { en: 'Pan Kotskyi', uk: 'Пан Коцький' }, subtitle: { en: 'The fearsome little cat', uk: 'Грізний маленький кіт' }, paragraphs: { en: ['A fox introduced a small house cat to the forest as the mysterious Pan Kotskyi. Wolf, bear, and boar imagined that he must be terribly powerful.', 'At a feast the cat chased a beetle and accidentally terrified everyone. His reputation grew from the animals’ own fear.'], uk: ['Лисиця представила маленького домашнього кота лісовим звірам як загадкового Пана Коцького. Вовк, ведмідь і кабан уявили, що він неймовірно сильний.', 'На бенкеті кіт погнався за жуком і випадково налякав усіх. Його слава виросла зі страху самих звірів.'] } },
  { id: 7, icon: '🪿', title: { en: 'Ivasyk-Telesyk', uk: 'Івасик-Телесик' }, subtitle: { en: 'The faithful voice', uk: 'Вірний голос' }, paragraphs: { en: ['Ivasyk-Telesyk fished from a golden boat and came ashore only when he heard his mother’s special song. A dragoness copied the melody and captured him.', 'Ivasyk escaped and a tired young goose carried him home. He learned to listen for the truth inside a familiar voice.'], uk: ['Івасик-Телесик ловив рибу в золотому човнику й причалював лише тоді, коли чув мамину особливу пісню. Змія підробила мелодію та схопила його.', 'Івасик утік, а втомлене молоде гусеня віднесло його додому. Він навчився чути правду в знайомому голосі.'] } },
  { id: 8, icon: '🫛', title: { en: 'Kotyhoroshko', uk: 'Котигорошко' }, subtitle: { en: 'The pea-born hero', uk: 'Герой із горошини' }, paragraphs: { en: ['Kotyhoroshko grew into a hero of extraordinary strength and carried an iron mace to the dragon’s stone palace.', 'He freed his family, survived betrayal, and returned without becoming cruel. His greatest strength was the ability to rise again.'], uk: ['Котигорошко виріс надзвичайно сильним богатирем і поніс залізну булаву до кам’яного палацу змія.', 'Він визволив родину, пережив зраду й повернувся, не ставши жорстоким. Його найбільшою силою було вміння піднятися знову.'] } },
  { id: 9, icon: '🦆', title: { en: 'The Lame Duck', uk: 'Кривенька качечка' }, subtitle: { en: 'A gift that needs trust', uk: 'Дар, якому потрібна довіра' }, paragraphs: { en: ['An old couple rescued an injured duck. Whenever they left home, someone mysteriously cleaned the house, baked bread, and worked at the loom.', 'They discovered the duck could become a young woman, but their impatience broke the quiet magic. Love gives shelter without forcing every mystery open.'], uk: ['Старенькі врятували поранену качечку. Щоразу, коли вони виходили з дому, хтось таємничо прибирав хату, пік хліб і працював за ткацьким верстатом.', 'Вони дізналися, що качечка могла ставати молодою дівчиною, але їхня нетерплячість зруйнувала тихе диво. Любов дає притулок і не примушує кожну таємницю відкриватися.'] } },
  { id: 10, icon: '🐕', title: { en: 'Sirko', uk: 'Сірко' }, subtitle: { en: 'Old friends', uk: 'Старі друзі' }, paragraphs: { en: ['Old Sirko was driven from the farm when his legs grew weak. A wolf helped him stage a brave rescue so the family would welcome him home again.', 'Sirko later repaid the wolf with a secret wedding feast. Each friend saved the other when the world considered him useless.'], uk: ['Старого Сірка вигнали з двору, коли його ноги ослабли. Вовк допоміг йому влаштувати удаваний героїчний порятунок, щоб родина знову прийняла його додому.', 'Пізніше Сірко віддячив вовкові таємним частуванням на весіллі. Кожен урятував іншого тоді, коли світ вважав його непотрібним.'] } },
  { id: 11, icon: '🐓', title: { en: 'The Cat and the Rooster', uk: 'Котик і Півник' }, subtitle: { en: 'Listen to a true friend', uk: 'Слухай справжнього друга' }, paragraphs: { en: ['A cat warned his rooster friend not to open the door while a fox prowled nearby. The fox sang sweet promises until curiosity defeated caution.', 'The cat followed the trail and rescued him. The rooster learned that a true friend’s warning can be more valuable than a stranger’s sweetest song.'], uk: ['Котик попередив Півника не відчиняти двері, поки поруч ходить лисиця. Лисиця співала солодкі обіцянки, доки цікавість не перемогла обережність.', 'Котик пішов по сліду й урятував друга. Півник зрозумів, що порада справжнього друга може бути ціннішою за найсолодшу пісню незнайомця.'] } },
  { id: 12, icon: '🌲', title: { en: 'Oh', uk: 'Ох' }, subtitle: { en: 'The spirit beneath the tree', uk: 'Дух під деревом' }, paragraphs: { en: ['A weary father sighed “Oh!” beneath a tree, and a strange forest spirit appeared. The spirit agreed to teach the father’s lazy son how to work and endure hardship.', 'After difficult trials, the young man returned strong and disciplined. What looked like misfortune became the beginning of his growth.'], uk: ['Втомлений батько зітхнув «Ох!» під деревом, і з’явився дивний лісовий дух. Дух погодився навчити ледачого сина працювати й витримувати труднощі.', 'Після важких випробувань юнак повернувся сильним і дисциплінованим. Те, що здавалося нещастям, стало початком його зростання.'] } },
  { id: 13, icon: '🚢', title: { en: 'The Flying Ship', uk: 'Летючий корабель' }, subtitle: { en: 'A voyage made by friendship', uk: 'Подорож, створена дружбою' }, paragraphs: { en: ['A kind young traveler received a flying ship and set out toward the king’s palace. Along the road he welcomed companions, each with a remarkable gift.', 'When the king demanded impossible tasks, the friends succeeded by combining their abilities. The traveler won because he valued every person he met.'], uk: ['Добрий юнак отримав летючий корабель і вирушив до царського палацу. Дорогою він приймав до компанії мандрівників, кожен із надзвичайним даром.', 'Коли цар поставив неможливі завдання, друзі виконали їх, поєднавши свої здібності. Юнак переміг тому, що цінував кожного, кого зустрів.'] } },
];

const C = { bg: '#21130d', panel: '#362117', paper: '#f1e3c5', ink: '#2b1b12', gold: '#e6bb45', blue: '#3568a5', red: '#9d3029', cream: '#fff4dc', muted: '#b8a080' };
const cleanWord = (x: string) => x.replace(/^[^\p{L}'’-]+|[^\p{L}'’-]+$/gu, '');

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const [tab, setTab] = useState<'library' | 'words'>('library');
  const [story, setStory] = useState<Story | null>(null);
  const [saved, setSaved] = useState<SavedWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [practice, setPractice] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    (async () => {
      const l = await AsyncStorage.getItem('hbc.lang');
      const w = await AsyncStorage.getItem('hbc.words');
      if (l === 'en' || l === 'uk') setLang(l);
      if (w) { try { setSaved(JSON.parse(w)); } catch {} }
    })();
  }, []);
  useEffect(() => { AsyncStorage.setItem('hbc.lang', lang).catch(() => {}); }, [lang]);
  useEffect(() => { AsyncStorage.setItem('hbc.words', JSON.stringify(saved)).catch(() => {}); }, [saved]);
  useEffect(() => () => { Speech.stop(); }, []);

  const labels = lang === 'uk'
    ? { library: 'БІБЛІОТЕКА', words: 'СЛОВА', heading: 'УКРАЇНСЬКІ НАРОДНІ КАЗКИ', read: 'ЧИТАТИ', saved: 'ЗБЕРЕЖЕНІ СЛОВА', empty: 'Торкнися слова під час читання, щоб зберегти його.', save: 'ЗБЕРЕГТИ', remove: 'ВИДАЛИТИ', listen: 'СЛУХАТИ', pause: 'ПАУЗА', resume: 'ПРОДОВЖИТИ', stop: 'СТОП' }
    : { library: 'LIBRARY', words: 'WORDS', heading: 'UKRAINIAN FOLK TALES', read: 'READ', saved: 'SAVED WORDS', empty: 'Tap a word while reading to save it here.', save: 'SAVE', remove: 'REMOVE', listen: 'LISTEN', pause: 'PAUSE', resume: 'RESUME', stop: 'STOP' };
  const locale = lang === 'uk' ? 'uk-UA' : 'en-US';
  const selectedSaved = useMemo(() => selectedWord ? saved.some(x => x.lang === lang && x.word.toLowerCase() === selectedWord.toLowerCase()) : false, [saved, selectedWord, lang]);

  const changeLanguage = () => {
    Speech.stop();
    setSpeaking(false);
    setPaused(false);
    setLang(x => x === 'en' ? 'uk' : 'en');
  };

  const openWord = (word: string) => {
    const clean = cleanWord(word);
    if (!clean) return;
    setPractice('');
    setSelectedWord(clean);
  };

  const toggleSaved = () => {
    if (!selectedWord || !story) return;
    if (selectedSaved) setSaved(x => x.filter(w => !(w.lang === lang && w.word.toLowerCase() === selectedWord.toLowerCase())));
    else setSaved(x => [{ word: selectedWord, lang, storyId: story.id }, ...x]);
  };

  const startSpeech = () => {
    if (!story) return;
    setSpeaking(true);
    setPaused(false);
    Speech.stop();
    Speech.speak(story.paragraphs[lang].join(' '), {
      language: locale,
      rate: 0.88,
      onDone: () => { setSpeaking(false); setPaused(false); },
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const toggleSpeech = async () => {
    if (!speaking) { startSpeech(); return; }
    if (paused) { await Speech.resume(); setPaused(false); return; }
    await Speech.pause();
    setPaused(true);
  };

  const stopSpeech = () => {
    Speech.stop();
    setSpeaking(false);
    setPaused(false);
  };

  const paragraph = (p: string, i: number) => (
    <Text key={i} style={s.paragraph}>
      {p.split(/(\s+)/).map((token, j) => cleanWord(token)
        ? <Text key={j} onPress={() => openWord(token)}>{token}</Text>
        : <Text key={j}>{token}</Text>)}
    </Text>
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="light" />
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.kicker}>HELLBOY CHRONICLES</Text>
          <Text style={s.headerTitle}>{labels.heading}</Text>
        </View>
        <Pressable style={s.lang} onPress={changeLanguage}><Text style={s.langText}>{lang === 'en' ? 'EN → УКР' : 'УКР → EN'}</Text></Pressable>
      </View>

      {tab === 'library' ? (
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.hero}>
            <Text style={s.flower}>✣</Text>
            <Text style={s.heroTitle}>{lang === 'uk' ? 'КАЗКИ, ЩО ЖИВУТЬ' : 'TALES THAT STILL LIVE'}</Text>
            <Text style={s.heroText}>{lang === 'uk' ? 'Читайте, слухайте й торкайтеся слів, які хочете запам’ятати.' : 'Read, listen, and tap the words you want to remember.'}</Text>
          </View>
          <View style={s.grid}>
            {stories.map(item => (
              <Pressable key={item.id} style={s.card} onPress={() => { stopSpeech(); setStory(item); }}>
                <View style={s.cover}><Text style={s.icon}>{item.icon}</Text></View>
                <Text style={s.number}>{String(item.id).padStart(2, '0')}</Text>
                <Text style={s.cardTitle}>{item.title[lang]}</Text>
                <Text style={s.cardSub}>{item.subtitle[lang]}</Text>
                <Text style={s.read}>{labels.read} ›</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.savedTitle}>{labels.saved}</Text>
          {!saved.length ? <Text style={s.empty}>{labels.empty}</Text> : saved.map((w, i) => {
            const source = stories.find(x => x.id === w.storyId);
            return <Pressable key={`${w.lang}-${w.word}-${i}`} style={s.wordRow} onPress={() => { setLang(w.lang); setStory(source ?? null); setSelectedWord(w.word); }}>
              <View><Text style={s.wordBig}>{w.word}</Text><Text style={s.wordMeta}>{source?.title[w.lang]} · {w.lang.toUpperCase()}</Text></View><Text style={s.arrow}>›</Text>
            </Pressable>;
          })}
        </ScrollView>
      )}

      <View style={s.tabs}>
        <Pressable style={[s.tab, tab === 'library' && s.tabOn]} onPress={() => setTab('library')}><Text style={[s.tabText, tab === 'library' && s.tabTextOn]}>▦ {labels.library}</Text></Pressable>
        <Pressable style={[s.tab, tab === 'words' && s.tabOn]} onPress={() => setTab('words')}><Text style={[s.tabText, tab === 'words' && s.tabTextOn]}>✎ {labels.words}</Text></Pressable>
      </View>

      <Modal visible={!!story} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { stopSpeech(); setStory(null); }}>
        <SafeAreaView style={s.readerSafe}>
          <View style={s.readerHeader}>
            <Pressable onPress={() => { stopSpeech(); setStory(null); }}><Text style={s.back}>‹ {labels.library}</Text></Pressable>
            <Pressable style={s.readerLang} onPress={changeLanguage}><Text style={s.readerLangText}>{lang === 'en' ? 'EN / УКР' : 'УКР / EN'}</Text></Pressable>
          </View>
          {story && <ScrollView contentContainerStyle={s.readerBody}>
            <Text style={s.readerIcon}>{story.icon}</Text>
            <Text style={s.readerTitle}>{story.title[lang]}</Text>
            <Text style={s.readerSub}>{story.subtitle[lang]}</Text>
            <Text style={s.ornament}>— ✣ —</Text>
            {story.paragraphs[lang].map(paragraph)}
            <Text style={s.hint}>{lang === 'uk' ? 'Торкнися слова, щоб зберегти його.' : 'Tap a word to save it.'}</Text>
            <View style={{ height: 110 }} />
          </ScrollView>}
          <View style={s.audio}>
            <Pressable style={s.audioMain} onPress={toggleSpeech}><Text style={s.audioMainText}>{!speaking ? `▶ ${labels.listen}` : paused ? `▶ ${labels.resume}` : `Ⅱ ${labels.pause}`}</Text></Pressable>
            <Pressable onPress={stopSpeech}><Text style={s.audioStop}>■ {labels.stop}</Text></Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={!!selectedWord} transparent animationType="fade" onRequestClose={() => setSelectedWord(null)}>
        <Pressable style={s.backdrop} onPress={() => setSelectedWord(null)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <Text style={s.sheetLabel}>{lang === 'uk' ? 'СЛОВО' : 'WORD'}</Text>
            <Text style={s.sheetWord}>{selectedWord}</Text>
            <View style={s.row}>
              <Pressable style={s.goldButton} onPress={toggleSaved}><Text style={s.goldButtonText}>{selectedSaved ? labels.remove : labels.save}</Text></Pressable>
              <Pressable style={s.darkButton} onPress={() => selectedWord && Speech.speak(selectedWord, { language: locale, rate: 0.82 })}><Text style={s.darkButtonText}>🔊 {lang === 'uk' ? 'ВИМОВА' : 'PRONOUNCE'}</Text></Pressable>
            </View>
            <Text style={s.practiceLabel}>{lang === 'uk' ? 'ПРАКТИКА ПИСЬМА' : 'WRITING PRACTICE'}</Text>
            <TextInput value={practice} onChangeText={setPractice} autoCapitalize="none" placeholder={lang === 'uk' ? 'Напиши слово…' : 'Write the word…'} placeholderTextColor="#8d785d" style={s.input} />
            {!!practice && <Text style={[s.result, practice.trim().toLowerCase() === selectedWord?.toLowerCase() ? s.good : s.bad]}>{practice.trim().toLowerCase() === selectedWord?.toLowerCase() ? '✓ CORRECT' : '↺ TRY AGAIN'}</Text>}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#614229' },
  kicker: { color: C.gold, fontSize: 9, letterSpacing: 2.2, fontWeight: '900' },
  headerTitle: { color: C.cream, fontSize: 17, fontFamily: 'Georgia', fontWeight: '700', marginTop: 4 },
  lang: { borderWidth: 1, borderColor: C.gold, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 8 },
  langText: { color: C.gold, fontSize: 10, fontWeight: '900' },
  content: { padding: 15, paddingBottom: 105 },
  hero: { backgroundColor: C.panel, borderWidth: 1, borderColor: '#765033', borderRadius: 18, padding: 20, marginBottom: 15 },
  flower: { color: C.gold, fontSize: 28 },
  heroTitle: { color: C.cream, fontFamily: 'Georgia', fontSize: 25, fontWeight: '700', marginTop: 10 },
  heroText: { color: '#d4c2a5', lineHeight: 21, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48.3%', backgroundColor: C.paper, borderRadius: 13, borderWidth: 2, borderColor: C.gold, padding: 12, marginBottom: 13, minHeight: 214 },
  cover: { height: 68, backgroundColor: C.blue, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 34 },
  number: { color: C.red, fontSize: 9, letterSpacing: 1.4, fontWeight: '900', marginTop: 9 },
  cardTitle: { color: C.ink, fontFamily: 'Georgia', fontWeight: '700', fontSize: 18, marginTop: 3 },
  cardSub: { color: '#6e543b', fontSize: 11, lineHeight: 15, marginTop: 4, flex: 1 },
  read: { color: C.blue, fontSize: 10, fontWeight: '900', marginTop: 8 },
  tabs: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#180e0a', flexDirection: 'row', padding: 10, gap: 8, borderTopWidth: 1, borderTopColor: '#614229' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 11 },
  tabOn: { backgroundColor: '#3b261b' },
  tabText: { color: '#97846b', fontSize: 11, letterSpacing: 1, fontWeight: '900' },
  tabTextOn: { color: C.gold },
  savedTitle: { color: C.cream, fontFamily: 'Georgia', fontSize: 25, fontWeight: '700', marginBottom: 14 },
  empty: { color: C.muted, lineHeight: 21 },
  wordRow: { backgroundColor: C.paper, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: C.blue, padding: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wordBig: { color: C.ink, fontFamily: 'Georgia', fontSize: 20, fontWeight: '700' },
  wordMeta: { color: '#7b6349', fontSize: 10, marginTop: 3 },
  arrow: { color: C.red, fontSize: 28 },
  readerSafe: { flex: 1, backgroundColor: C.paper },
  readerHeader: { paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#d3bd91' },
  back: { color: C.blue, fontWeight: '900' },
  readerLang: { backgroundColor: C.bg, borderRadius: 16, paddingHorizontal: 11, paddingVertical: 8 },
  readerLangText: { color: C.gold, fontSize: 10, fontWeight: '900' },
  readerBody: { paddingHorizontal: 24, paddingTop: 20 },
  readerIcon: { textAlign: 'center', fontSize: 43 },
  readerTitle: { textAlign: 'center', color: C.ink, fontFamily: 'Georgia', fontSize: 32, fontWeight: '700', marginTop: 8 },
  readerSub: { textAlign: 'center', color: '#7b644a', fontStyle: 'italic', marginTop: 4 },
  ornament: { textAlign: 'center', color: C.red, fontSize: 18, marginVertical: 18 },
  paragraph: { color: '#35251b', fontFamily: 'Georgia', fontSize: 19, lineHeight: 31, marginBottom: 18 },
  hint: { textAlign: 'center', color: C.blue, fontSize: 11, fontWeight: '900' },
  audio: { position: 'absolute', left: 12, right: 12, bottom: 10, backgroundColor: C.bg, borderRadius: 15, borderWidth: 1, borderColor: C.gold, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 14 },
  audioMain: { backgroundColor: C.gold, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12 },
  audioMainText: { color: C.ink, fontSize: 11, fontWeight: '900' },
  audioStop: { color: C.cream, fontSize: 10, fontWeight: '900' },
  backdrop: { flex: 1, backgroundColor: 'rgba(20,12,8,.68)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 3, borderTopColor: C.gold, padding: 22, paddingBottom: 34 },
  sheetLabel: { color: C.red, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  sheetWord: { color: C.ink, fontFamily: 'Georgia', fontSize: 38, fontWeight: '700', marginTop: 4 },
  row: { flexDirection: 'row', gap: 8, marginTop: 16 },
  goldButton: { backgroundColor: C.gold, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  goldButtonText: { color: C.ink, fontSize: 11, fontWeight: '900' },
  darkButton: { backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  darkButtonText: { color: C.cream, fontSize: 11, fontWeight: '900' },
  practiceLabel: { color: C.blue, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginTop: 22, marginBottom: 8 },
  input: { backgroundColor: '#fff8e9', borderWidth: 1, borderColor: '#bda57b', borderRadius: 10, padding: 13, color: C.ink, fontFamily: 'Georgia', fontSize: 18 },
  result: { marginTop: 10, fontSize: 11, fontWeight: '900' },
  good: { color: '#3e754d' },
  bad: { color: C.red },
});
