import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import App from './App';

type Mode = 'menu' | 'text' | 'graphicIndex' | 'graphicReader';
type Lang = 'en' | 'uk';

type StoryRange = {
  id: number;
  en: string;
  uk: string;
  startPage: number;
  endPage: number;
};

const stories: StoryRange[] = [
  { id: 1, en: 'The Turnip', uk: 'Ріпка', startPage: 3, endPage: 4 },
  { id: 2, en: 'The Mitten', uk: 'Рукавичка', startPage: 5, endPage: 6 },
  { id: 3, en: 'The Straw Bull', uk: 'Солом’яний бичок', startPage: 7, endPage: 8 },
  { id: 4, en: 'Goat-Dereza', uk: 'Коза-Дереза', startPage: 9, endPage: 10 },
  { id: 5, en: 'The Fox and Misha', uk: 'Лисичка та Міша', startPage: 11, endPage: 12 },
  { id: 6, en: 'Pan Kotskyi', uk: 'Пан Коцький', startPage: 13, endPage: 14 },
  { id: 7, en: 'Ivasyk-Telesyk', uk: 'Івасик-Телесик', startPage: 15, endPage: 16 },
  { id: 8, en: 'Kotyhoroshko', uk: 'Котигорошко', startPage: 17, endPage: 18 },
  { id: 9, en: 'The Lame Duck', uk: 'Кривенька качечка', startPage: 19, endPage: 20 },
  { id: 10, en: 'Sirko', uk: 'Сірко', startPage: 21, endPage: 22 },
  { id: 11, en: 'The Cat and the Rooster', uk: 'Котик і Півник', startPage: 23, endPage: 24 },
  { id: 12, en: 'Oh', uk: 'Ох', startPage: 25, endPage: 26 },
  { id: 13, en: 'The Flying Ship', uk: 'Летючий корабель', startPage: 27, endPage: 28 },
];

const PAGE_BASE = 'https://hellboychronicles.vercel.app/folk-collection-pages-lite';
const screenWidth = Dimensions.get('window').width;

