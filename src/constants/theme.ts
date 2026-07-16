/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1F2937',
    background: '#FFFFFF',
    backgroundElement: '#F8FAFC',
    backgroundSelected: '#E2E8F0',
    textSecondary: '#6B7280',
    primary: '#2563EB',
    secondary: '#2563EB',
    surface: '#FFFFFF',
    error: '#EF4444',
    success: '#22C55E',
    warning: '#F59E0B',
    onPrimary: '#FFFFFF',
    border: '#E5E7EB',
    borderFocus: '#2563EB',
    placeholder: '#9CA3AF',
    divider: '#E5E7EB',
  },
  dark: {
    text: '#1F2937',
    background: '#FFFFFF',
    backgroundElement: '#F8FAFC',
    backgroundSelected: '#E2E8F0',
    textSecondary: '#6B7280',
    primary: '#2563EB',
    secondary: '#2563EB',
    surface: '#FFFFFF',
    error: '#EF4444',
    success: '#22C55E',
    warning: '#F59E0B',
    onPrimary: '#FFFFFF',
    border: '#E5E7EB',
    borderFocus: '#2563EB',
    placeholder: '#9CA3AF',
    divider: '#E5E7EB',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
