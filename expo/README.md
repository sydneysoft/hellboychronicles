# Hellboy Chronicles — Expo app

Parallel React Native / Expo version of Hellboy Chronicles. The existing website and `ios/` SwiftUI app are untouched.

## Why Expo SDK 54?

The physical iPhone App Store build of Expo Go currently supports SDK 54, so this project intentionally targets Expo SDK 54 for easy testing from your phone.

## First run

From the repository root:

```bash
cd expo
npm install
npx expo-doctor@latest
npx expo start --tunnel
```

Then open Expo Go on your iPhone and scan the QR code.

If your iPhone and laptop are on the same Wi-Fi, you can use:

```bash
npm start
```

## Current MVP

- Premium vintage Ukrainian folk design
- All 13 folk-tale titles in English and Ukrainian
- English / Ukrainian language switch
- Native React Native story reader
- Tap individual words while reading
- Save vocabulary locally with AsyncStorage
- Saved Words screen
- Writing-practice check for selected words
- Native pronunciation for selected words
- Audiobook controls using `expo-speech`
- iOS pause/resume via native speech APIs

## Notes

On a physical iPhone, `expo-speech` may be silent when the phone is in Silent Mode. Turn Silent Mode off when testing narration.

This is the first runnable Expo MVP. Next iterations can import the complete long-form story corpus, richer translation/practice logic, reading progress, the shooting comprehension game, cover artwork, and EAS/TestFlight distribution.