export default function RootApp() {
  const [mode, setMode] = useState<Mode>('menu');
  const [lang, setLang] = useState<Lang>('en');
  const [story, setStory] = useState<StoryRange | null>(null);
  const [page, setPage] = useState(1);

  const labels = useMemo(
    () =>
      lang === 'en'
        ? {
            title: 'Ukrainian Folk Tales',
            kicker: 'VOLUME I · 13 STORIES',
            text: 'TEXT / NOVEL',
            graphic: 'GRAPHIC / COMIC',
            choose: 'Choose how you want to read',
            back: 'BACK',
            index: 'CHAPTER INDEX',
            all: 'FULL COLLECTION',
            stories: 'STORIES',
            page: 'PAGE',
            previous: 'PREVIOUS',
            next: 'NEXT',
          }
        : {
            title: 'Українські народні казки',
            kicker: 'ТОМ I · 13 КАЗОК',
            text: 'ТЕКСТ / НОВЕЛА',
            graphic: 'ГРАФІЧНА / КОМІКС',
            choose: 'Оберіть формат читання',
            back: 'НАЗАД',
            index: 'ЗМІСТ',
            all: 'ПОВНА ЗБІРКА',
            stories: 'КАЗКИ',
            page: 'СТОРІНКА',
            previous: 'НАЗАД',
            next: 'ДАЛІ',
          },
    [lang]
  );

  const openCollection = () => {
    setStory(null);
    setPage(1);
    setMode('graphicReader');
  };

  const openStory = (item: StoryRange) => {
    setStory(item);
    setPage(item.startPage);
    setMode('graphicReader');
  };

  const minPage = story?.startPage ?? 1;
  const maxPage = story?.endPage ?? 30;

  const previousPage = () => {
    setPage((current) => Math.max(minPage, current - 1));
  };

  const nextPage = () => {
    setPage((current) => Math.min(maxPage, current + 1));
  };

  if (mode === 'text') {
    return (
      <View style={{ flex: 1 }}>
        <Pressable style={styles.floatingBack} onPress={() => setMode('menu')}>
          <Text style={styles.floatingBackText}>‹ {labels.back}</Text>
        </Pressable>
        <App />
      </View>
    );
  }

  if (mode === 'graphicIndex') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topbar}>
          <Pressable onPress={() => setMode('menu')} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹ {labels.back}</Text>
          </Pressable>
          <LanguageSwitch lang={lang} setLang={setLang} />
        </View>

        <ScrollView contentContainerStyle={styles.graphicContent}>
          <Text style={styles.kicker}>{labels.kicker}</Text>
          <Text style={styles.graphicTitle}>{labels.title}</Text>
          <Text style={styles.sectionLabel}>{labels.stories}</Text>

          <Pressable style={styles.collectionCard} onPress={openCollection}>
            <Text style={styles.collectionTitle}>{labels.all}</Text>
            <Text style={styles.collectionMeta}>30 {labels.page.toLowerCase()}s</Text>
          </Pressable>

          <View style={styles.storyGrid}>
            {stories.map((item) => (
              <Pressable key={item.id} style={styles.storyCard} onPress={() => openStory(item)}>
                <Text style={styles.storyNo}>{String(item.id).padStart(2, '0')}</Text>
                <Text style={styles.storyTitle}>{lang === 'en' ? item.en : item.uk}</Text>
                <Text style={styles.storyPages}>{item.startPage}–{item.endPage}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (mode === 'graphicReader') {
    const atFirst = page <= minPage;
    const atLast = page >= maxPage;
    const readerTitle = story ? (lang === 'en' ? story.en : story.uk) : labels.all;

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topbar}>
          <Pressable onPress={() => setMode('graphicIndex')} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹ {labels.index}</Text>
          </Pressable>
          <LanguageSwitch lang={lang} setLang={setLang} />
        </View>

        <View style={styles.readerScreen}>
          <Text style={styles.readerKicker}>{story ? `${String(story.id).padStart(2, '0')} · ${labels.page} ${story.startPage}–${story.endPage}` : labels.kicker}</Text>
          <Text style={styles.readerTitle} numberOfLines={2}>{readerTitle}</Text>

          <View style={styles.imageFrame}>
            <Image
              key={page}
              source={{ uri: `${PAGE_BASE}/page-${String(page).padStart(2, '0')}.webp?v=expo-graphic-2` }}
              style={styles.pageImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.pageCounter}>{labels.page} {page} / 30</Text>

          <View style={styles.controls}>
            <Pressable
              disabled={atFirst}
              style={[styles.navButton, atFirst && styles.navButtonDisabled]}
              onPress={previousPage}
            >
              <Text style={[styles.navText, atFirst && styles.navTextDisabled]}>‹ {labels.previous}</Text>
            </Pressable>

            <Pressable style={styles.indexButton} onPress={() => setMode('graphicIndex')}>
              <Text style={styles.indexText}>☰</Text>
            </Pressable>

            <Pressable
              disabled={atLast}
              style={[styles.navButton, atLast && styles.navButtonDisabled]}
              onPress={nextPage}
            >
              <Text style={[styles.navText, atLast && styles.navTextDisabled]}>{labels.next} ›</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.menuWrap}>
        <View style={styles.langSwitchTop}>
          <LanguageSwitch lang={lang} setLang={setLang} />
        </View>

        <Text style={styles.kicker}>{labels.kicker}</Text>
        <Text style={styles.title}>{labels.title}</Text>
        <View style={styles.divider} />
        <Text style={styles.choose}>{labels.choose}</Text>

        <Pressable style={styles.modeCard} onPress={() => setMode('text')}>
          <Text style={styles.modeIcon}>📖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.modeTitle}>{labels.text}</Text>
            <Text style={styles.modeCopy}>{lang === 'en' ? 'Selectable words, vocabulary, practice and audiobook.' : 'Виділення слів, словник, вправи та аудіокнига.'}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable style={styles.modeCard} onPress={() => setMode('graphicIndex')}>
          <Text style={styles.modeIcon}>🖼️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.modeTitle}>{labels.graphic}</Text>
            <Text style={styles.modeCopy}>{lang === 'en' ? 'Open the illustrated collection and jump directly to any story.' : 'Відкрийте ілюстровану збірку та переходьте прямо до будь-якої казки.'}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Text style={styles.footer}>GOOD BOOKS · BRIGHTER DAYS</Text>
      </View>
    </SafeAreaView>
  );
}

