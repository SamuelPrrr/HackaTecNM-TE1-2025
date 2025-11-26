# Component Mapping: Web → React Native

This document shows how web components were mapped to React Native equivalents.

## 1. Web Components → React Native Components

| Web Element | React Native Component | Notes |
|------------|------------------------|-------|
| `<div>` | `<View>` | Container element |
| `<button>` | `<TouchableOpacity>` or `<Pressable>` | Interactive element |
| `<input>` | `<TextInput>` | Text input |
| `<p>`, `<h1>`, `<span>` | `<Text>` | All text must be wrapped in Text |
| `<img>` | `<Image>` | Images |
| CSS classes | `StyleSheet.create()` | No CSS, all styling via JS objects |

## 2. Web Libraries → React Native Equivalents

### Navigation
- **Web**: `react-router-dom` (BrowserRouter, Routes, Route)
- **Mobile**: `@react-navigation/native` + `@react-navigation/bottom-tabs`
- **Changes**: 
  - Bottom tab navigator instead of web routing
  - Native navigation animations
  - Stack-based navigation paradigm

### Maps
- **Web**: `leaflet` + `react-leaflet`
- **Mobile**: `react-native-maps`
- **Changes**:
  - Native map rendering (Google Maps/Apple Maps)
  - Different marker API
  - Better performance on mobile

### Icons
- **Web**: `lucide-react`
- **Mobile**: `lucide-react-native`
- **Changes**: Same API, different implementation for SVG rendering

### UI Components (Shadcn/Radix UI)
- **Web**: Radix UI primitives + Tailwind CSS
- **Mobile**: Custom components with StyleSheet
- **Replaced Components**:
  - `Card` → Custom View-based Card
  - `Button` → Custom TouchableOpacity-based Button
  - `Badge` → Custom View + Text Badge
  - `Input` → Custom TextInput wrapper

### Styling
- **Web**: Tailwind CSS classes
- **Mobile**: StyleSheet API with theme system
- **Changes**:
  - No CSS or class names
  - All styles as JavaScript objects
  - Theme system using constants file

## 3. Screen-by-Screen Mapping

### Dashboard Screen

#### Web Version (Dashboard.tsx)
```tsx
<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
  <h1 className="text-4xl font-bold">EcoMonitor</h1>
  <Button onClick={() => setIsConnected(!isConnected)}>
    {isConnected ? "Disconnect" : "Connect"}
  </Button>
</div>
```

#### Mobile Version (Dashboard.tsx)
```tsx
<ScrollView style={styles.container}>
  <Text style={styles.title}>EcoMonitor</Text>
  <Button onPress={() => setIsConnected(!isConnected)}>
    {isConnected ? "Disconnect" : "Connect"}
  </Button>
</ScrollView>

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  title: { fontSize: 32, fontWeight: 'bold' }
});
```

**Key Changes**:
- `div` → `ScrollView` (for scrollable content)
- `className` → `style` prop with StyleSheet
- `onClick` → `onPress`
- No gradient backgrounds (can be achieved with LinearGradient)

### MapView Screen

#### Web Version
```tsx
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const map = L.map(containerRef.current).setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
```

#### Mobile Version
```tsx
import MapView, { Marker } from 'react-native-maps';

<MapView
  initialRegion={{
    latitude: 51.505,
    longitude: -0.09,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  }}
>
  <Marker coordinate={{ latitude: 51.505, longitude: -0.09 }} />
</MapView>
```

**Key Changes**:
- Declarative API instead of imperative
- No tile layer needed (uses native maps)
- Different marker system
- Built-in gesture handling

### Models Screen

#### Web Features Preserved
- ✅ Three model cards (Audio, Motion, Species)
- ✅ Active model highlighting
- ✅ Feature lists
- ✅ Activation buttons
- ✅ Active model banner

#### Mobile Adaptations
- Cards use TouchableOpacity for better touch feedback
- Icons from lucide-react-native
- Scrollable content with ScrollView
- Bottom padding for tab bar clearance

### Data Screen

#### Web Features Preserved
- ✅ Cloud sync status
- ✅ Search functionality
- ✅ Records list
- ✅ Storage usage indicator

#### Mobile Adaptations
- Search icon positioned absolutely in input
- FlatList could be used for better performance (currently using map)
- Touch-optimized filter button
- Progress bar using View with dynamic width

## 4. Theme System

### Web (Tailwind CSS Variables)
```css
:root {
  --primary: 46 85% 54%;
  --foreground: 0 0% 10%;
  --border: 0 0% 90%;
}

.bg-primary { background: hsl(var(--primary)); }
```

### Mobile (colors.ts)
```typescript
export const colors = {
  primary: '#F7A800',
  foreground: '#1A1A1A',
  border: '#E5E5E5',
};

// Usage
<View style={{ backgroundColor: colors.primary }} />
```

## 5. Layout Differences

### Flexbox
- **Web**: Opt-in via `display: flex`
- **Mobile**: Default for all Views
- **Note**: `flexDirection: 'column'` is default in RN (vs 'row' in web)

### Responsive Design
- **Web**: Media queries and responsive classes
- **Mobile**: 
  - Use `Dimensions` API
  - `useWindowDimensions` hook
  - Platform-specific code with `Platform.OS`

### Scrolling
- **Web**: Automatic with CSS `overflow`
- **Mobile**: Must explicitly use `ScrollView` or `FlatList`

## 6. Event Handling

| Web Event | React Native Event | Component |
|-----------|-------------------|-----------|
| `onClick` | `onPress` | TouchableOpacity |
| `onChange` | `onChangeText` | TextInput |
| `onSubmit` | Manual handling | Form components |
| `onMouseEnter` | ❌ Not available | Use `onPressIn` |
| `onMouseLeave` | ❌ Not available | Use `onPressOut` |

## 7. Performance Considerations

### Lists
- **Web**: Map array with `.map()`
- **Mobile**: 
  - Small lists: `.map()` is fine
  - Large lists: Use `FlatList` or `SectionList` for virtualization

### Images
- **Web**: `<img src="..." />`
- **Mobile**: 
  - Local: `<Image source={require('./path')} />`
  - Remote: `<Image source={{ uri: 'https://...' }} />`
  - Should specify width/height

### Heavy Components
- Use `memo()` for expensive components
- Implement `shouldComponentUpdate` or `React.memo`
- Use `useMemo` and `useCallback` hooks

## 8. Platform-Specific Code

```typescript
import { Platform } from 'react-native';

// Option 1: Inline
const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 20 : 0
  }
});

// Option 2: Platform.select
const containerPadding = Platform.select({
  ios: 20,
  android: 0,
  default: 0
});

// Option 3: Separate files
// Button.ios.tsx
// Button.android.tsx
```

## 9. Safe Areas

### Mobile-Only Concern
```tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Wrap app
<SafeAreaProvider>
  <App />
</SafeAreaProvider>

// Use in components
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const insets = useSafeAreaInsets();
```

## 10. Testing

### Web
- Jest + React Testing Library
- Cypress for E2E

### Mobile
- Jest + React Native Testing Library
- Detox for E2E
- Manual testing on iOS Simulator / Android Emulator

## Summary

The migration successfully translated all major features from web to mobile:
- ✅ All 4 screens implemented
- ✅ Navigation system adapted
- ✅ UI components recreated
- ✅ Theme system ported
- ✅ Maps replaced with native solution
- ✅ Icons working with mobile version
- ✅ Touch interactions implemented
