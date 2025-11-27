import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import TestFirebase from './src/components/TestFirebase';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style='dark' />
        <TabNavigator />
        {/* <TestFirebase></TestFirebase> */}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
