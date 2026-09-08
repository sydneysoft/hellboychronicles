import SwiftUI

private enum VintagePalette {
    static let ink = Color(red: 0.16, green: 0.11, blue: 0.07)
    static let paper = Color(red: 0.92, green: 0.86, blue: 0.73)
    static let paperLight = Color(red: 0.97, green: 0.93, blue: 0.84)
    static let walnut = Color(red: 0.13, green: 0.075, blue: 0.04)
    static let oxblood = Color(red: 0.52, green: 0.10, blue: 0.08)
    static let blue = Color(red: 0.00, green: 0.34, blue: 0.72)
    static let yellow = Color(red: 1.00, green: 0.83, blue: 0.00)
    static let line = Color(red: 0.45, green: 0.34, blue: 0.20)
    static let forest = Color(red: 0.10, green: 0.28, blue: 0.17)
    static let plum = Color(red: 0.31, green: 0.12, blue: 0.24)
}

struct RootView: View {
    var body: some View {
        TabView {
            NavigationStack { LibraryView() }
                .tabItem { Label("Library", systemImage: "books.vertical.fill") }

            NavigationStack { VocabularyView() }
                .tabItem { Label("Words", systemImage: "character.book.closed.fill") }
        }
        .tint(VintagePalette.oxblood)
    }
}

private struct CoverDesign {
    let emoji: String
    let start: Color
    let end: Color
    let accent: Color
}

private struct BookCoverView: View {
    let story: Story
    let language: ReaderLanguage
    var compact = false

    private var design: CoverDesign {
        switch story.id {
        case "turnip": return CoverDesign(emoji: "🌱", start: VintagePalette.blue, end: VintagePalette.oxblood, accent: VintagePalette.yellow)
        case "mitten": return CoverDesign(emoji: "🧤", start: Color(red: 0.12, green: 0.28, blue: 0.46), end: VintagePalette.plum, accent: VintagePalette.paperLight)
        case "straw-bull": return CoverDesign(emoji: "🐂", start: Color(red: 0.47, green: 0.28, blue: 0.08), end: VintagePalette.oxblood, accent: VintagePalette.yellow)
        case "goat-dereza": return CoverDesign(emoji: "🐐", start: VintagePalette.forest, end: VintagePalette.walnut, accent: VintagePalette.yellow)
        case "fox-and-misha": return CoverDesign(emoji: "🦊", start: VintagePalette.oxblood, end: VintagePalette.plum, accent: VintagePalette.yellow)
        case "pan-kotskyi": return CoverDesign(emoji: "🐈", start: Color(red: 0.12, green: 0.24, blue: 0.36), end: VintagePalette.walnut, accent: VintagePalette.paperLight)
        case "ivasyk-telesyk": return CoverDesign(emoji: "🛶", start: VintagePalette.blue, end: VintagePalette.forest, accent: VintagePalette.yellow)
        case "kotyhoroshko": return CoverDesign(emoji: "⚔️", start: VintagePalette.oxblood, end: Color.black, accent: VintagePalette.yellow)
        case "lame-duck": return CoverDesign(emoji: "🦆", start: Color(red: 0.18, green: 0.43, blue: 0.48), end: VintagePalette.plum, accent: VintagePalette.paperLight)
        case "sirko": return CoverDesign(emoji: "🐕", start: Color(red: 0.31, green: 0.25, blue: 0.18), end: VintagePalette.forest, accent: VintagePalette.yellow)
        case "cat-and-rooster": return CoverDesign(emoji: "🐓", start: VintagePalette.plum, end: VintagePalette.oxblood, accent: VintagePalette.yellow)
        case "oh": return CoverDesign(emoji: "🌿", start: Color(red: 0.06, green: 0.38, blue: 0.23), end: Color(red: 0.03, green: 0.16, blue: 0.11), accent: VintagePalette.yellow)
        default: return CoverDesign(emoji: "⛵️", start: VintagePalette.blue, end: Color(red: 0.27, green: 0.13, blue: 0.42), accent: VintagePalette.yellow)
        }
    }

