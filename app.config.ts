import type { ConfigContext, ExpoConfig } from 'expo/config';
import type { WithAndroidWidgetsParams } from 'react-native-android-widget';

const widgetConfig: WithAndroidWidgetsParams = {
  fonts: [
    './assets/fonts/DMSans-Regular.ttf',
    './assets/fonts/DMSans-Medium.ttf',
    './assets/fonts/DMSans-SemiBold.ttf',
  ],
  widgets: [
    {
      name: 'Today',
      label: 'Twice — Today',
      description: "Today's habits, one tap to complete.",
      minWidth: '250dp',
      minHeight: '110dp',
      targetCellWidth: 4,
      targetCellHeight: 2,
      previewImage: './assets/widget-preview/today.png',
      updatePeriodMillis: 1800000,
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Twice',
  slug: 'twice',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'twice',
  userInterfaceStyle: 'automatic',
  platforms: ['ios', 'android', 'web'],
  icon: './assets/images/icon.png',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.asad.twice',
  },
  android: {
    package: 'com.asad.twice',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#FAF8F1',
      monochromeImage: './assets/images/adaptive-icon-monochrome.png',
    },
    permissions: ['RECEIVE_BOOT_COMPLETED', 'SCHEDULE_EXACT_ALARM'],
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 168,
        resizeMode: 'contain',
        backgroundColor: '#FAF8F1',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#3E7A4A',
      },
    ],
    ['react-native-android-widget', widgetConfig],
  ],
});
