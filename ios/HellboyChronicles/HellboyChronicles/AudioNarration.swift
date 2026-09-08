import AVFoundation
import Combine
import Foundation

enum StoryVoiceRole: String, CaseIterable {
    case narrator
    case male
    case female
    case child
    case creature

    func label(for language: ReaderLanguage) -> String {
        switch (self, language) {
        case (.narrator, .english): return "Narrator"
        case (.male, .english): return "Male character"
        case (.female, .english): return "Female character"
        case (.child, .english): return "Young character"
        case (.creature, .english): return "Creature"
        case (.narrator, .ukrainian): return "Оповідач"
        case (.male, .ukrainian): return "Чоловічий персонаж"
        case (.female, .ukrainian): return "Жіночий персонаж"
        case (.child, .ukrainian): return "Юний персонаж"
        case (.creature, .ukrainian): return "Казковий персонаж"
        }
    }

    var pitch: Float {
        switch self {
        case .narrator: return 0.98
        case .male: return 0.84
        case .female: return 1.10
        case .child: return 1.22
        case .creature: return 0.72
        }
    }
}

struct StoryAudioSegment: Identifiable, Equatable {
    let id = UUID()
    let paragraphIndex: Int
    let text: String
    let role: StoryVoiceRole
}

final class StoryAudioEngine: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
    @Published private(set) var isPlaying = false
    @Published private(set) var isPaused = false
    @Published private(set) var currentSegmentIndex = 0
    @Published private(set) var currentParagraph = 0
    @Published private(set) var currentRole: StoryVoiceRole = .narrator
    @Published private(set) var segmentCount = 0
    @Published var speed: Float = 1.0

    private let synthesizer = AVSpeechSynthesizer()
    private var segments: [StoryAudioSegment] = []
    private var language: ReaderLanguage = .english

    override init() {
        super.init()
        synthesizer.delegate = self
    }

    var progress: Double {
        guard segmentCount > 0 else { return 0 }
        return min(1, max(0, Double(currentSegmentIndex + 1) / Double(segmentCount)))
    }

    func prepare(story: Story, language: ReaderLanguage, startParagraph: Int = 0) {
        stop()
        self.language = language
        segments = StoryAudioParser.segments(for: story, language: language)
        segmentCount = segments.count
        if let index = segments.firstIndex(where: { $0.paragraphIndex >= startParagraph }) {
            currentSegmentIndex = index
        } else {
            currentSegmentIndex = 0
        }
        updateCurrentMetadata()
    }

    func play() {
        guard !segments.isEmpty else { return }
        if synthesizer.isPaused {
            synthesizer.continueSpeaking()
            isPaused = false
            isPlaying = true
            return
        }
        if synthesizer.isSpeaking { return }
        speakCurrent()
    }

    func pause() {
        guard synthesizer.isSpeaking else { return }
        if synthesizer.pauseSpeaking(at: .word) {
            isPaused = true
            isPlaying = false
        }
    }

    func togglePlayPause() {
        if synthesizer.isSpeaking {
            pause()
        } else {
            play()
        }
    }

    func stop() {
        synthesizer.stopSpeaking(at: .immediate)
        isPlaying = false
        isPaused = false
    }

    func previous() {
        guard !segments.isEmpty else { return }
        synthesizer.stopSpeaking(at: .immediate)
        currentSegmentIndex = max(0, currentSegmentIndex - 1)
        updateCurrentMetadata()
        speakCurrent()
    }

    func next() {
        guard !segments.isEmpty else { return }
        synthesizer.stopSpeaking(at: .immediate)
        currentSegmentIndex = min(segments.count - 1, currentSegmentIndex + 1)
        updateCurrentMetadata()
        speakCurrent()
    }

    func seek(toParagraph paragraph: Int) {
        guard let index = segments.firstIndex(where: { $0.paragraphIndex >= paragraph }) else { return }
        let wasActive = synthesizer.isSpeaking || synthesizer.isPaused
        synthesizer.stopSpeaking(at: .immediate)
        currentSegmentIndex = index
        updateCurrentMetadata()
        if wasActive { speakCurrent() }
    }

    func cycleSpeed() {
        if speed < 0.95 { speed = 1.0 }
        else if speed < 1.12 { speed = 1.2 }
        else if speed < 1.32 { speed = 1.4 }
        else { speed = 0.85 }
    }

    private func speakCurrent() {
        guard segments.indices.contains(currentSegmentIndex) else { return }
        let segment = segments[currentSegmentIndex]
        updateCurrentMetadata()

        let utterance = AVSpeechUtterance(string: segment.text)
        utterance.voice = voice(for: segment.role, language: language)
        utterance.rate = min(0.60, max(0.32, 0.43 * speed))
        utterance.pitchMultiplier = segment.role.pitch
        utterance.preUtteranceDelay = segment.role == .narrator ? 0.04 : 0.12
        utterance.postUtteranceDelay = 0.08
        synthesizer.speak(utterance)
        isPlaying = true
        isPaused = false
    }

    private func updateCurrentMetadata() {
        guard segments.indices.contains(currentSegmentIndex) else {
            currentParagraph = 0
            currentRole = .narrator
            return
        }
        currentParagraph = segments[currentSegmentIndex].paragraphIndex
        currentRole = segments[currentSegmentIndex].role
    }

    private func voice(for role: StoryVoiceRole, language: ReaderLanguage) -> AVSpeechSynthesisVoice? {
        let languagePrefix = language == .english ? "en" : "uk"
        let locale = language.localeIdentifier
        let voices = AVSpeechSynthesisVoice.speechVoices()
            .filter { $0.language.lowercased().hasPrefix(languagePrefix) }
            .sorted {
                if $0.quality.rawValue != $1.quality.rawValue {
                    return $0.quality.rawValue > $1.quality.rawValue
                }
                return $0.name < $1.name
            }

        let preferredNames: [String]
        switch (language, role) {
        case (.english, .narrator): preferredNames = ["Samantha", "Daniel", "Ava", "Alex"]
        case (.english, .male): preferredNames = ["Daniel", "Aaron", "Alex", "Fred", "Tom"]
        case (.english, .female): preferredNames = ["Samantha", "Ava", "Karen", "Moira", "Tessa", "Victoria"]
        case (.english, .child): preferredNames = ["Junior", "Samantha", "Ava"]
        case (.english, .creature): preferredNames = ["Fred", "Daniel", "Alex"]
        case (.ukrainian, .narrator): preferredNames = ["Lesya", "Ostap"]
        case (.ukrainian, .male): preferredNames = ["Ostap", "Lesya"]
        case (.ukrainian, .female): preferredNames = ["Lesya", "Ostap"]
        case (.ukrainian, .child): preferredNames = ["Lesya", "Ostap"]
        case (.ukrainian, .creature): preferredNames = ["Ostap", "Lesya"]
        }

        for preferred in preferredNames {
            if let match = voices.first(where: { $0.name.localizedCaseInsensitiveContains(preferred) }) {
                return match
            }
        }

        guard !voices.isEmpty else { return AVSpeechSynthesisVoice(language: locale) }
        let roleIndex: Int
        switch role {
        case .narrator: roleIndex = 0
        case .male: roleIndex = 1
        case .female: roleIndex = 2
        case .child: roleIndex = 3
        case .creature: roleIndex = 4
        }
        return voices[min(roleIndex, voices.count - 1)]
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            if self.currentSegmentIndex + 1 < self.segments.count {
                self.currentSegmentIndex += 1
                self.speakCurrent()
            } else {
                self.isPlaying = false
                self.isPaused = false
            }
        }
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        DispatchQueue.main.async { [weak self] in
            self?.isPlaying = false
            self?.isPaused = false
        }
    }
}