    private var storyNumber: Int {
        (StoryCatalog.stories.firstIndex(where: { $0.id == story.id }) ?? 0) + 1
    }

    var body: some View {
        ZStack {
            LinearGradient(colors: [design.start, design.end], startPoint: .topLeading, endPoint: .bottomTrailing)

            VStack(spacing: compact ? 7 : 12) {
                HStack {
                    Text(language == .english ? "UKRAINIAN FOLK TALE" : "УКРАЇНСЬКА КАЗКА")
                        .font(.system(size: compact ? 7 : 9, weight: .black))
                        .tracking(compact ? 0.8 : 1.4)
                    Spacer()
                    Text(String(format: "%02d", storyNumber))
                        .font(.system(size: compact ? 9 : 11, weight: .black, design: .serif))
                }
                .foregroundStyle(design.accent)

                Text("◆  ◇  ◆  ◇  ◆")
                    .font(.system(size: compact ? 7 : 9))
                    .tracking(compact ? 1 : 2)
                    .foregroundStyle(design.accent.opacity(0.8))

                Spacer(minLength: 0)

                Text(design.emoji)
                    .font(.system(size: compact ? 40 : 64))
                    .shadow(color: .black.opacity(0.25), radius: 8, y: 5)

                Spacer(minLength: 0)

                Text(story.title(for: language).uppercased())
                    .font(.system(size: compact ? 18 : 31, weight: .black, design: .serif))
                    .minimumScaleFactor(0.65)
                    .lineLimit(compact ? 3 : 4)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.white)

                Text(story.subtitle(for: language))
                    .font(.system(size: compact ? 9 : 13, weight: .semibold, design: .serif).italic())
                    .lineLimit(compact ? 2 : 3)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(VintagePalette.paperLight.opacity(0.8))

                Text(language == .english ? "VOLUME I" : "ТОМ I")
                    .font(.system(size: compact ? 7 : 9, weight: .black))
                    .tracking(2)
                    .foregroundStyle(design.accent)
            }
            .padding(compact ? 12 : 20)
        }
        .overlay {
            Rectangle()
                .stroke(design.accent.opacity(0.85), lineWidth: compact ? 1 : 1.5)
                .padding(compact ? 6 : 9)
        }
        .overlay(alignment: .leading) {
            Rectangle()
                .fill(Color.black.opacity(0.16))
                .frame(width: compact ? 5 : 8)
        }
        .clipShape(RoundedRectangle(cornerRadius: compact ? 3 : 5, style: .continuous))
        .shadow(color: .black.opacity(0.38), radius: compact ? 8 : 18, y: compact ? 6 : 12)
        .accessibilityLabel(story.title(for: language))
    }
}

struct LibraryView: View {
    @EnvironmentObject private var app: AppState
    private let columns = [GridItem(.flexible(), spacing: 16), GridItem(.flexible(), spacing: 16)]

    var body: some View {
        ZStack {
            VintagePalette.walnut.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 25) {
                    header
                    languagePicker
                    featured
                    storyGrid
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 42)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .navigationDestination(for: Story.self) { story in
            ReaderView(story: story)
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text(app.language == .english ? "THE FOLK LIBRARY · 13 STORIES" : "БІБЛІОТЕКА КАЗОК · 13 ІСТОРІЙ")
                .font(.caption.weight(.bold))
                .tracking(2.5)
                .foregroundStyle(VintagePalette.yellow)
            Text(app.language == .english ? "Ukrainian\nFolk Tales" : "Українські\nНародні Казки")
                .font(.system(size: 50, weight: .bold, design: .serif))
                .foregroundStyle(VintagePalette.paperLight)
                .lineSpacing(-7)
            Text(app.language == .english ? "A native reading and language-learning edition." : "Нативне видання для читання та вивчення мов.")
                .font(.system(.body, design: .serif))
                .foregroundStyle(VintagePalette.paper.opacity(0.72))
        }
        .padding(.top, 28)
    }

