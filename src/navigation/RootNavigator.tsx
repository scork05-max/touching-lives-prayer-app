import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@react-native-community/vector-icons/Ionicons';

// Screen Imports
import { HomeScreen, BibleReadingScreen, GlobalFireMapScreen, LeaderConsoleScreen } from '../screens/index';
import AltarScreen from '../screens/AltarScreen';
import PrayerJournalScreen from '../screens/PrayerJournalScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Altar') {
            iconName = focused ? 'flame' : 'flame-outline';
          } else if (route.name === 'Bible') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Journal') {
            iconName = focused ? 'create' : 'create-outline';
          } else if (route.name === 'GlobalFire') {
            iconName = focused ? 'globe' : 'globe-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff6b6b',
        tabBarInactiveTintColor: '#888',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1a1a2e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Touching Lives' }}
      />
      <Tab.Screen
        name="Altar"
        component={AltarScreen}
        options={{ title: 'The Altar' }}
      />
      <Tab.Screen
        name="Bible"
        component={BibleReadingScreen}
        options={{ title: 'Bible Reading' }}
      />
      <Tab.Screen
        name="Journal"
        component={PrayerJournalScreen}
        options={{ title: 'Prayer Journal' }}
      />
      <Tab.Screen
        name="GlobalFire"
        component={GlobalFireMapScreen}
        options={{ title: 'Global Fire Map' }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={HomeTabs} />
        <Stack.Screen
          name="LeaderConsole"
          component={LeaderConsoleScreen}
          options={{
            presentation: 'modal',
            headerShown: true,
            headerStyle: { backgroundColor: '#1a1a2e' },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