private enum StoryAudioParser {
    private struct VoiceHint {
        let terms: [String]
        let role: StoryVoiceRole
    }

    static func segments(for story: Story, language: ReaderLanguage) -> [StoryAudioSegment] {
        story.paragraphs(for: language).enumerated().flatMap { index, paragraph in
            split(paragraph: paragraph, paragraphIndex: index, language: language)
        }
    }

    private static func split(paragraph: String, paragraphIndex: Int, language: ReaderLanguage) -> [StoryAudioSegment] {
        if paragraph.hasPrefix("—") {
            return [StoryAudioSegment(paragraphIndex: paragraphIndex, text: paragraph, role: inferRole(in: paragraph, near: 0, language: language))]
        }

        let pattern = "“([^”]+)”|«([^»]+)»|\\\"([^\\\"]+)\\\""
        guard let regex = try? NSRegularExpression(pattern: pattern) else {
            return [StoryAudioSegment(paragraphIndex: paragraphIndex, text: paragraph, role: .narrator)]
        }

        let source = paragraph as NSString
        let matches = regex.matches(in: paragraph, range: NSRange(location: 0, length: source.length))
        guard !matches.isEmpty else {
            return [StoryAudioSegment(paragraphIndex: paragraphIndex, text: paragraph, role: .narrator)]
        }

        var result: [StoryAudioSegment] = []
        var cursor = 0

        for match in matches {
            if match.range.location > cursor {
                let narrative = source.substring(with: NSRange(location: cursor, length: match.range.location - cursor))
                    .trimmingCharacters(in: .whitespacesAndNewlines)
                if !narrative.isEmpty {
                    result.append(StoryAudioSegment(paragraphIndex: paragraphIndex, text: narrative, role: .narrator))
                }
            }

            let quoted = source.substring(with: match.range)
                .dropFirst()
                .dropLast()
                .trimmingCharacters(in: .whitespacesAndNewlines)
            if !quoted.isEmpty {
                let role = inferRole(in: paragraph, near: match.range.location, language: language)
                result.append(StoryAudioSegment(paragraphIndex: paragraphIndex, text: quoted, role: role))
            }
            cursor = NSMaxRange(match.range)
        }

        if cursor < source.length {
            let narrative = source.substring(from: cursor).trimmingCharacters(in: .whitespacesAndNewlines)
            if !narrative.isEmpty {
                result.append(StoryAudioSegment(paragraphIndex: paragraphIndex, text: narrative, role: .narrator))
            }
        }

        return result.isEmpty ? [StoryAudioSegment(paragraphIndex: paragraphIndex, text: paragraph, role: .narrator)] : result
    }

