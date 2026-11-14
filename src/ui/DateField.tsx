import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';

import { useTheme } from '@/design/theme';
import { icons, layout, opacity, radius, space } from '@/design/tokens';
import {
  fromDateKey,
  formatFullDate,
  toDateKey,
  todayKey,
  weekdayIndex,
  type DateKey,
} from '@/domain/dates';
import { AppText } from './AppText';
import { FieldShell } from './FieldShell';
import { Sheet } from './Sheet';

type DateFieldProps = {
  label: string;
  value: DateKey;
  onChange: (value: DateKey) => void;
  hint?: string;
};

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

function monthStart(key: DateKey): Date {
  const date = fromDateKey(key);
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

function shiftMonth(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 12, 0, 0, 0);
}

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date);
}

/** A calm, Sunday-first calendar used for start dates on every platform. */
export function DateField({ label, value, onChange, hint }: DateFieldProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => monthStart(value));
  const [draft, setDraft] = useState<DateKey>(value);

  const cells = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const first = new Date(year, month, 1, 12, 0, 0, 0);
    const offset = (weekdayIndex(toDateKey(first)) + 1) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const blanks = Array.from({ length: offset }, () => null);
    const dates = Array.from({ length: days }, (_, index) => {
      const day = index + 1;
      return toDateKey(new Date(year, month, day, 12, 0, 0, 0));
    });
    return [...blanks, ...dates];
  }, [view]);

  const openPicker = () => {
    setDraft(value);
    setView(monthStart(value));
    setOpen(true);
  };

  const chooseToday = () => {
    const key = todayKey();
    setDraft(key);
    setView(monthStart(key));
  };

  const today = todayKey();

  return (
    <>
      <FieldShell
        label={label}
        hint={hint}
        leading={<CalendarDays size={icons.sm} strokeWidth={icons.stroke} color={colors.muted} />}
      >
        <Pressable
          onPress={openPicker}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${formatFullDate(value)}`}
          accessibilityHint="Opens a calendar"
          style={({ pressed }) => [styles.trigger, { opacity: pressed ? opacity.pressed : 1 }]}
        >
          <AppText numberOfLines={1}>{formatFullDate(value)}</AppText>
        </Pressable>
      </FieldShell>

      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        <View style={styles.monthRow}>
          <Pressable
            onPress={() => setView((current) => shiftMonth(current, -1))}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            hitSlop={8}
            style={({ pressed }) => [
              styles.monthButton,
              { borderColor: colors.border, opacity: pressed ? opacity.pressed : 1 },
            ]}
          >
            <ChevronLeft size={icons.sm} strokeWidth={icons.stroke} color={colors.text} />
          </Pressable>

          <AppText variant="title" align="center" style={styles.monthTitle}>
            {monthLabel(view)}
          </AppText>

          <Pressable
            onPress={() => setView((current) => shiftMonth(current, 1))}
            accessibilityRole="button"
            accessibilityLabel="Next month"
            hitSlop={8}
            style={({ pressed }) => [
              styles.monthButton,
              { borderColor: colors.border, opacity: pressed ? opacity.pressed : 1 },
            ]}
          >
            <ChevronRight size={icons.sm} strokeWidth={icons.stroke} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAY_INITIALS.map((initial, index) => (
            <AppText
              key={`${initial}-${index}`}
              variant="caption"
              tone="faint"
              align="center"
              style={styles.weekCell}
            >
              {initial}
            </AppText>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((key, index) => {
            if (!key) return <View key={`blank-${index}`} style={styles.cell} />;

            const selected = key === draft;
            const isToday = key === today;

            return (
              <Pressable
                key={key}
                onPress={() => setDraft(key)}
                accessibilityRole="button"
                accessibilityLabel={formatFullDate(key)}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.cell,
                  {
                    backgroundColor: selected ? colors.primary : 'transparent',
                    borderColor: isToday && !selected ? colors.primary : 'transparent',
                    opacity: pressed ? opacity.pressed : 1,
                  },
                ]}
              >
                <AppText
                  variant="label"
                  weight={selected ? 'semibold' : 'regular'}
                  align="center"
                  style={{ color: selected ? colors.onPrimary : colors.text }}
                >
                  {Number(key.slice(8, 10))}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={chooseToday}
            accessibilityRole="button"
            accessibilityLabel="Choose today"
            style={({ pressed }) => [styles.secondaryAction, { opacity: pressed ? opacity.pressed : 1 }]}
          >
            <AppText variant="label" weight="semibold" tone="primary">
              Today
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => {
              onChange(draft);
              setOpen(false);
            }}
            accessibilityRole="button"
            accessibilityLabel="Save start date"
            style={({ pressed }) => [
              styles.primaryAction,
              { backgroundColor: colors.primary, opacity: pressed ? opacity.pressed : 1 },
            ]}
          >
            <AppText variant="label" weight="semibold" tone="onPrimary">
              Done
            </AppText>
          </Pressable>
        </View>

        <AppText variant="caption" tone="faint" align="center" style={styles.footer}>
          Week starts on Sunday.
        </AppText>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flex: 1,
    justifyContent: 'center',
    minHeight: layout.minTarget,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    marginBottom: space.md,
  },
  monthButton: {
    width: layout.minTarget,
    height: layout.minTarget,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: { flex: 1 },
  weekRow: {
    flexDirection: 'row',
    marginBottom: space.xs,
  },
  weekCell: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.lg,
  },
  secondaryAction: {
    minHeight: layout.minTarget,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    flex: 1,
    minHeight: layout.minTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { marginTop: space.sm },
});
