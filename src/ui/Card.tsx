import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/design/theme';
import { layout, radius } from '@/design/tokens';

type CardProps = {
  children: ReactNode;
  /** `sunken` groups content inside another card. */
  tone?: 'surface' | 'sunken';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, tone = 'surface', padded = true, style }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: tone === 'sunken' ? colors.sunken : colors.surface,
          borderColor: tone === 'sunken' ? 'transparent' : colors.border,
          padding: padded ? layout.cardPadding : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});
