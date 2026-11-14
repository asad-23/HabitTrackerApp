import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';

import type { Habit } from '@/db/schema';
import type { HabitDraft } from '@/db/repositories/habits';
import { useSessionStore } from '@/stores/useSession';
import { useSettingsStore } from '@/stores/useSettings';
import { ALL_DAYS, formatTime, type DateKey } from '@/domain/dates';
import { space } from '@/design/tokens';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { DateField } from '@/ui/DateField';
import { RepeatDayPicker } from '@/ui/RepeatDayPicker';
import { TextField } from '@/ui/TextField';
import { TimeField } from '@/ui/TimeField';

type HabitFormProps = {
  initial?: Habit;
  /** Used when creating a habit, e.g. from the onboarding date choice. */
  initialStartDate?: DateKey;
  submitLabel: string;
  onSubmit: (draft: HabitDraft) => void;
  onCancel?: () => void;
  busy?: boolean;
};

type Errors = Partial<Record<'name' | 'fullVersion' | 'minVersion', string>>;

export function HabitForm({
  initial,
  initialStartDate,
  submitLabel,
  onSubmit,
  onCancel,
  busy,
}: HabitFormProps) {
  const today = useSessionStore((state) => state.todayKey);
  const defaultReminderTime = useSettingsStore((state) => state.defaultReminderTime);
  const [name, setName] = useState(initial?.name ?? '');
  const [fullVersion, setFullVersion] = useState(initial?.fullVersion ?? '');
  const [minVersion, setMinVersion] = useState(initial?.minVersion ?? '');
  const [cue, setCue] = useState(initial?.cue ?? '');
  const [identity, setIdentity] = useState(initial?.identity ?? '');
  const [reminderTime, setReminderTime] = useState<string | null>(initial?.reminderTime ?? null);
  const [repeatMask, setRepeatMask] = useState(initial?.repeatMask ?? ALL_DAYS);
  const [startDate, setStartDate] = useState<DateKey>(
    initial?.startDate ?? initialStartDate ?? today,
  );
  const [errors, setErrors] = useState<Errors>({});

  const fullRef = useRef<ComponentRef<typeof TextInput>>(null);
  const minRef = useRef<ComponentRef<typeof TextInput>>(null);

  const trimmed = useMemo(
    () => ({
      name: name.trim(),
      fullVersion: fullVersion.trim(),
      minVersion: minVersion.trim(),
      cue: cue.trim(),
      identity: identity.trim(),
    }),
    [cue, fullVersion, identity, minVersion, name],
  );

  const submit = () => {
    const nextErrors: Errors = {};
    if (!trimmed.name) nextErrors.name = 'Give this habit a name.';
    if (!trimmed.fullVersion) nextErrors.fullVersion = 'Describe what a full version looks like.';
    if (!trimmed.minVersion) nextErrors.minVersion = 'A minimum version keeps the habit alive.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name: trimmed.name,
      fullVersion: trimmed.fullVersion,
      minVersion: trimmed.minVersion,
      cue: trimmed.cue,
      identity: trimmed.identity,
      reminderTime,
      repeatMask,
      startDate: initial?.startDate ?? startDate,
    });
  };

  return (
    <View style={styles.form}>
      <Card tone="sunken" style={styles.intro}>
        <AppText variant="label" weight="semibold" tone="primary">
          Two versions, one habit
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.introBody}>
          A full version for good days and a minimum for the rest. Both count.
        </AppText>
      </Card>

      <TextField
        label="Habit"
        placeholder="Read 10 pages"
        value={name}
        onChangeText={setName}
        error={errors.name}
        maxLength={60}
        autoCapitalize="sentences"
        returnKeyType="next"
        onSubmitEditing={() => fullRef.current?.focus()}
        autoFocus={!initial}
      />

      <TextField
        label="Full version"
        placeholder="Read ten pages before bed"
        value={fullVersion}
        onChangeText={setFullVersion}
        error={errors.fullVersion}
        maxLength={120}
        autoCapitalize="sentences"
        inputRef={fullRef}
        returnKeyType="next"
        onSubmitEditing={() => minRef.current?.focus()}
      />

      <TextField
        label="Minimum version"
        hint="On a hard day, this still counts."
        placeholder="Read one page"
        value={minVersion}
        onChangeText={setMinVersion}
        error={errors.minVersion}
        maxLength={120}
        autoCapitalize="sentences"
        inputRef={minRef}
        returnKeyType="next"
      />

      <TextField
        label="Cue (optional)"
        hint="Anchor it to something you already do."
        placeholder="After I pour my morning coffee"
        value={cue}
        onChangeText={setCue}
        maxLength={120}
        autoCapitalize="sentences"
      />

      <TextField
        label="Identity (optional)"
        hint="Who does this habit make you?"
        placeholder="Someone who reads every day"
        value={identity}
        onChangeText={setIdentity}
        maxLength={120}
        autoCapitalize="sentences"
      />

      <RepeatDayPicker label="Repeat on" mask={repeatMask} onChange={setRepeatMask} />

      {initial ? null : (
        <DateField
          label="Start date"
          value={startDate}
          onChange={setStartDate}
          hint="Today is fine. Choose another day if you want Twice to count from it."
        />
      )}

      <TimeField
        label="Reminder time"
        hint="Leave it empty to use your default reminder time."
        placeholder={`Default · ${formatTime(defaultReminderTime)}`}
        value={reminderTime}
        onChange={setReminderTime}
      />

      <View style={styles.actions}>
        <Button label={submitLabel} onPress={submit} size="lg" loading={busy} fullWidth />
        {onCancel ? (
          <Button label="Cancel" onPress={onCancel} variant="ghost" fullWidth />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.xl },
  intro: { gap: space.xs },
  introBody: { maxWidth: 420 },
  actions: { gap: space.sm, marginTop: space.sm },
});
