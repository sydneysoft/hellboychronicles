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

## Run

1. Open `HellboyChronicles.xcodeproj` in Xcode 16 or later.
2. Select an iPhone simulator or your connected iPhone.
3. In Signing & Capabilities, choose your Apple Developer Team.
4. Build and run.

Bundle identifier: `com.sydneysoft.hellboychronicles`
Minimum target: iOS 17.0

## Next distribution step

Create/sign an App Store Connect build and upload it to TestFlight. Once the build is processed, add the intended Apple ID as an internal tester and install the app from TestFlight on the iPhone.
