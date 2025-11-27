import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Radio, Map, Database, Wifi } from 'lucide-react-native';
import Dashboard from '../screens/Dashboard';
import Models from '../screens/Models';
import MapViewScreen from '../screens/MapView';
import Data from '../screens/Data';
import NetworkDiagnostics from '../components/NetworkDiagnostics';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.foreground,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={Dashboard}
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Modelos"
        component={Models}
        options={{
          tabBarIcon: ({ color, size }) => <Radio size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Mapa"
        component={MapViewScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Datos"
        component={Data}
        options={{
          tabBarIcon: ({ color, size }) => <Database size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Red"
        component={NetworkDiagnostics}
        options={{
          tabBarIcon: ({ color, size }) => <Wifi size={size} color={color} />,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
