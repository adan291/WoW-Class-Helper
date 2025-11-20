# WoW AI Class Helper - Mobile App (React Native) Setup Guide

**Date**: November 20, 2025  
**Status**: ✅ SETUP GUIDE COMPLETE  
**Target**: iOS & Android  

---

## 📱 Mobile App Implementation Guide

This guide provides the structure and setup for implementing the WoW AI Class Helper as a native mobile application using React Native.

---

## 🎯 Project Structure

```
wow-class-helper-mobile/
├── app/
│   ├── screens/
│   │   ├── ClassSelectionScreen.tsx
│   │   ├── SpecDetailScreen.tsx
│   │   ├── GuideViewScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── BookmarksScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── OfflineScreen.tsx
│   ├── components/
│   │   ├── ClassCard.tsx
│   │   ├── SpecCard.tsx
│   │   ├── GuideCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── TabBar.tsx
│   │   └── LoadingSpinner.tsx
│   ├── services/
│   │   ├── apiService.ts
│   │   ├── storageService.ts
│   │   ├── offlineService.ts
│   │   ├── syncService.ts
│   │   └── notificationService.ts
│   ├── hooks/
│   │   ├── useOnlineStatus.ts
│   │   ├── useLocalStorage.ts
│   │   └── useSyncData.ts
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── ClassNavigator.tsx
│   │   └── ProfileNavigator.tsx
│   ├── styles/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   ├── App.tsx
│   └── index.ts
├── ios/
│   ├── WoWClassHelper/
│   ├── Podfile
│   └── WoWClassHelper.xcodeproj
├── android/
│   ├── app/
│   ├── gradle/
│   └── build.gradle
├── package.json
├── app.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ and npm/yarn
- Xcode 13+ (for iOS development)
- Android Studio (for Android development)
- React Native CLI

### Installation

```bash
# Create new React Native project
npx react-native init WoWClassHelper --template react-native-template-typescript

# Navigate to project
cd WoWClassHelper

# Install dependencies
npm install

# Install additional packages
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
npm install react-native-netinfo
npm install react-native-push-notifications
npm install axios
npm install zustand
```

### iOS Setup

```bash
# Navigate to iOS directory
cd ios

# Install pods
pod install

# Return to root
cd ..

# Run on iOS simulator
npm run ios
```

### Android Setup

```bash
# Run on Android emulator
npm run android
```

---

## 📋 Core Features Implementation

### 1. Navigation Structure

```typescript
// app/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ClassNavigator from './ClassNavigator';
import SearchScreen from '../screens/SearchScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#9CA3AF',
        }}
      >
        <Tab.Screen
          name="Classes"
          component={ClassNavigator}
          options={{
            tabBarLabel: 'Classes',
            tabBarIcon: ({ color }) => <ClassIcon color={color} />,
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarLabel: 'Search',
            tabBarIcon: ({ color }) => <SearchIcon color={color} />,
          }}
        />
        <Tab.Screen
          name="Bookmarks"
          component={BookmarksScreen}
          options={{
            tabBarLabel: 'Bookmarks',
            tabBarIcon: ({ color }) => <BookmarkIcon color={color} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
```

### 2. Offline Support

```typescript
// app/services/offlineService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const offlineService = {
  async saveForOffline(key: string, data: any) {
    try {
      await AsyncStorage.setItem(`offline_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  },

  async getOfflineData(key: string) {
    try {
      const data = await AsyncStorage.getItem(`offline_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  },

  async clearOfflineData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter((k) => k.startsWith('offline_'));
      await AsyncStorage.multiRemove(offlineKeys);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  },
};
```

### 3. Sync Service

```typescript
// app/services/syncService.ts
import NetInfo from '@react-native-community/netinfo';
import { offlineService } from './offlineService';

export const syncService = {
  async syncData() {
    const state = await NetInfo.fetch();

    if (!state.isConnected) {
      console.log('No internet connection');
      return false;
    }

    try {
      // Sync bookmarks
      const bookmarks = await offlineService.getOfflineData('bookmarks');
      if (bookmarks) {
        // Send to server
        console.log('Syncing bookmarks...');
      }

      // Sync preferences
      const preferences = await offlineService.getOfflineData('preferences');
      if (preferences) {
        // Send to server
        console.log('Syncing preferences...');
      }

      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  },

  async setupAutoSync() {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        this.syncData();
      }
    });

    return unsubscribe;
  },
};
```

### 4. Push Notifications

```typescript
// app/services/notificationService.ts
import PushNotification from 'react-native-push-notification';