function LanguageSwitch({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <View style={styles.langSwitch}>
      <Pressable onPress={() => setLang('en')} style={[styles.langChip, lang === 'en' && styles.langChipActive]}>
        <Text style={styles.langText}>EN</Text>
      </Pressable>
      <Pressable onPress={() => setLang('uk')} style={[styles.langChip, lang === 'uk' && styles.langChipActive]}>
        <Text style={styles.langText}>UA</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101216' },
  menuWrap: { flex: 1, paddingHorizontal: 22, justifyContent: 'center' },
  kicker: { color: '#d9b85f', letterSpacing: 2.2, fontWeight: '700', fontSize: 12, textAlign: 'center' },
  title: { color: '#f4ead4', fontSize: 39, lineHeight: 44, fontFamily: 'Georgia', textAlign: 'center', marginTop: 10 },
  graphicTitle: { color: '#f4ead4', fontSize: 31, fontFamily: 'Georgia', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  divider: { width: 92, height: 2, backgroundColor: '#d9b85f', alignSelf: 'center', marginVertical: 22 },
  choose: { color: '#b8b0a1', textAlign: 'center', fontSize: 15, marginBottom: 24 },
  modeCard: { borderWidth: 1, borderColor: '#6e5c35', backgroundColor: '#1c1b19', borderRadius: 18, padding: 18, marginBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 14 },
  modeIcon: { fontSize: 30 },
  modeTitle: { color: '#f4ead4', fontWeight: '800', fontSize: 17, letterSpacing: .5 },
  modeCopy: { color: '#a9a191', marginTop: 5, fontSize: 13, lineHeight: 18 },
  arrow: { color: '#d9b85f', fontSize: 36 },
  footer: { color: '#6f685e', textAlign: 'center', marginTop: 26, letterSpacing: 1.8, fontSize: 11 },
  langSwitchTop: { position: 'absolute', top: 18, right: 22 },
  langSwitch: { flexDirection: 'row', backgroundColor: '#1f2227', padding: 3, borderRadius: 14 },
  langChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 11 },
  langChipActive: { backgroundColor: '#785d25' },
  langText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  topbar: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { paddingVertical: 8, paddingHorizontal: 8 },
  backButtonText: { color: '#d9b85f', fontWeight: '800' },
  graphicContent: { padding: 18, paddingBottom: 60 },
  sectionLabel: { color: '#8d8372', fontSize: 11, letterSpacing: 2, marginBottom: 10 },
  collectionCard: { borderWidth: 1, borderColor: '#6e5c35', backgroundColor: '#211e19', borderRadius: 14, padding: 16, marginBottom: 14 },
  collectionTitle: { color: '#f2e5ca', fontWeight: '800', fontSize: 16 },
  collectionMeta: { color: '#8f8574', marginTop: 4, fontSize: 12 },
  storyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  storyCard: { width: '48.3%', minHeight: 104, borderWidth: 1, borderColor: '#3e392f', backgroundColor: '#18191b', borderRadius: 13, padding: 13, marginBottom: 10 },
  storyNo: { color: '#d9b85f', fontSize: 11, fontWeight: '800' },
  storyTitle: { color: '#f1e5cf', fontFamily: 'Georgia', fontSize: 15, marginTop: 7, lineHeight: 19 },
  storyPages: { color: '#756d61', marginTop: 8, fontSize: 11 },
  readerScreen: { flex: 1, paddingHorizontal: 14, paddingBottom: 12, justifyContent: 'center' },
  readerKicker: { color: '#a68d50', fontSize: 10, letterSpacing: 1.5, textAlign: 'center', marginBottom: 5 },
  readerTitle: { color: '#f4ead4', fontFamily: 'Georgia', fontSize: 24, lineHeight: 29, textAlign: 'center', marginBottom: 10 },
  imageFrame: { alignSelf: 'center', borderWidth: 1, borderColor: '#6e5c35', borderRadius: 12, padding: 6, backgroundColor: '#0c0d0f' },
  pageImage: { width: Math.min(screenWidth - 42, 430), height: Math.min(screenWidth - 42, 430) * 1.598, borderRadius: 7, backgroundColor: '#e9dec4' },
  pageCounter: { color: '#b5aa98', textAlign: 'center', marginTop: 8, fontSize: 12, letterSpacing: 1.2 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 10 },
  navButton: { flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: '#6e5c35', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f1b16', paddingHorizontal: 8 },
  navButtonDisabled: { opacity: .35 },
  navText: { color: '#f3dfad', fontWeight: '800', fontSize: 12 },
  navTextDisabled: { color: '#8b816d' },
  indexButton: { width: 50, height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#4c463b', alignItems: 'center', justifyContent: 'center', backgroundColor: '#17191c' },
  indexText: { color: '#d9b85f', fontSize: 20 },
  floatingBack: { position: 'absolute', zIndex: 100, top: 52, left: 12, backgroundColor: 'rgba(15,15,15,.86)', borderWidth: 1, borderColor: '#6e5c35', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  floatingBackText: { color: '#e0bf68', fontWeight: '800', fontSize: 12 },
});
