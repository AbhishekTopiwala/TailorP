import { Colors } from '@/constants/theme';
import { AppProvider, useAppStore } from '@/store/AppStore';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

function RootLayoutContent() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { userSession } = useAppStore();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    setTimeout(() => {
      if (!userSession.isOnboarded) {
        router.replace('/onboarding');
      } else if (!userSession.isLoggedIn) {
        router.replace('/login');
      }
    }, 1);
  }, [userSession.isOnboarded, userSession.isLoggedIn, navigationState?.key]);

  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerShadowVisible: false, // Minimalistic, no shadow
      contentStyle: { backgroundColor: colors.background }
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: 'Profile & Settings', headerBackTitle: 'Back' }} />
      <Stack.Screen name="appointments" options={{ title: 'Book Appointment', headerBackTitle: 'Back' }} />
      <Stack.Screen name="customer/[id]" options={{ title: 'Customer Details', headerBackTitle: 'Back' }} />
      <Stack.Screen name="customer/new" options={{ title: 'New Customer', headerBackTitle: 'Back' }} />
      <Stack.Screen name="order/[id]" options={{ title: 'Order Details', headerBackTitle: 'Back' }} />
      <Stack.Screen name="order/new" options={{ title: 'New Order', headerBackTitle: 'Back' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutContent />
    </AppProvider>
  );
}
