import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import * as SystemUI from 'expo-system-ui';

import { useSettingsStore } from '@/stores/useSettings';
import { colors, type ColorMode, type ThemeColors } from './tokens';

export type Theme = {
  mode: ColorMode;
  colors: ThemeColors;
};

const ThemeContext = createContext<Theme>({
  mode: 'light',
  colors: colors.light,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useSettingsStore((state) => state.theme);

  const mode: ColorMode =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const theme = useMemo<Theme>(
    () => ({ mode, colors: colors[mode] as ThemeColors }),
    [mode],
  );

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.bg).catch(() => {
      // The root background is cosmetic; a failure must not block the app.
    });
  }, [theme.colors.bg]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
