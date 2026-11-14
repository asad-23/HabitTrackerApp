import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Minus, Plus } from 'lucide-react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { useTheme } from '@/design/theme';
import { icons, opacity, radius, space } from '@/design/tokens';
import {
  clockText,
  readClock,
  setClockHour,
  setClockMeridiem,
  setClockMinute,
  shiftClockMinutes,
  type Meridiem,
} from '@/domain/clock';
import { pad2 } from '@/domain/dates';
import { AppText } from './AppText';
import { Button } from './Button';
import { Chip } from './Chip';
import { Sheet } from './Sheet';

export type DialMode = 'hour' | 'minute';

type TimePickerProps = {
  visible: boolean;
  title: string;
  /** The draft value in `HH:mm`, owned by the field so opening can reset it. */
  value: string;
  onValueChange: (value: string) => void;
  mode: DialMode;
  onModeChange: (mode: DialMode) => void;
  onConfirm: (value: string) => void;
  onClose: () => void;
  allowClear?: boolean;
  clearActionLabel?: string;
  onClear?: () => void;
};

const HOUR_LABELS = Array.from({ length: 12 }, (_, index) => (index === 0 ? 12 : index));
const MINUTE_LABELS = Array.from({ length: 12 }, (_, index) => index * 5);

function dialAngle(index: number): number {
  return (index / 12) * Math.PI * 2 - Math.PI / 2;
}

function polar(distance: number, angle: number, center: number) {
  return {
    x: center + Math.cos(angle) * distance,
    y: center + Math.sin(angle) * distance,
  };
}

/**
 * A calm, in-app clock shared by every platform.
 *
 * Tapping an hour moves straight to the minute ring, so a reminder takes two
 * taps. Odd minutes stay reachable through the one-minute steppers instead of
 * being snapped to the nearest five.
 */
export function TimePicker({
  visible,
  title,
  value,
  onValueChange,
  mode,
  onModeChange,
  onConfirm,
  onClose,
  allowClear = true,
  clearActionLabel = 'Clear time',
  onClear,
}: TimePickerProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();

  const clock = readClock(value);

  const chooseHour = (hour: number) => {
    Haptics.selectionAsync().catch(() => {});
    onValueChange(setClockHour(value, hour));
    onModeChange('minute');
  };

  const chooseMinute = (minute: number) => {
    Haptics.selectionAsync().catch(() => {});
    onValueChange(setClockMinute(value, minute));
  };

  const chooseMeridiem = (meridiem: Meridiem) => {
    if (meridiem === clock.meridiem) return;
    Haptics.selectionAsync().catch(() => {});
    onValueChange(setClockMeridiem(value, meridiem));
  };

  const step = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onValueChange(shiftClockMinutes(value, delta));
  };

  const dialSize = Math.max(196, Math.min(248, width - 112, height * 0.34));
  const center = dialSize / 2;
  const numberSize = dialSize < 220 ? 38 : 42;
  const numberRadius = center - numberSize / 2 - 6;
  const handAngle =
    mode === 'hour'
      ? dialAngle(clock.hour12 % 12)
      : (clock.minute / 60) * Math.PI * 2 - Math.PI / 2;
  const handEnd = polar(numberRadius - 6, handAngle, center);

  const labels = mode === 'hour' ? HOUR_LABELS : MINUTE_LABELS;
  const selectedIndex =
    mode === 'hour'
      ? clock.hour12 % 12
      : clock.minute % 5 === 0
        ? clock.minute / 5
        : -1;

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.displayRow}>
        <AppText variant="display" style={styles.timeText}>
          {clockText(clock)}
        </AppText>
        <View style={styles.meridiemRow}>
          <Chip
            label="AM"
            selected={clock.meridiem === 'AM'}
            onPress={() => chooseMeridiem('AM')}
          />
          <Chip
            label="PM"
            selected={clock.meridiem === 'PM'}
            onPress={() => chooseMeridiem('PM')}
          />
        </View>
      </View>

      <View style={styles.modeRow}>
        <Chip label="Hour" selected={mode === 'hour'} onPress={() => onModeChange('hour')} />
        <Chip
          label="Minute"
          selected={mode === 'minute'}
          onPress={() => onModeChange('minute')}
        />
      </View>

      <View
        style={[
          styles.dial,
          {
            width: dialSize,
            height: dialSize,
            backgroundColor: colors.sunken,
            borderColor: colors.border,
          },
        ]}
      >
        <Svg width={dialSize} height={dialSize} style={StyleSheet.absoluteFill}>
          <Circle
            cx={center}
            cy={center}
            r={numberRadius}
            fill="none"
            stroke={colors.border}
            strokeWidth={1}
          />
          <Line
            x1={center}
            y1={center}
            x2={handEnd.x}
            y2={handEnd.y}
            stroke={colors.primary}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Circle cx={center} cy={center} r={6} fill={colors.primary} />
          <Circle cx={center} cy={center} r={2.5} fill={colors.sunken} />
        </Svg>

        {labels.map((label, index) => {
          const point = polar(numberRadius, dialAngle(index), center);
          const selected = index === selectedIndex;

          return (
            <Pressable
              key={`${mode}-${label}`}
              onPress={() => (mode === 'hour' ? chooseHour(label) : chooseMinute(label))}
              accessibilityRole="button"
              accessibilityLabel={
                mode === 'hour' ? `Set hour to ${label}` : `Set minute to ${pad2(label)}`
              }
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.number,
                {
                  width: numberSize,
                  height: numberSize,
                  left: point.x - numberSize / 2,
                  top: point.y - numberSize / 2,
                  backgroundColor: selected ? colors.primary : 'transparent',
                  opacity: pressed ? opacity.pressed : 1,
                },
              ]}
            >
              <AppText
                variant="label"
                weight={selected ? 'semibold' : 'medium'}
                style={{ color: selected ? colors.onPrimary : colors.text }}
                maxScale={1.2}
              >
                {mode === 'hour' ? label : pad2(label)}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.stepperRow}>
        <Pressable
          onPress={() => step(-1)}
          accessibilityRole="button"
          accessibilityLabel="One minute earlier"
          style={({ pressed }) => [
            styles.stepper,
            { borderColor: colors.border, opacity: pressed ? opacity.pressed : 1 },
          ]}
        >
          <Minus size={icons.sm - 4} strokeWidth={icons.stroke} color={colors.muted} />
          <AppText variant="label" weight="medium" tone="muted">
            1 min
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => step(1)}
          accessibilityRole="button"
          accessibilityLabel="One minute later"
          style={({ pressed }) => [
            styles.stepper,
            { borderColor: colors.border, opacity: pressed ? opacity.pressed : 1 },
          ]}
        >
          <Plus size={icons.sm - 4} strokeWidth={icons.stroke} color={colors.muted} />
          <AppText variant="label" weight="medium" tone="muted">
            1 min
          </AppText>
        </Pressable>
      </View>

      <View style={styles.actions}>
        {allowClear ? (
          <Button
            label={clearActionLabel}
            variant="ghost"
            onPress={() => onClear?.()}
            style={styles.clearAction}
          />
        ) : null}
        <Button label="Done" onPress={() => onConfirm(value)} style={styles.doneAction} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
  },
  timeText: {
    fontVariant: ['tabular-nums'],
  },
  meridiemRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.md,
    marginBottom: space.md,
  },
  dial: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'center',
    position: 'relative',
  },
  number: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.md,
    marginTop: space.lg,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    minHeight: 40,
    minWidth: 104,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.lg,
  },
  clearAction: {
    paddingHorizontal: space.lg,
  },
  doneAction: {
    flex: 1,
  },
});
