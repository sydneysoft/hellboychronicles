# Hellboy Chronicles — Native iOS app

This folder contains the SwiftUI-first iOS application for the Folk Tales reader.

## Current native MVP

- Vintage Ukrainian book-inspired library UI
- English / Ukrainian reader switching
- Native selectable text through `UITextView`
- Selected-word translation sheet
- Text-to-speech pronunciation
- Saved vocabulary stored with `UserDefaults`
- Writing practice: spelling check, then sentence check
- Learned-word state
- Two bundled stories for the first native build: The Turnip and The Mitten

## Run

1. Open `HellboyChronicles.xcodeproj` in Xcode 16 or later.
2. Select an iPhone simulator or your connected iPhone.
3. In Signing & Capabilities, choose your Apple Developer Team.
4. Build and run.

Bundle identifier: `com.sydneysoft.hellboychronicles`
Minimum target: iOS 17.0

The next content pass should move all 13 folk tales into a shared JSON content package so the website and native app consume the same source of truth.
