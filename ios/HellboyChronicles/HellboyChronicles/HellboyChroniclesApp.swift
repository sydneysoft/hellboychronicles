import SwiftUI

@main
struct HellboyChroniclesApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var readingContext = ReadingContextStore.shared

    var body: some Scene {
        WindowGroup {
            ZStack(alignment: .bottom) {
                RootView()

                GlobalStoryAudioBar(context: readingContext)
                    .padding(.bottom, 58)
                    .zIndex(10)
            }
            .environmentObject(appState)
            .preferredColorScheme(.dark)
        }
    }
}
