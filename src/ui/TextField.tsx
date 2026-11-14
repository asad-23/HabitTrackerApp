import { useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import { StyleSheet, TextInput, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/design/theme';
import { space, typeScale } from '@/design/tokens';
import { FieldShell } from './FieldShell';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  hint?: string;
  error?: string | null;
  /** Replaces the label row content, e.g. a character counter. */
  labelAccessory?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  multiline?: boolean;
  inputRef?: Ref<ComponentRef<typeof TextInput>>;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  hint,
  error,
  labelAccessory,
  leading,
  trailing,
  multiline = false,
  inputRef,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      labelAccessory={labelAccessory}
      leading={leading}
      trailing={trailing}
      focused={focused}
      multiline={multiline}
      style={containerStyle}
    >
      <TextInput
        {...rest}
        ref={inputRef}
        multiline={multiline}
        placeholderTextColor={colors.faint}
        selectionColor={colors.primary}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          typeScale.body,
          {
            color: colors.text,
            paddingTop: multiline ? space.md : 0,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
        accessibilityLabel={label}
      />
    </FieldShell>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    paddingVertical: space.md,
  },
});
