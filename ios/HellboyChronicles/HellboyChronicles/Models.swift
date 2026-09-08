import Foundation

enum ReaderLanguage: String, CaseIterable, Identifiable, Codable {
    case english = "EN"
    case ukrainian = "UK"

    var id: String { rawValue }

    var localeIdentifier: String {
        self == .english ? "en-US" : "uk-UA"
    }

    var flag: String {
        self == .english ? "🇬🇧" : "🇺🇦"
    }
}

struct Story: Identifiable, Hashable {
    let id: String
    let title: String
    let ukrainianTitle: String
    let subtitle: String
    let ukrainianSubtitle: String
    let englishBody: String
    let ukrainianBody: String

    func title(for language: ReaderLanguage) -> String {
        language == .english ? title : ukrainianTitle
    }

    func subtitle(for language: ReaderLanguage) -> String {
        language == .english ? subtitle : ukrainianSubtitle
    }

    func body(for language: ReaderLanguage) -> String {
        language == .english ? englishBody : ukrainianBody
    }
}

struct SavedWord: Identifiable, Codable, Hashable {
    let id: UUID
    let source: String
    let translation: String
    let sourceLanguage: ReaderLanguage
    let example: String
    var learned: Bool

    init(
        id: UUID = UUID(),
        source: String,
        translation: String,
        sourceLanguage: ReaderLanguage,
        example: String,
        learned: Bool = false
    ) {
        self.id = id
        self.source = source
        self.translation = translation
        self.sourceLanguage = sourceLanguage
        self.example = example
        self.learned = learned
    }
}
