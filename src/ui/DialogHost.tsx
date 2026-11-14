import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react-native';

import { useTheme } from '@/design/theme';
import { elevation, icons, motion, radius, space, type ThemeColors } from '@/design/tokens';
import { AppText } from './AppText';
import { Button } from './Button';
import { useDialogStore, type DialogAction, type DialogTone } from './dialog';

function tonePalette(tone: DialogTone, colors: ThemeColors) {
  switch (tone) {
    case 'warning':
      return {
        icon: AlertTriangle,
        background: colors.accentSoft,
        foreground: colors.accentSoftText,
      };
    case 'success':
      return {
        icon: CheckCircle2,
        background: colors.primarySoft,
        foreground: colors.primarySoftText,
      };
    default:
      return {
        icon: Info,
        background: colors.sunken,
        foreground: colors.muted,
      };
  }
}

function buttonVariant(action: DialogAction) {
  if (action.style === 'destructive') return 'danger' as const;
  if (action.style === 'cancel') return 'ghost' as const;
  return 'primary' as const;
}

/** The only place the app draws a message, warning, or confirmation. */
export function DialogHost() {
  const { colors } = useTheme();
  const dialog = useDialogStore((state) => state.dialog);
  const dismiss = useDialogStore((state) => state.dismiss);

  const cancelAction = dialog?.actions.find((action) => action.style === 'cancel');

  const close = () => {
    dismiss();
    cancelAction?.onPress?.();
  };

  const tone = tonePalette(dialog?.tone ?? 'default', colors);
  const ToneIcon = tone.icon;

  // The affirmative choice leads; a cancel action always sits last.
  const actions = dialog
    ? [...dialog.actions].sort(
        (a, b) => Number(a.style === 'cancel') - Number(b.style === 'cancel'),
      )
    : [];

  return (
    <Modal
      visible={dialog !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={close}
    >
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Dismiss message"
        />

        {dialog ? (
          <Animated.View
            entering={FadeInDown.duration(motion.base)}
            accessibilityViewIsModal
            accessibilityRole="alert"
            style={[
              styles.card,
              elevation.sheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={[styles.badge, { backgroundColor: tone.background }]}>
              <ToneIcon size={icons.md} color={tone.foreground} strokeWidth={icons.stroke} />
            </View>

            <View style={styles.copy}>
              <AppText variant="title">{dialog.title}</AppText>
              {dialog.message ? <AppText tone="muted">{dialog.message}</AppText> : null}
            </View>

            <View style={styles.actions}>
              {actions.map((action, index) => (
                <Button
                  key={`${action.text}-${index}`}
                  label={action.text}
                  variant={buttonVariant(action)}
                  fullWidth
                  onPress={() => {
                    dismiss();
                    action.onPress?.();
                  }}
                />
              ))}
            </View>
          </Animated.View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: radius.lg + 8,
    borderWidth: 1,
    padding: space.xxl,
    gap: space.lg,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { gap: space.sm },
  actions: { gap: space.sm, marginTop: space.xs },
});
