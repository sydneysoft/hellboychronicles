import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import App from './App';

type Mode = 'menu' | 'text' | 'graphic';

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
const width = Dimensions.get('window').width;

export default function RootApp() {
  const [mode, setMode] = useState<Mode>('menu');
  const [lang, setLang] = useState<'en' | 'uk'>('en');
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
            all: 'FULL COLLECTION',
            story: 'STORIES',
            page: 'PAGE',
          }
        : {
            title: 'Українські народні казки',
            kicker: 'ТОМ I · 13 КАЗОК',
            text: 'ТЕКСТ / НОВЕЛА',
            graphic: 'ГРАФІЧНА / КОМІКС',
            choose: 'Оберіть формат читання',
            back: 'НАЗАД',
            all: 'ПОВНА ЗБІРКА',
            story: 'КАЗКИ',
            page: 'СТОРІНКА',
          },
    [lang]
  );

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

  if (mode === 'graphic') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topbar}>
          <Pressable onPress={() => setMode('menu')} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹ {labels.back}</Text>
          </Pressable>
          <View style={styles.langSwitch}>
            <Pressable onPress={() => setLang('en')} style={[styles.langChip, lang === 'en' && styles.langChipActive]}>
              <Text style={styles.langText}>EN</Text>
            </Pressable>
            <Pressable onPress={() => setLang('uk')} style={[styles.langChip, lang === 'uk' && styles.langChipActive]}>
              <Text style={styles.langText}>UA</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.graphicContent}>
          <Text style={styles.kicker}>{labels.kicker}</Text>
          <Text style={styles.graphicTitle}>{labels.title}</Text>
          <Text style={styles.sectionLabel}>{labels.story}</Text>

          <Pressable
            style={styles.collectionCard}
            onPress={() => {
              setStory(null);
              setPage(1);
            }}
          >
            <Text style={styles.collectionTitle}>{labels.all}</Text>
            <Text style={styles.collectionMeta}>30 {labels.page.toLowerCase()}s</Text>
          </Pressable>

          <View style={styles.storyGrid}>
            {stories.map((item) => (
              <Pressable
                key={item.id}
                style={styles.storyCard}
                onPress={() => {
                  setStory(item);
                  setPage(item.startPage);
                }}
              >
                <Text style={styles.storyNo}>{String(item.id).padStart(2, '0')}</Text>
                <Text style={styles.storyTitle}>{lang === 'en' ? item.en : item.uk}</Text>
                <Text style={styles.storyPages}>{item.startPage}–{item.endPage}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.readerFrame}>
            <Image
              source={{ uri: `${PAGE_BASE}/page-${String(page).padStart(2, '0')}.webp?v=expo-graphic-1` }}
              style={styles.pageImage}
              resizeMode="contain"
            />
            <Text style={styles.pageCounter}>{labels.page} {page} / 30</Text>
            <View style={styles.controls}>
              <Pressable style={styles.controlButton} onPress={() => setPage((p) => Math.max(story?.startPage ?? 1, p - 1))}>
                <Text style={styles.controlText}>‹</Text>
              </Pressable>
              <Pressable style={styles.controlButton} onPress={() => setPage((p) => Math.min(story?.endPage ?? 30, p + 1))}>
                <Text style={styles.controlText}>›</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.menuWrap}>
        <View style={styles.langSwitchTop}>
          <Pressable onPress={() => setLang('en')} style={[styles.langChip, lang === 'en' && styles.langChipActive]}>
            <Text style={styles.langText}>EN</Text>
          </Pressable>
          <Pressable onPress={() => setLang('uk')} style={[styles.langChip, lang === 'uk' && styles.langChipActive]}>
            <Text style={styles.langText}>UA</Text>
          </Pressable>
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

        <Pressable style={styles.modeCard} onPress={() => setMode('graphic')}>
          <Text style={styles.modeIcon}>🖼️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.modeTitle}>{labels.graphic}</Text>
            <Text style={styles.modeCopy}>{lang === 'en' ? 'Read the illustrated 30-page collection story by story.' : 'Читайте ілюстровану 30-сторінкову збірку казка за казкою.'}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Text style={styles.footer}>GOOD BOOKS · BRIGHTER DAYS</Text>
      </View>
    </SafeAreaView>
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
  langSwitchTop: { position: 'absolute', top: 18, right: 22, flexDirection: 'row', backgroundColor: '#1f2227', padding: 3, borderRadius: 14 },
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
  readerFrame: { marginTop: 20, borderWidth: 1, borderColor: '#6e5c35', borderRadius: 16, padding: 10, backgroundColor: '#0c0d0f' },
  pageImage: { width: width - 58, height: (width - 58) * 1.598, alignSelf: 'center', borderRadius: 8, backgroundColor: '#e9dec4' },
  pageCounter: { color: '#b5aa98', textAlign: 'center', marginTop: 10, fontSize: 12, letterSpacing: 1.2 },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 10, marginBottom: 4 },
  controlButton: { width: 58, height: 42, borderRadius: 12, borderWidth: 1, borderColor: '#6e5c35', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f1b16' },
  controlText: { color: '#f3dfad', fontSize: 28, lineHeight: 30 },
  floatingBack: { position: 'absolute', zIndex: 100, top: 52, left: 12, backgroundColor: 'rgba(15,15,15,.86)', borderWidth: 1, borderColor: '#6e5c35', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  floatingBackText: { color: '#e0bf68', fontWeight: '800', fontSize: 12 },
});
