import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Clock, X } from 'lucide-react-native';

import { useTheme } from '@/design/theme';
import { icons, layout, opacity } from '@/design/tokens';
import { DEFAULT_CLOCK_TIME } from '@/domain/clock';
import { formatTime } from '@/domain/dates';
import { AppText } from './AppText';
import { FieldShell } from './FieldShell';
import { TimePicker, type DialMode } from './TimePicker';

type TimeFieldProps = {
  label: string;
  /** `HH:mm`, or null when unset. */
  value: string | null;
  onChange: (value: string | null) => void;
  hint?: string;
  placeholder?: string;
  clearLabel?: string;
  /** Hides the clear button for settings that must always have a time. */
  allowClear?: boolean;
};

/** A shared field that opens Twice's own clock on every platform. */
export function TimeField({
  label,
  value,
  onChange,
  hint,
  placeholder = 'No reminder',
  clearLabel = 'Clear reminder',
  allowClear = true,
}: TimeFieldProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? DEFAULT_CLOCK_TIME);
  const [mode, setMode] = useState<DialMode>('hour');

  const openPicker = () => {
    setDraft(value ?? DEFAULT_CLOCK_TIME);
    setMode('hour');
    setOpen(true);
  };

  return (
    <>
      <FieldShell
        label={label}
        hint={hint}
        leading={
          <Clock size={icons.sm} strokeWidth={icons.stroke} color={colors.muted} />
        }
        trailing={
          value && allowClear ? (
            <Pressable
              onPress={() => onChange(null)}
              accessibilityRole="button"
              accessibilityLabel={clearLabel}
              hitSlop={10}
              style={styles.clear}
            >
              <X size={icons.sm - 4} strokeWidth={icons.stroke} color={colors.muted} />
            </Pressable>
          ) : null
        }
      >
        <Pressable
          onPress={openPicker}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value ? formatTime(value) : placeholder}`}
          accessibilityHint="Opens a clock"
          style={({ pressed }) => [styles.trigger, { opacity: pressed ? opacity.pressed : 1 }]}
        >
          <AppText tone={value ? 'text' : 'faint'} numberOfLines={1}>
            {value ? formatTime(value) : placeholder}
          </AppText>
        </Pressable>
      </FieldShell>

      <TimePicker
        visible={open}
        title={label}
        value={draft}
        onValueChange={setDraft}
        mode={mode}
        onModeChange={setMode}
        onClose={() => setOpen(false)}
        onConfirm={(next) => {
          onChange(next);
          setOpen(false);
        }}
        allowClear={allowClear}
        clearActionLabel="Clear time"
        onClear={() => {
          onChange(null);
          setOpen(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flex: 1,
    justifyContent: 'center',
    minHeight: layout.minTarget,
  },
  clear: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
