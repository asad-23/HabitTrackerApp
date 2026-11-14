import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import migrations from '../../drizzle/migrations';
import { db, initDatabase } from '@/db/client';
import { useAppFonts } from '@/design/fonts';
import { ThemeProvider, useTheme } from '@/design/theme';
import { useDayRollover } from '@/hooks/useDayRollover';
import { useNotificationSync } from '@/hooks/useNotificationSync';
import { useDataStore } from '@/stores/useData';
import { useSessionStore } from '@/stores/useSession';
import { space, colors as palette } from '@/design/tokens';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { DialogHost } from '@/ui/DialogHost';
import { Screen } from '@/ui/Screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => Promise<void> }) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Screen scroll={false} contentContainerStyle={{ justifyContent: 'center', gap: space.lg }}>
          <AppText variant="title">Something went quiet</AppText>
          <AppText tone="muted">
            Twice could not open its notebook. Your data is still on this device.
          </AppText>
          <AppText variant="caption" tone="faint">
            {error.message}
          </AppText>
          <Button label="Try again" onPress={() => void retry()} />
        </Screen>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  // Native opens SQLite at module load; web needs an async warm-up first.
  const [dbReady, setDbReady] = useState(Platform.OS !== 'web');
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let cancelled = false;
    initDatabase()
      .then(() => {
        if (!cancelled) setDbReady(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setDbError(error instanceof Error ? error : new Error(String(error)));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (dbError) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <Screen scroll={false} contentContainerStyle={{ justifyContent: 'center', gap: space.lg }}>
            <AppText variant="title">The notebook needs a moment</AppText>
            <AppText tone="muted">
              Twice could not prepare its local database. Reopening the app usually fixes this.
            </AppText>
            <AppText variant="caption" tone="faint">
              {dbError.message}
            </AppText>
          </Screen>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  if (!dbReady) {
    return <View style={{ flex: 1, backgroundColor: palette.light.bg }} />;
  }

  return <DatabaseApp fontsLoaded={fontsLoaded} fontError={fontError} />;
}

function DatabaseApp({
  fontsLoaded,
  fontError,
}: {
  fontsLoaded: boolean;
  fontError: Error | null;
}) {
  const { success, error } = useMigrations(db, migrations);

  useDayRollover();

  const ready = (fontsLoaded || fontError !== null) && success;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    if (!success) return;
    useSessionStore.getState().refreshToday();
    useDataStore.getState().refresh();
  }, [success]);

  if (error) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <Screen scroll={false} contentContainerStyle={{ justifyContent: 'center', gap: space.lg }}>
            <AppText variant="title">The notebook needs a moment</AppText>
            <AppText tone="muted">
              Twice could not prepare its local database. Reopening the app usually fixes this.
            </AppText>
            <AppText variant="caption" tone="faint">
              {error.message}
            </AppText>
          </Screen>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: palette.light.bg }} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { colors, mode } = useTheme();
  useNotificationSync();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="habit/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="habit/[id]/index" />
        <Stack.Screen name="habit/[id]/edit" options={{ presentation: 'modal' }} />
      </Stack>
      <DialogHost />
    </>
  );
}
