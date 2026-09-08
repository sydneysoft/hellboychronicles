# Hellboy Chronicles — Native iOS app

This folder contains the SwiftUI-first iOS application for the Folk Tales reader.

## Current native MVP

- Vintage Ukrainian book-inspired library UI
- All 13 Volume I folk tales bundled in English and Ukrainian
- Unique native SwiftUI book-cover treatment for every tale
- English / Ukrainian reader switching with language preference remembered
- Native selectable text through `UITextView`
- Selected-word translation sheet
- Text-to-speech pronunciation
- Saved vocabulary stored with `UserDefaults`
- Writing practice: spelling check, then sentence check
- Learned-word state
- Per-story, per-language reading position saved automatically
- Continue-reading restoration and progress percentages in the library and reader
- Native iOS asset catalog and 1024×1024 Folk Tales app icon
- Story-level audiobook controls with play/pause, previous/next segment, stop and speed control
- Character-aware narration: narrator, male, female, young-character and creature voice treatments
- English and Ukrainian speech voices selected from the best matching voices installed on the device
- Audio progress updates the same reading-position system used by visual reading
- Background audio mode enabled for audiobook-style listening

## Audio architecture

The story audio engine is independent of the visual reader. The text reader currently discovers the open tale and exposes the global audiobook bar automatically. The same `ReadingContextStore` + `StoryAudioEngine` is intended to be reused by the native graphic-novel reader, so text and illustrated pages can play the same character-aware narration without maintaining two audio systems.

Dialogue is currently split from narration automatically and assigned a role from nearby story context. For a production voice-cast pass, dialogue can be tagged explicitly by character so each recurring character has one consistent voice across every scene.

## Run

1. Open `HellboyChronicles.xcodeproj` in Xcode 16 or later.
2. Select an iPhone simulator or your connected iPhone.
3. In Signing & Capabilities, choose your Apple Developer Team.
4. Build and run.

Bundle identifier: `com.sydneysoft.hellboychronicles`
Minimum target: iOS 17.0

## Next distribution step

Create/sign an App Store Connect build and upload it to TestFlight. Once the build is processed, add the intended Apple ID as an internal tester and install the app from TestFlight on the iPhone.
