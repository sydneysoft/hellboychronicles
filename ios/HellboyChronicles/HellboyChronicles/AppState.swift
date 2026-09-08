import AVFoundation
import Foundation

@MainActor
final class AppState: ObservableObject {
    @Published var language: ReaderLanguage = .english
    @Published private(set) var savedWords: [SavedWord] = []

    private let savedWordsKey = "hellboy-native-saved-words-v1"
    private let speaker = AVSpeechSynthesizer()

    init() {
        loadSavedWords()
    }

    func isSaved(source: String, language: ReaderLanguage) -> Bool {
        savedWords.contains {
            $0.source.caseInsensitiveCompare(source) == .orderedSame && $0.sourceLanguage == language
        }
    }

    func toggleSaved(_ word: SavedWord) {
        if let index = savedWords.firstIndex(where: {
            $0.source.caseInsensitiveCompare(word.source) == .orderedSame && $0.sourceLanguage == word.sourceLanguage
        }) {
            savedWords.remove(at: index)
        } else {
            savedWords.insert(word, at: 0)
        }
        persistSavedWords()
    }

    func markLearned(_ word: SavedWord) {
        guard let index = savedWords.firstIndex(where: {
            $0.id == word.id || ($0.source.caseInsensitiveCompare(word.source) == .orderedSame && $0.sourceLanguage == word.sourceLanguage)
        }) else { return }
        savedWords[index].learned = true
        persistSavedWords()
    }

    func speak(_ text: String, language: ReaderLanguage) {
        speaker.stopSpeaking(at: .immediate)
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: language.localeIdentifier)
        utterance.rate = 0.43
        speaker.speak(utterance)
    }

    func translate(_ word: String, from source: ReaderLanguage) async -> String {
        let normalized = word
            .trimmingCharacters(in: .punctuationCharacters.union(.whitespacesAndNewlines))
            .lowercased()

        if let builtIn = Self.builtInTranslations[source]?[normalized] {
            return builtIn
        }

        let pair = source == .english ? "en|uk" : "uk|en"
        guard var components = URLComponents(string: "https://api.mymemory.translated.net/get") else {
            return "Translation unavailable"
        }
        components.queryItems = [
            URLQueryItem(name: "q", value: normalized),
            URLQueryItem(name: "langpair", value: pair)
        ]
        guard let url = components.url else { return "Translation unavailable" }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            guard (response as? HTTPURLResponse)?.statusCode == 200 else {
                return "Translation unavailable"
            }
            let decoded = try JSONDecoder().decode(MyMemoryResponse.self, from: data)
            return decoded.responseData.translatedText
        } catch {
            return "Translation unavailable"
        }
    }

    private func loadSavedWords() {
        guard let data = UserDefaults.standard.data(forKey: savedWordsKey),
              let words = try? JSONDecoder().decode([SavedWord].self, from: data) else { return }
        savedWords = words
    }

    private func persistSavedWords() {
        guard let data = try? JSONEncoder().encode(savedWords) else { return }
        UserDefaults.standard.set(data, forKey: savedWordsKey)
    }

    private struct MyMemoryResponse: Decodable {
        struct ResponseData: Decodable {
            let translatedText: String
        }
        let responseData: ResponseData
    }

    private static let builtInTranslations: [ReaderLanguage: [String: String]] = [
        .english: [
            "house": "будинок",
            "whitewashed": "побілений",
            "field": "поле",
            "grandfather": "дід",
            "grandmother": "баба",
            "garden": "город",
            "turnip": "ріпка",
            "earth": "земля",
            "mouse": "мишка",
            "dog": "собака",
            "cat": "кішка",
            "mitten": "рукавичка",
            "forest": "ліс",
            "snow": "сніг",
            "kindness": "доброта",
            "bear": "ведмідь",
            "wolf": "вовк",
            "fox": "лисиця",
            "rabbit": "заєць"
        ],
        .ukrainian: [
            "будинок": "house",
            "біленій": "whitewashed",
            "поле": "field",
            "дід": "grandfather",
            "баба": "grandmother",
            "город": "garden",
            "ріпка": "turnip",
            "земля": "earth",
            "мишка": "mouse",
            "собака": "dog",
            "кішка": "cat",
            "рукавичка": "mitten",
            "ліс": "forest",
            "сніг": "snow",
            "доброта": "kindness",
            "ведмідь": "bear",
            "вовк": "wolf",
            "лисиця": "fox",
            "заєць": "rabbit"
        ]
    ]
}