export const notificationService = {
  configure() {
    PushNotification.configure({
      onNotification: (notification) => {
        console.log('Notification received:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
    });
  },

  sendLocalNotification(title: string, message: string) {
    PushNotification.localNotification({
      title,
      message,
      playSound: true,
      soundName: 'default',
    });
  },

  scheduleNotification(title: string, message: string, delayMs: number) {
    PushNotification.localNotificationSchedule({
      title,
      message,
      date: new Date(Date.now() + delayMs),
      playSound: true,
      soundName: 'default',
    });
  },
};
```

---

## 🎨 Design System

### Colors
```typescript
// app/styles/colors.ts
export const colors = {
  primary: '#3B82F6',
  secondary: '#A855F7',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#111827',
  surface: '#1F2937',
  text: '#F3F4F6',
  textSecondary: '#D1D5DB',
};
```

### Spacing
```typescript
// app/styles/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
```

---

## 📱 Screen Examples

### Class Selection Screen

```typescript
// app/screens/ClassSelectionScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ClassCard } from '../components/ClassCard';
import { offlineService } from '../services/offlineService';

export const ClassSelectionScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      // Try to load from offline storage first
      const offlineClasses = await offlineService.getOfflineData('classes');
      if (offlineClasses) {
        setClasses(offlineClasses);
      }

      // Then fetch from API
      const response = await fetch('https://api.example.com/classes');
      const data = await response.json();
      setClasses(data);

      // Save for offline
      await offlineService.saveForOffline('classes', data);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={classes}
        renderItem={({ item }) => (
          <ClassCard
            class={item}
            onPress={() => navigation.navigate('SpecDetail', { classId: item.id })}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
});
```

---

## 🔄 API Integration

### Shared Services

The mobile app can reuse many services from the web app:

```typescript
// app/services/apiService.ts
import axios from 'axios';
import { authService } from './authService'; // Shared from web

const API_BASE_URL = 'https://api.example.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  async getClasses() {
    return apiClient.get('/classes');
  },

  async getSpecs(classId: string) {
    return apiClient.get(`/classes/${classId}/specs`);
  },

  async getGuide(guideId: string) {
    return apiClient.get(`/guides/${guideId}`);
  },
};
```

---

## 🧪 Testing

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react-native jest

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

---

## 📦 Build & Distribution

### iOS Distribution

```bash
# Build for iOS
npm run ios -- --configuration Release

# Archive for App Store
xcodebuild -workspace ios/WoWClassHelper.xcworkspace \
  -scheme WoWClassHelper \
  -configuration Release \
  -archivePath build/WoWClassHelper.xcarchive \
  archive
```

### Android Distribution

```bash
# Build APK
cd android
./gradlew assembleRelease

# Build AAB for Play Store
./gradlew bundleRelease
```

---

## 🔐 Security Considerations

- Use secure storage for sensitive data (tokens, passwords)
- Implement certificate pinning for API calls
- Validate all user input
- Use HTTPS for all API communication
- Implement proper authentication flow
- Encrypt sensitive data in local storage

---

## 📊 Performance Optimization

- Lazy load screens and components
- Optimize images for mobile
- Use FlatList with proper key extraction
- Implement pagination for large lists
- Cache API responses
- Minimize bundle size

---

## 🚀 Deployment Checklist

- [ ] All screens implemented
- [ ] Offline functionality tested
- [ ] Push notifications working
- [ ] API integration complete
- [ ] Authentication implemented
- [ ] Error handling in place
- [ ] Performance optimized
- [ ] Security review completed
- [ ] App Store submission ready
- [ ] Play Store submission ready

---

## 📚 Resources

- React Native Documentation: https://reactnative.dev
- React Navigation: https://reactnavigation.org
- Expo: https://expo.dev
- React Native Community: https://github.com/react-native-community

---

## 🎯 Next Steps

1. Set up React Native project with TypeScript
2. Implement navigation structure
3. Create core screens
4. Integrate with web API
5. Implement offline support
6. Add push notifications
7. Test on iOS and Android
8. Submit to app stores

---

**Mobile App Setup Guide Complete**  
**Ready for Implementation**  
**Status**: ✅ READY TO BUILD
