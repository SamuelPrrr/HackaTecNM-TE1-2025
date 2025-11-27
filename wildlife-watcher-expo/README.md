# Wildlife Watcher Mobile

React Native mobile app for the Wildlife Watcher project, built with Expo.

## Overview

This is a mobile port of the wildlife-watcher web application, featuring:
- 🏠 **Dashboard** - Monitor connection status and recent detections
- 🎯 **Models** - Select and activate AI processing models
- 🗺️ **Map View** - Visualize species distribution on an interactive map
- 📊 **Data** - Manage and sync collected data

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for bottom tab navigation
- **React Native Maps** for map visualization (replaces Leaflet)
- **Lucide React Native** for icons
- **Custom UI Components** adapted from Shadcn/ui

## Component Mapping

### Web → React Native
- `<div>` → `<View>`
- `<button>` → `<TouchableOpacity>`
- `<input>` → `<TextInput>`
- `<p>`, `<h1>`, etc. → `<Text>`
- Tailwind CSS → StyleSheet API

### Library Replacements
- `react-router-dom` → `@react-navigation/native`
- `leaflet` → `react-native-maps`
- `radix-ui` → Custom React Native components
- `lucide-react` → `lucide-react-native`

## Project Structure

```
wildlife-watcher-mobile/
├── App.js                 # Entry point
├── src/
│   ├── screens/          # Screen components
│   │   ├── Dashboard.tsx
│   │   ├── Models.tsx
│   │   ├── MapView.tsx
│   │   └── Data.tsx
│   ├── components/       # Reusable UI components
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── navigation/       # Navigation setup
│   │   └── TabNavigator.tsx
│   └── theme/           # Theme and styling
│       └── colors.ts
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on a platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

## Features

### Dashboard Screen
- Connection status with Raspberry Pi
- Quick stats (species detected, active sensors)
- Recent detections list
- Toggle connect/disconnect

### Models Screen
- Three AI models: Audio Processing, Motion Detection, Species Recognition
- Active model indicator
- Feature lists for each model
- Model activation controls

### Map View Screen
- Interactive map with detection markers
- Stats cards (active locations, detections today)
- Top species list with trends
- Uses `react-native-maps` for native map rendering

### Data Screen
- Cloud synchronization status
- Pending records counter
- Search and filter functionality
- Storage usage indicator with progress bar

## Styling

The app uses a custom theme system that mirrors the web app's Tailwind/Shadcn color palette:
- Primary: #F7A800 (yellow/amber)
- Secondary: #8B5CF6 (purple)
- Success: #10B981 (green)
- Muted: #F5F5F5 (light gray)

All styling is done using React Native's StyleSheet API with theming constants.

## Development Notes

### Key Differences from Web Version
1. **No CSS/Tailwind** - All styling via StyleSheet
2. **No hover states** - Use press/active states instead
3. **Flexbox by default** - Different layout paradigm
4. **ScrollView required** - For scrollable content
5. **SafeAreaProvider** - Handle notches and safe areas
6. **Native components** - Maps use platform-native views

### TypeScript Support
All screens and components are written in TypeScript for better type safety and developer experience.

## Maps Configuration

For maps to work properly on iOS and Android, you may need to configure API keys:

**iOS (app.json):**
```json
"ios": {
  "config": {
    "googleMapsApiKey": "YOUR_KEY_HERE"
  }
}
```

**Android (app.json):**
```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_KEY_HERE"
    }
  }
}
```

## Future Enhancements

- [ ] Add React Query for data fetching
- [ ] Implement real API integration
- [ ] Add offline data storage
- [ ] Implement push notifications
- [ ] Add camera integration for species detection
- [ ] Real-time WebSocket updates

## License

0BSD - See LICENSE file
