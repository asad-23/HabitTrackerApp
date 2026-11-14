import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/design/theme';
import { typeScale, type ThemeColors, type TypeVariant } from '@/design/tokens';

export type TextTone = 'text' | 'muted' | 'faint' | 'primary' | 'accent' | 'onPrimary' | 'danger';

type AppTextProps = TextProps & {
  variant?: TypeVariant;
  tone?: TextTone;
  /** Overrides the variant family, e.g. a medium-weight label. */
  weight?: 'regular' | 'medium' | 'semibold';
  align?: TextStyle['textAlign'];
  /** Display sizes scale less aggressively so headlines never clip. */
  maxScale?: number;
};

const weightFamilies = {
  regular: 'DMSans-Regular',
  medium: 'DMSans-Medium',
  semibold: 'DMSans-SemiBold',
} as const;

function toneColor(tone: TextTone, palette: ThemeColors): string {
  switch (tone) {
    case 'muted':
      return palette.muted;
    case 'faint':
      return palette.faint;
    case 'primary':
      return palette.primaryText;
    case 'accent':
      return palette.accentSoftText;
    case 'onPrimary':
      return palette.onPrimary;
    case 'danger':
      return palette.danger;
    default:
      return palette.text;
  }
}

export function AppText({
  variant = 'body',
  tone = 'text',
  weight,
  align,
  maxScale,
  style,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();
  const base = typeScale[variant];

  return (
    <Text
      {...rest}
      maxFontSizeMultiplier={maxScale ?? (variant === 'display' || variant === 'title' ? 1.3 : 1.6)}
      style={[
        base,
        weight ? { fontFamily: weightFamilies[weight] } : null,
        { color: toneColor(tone, colors) },
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
