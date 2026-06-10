import {
  IBMPlexMono_500Medium,
  useFonts,
} from '@expo-google-fonts/ibm-plex-mono';
import {
  Inter_200ExtraLight,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { RootStackParamList } from './src/nav';
import { nfcIsSupported } from './src/nfc';
import { HowScreen } from './src/screens/How';
import { MainScreen } from './src/screens/Main';
import { PairTagScreen } from './src/screens/PairTag';
import { PermissionsScreen } from './src/screens/Permissions';
import { SelectAppsScreen } from './src/screens/SelectApps';
import { WelcomeScreen } from './src/screens/Welcome';
import { useStore } from './src/store';
import { palette } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: palette.cream },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_200ExtraLight,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    IBMPlexMono_500Medium,
  });
  const onboarded = useStore((s) => s.onboarded);
  const focused = useStore((s) => s.focused);

  useEffect(() => {
    nfcIsSupported();
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: palette.cream }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={focused ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          initialRouteName={onboarded ? 'Main' : 'Welcome'}
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: palette.cream },
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="How" component={HowScreen} />
          <Stack.Screen name="Permissions" component={PermissionsScreen} />
          <Stack.Screen name="SelectApps" component={SelectAppsScreen} />
          <Stack.Screen name="PairTag" component={PairTagScreen} />
          <Stack.Screen name="Main" component={MainScreen} options={{ animation: 'fade' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
