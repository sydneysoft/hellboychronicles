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
}

struct RootView: View {
    @EnvironmentObject private var app: AppState

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

struct LibraryView: View {
    @EnvironmentObject private var app: AppState

    var body: some View {
        ZStack {
            VintagePalette.walnut.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    header
                    languagePicker
                    featured
                    storyList
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 40)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text("THE FOLK LIBRARY")
                .font(.caption.weight(.bold))
                .tracking(3)
                .foregroundStyle(VintagePalette.yellow)
            Text("Ukrainian\nFolk Tales")
                .font(.system(size: 52, weight: .bold, design: .serif))
                .foregroundStyle(VintagePalette.paperLight)
                .lineSpacing(-8)
            Text("A native reading and language-learning edition.")
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
                        .padding(.vertical, 9)
                        .frame(maxWidth: .infinity)
                        .background(app.language == language ? VintagePalette.yellow : Color.white.opacity(0.08))
                        .foregroundStyle(app.language == language ? VintagePalette.ink : VintagePalette.paperLight)
                        .overlay(Rectangle().stroke(VintagePalette.line.opacity(0.7), lineWidth: 1))
                }
            }
        }
    }

    private var featured: some View {
        NavigationLink(value: StoryCatalog.stories[0]) {
            ZStack(alignment: .bottomLeading) {
                LinearGradient(
                    colors: [VintagePalette.blue.opacity(0.9), VintagePalette.oxblood.opacity(0.95)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                VStack(alignment: .leading, spacing: 9) {
                    Text("VOLUME I · FEATURED")
                        .font(.caption2.weight(.black))
                        .tracking(2.2)
                        .foregroundStyle(VintagePalette.yellow)
                    Spacer()
                    Text(StoryCatalog.stories[0].title(for: app.language).uppercased())
                        .font(.system(size: 39, weight: .black, design: .serif))
                        .foregroundStyle(.white)
                    Text(StoryCatalog.stories[0].subtitle(for: app.language))
                        .font(.system(.body, design: .serif).italic())
                        .foregroundStyle(.white.opacity(0.8))
                    Label("READ NOW", systemImage: "arrow.right")
                        .font(.caption.weight(.black))
                        .tracking(1.5)
                        .foregroundStyle(VintagePalette.yellow)
                }
                .padding(22)
            }
            .frame(height: 250)
            .overlay(Rectangle().stroke(VintagePalette.yellow.opacity(0.7), lineWidth: 1))
            .shadow(color: .black.opacity(0.35), radius: 18, y: 12)
        }
        .buttonStyle(.plain)
        .navigationDestination(for: Story.self) { story in
            ReaderView(story: story)
        }
    }

    private var storyList: some View {
        VStack(alignment: .leading, spacing: 13) {
            Text("IN THIS EDITION")
                .font(.caption.weight(.black))
                .tracking(2)
                .foregroundStyle(VintagePalette.paper.opacity(0.65))

            ForEach(Array(StoryCatalog.stories.enumerated()), id: \.element.id) { index, story in
                NavigationLink(value: story) {
                    HStack(spacing: 14) {
                        Text(String(format: "%02d", index + 1))
                            .font(.system(.title3, design: .serif).weight(.bold))
                            .foregroundStyle(VintagePalette.oxblood)
                            .frame(width: 42, height: 58)
                            .background(VintagePalette.paperLight)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(story.title(for: app.language))
                                .font(.system(.title3, design: .serif).weight(.bold))
                                .foregroundStyle(VintagePalette.paperLight)
                            Text(story.subtitle(for: app.language))
                                .font(.system(.caption, design: .serif).italic())
                                .foregroundStyle(VintagePalette.paper.opacity(0.66))
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundStyle(VintagePalette.yellow)
                    }
                    .padding(.vertical, 4)
                }
                .buttonStyle(.plain)
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

    var body: some View {
        ZStack {
            VintagePalette.paper.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 0) {
                    readerHeader
                    ornament
                    SelectableReaderText(
                        text: story.body(for: app.language),
                        language: app.language,
                        selectedWord: $selectedWord
                    )
                    .frame(maxWidth: .infinity)
                    ornament
                    Text(app.language == .english ? "END OF THE TALE" : "КІНЕЦЬ КАЗКИ")
                        .font(.caption.weight(.black))
                        .tracking(2)
                        .foregroundStyle(VintagePalette.oxblood)
                        .padding(.top, 24)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 50)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(VintagePalette.walnut, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .toolbar {
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

    private var readerHeader: some View {
        VStack(spacing: 8) {
            Text(app.language == .english ? "UKRAINIAN FOLK TALE" : "УКРАЇНСЬКА НАРОДНА КАЗКА")
                .font(.caption2.weight(.black))
                .tracking(2.2)
                .foregroundStyle(VintagePalette.blue)
            Text(story.title(for: app.language))
                .font(.system(size: 46, weight: .bold, design: .serif))
                .multilineTextAlignment(.center)
                .foregroundStyle(VintagePalette.ink)
            Text(story.subtitle(for: app.language))
                .font(.system(.body, design: .serif).italic())
                .foregroundStyle(VintagePalette.line)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 34)
        .padding(.bottom, 28)
    }

    private var ornament: some View {
        Text("◆  ◇  ◆  ◇  ◆")
            .font(.caption)
            .tracking(4)
            .foregroundStyle(VintagePalette.oxblood)
            .padding(.vertical, 22)
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
                    Text("SELECTED WORD")
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
                    Text("EXAMPLE FROM THE TALE")
                        .font(.caption2.weight(.black))
                        .tracking(1.5)
                        .foregroundStyle(VintagePalette.blue)
                    Text(example)
                        .font(.system(.body, design: .serif).italic())
                        .foregroundStyle(VintagePalette.ink.opacity(0.78))
                }

                Spacer(minLength: 4)

                HStack(spacing: 10) {
                    actionButton("Listen", icon: "speaker.wave.2.fill", color: VintagePalette.blue) {
                        app.speak(source, language: sourceLanguage)
                    }
                    actionButton(app.isSaved(source: source, language: sourceLanguage) ? "Saved" : "Save", icon: app.isSaved(source: source, language: sourceLanguage) ? "star.fill" : "star", color: VintagePalette.oxblood) {
                        guard !translation.isEmpty else { return }
                        app.toggleSaved(word)
                    }
                }

                Button {
                    guard !translation.isEmpty else { return }
                    practiceWord = word
                } label: {
                    Label("PRACTICE YOUR WRITING", systemImage: "pencil.and.scribble")
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
                        "No Saved Words",
                        systemImage: "character.book.closed",
                        description: Text("Select a word while reading and save it here.")
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
        .navigationTitle("Saved Words")
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
                            Text("WRITING PRACTICE")
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
                        Text("TRANSLATION")
                            .font(.caption2.weight(.black))
                            .tracking(2)
                            .foregroundStyle(VintagePalette.blue)
                        Text(word.source.uppercased())
                            .font(.system(size: 46, weight: .bold, design: .serif))
                            .foregroundStyle(VintagePalette.oxblood)
                            .multilineTextAlignment(.center)
                        Text("Write the \(answerLanguage == .ukrainian ? "Ukrainian" : "English") word")
                            .font(.system(.subheadline, design: .serif).italic())
                            .foregroundStyle(VintagePalette.line)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(24)
                    .background(VintagePalette.paperLight)
                    .overlay(Rectangle().stroke(VintagePalette.line, lineWidth: 2))

                    VStack(alignment: .leading, spacing: 10) {
                        Text("PRACTICE YOUR WRITING")
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
