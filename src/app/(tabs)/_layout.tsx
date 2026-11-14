import { Tabs } from 'expo-router';
import { NotebookPen, Settings, Sprout, Sun } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/design/theme';
import { space, typeScale } from '@/design/tokens';

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingTop: space.sm,
          paddingBottom: insets.bottom + space.xs,
        },
        tabBarLabelStyle: typeScale.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarAccessibilityLabel: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <Sun size={22} strokeWidth={focused ? 2 : 1.75} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="garden"
        options={{
          title: 'Garden',
          tabBarAccessibilityLabel: 'Garden',
          tabBarIcon: ({ color, focused }) => (
            <Sprout size={22} strokeWidth={focused ? 2 : 1.75} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: 'Reflect',
          tabBarAccessibilityLabel: 'Reflect',
          tabBarIcon: ({ color, focused }) => (
            <NotebookPen size={22} strokeWidth={focused ? 2 : 1.75} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarAccessibilityLabel: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Settings size={22} strokeWidth={focused ? 2 : 1.75} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
