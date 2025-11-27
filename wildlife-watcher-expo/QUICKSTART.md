# Quick Start Guide

Get the Wildlife Watcher Mobile app running in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js (v18+) - Check with `node --version`
- ✅ npm or yarn - Check with `npm --version`
- ✅ Expo CLI - Install with `npm install -g expo-cli`

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This installs:
- React Native and Expo
- React Navigation (for tabs)
- React Native Maps
- Lucide icons
- TypeScript support

### 2. Start Development Server
```bash
npm start
```

This will:
- Start the Metro bundler
- Open Expo DevTools in your browser
- Show a QR code for device testing

### 3. Run on Device/Simulator

#### Option A: Physical Device (Easiest!)
1. Install **Expo Go** app on your phone
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code shown in terminal
3. App loads on your device!

#### Option B: iOS Simulator (Mac Only)
```bash
npm run ios
```
- Requires Xcode installed
- Will open iOS Simulator automatically

#### Option C: Android Emulator
```bash
npm run android
```
- Requires Android Studio installed
- Android emulator must be running

## Project Structure Overview

```
wildlife-watcher-mobile/
├── App.js                    # Entry point
├── src/
│   ├── screens/             # 4 main screens
│   │   ├── Dashboard.tsx    # 🏠 Home screen
│   │   ├── Models.tsx       # 🎯 AI models
│   │   ├── MapView.tsx      # 🗺️ Map view
│   │   └── Data.tsx         # 📊 Data management
│   ├── components/          # Reusable UI
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── navigation/          # Tab navigation
│   │   └── TabNavigator.tsx
│   └── theme/              # Colors & styling
│       └── colors.ts
```

## Testing the App

### Features to Test:

#### Dashboard Screen
- [ ] Toggle connection button
- [ ] View species stats
- [ ] See recent detections list

#### Models Screen
- [ ] Select different AI models
- [ ] See active model indicator
- [ ] View feature lists

#### Map View Screen
- [ ] Pan and zoom map
- [ ] Tap markers to see species info
- [ ] View detection stats

#### Data Screen
- [ ] Sync button functionality
- [ ] Search records
- [ ] View storage usage

## Common Issues & Fixes

### Issue: "Unable to resolve module"
**Fix:**
```bash
npm install
npx expo start --clear
```

### Issue: Maps not showing
**Fix:** 
- On iOS Simulator: Maps work out of the box
- On Android: May need Google Maps API key (see README.md)

### Issue: Icons not appearing
**Fix:**
```bash
npm install lucide-react-native
npx expo start --clear
```

### Issue: TypeScript errors
**Fix:**
```bash
npm install --save-dev typescript @types/react @types/react-native
```

## Development Tips

### Hot Reload
- Save any file to see changes instantly
- Shake device (or press `R` in terminal) to reload
- Press `M` in terminal to open dev menu

### Debug Menu
- iOS Simulator: `Cmd + D`
- Android Emulator: `Cmd + M` (Mac) or `Ctrl + M` (Windows/Linux)
- Physical Device: Shake the device

### Useful Commands
```bash
# Clear cache and restart
npx expo start --clear

# Run on specific platform
npm run ios
npm run android

# Check for issues
npm run lint    # (if configured)

# View dependencies
npm list --depth=0
```

## Customization Guide

### Change Colors
Edit `src/theme/colors.ts`:
```typescript
export const colors = {
  primary: '#YOUR_COLOR',
  // ... other colors
};
```

### Add New Screen
1. Create file in `src/screens/NewScreen.tsx`
2. Add to `src/navigation/TabNavigator.tsx`:
```typescript
<Tab.Screen
  name="NewScreen"
  component={NewScreen}
  options={{
    tabBarIcon: ({ color, size }) => <Icon size={size} color={color} />
  }}
/>
```

### Modify UI Components
All components in `src/components/` can be edited:
- `Card.tsx` - Card containers
- `Button.tsx` - Buttons with variants
- `Badge.tsx` - Status badges
- `Input.tsx` - Text inputs

## Next Steps

1. **Read Documentation**
   - `README.md` - Full documentation
   - `COMPONENT_MAPPING.md` - Web to mobile mapping

2. **Explore Code**
   - Start with `App.js`
   - Then check `TabNavigator.tsx`
   - Review individual screens

3. **Customize**
   - Modify colors in theme
   - Adjust layouts
   - Add new features

4. **Deploy**
   - Build for iOS: `expo build:ios`
   - Build for Android: `expo build:android`
   - Or use EAS Build: `eas build`

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Lucide Icons](https://lucide.dev/)

## Need Help?

- Check existing issues in the repository
- Review the `COMPONENT_MAPPING.md` for implementation details
- Consult React Native documentation for platform-specific issues

---

**Happy Coding! 🚀**

The app should now be running successfully. You can start testing features and making customizations!
