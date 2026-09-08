import SwiftUI

final class ReadingContextStore: ObservableObject {
    static let shared = ReadingContextStore()

    @Published private(set) var story: Story?
    @Published private(set) var language: ReaderLanguage = .english

    private init() {}

    func detectStory(containing paragraph: String, language: ReaderLanguage) {
        guard let match = StoryCatalog.stories.first(where: { story in
            story.paragraphs(for: language).contains(paragraph)
        }) else { return }

        if story?.id != match.id || self.language != language {
            story = match
            self.language = language
        }
    }
}

private enum AudioPalette {
    static let paper = Color(red: 0.97, green: 0.93, blue: 0.84)
    static let walnut = Color(red: 0.13, green: 0.075, blue: 0.04)
    static let ink = Color(red: 0.16, green: 0.11, blue: 0.07)
    static let blue = Color(red: 0.00, green: 0.34, blue: 0.72)
    static let yellow = Color(red: 1.00, green: 0.83, blue: 0.00)
    static let oxblood = Color(red: 0.52, green: 0.10, blue: 0.08)
}

struct GlobalStoryAudioBar: View {
    @EnvironmentObject private var app: AppState
    @ObservedObject var context: ReadingContextStore
    @StateObject private var engine = StoryAudioEngine()
    @State private var expanded = false

    var body: some View {
        Group {
            if let story = context.story {
                if expanded || engine.isPlaying || engine.isPaused {
                    expandedPlayer(story: story)
                } else {
                    compactButton(story: story)
                }
            }
        }
        .padding(.horizontal, 14)
        .onChange(of: context.story?.id) { _, _ in
            prepareCurrentStory()
        }
        .onChange(of: context.language) { _, _ in
            prepareCurrentStory()
        }
        .onChange(of: engine.currentParagraph) { _, paragraph in
            guard let story = context.story else { return }
            app.saveReadingPosition(paragraph, for: story, language: context.language)
        }
    }

    private func compactButton(story: Story) -> some View {
        Button {
            prepareIfNeeded()
            withAnimation(.snappy) { expanded = true }
        } label: {
            HStack(spacing: 11) {
                Image(systemName: "headphones")
                    .font(.headline.weight(.bold))
                    .foregroundStyle(AudioPalette.yellow)
                VStack(alignment: .leading, spacing: 2) {
                    Text(context.language == .english ? "AUDIOBOOK" : "АУДІОКНИГА")
                        .font(.system(size: 9, weight: .black))
                        .tracking(1.6)
                        .foregroundStyle(AudioPalette.yellow)
                    Text(context.language == .english ? "Listen to \(story.title(for: context.language))" : "Слухати: \(story.title(for: context.language))")
                        .font(.system(.caption, design: .serif).weight(.semibold))
                        .foregroundStyle(AudioPalette.paper)
                        .lineLimit(1)
                }
                Spacer()
                Image(systemName: "play.fill")
                    .foregroundStyle(.white)
            }
            .padding(.horizontal, 15)
            .padding(.vertical, 11)
            .background(AudioPalette.walnut.opacity(0.97))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(AudioPalette.yellow.opacity(0.42), lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .shadow(color: .black.opacity(0.28), radius: 10, y: 5)
        }
        .buttonStyle(.plain)
    }

    private func expandedPlayer(story: Story) -> some View {
        VStack(spacing: 10) {
            HStack(spacing: 10) {
                Image(systemName: "waveform.circle.fill")
                    .font(.title2)
                    .foregroundStyle(AudioPalette.yellow)

                VStack(alignment: .leading, spacing: 2) {
                    Text(story.title(for: context.language))
                        .font(.system(.subheadline, design: .serif).weight(.bold))
                        .foregroundStyle(AudioPalette.paper)
                        .lineLimit(1)
                    Text(engine.currentRole.label(for: context.language).uppercased())
                        .font(.system(size: 9, weight: .black))
                        .tracking(1.2)
                        .foregroundStyle(roleColor)
                }

                Spacer()

                Button {
                    withAnimation(.snappy) { expanded = false }
                } label: {
                    Image(systemName: "chevron.down")
                        .foregroundStyle(AudioPalette.paper)
                        .padding(7)
                }
            }

            ProgressView(value: engine.progress)
                .tint(AudioPalette.yellow)

            HStack(spacing: 15) {
                Button { engine.previous() } label: {
                    Image(systemName: "backward.end.fill")
                }

                Button {
                    prepareIfNeeded()
                    engine.togglePlayPause()
                } label: {
                    Image(systemName: engine.isPlaying ? "pause.fill" : "play.fill")
                        .font(.title3.weight(.black))
                        .frame(width: 48, height: 48)
                        .background(AudioPalette.yellow)
                        .foregroundStyle(AudioPalette.ink)
                        .clipShape(Circle())
                }

                Button { engine.next() } label: {
                    Image(systemName: "forward.end.fill")
                }

                Spacer()

                Button { engine.cycleSpeed() } label: {
                    Text(String(format: "%.2gx", engine.speed))
                        .font(.caption.weight(.black))
                        .frame(minWidth: 42)
                }

                Button { engine.stop() } label: {
                    Image(systemName: "stop.fill")
                }
            }
            .font(.headline)
            .foregroundStyle(AudioPalette.paper)
        }
        .padding(15)
        .background(AudioPalette.walnut.opacity(0.98))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(AudioPalette.yellow.opacity(0.45), lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .shadow(color: .black.opacity(0.35), radius: 14, y: 6)
    }

    private var roleColor: Color {
        switch engine.currentRole {
        case .narrator: return AudioPalette.yellow
        case .male: return AudioPalette.blue
        case .female: return Color(red: 0.95, green: 0.45, blue: 0.62)
        case .child: return Color(red: 0.32, green: 0.72, blue: 0.45)
        case .creature: return AudioPalette.oxblood
        }
    }

    private func prepareIfNeeded() {
        guard engine.segmentCount == 0 else { return }
        prepareCurrentStory()
    }

    private func prepareCurrentStory() {
        guard let story = context.story else { return }
        let paragraph = app.readingPosition(for: story, language: context.language)
        engine.prepare(story: story, language: context.language, startParagraph: paragraph)
    }
}
