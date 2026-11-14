import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { useTheme } from '@/design/theme';
import { elevation, motion, radius, space } from '@/design/tokens';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Keeps the sheet open while a form is submitting. */
  dismissible?: boolean;
};

export function Sheet({ visible, onClose, title, children, dismissible = true }: SheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const close = () => {
    if (dismissible) onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={close}
    >
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={close}
          accessibilityLabel="Close"
          accessibilityRole="button"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
          pointerEvents="box-none"
        >
          <Animated.View
            entering={SlideInDown.duration(motion.base)}
            exiting={SlideOutDown.duration(motion.fast)}
            style={[
              styles.sheet,
              elevation.sheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                paddingBottom: insets.bottom + space.xxl,
                maxHeight: Math.round(height * 0.9),
              },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
            {title ? (
              <View style={styles.header}>
                <AppText variant="title" style={styles.headerTitle}>
                  {title}
                </AppText>
                <IconButton icon={X} label="Close" onPress={close} size="sm" />
              </View>
            ) : null}
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {children}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  keyboard: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.lg + 8,
    borderTopRightRadius: radius.lg + 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: space.xxl,
    paddingTop: space.md,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: space.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    alignSelf: 'center',
    marginBottom: space.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    marginBottom: space.lg,
  },
  headerTitle: { flex: 1 },
});
