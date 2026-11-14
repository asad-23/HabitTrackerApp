import { Redirect } from 'expo-router';

import { useSettingsStore } from '@/stores/useSettings';

export default function Index() {
  const onboardingComplete = useSettingsStore((state) => state.onboardingComplete);

  return <Redirect href={onboardingComplete ? '/(tabs)' : '/onboarding'} />;
}