    private static func inferRole(in paragraph: String, near location: Int, language: ReaderLanguage) -> StoryVoiceRole {
        let hints: [VoiceHint]
        if language == .english {
            hints = [
                VoiceHint(terms: ["ivasyk", "boy", "girl", "granddaughter", "young goose", "son"], role: .child),
                VoiceHint(terms: ["grandmother", "old woman", "mother", "woman", "daughter", "fox", "goat", "mouse", "duck", "princess", "dragoness", "wife"], role: .female),
                VoiceHint(terms: ["grandfather", "old man", "father", "master", "king", "misha", "cat", "rooster", "sirko", "wolf", "bear", "boar", "rabbit", "crayfish", "husband", "kotyhoroshko", "pan kotskyi"], role: .male),
                VoiceHint(terms: ["dragon", "oh"], role: .creature)
            ]
        } else {
            hints = [
                VoiceHint(terms: ["івасик", "хлоп", "дівчин", "онуч", "син", "гусен"], role: .child),
                VoiceHint(terms: ["баба", "мати", "жінк", "доньк", "лисиц", "лисич", "коза", "мишк", "кач", "царівн", "змія", "дружин"], role: .female),
                VoiceHint(terms: ["дід", "батько", "господар", "цар", "міша", "котик", "півник", "сірко", "вовк", "ведмід", "кабан", "заєць", "рак", "чоловік", "котигорошко", "пан коцький"], role: .male),
                VoiceHint(terms: ["змій", "ох"], role: .creature)
            ]
        }

        let source = paragraph.lowercased() as NSString
        let start = max(0, location - 150)
        let end = min(source.length, location + 110)
        let searchRange = NSRange(location: start, length: max(0, end - start))
        var best: (distance: Int, role: StoryVoiceRole)?

        for hint in hints {
            for term in hint.terms {
                var cursor = searchRange.location
                while cursor < NSMaxRange(searchRange) {
                    let remaining = NSRange(location: cursor, length: NSMaxRange(searchRange) - cursor)
                    let found = source.range(of: term, options: [], range: remaining)
                    if found.location == NSNotFound { break }
                    let distance = abs(found.location - location)
                    if best == nil || distance < best!.distance {
                        best = (distance, hint.role)
                    }
                    cursor = max(found.location + max(found.length, 1), cursor + 1)
                }
            }
        }

        return best?.role ?? .narrator
    }
}
