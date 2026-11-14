import { type ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/design/theme';
import { layout } from '@/design/tokens';

type ScreenProps = {
  children: ReactNode;
  /** Wraps content in a ScrollView. */
  scroll?: boolean;
  /** Extra bottom padding, e.g. to clear a floating action button. */
  bottomInset?: number;
  /** Removes horizontal padding for edge-to-edge content. */
  edgeToEdge?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle' | 'children'>;
  style?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scroll = true,
  bottomInset = 0,
  edgeToEdge = false,
  contentContainerStyle,
  scrollProps,
  style,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const padding = {
    paddingTop: insets.top + layout.sectionGap / 2,
    paddingBottom: insets.bottom + layout.sectionGap + bottomInset,
    paddingHorizontal: edgeToEdge ? 0 : layout.screenPadding,
  };

  if (!scroll) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.bg }, style]}>
        <View style={[styles.flex, padding, contentContainerStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      {...scrollProps}
      style={[styles.flex, { backgroundColor: colors.bg }, style]}
      contentContainerStyle={[styles.content, padding, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

/** Centers content on tablets and keeps lines short on large phones. */
export function ContentColumn({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.column, style]}>{children}</View>;
}

export const ScreenScrollView = ScrollView;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  column: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
});
