import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import TestFirebase from './src/components/TestFirebase';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={['top']}
      >
        <NavigationContainer>
          <StatusBar style="dark" />
          <TabNavigator />
          {/* <TestFirebase></TestFirebase> */}
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
