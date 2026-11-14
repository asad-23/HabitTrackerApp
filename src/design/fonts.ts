import { useFonts } from 'expo-font';

export const fontAssets = {
  'Fraunces-SemiBold': require('../../assets/fonts/Fraunces-SemiBold.ttf'),
  'DMSans-Regular': require('../../assets/fonts/DMSans-Regular.ttf'),
  'DMSans-Medium': require('../../assets/fonts/DMSans-Medium.ttf'),
  'DMSans-SemiBold': require('../../assets/fonts/DMSans-SemiBold.ttf'),
} as const;

export function useAppFonts(): [boolean, Error | null] {
  return useFonts(fontAssets);
}
