/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1F2B',
    background: '#FFFFFF',
    backgroundElement: '#F7F7F8',
    backgroundSelected: '#F7F7F8',
    textSecondary: '#4B5563',
    primary: '#1A1F2B',
    secondary: '#1A1F2B',
    surface: '#FFFFFF',
    error: '#EF4444',
    success: '#22C55E',
    warning: '#F59E0B',
    onPrimary: '#FFFFFF',
    border: '#E5E7EB',
    borderFocus: '#1A1F2B',
    placeholder: '#9CA3AF',
    divider: '#EEEEEE',
  },
  dark: {
    text: '#F9FAFB',
    background: '#09090B',
    backgroundElement: '#18181B',
    backgroundSelected: '#27272A',
    textSecondary: '#A1A1AA',
    primary: '#FAFAFA',
    secondary: '#FAFAFA',
    surface: '#18181B',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    onPrimary: '#09090B',
    border: '#27272A',
    borderFocus: '#FAFAFA',
    placeholder: '#71717A',
    divider: '#27272A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