    private var languagePicker: some View {
        HStack(spacing: 8) {
            ForEach(ReaderLanguage.allCases) { language in
                Button {
                    withAnimation(.snappy) { app.language = language }
                } label: {
                    Text("\(language.flag)  \(language.rawValue)")
                        .font(.caption.weight(.heavy))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .frame(maxWidth: .infinity)
                        .background(app.language == language ? VintagePalette.yellow : Color.white.opacity(0.08))
                        .foregroundStyle(app.language == language ? VintagePalette.ink : VintagePalette.paperLight)
                        .overlay(Rectangle().stroke(VintagePalette.line.opacity(0.7), lineWidth: 1))
                }
            }
        }
    }

    private var featured: some View {
        let story = StoryCatalog.stories[0]
        let progress = app.readingProgress(for: story, language: app.language)
        return NavigationLink(value: story) {
            VStack(alignment: .leading, spacing: 13) {
                HStack(alignment: .top, spacing: 17) {
                    BookCoverView(story: story, language: app.language)
                        .frame(width: 154, height: 226)
                    VStack(alignment: .leading, spacing: 10) {
                        Text(app.language == .english ? "FEATURED TALE" : "ОБРАНА КАЗКА")
                            .font(.caption2.weight(.black))
                            .tracking(2)
                            .foregroundStyle(VintagePalette.yellow)
                        Text(story.title(for: app.language))
                            .font(.system(size: 29, weight: .bold, design: .serif))
                            .foregroundStyle(VintagePalette.paperLight)
                        Text(story.subtitle(for: app.language))
                            .font(.system(.subheadline, design: .serif).italic())
                            .foregroundStyle(VintagePalette.paper.opacity(0.72))
                        Spacer()
                        Label(progress > 0 ? (app.language == .english ? "CONTINUE READING" : "ПРОДОВЖИТИ") : (app.language == .english ? "READ NOW" : "ЧИТАТИ"), systemImage: "arrow.right")
                            .font(.caption.weight(.black))
                            .tracking(1)
                            .foregroundStyle(VintagePalette.yellow)
                    }
                    .padding(.vertical, 8)
                }
                if progress > 0 {
                    ProgressView(value: progress)
                        .tint(VintagePalette.yellow)
                    Text("\(Int(progress * 100))% \(app.language == .english ? "READ" : "ПРОЧИТАНО")")
                        .font(.caption2.weight(.black))
                        .tracking(1.2)
                        .foregroundStyle(VintagePalette.paper.opacity(0.65))
                }
            }
            .padding(15)
            .background(Color.white.opacity(0.045))
            .overlay(Rectangle().stroke(VintagePalette.line.opacity(0.55), lineWidth: 1))
        }
        .buttonStyle(.plain)
    }

    private var storyGrid: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(app.language == .english ? "THE COMPLETE VOLUME" : "ПОВНИЙ ТОМ")
                .font(.caption.weight(.black))
                .tracking(2)
                .foregroundStyle(VintagePalette.paper.opacity(0.65))

