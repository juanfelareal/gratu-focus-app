import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  How: undefined;
  Permissions: undefined;
  SelectApps: { mode: 'onboarding' | 'settings' };
  PairTag: { mode: 'onboarding' | 'relink' };
  Main: undefined;
};

export type Nav = NativeStackNavigationProp<RootStackParamList>;