            LazyVGrid(columns: columns, spacing: 20) {
                ForEach(StoryCatalog.stories) { story in
                    let progress = app.readingProgress(for: story, language: app.language)
                    NavigationLink(value: story) {
                        VStack(alignment: .leading, spacing: 9) {
                            BookCoverView(story: story, language: app.language, compact: true)
                                .aspectRatio(0.69, contentMode: .fit)
                            if progress > 0 {
                                ProgressView(value: progress)
                                    .tint(VintagePalette.yellow)
                                Text("\(Int(progress * 100))%")
                                    .font(.caption2.weight(.black))
                                    .foregroundStyle(VintagePalette.paper.opacity(0.65))
                            } else {
                                Text(app.language == .english ? "NOT STARTED" : "НЕ РОЗПОЧАТО")
                                    .font(.system(size: 9, weight: .black))
                                    .tracking(1)
                                    .foregroundStyle(VintagePalette.paper.opacity(0.42))
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

struct ReaderView: View {
    @EnvironmentObject private var app: AppState
    let story: Story

    @State private var selectedWord: String?
    @State private var translation: String = ""
    @State private var isTranslating = false
    @State private var practiceWord: SavedWord?
    @State private var scrollParagraph: Int?

    private var paragraphs: [String] {
        story.paragraphs(for: app.language)
    }

    private var progress: Double {
        app.readingProgress(for: story, language: app.language)
    }

    var body: some View {
        ZStack(alignment: .top) {
            VintagePalette.paper.ignoresSafeArea()

            ScrollView {
                LazyVStack(spacing: 0) {
                    readerHeader
                        .id(-1)
                    ornament
                    ForEach(Array(paragraphs.enumerated()), id: \.offset) { index, paragraph in
                        SelectableReaderText(
                            text: paragraph,
                            language: app.language,
                            selectedWord: $selectedWord
                        )
                        .id(index)
                        .padding(.bottom, 19)
                    }
                    ornament
                    Text(app.language == .english ? "END OF THE TALE" : "КІНЕЦЬ КАЗКИ")
                        .font(.caption.weight(.black))
                        .tracking(2)
                        .foregroundStyle(VintagePalette.oxblood)
                        .padding(.top, 18)
                        .padding(.bottom, 20)
                        .id(paragraphs.count)
                        .onAppear {
                            app.markStoryFinished(story, language: app.language)
                        }
                }
                .scrollTargetLayout()
                .padding(.horizontal, 24)
                .padding(.bottom, 36)
            }
            .scrollPosition(id: $scrollParagraph, anchor: .top)
            .padding(.top, 4)

            ProgressView(value: progress)
                .progressViewStyle(.linear)
                .tint(VintagePalette.oxblood)
                .background(VintagePalette.paper.opacity(0.9))
                .frame(height: 4)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(VintagePalette.walnut, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .principal) {
                VStack(spacing: 1) {
                    Text(story.title(for: app.language))
                        .font(.caption.bold())
                    Text("\(Int(progress * 100))%")
                        .font(.system(size: 9, weight: .black))
                        .foregroundStyle(VintagePalette.yellow)
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Picker("Language", selection: $app.language) {
                        ForEach(ReaderLanguage.allCases) { language in
                            Text("\(language.flag) \(language.rawValue)").tag(language)
                        }
                    }
                } label: {
                    Text("\(app.language.flag) \(app.language.rawValue)")
                        .font(.caption.bold())
                        .foregroundStyle(VintagePalette.yellow)
                }
            }
        }
        .onAppear { restorePosition() }
        .onChange(of: app.language) { _, _ in
            selectedWord = nil
            translation = ""
            scrollParagraph = nil
            restorePosition()
        }
        .onChange(of: scrollParagraph) { _, newValue in
            guard let newValue, newValue >= 0, newValue < paragraphs.count else { return }
            app.saveReadingPosition(newValue, for: story, language: app.language)
        }
        .onChange(of: selectedWord) { _, newValue in
            guard let newValue else { return }
            translation = ""
            isTranslating = true
            Task {
                translation = await app.translate(newValue, from: app.language)
                isTranslating = false
            }
        }
        .sheet(isPresented: Binding(
            get: { selectedWord != nil },
            set: { if !$0 { selectedWord = nil } }
        )) {
            if let selectedWord {
                TranslationSheet(
                    source: selectedWord,
                    translation: translation,
                    sourceLanguage: app.language,
                    example: sentence(containing: selectedWord),
                    isLoading: isTranslating,
                    practiceWord: $practiceWord
                )
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
            }
        }
        .fullScreenCover(item: $practiceWord) { word in
            PracticeView(word: word)
        }
    }

    private func restorePosition() {
        let saved = app.readingPosition(for: story, language: app.language)
        guard saved > 0 else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.12) {
            withAnimation(.none) { scrollParagraph = saved }
        }
    }

    private var readerHeader: some View {
        VStack(spacing: 13) {
            BookCoverView(story: story, language: app.language)
                .frame(width: 190, height: 278)
                .padding(.bottom, 12)
            Text(app.language == .english ? "UKRAINIAN FOLK TALE" : "УКРАЇНСЬКА НАРОДНА КАЗКА")
                .font(.caption2.weight(.black))
                .tracking(2.2)
                .foregroundStyle(VintagePalette.blue)
            Text(story.title(for: app.language))
                .font(.system(size: 42, weight: .bold, design: .serif))
                .multilineTextAlignment(.center)
                .foregroundStyle(VintagePalette.ink)
            Text(story.subtitle(for: app.language))
                .font(.system(.body, design: .serif).italic())
                .foregroundStyle(VintagePalette.line)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 30)
        .padding(.bottom, 22)
    }

    private var ornament: some View {
        Text("◆  ◇  ◆  ◇  ◆")
            .font(.caption)
            .tracking(4)
            .foregroundStyle(VintagePalette.oxblood)
            .padding(.vertical, 19)
    }

    private func sentence(containing word: String) -> String {
        let body = story.body(for: app.language)
        let parts = body.components(separatedBy: CharacterSet(charactersIn: ".!?…"))
        return parts.first(where: { $0.localizedCaseInsensitiveContains(word) })?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    }
}

private struct TranslationSheet: View {
    @EnvironmentObject private var app: AppState
    let source: String
    let translation: String
    let sourceLanguage: ReaderLanguage
    let example: String
    let isLoading: Bool
    @Binding var practiceWord: SavedWord?

    private var word: SavedWord {
        SavedWord(source: source, translation: translation, sourceLanguage: sourceLanguage, example: example)
    }

    var body: some View {
        ZStack {
            VintagePalette.paperLight.ignoresSafeArea()
            VStack(alignment: .leading, spacing: 18) {
                HStack {
                    Text(sourceLanguage == .english ? "SELECTED WORD" : "ВИБРАНЕ СЛОВО")
                        .font(.caption2.weight(.black))
                        .tracking(2)
                        .foregroundStyle(VintagePalette.blue)
                    Spacer()
                    Text(sourceLanguage.flag)
                }

                Text(source)
                    .font(.system(size: 42, weight: .bold, design: .serif))
                    .foregroundStyle(VintagePalette.ink)

                if isLoading {
                    ProgressView().tint(VintagePalette.blue)
                } else {
                    Text(translation.uppercased())
                        .font(.title3.weight(.black))
                        .tracking(1.2)
                        .foregroundStyle(VintagePalette.oxblood)
                }

                Divider().overlay(VintagePalette.line)

                if !example.isEmpty {
                    Text(sourceLanguage == .english ? "EXAMPLE FROM THE TALE" : "ПРИКЛАД ІЗ КАЗКИ")
                        .font(.caption2.weight(.black))
                        .tracking(1.5)
                        .foregroundStyle(VintagePalette.blue)
                    Text(example)
                        .font(.system(.body, design: .serif).italic())
                        .foregroundStyle(VintagePalette.ink.opacity(0.78))
                }

                Spacer(minLength: 4)

                HStack(spacing: 10) {
                    actionButton(sourceLanguage == .english ? "Listen" : "Слухати", icon: "speaker.wave.2.fill", color: VintagePalette.blue) {
                        app.speak(source, language: sourceLanguage)
                    }
                    actionButton(
                        app.isSaved(source: source, language: sourceLanguage) ? (sourceLanguage == .english ? "Saved" : "Збережено") : (sourceLanguage == .english ? "Save" : "Зберегти"),
                        icon: app.isSaved(source: source, language: sourceLanguage) ? "star.fill" : "star",
                        color: VintagePalette.oxblood
                    ) {
                        guard !translation.isEmpty else { return }
                        app.toggleSaved(word)
                    }
                }

                Button {
                    guard !translation.isEmpty else { return }
                    practiceWord = word
                } label: {
                    Label(sourceLanguage == .english ? "PRACTICE YOUR WRITING" : "ПРАКТИКУВАТИ ПИСЬМО", systemImage: "pencil.and.scribble")
                        .font(.caption.weight(.black))
                        .tracking(1)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 15)
                        .background(VintagePalette.ink)
                        .foregroundStyle(VintagePalette.yellow)
                }
                .disabled(isLoading || translation.isEmpty)
            }
            .padding(24)
        }
    }

    private func actionButton(_ title: String, icon: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Label(title.uppercased(), systemImage: icon)
                .font(.caption.weight(.black))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 13)
                .background(color)
                .foregroundStyle(.white)
        }
    }
}

struct VocabularyView: View {
    @EnvironmentObject private var app: AppState
    @State private var practiceWord: SavedWord?

    var body: some View {
        ZStack {
            VintagePalette.walnut.ignoresSafeArea()
            Group {
                if app.savedWords.isEmpty {
                    ContentUnavailableView(
                        app.language == .english ? "No Saved Words" : "Немає збережених слів",
                        systemImage: "character.book.closed",
                        description: Text(app.language == .english ? "Select a word while reading and save it here." : "Виділіть слово під час читання та збережіть його тут.")
                    )
                    .foregroundStyle(VintagePalette.paperLight)
                } else {
                    List {
                        ForEach(app.savedWords) { word in
                            Button {
                                practiceWord = word
                            } label: {
                                VStack(alignment: .leading, spacing: 6) {
                                    HStack {
                                        Text(word.source)
                                            .font(.system(.title3, design: .serif).weight(.bold))
                                        Spacer()
                                        if word.learned {
                                            Image(systemName: "checkmark.seal.fill")
                                                .foregroundStyle(.green)
                                        }
                                    }
                                    Text(word.translation.uppercased())
                                        .font(.caption.weight(.black))
                                        .foregroundStyle(VintagePalette.oxblood)
                                }
                                .padding(.vertical, 6)
                            }
                            .listRowBackground(VintagePalette.paperLight)
                            .foregroundStyle(VintagePalette.ink)
                        }
                    }
                    .scrollContentBackground(.hidden)
                }
            }
        }
        .navigationTitle(app.language == .english ? "Saved Words" : "Збережені слова")
        .toolbarBackground(VintagePalette.walnut, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .fullScreenCover(item: $practiceWord) { PracticeView(word: $0) }
    }
}

struct PracticeView: View {
    @EnvironmentObject private var app: AppState
    @Environment(\.dismiss) private var dismiss
    let word: SavedWord

    @State private var spelling = ""
    @State private var sentence = ""
    @State private var spellingPassed = false
    @State private var spellingFeedback: String?
    @State private var sentenceFeedback: String?

    private var answerLanguage: ReaderLanguage {
        word.sourceLanguage == .english ? .ukrainian : .english
    }

    private var expectedAnswer: String {
        word.translation.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    var body: some View {
        ZStack {
            VintagePalette.walnut.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 22) {
                    HStack {
                        VStack(alignment: .leading) {
                            Text(word.sourceLanguage == .english ? "WRITING PRACTICE" : "ПРАКТИКА ПИСЬМА")
                                .font(.caption2.weight(.black))
                                .tracking(2)
                                .foregroundStyle(VintagePalette.yellow)
                            Text("\(word.sourceLanguage.flag) → \(answerLanguage.flag)")
                                .foregroundStyle(VintagePalette.paper.opacity(0.7))
                        }
                        Spacer()
                        Button { dismiss() } label: {
                            Image(systemName: "xmark")
                                .font(.headline)
                                .padding(11)
                                .background(Color.white.opacity(0.08))
                                .clipShape(Circle())
                        }
                        .foregroundStyle(.white)
                    }

                    VStack(spacing: 8) {
                        Text(word.sourceLanguage == .english ? "TRANSLATION" : "ПЕРЕКЛАД")
                            .font(.caption2.weight(.black))
                            .tracking(2)
                            .foregroundStyle(VintagePalette.blue)
                        Text(word.source.uppercased())
                            .font(.system(size: 46, weight: .bold, design: .serif))
                            .foregroundStyle(VintagePalette.oxblood)
                            .multilineTextAlignment(.center)
                        Text(answerLanguage == .ukrainian ? "Write the Ukrainian word" : "Write the English word")
                            .font(.system(.subheadline, design: .serif).italic())
                            .foregroundStyle(VintagePalette.line)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(24)
                    .background(VintagePalette.paperLight)
                    .overlay(Rectangle().stroke(VintagePalette.line, lineWidth: 2))

                    VStack(alignment: .leading, spacing: 10) {
                        Text(word.sourceLanguage == .english ? "PRACTICE YOUR WRITING" : "ПРАКТИКУЙТЕ ПИСЬМО")
                            .font(.caption.weight(.black))
                            .tracking(1.5)
                            .foregroundStyle(VintagePalette.yellow)

                        HStack(spacing: 8) {
                            TextField("Type the word", text: $spelling)
                                .textInputAutocapitalization(.never)
                                .autocorrectionDisabled()
                                .padding(14)
                                .background(.white)
                                .foregroundStyle(VintagePalette.ink)
                            Button(action: verifySpelling) {
                                Image(systemName: "arrow.right")
                                    .font(.headline.weight(.black))
                                    .frame(width: 52, height: 52)
                                    .background(VintagePalette.blue)
                                    .foregroundStyle(.white)
                            }
                        }

                        if let spellingFeedback {
                            feedback(spellingFeedback, success: spellingPassed)
                        }
                    }

                    if spellingPassed {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("USE “\(expectedAnswer)” IN A PHRASE OR SENTENCE")
                                .font(.caption.weight(.black))
                                .tracking(1)
                                .foregroundStyle(VintagePalette.yellow)
                            TextEditor(text: $sentence)
                                .frame(minHeight: 120)
                                .padding(8)
                                .scrollContentBackground(.hidden)
                                .background(.white)
                                .foregroundStyle(VintagePalette.ink)
                            Button(action: verifySentence) {
                                Text("VERIFY SENTENCE  →")
                                    .font(.caption.weight(.black))
                                    .tracking(1)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 15)
                                    .background(VintagePalette.blue)
                                    .foregroundStyle(.white)
                            }
                            if let sentenceFeedback {
                                feedback(sentenceFeedback, success: sentenceFeedback.hasPrefix("✓"))
                            }
                        }
                    }
                }
                .padding(20)
            }
        }
    }

    @ViewBuilder
    private func feedback(_ text: String, success: Bool) -> some View {
        Text(text)
            .font(.system(.subheadline, design: .serif).weight(.bold))
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(12)
            .background(success ? Color.green.opacity(0.18) : VintagePalette.oxblood.opacity(0.24))
            .foregroundStyle(success ? Color.green : Color(red: 1, green: 0.72, blue: 0.65))
    }

    private func verifySpelling() {
        let typed = spelling.trimmingCharacters(in: .whitespacesAndNewlines)
        if typed.localizedCaseInsensitiveCompare(expectedAnswer) == .orderedSame {
            spellingPassed = true
            spellingFeedback = "✓ Correct"
        } else {
            spellingPassed = false
            spellingFeedback = "× Try again · Correct spelling: \(expectedAnswer)"
        }
    }

    private func verifySentence() {
        let trimmed = sentence.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.localizedCaseInsensitiveContains(expectedAnswer) else {
            sentenceFeedback = "× Use “\(expectedAnswer)” in the sentence."
            return
        }
        guard trimmed.split(whereSeparator: { $0.isWhitespace }).count >= 3 else {
            sentenceFeedback = "× Write at least three words."
            return
        }
        guard let first = trimmed.first, first.isUppercase else {
            sentenceFeedback = "× Start the sentence with a capital letter."
            return
        }
        guard let last = trimmed.last, ".!?…".contains(last) else {
            sentenceFeedback = "× Add punctuation at the end."
            return
        }
        sentenceFeedback = "✓ Well written"
        app.markLearned(word)
    }
}
