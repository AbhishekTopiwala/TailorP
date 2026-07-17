import { Colors } from '@/constants/theme';
import { AppProvider, useAppStore } from '@/store/AppStore';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import { CustomAlertView } from '@/components/CustomAlertView';

function RootLayoutContent() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { userSession, loading, storagePermissionGranted, requestStoragePermission } = useAppStore();
  const navigationState = useRootNavigationState();

  // Request storage permission on app launch if not decided
  useEffect(() => {
    if (loading) return;
    if (storagePermissionGranted === null) {
      requestStoragePermission();
    }
  }, [loading, storagePermissionGranted, requestStoragePermission]);

  // Handle routing based on user session
  useEffect(() => {
    if (!navigationState?.key || loading) return;

    setTimeout(() => {
      if (!userSession.isOnboarded) {
        router.replace('/onboarding');
      } else if (!userSession.isLoggedIn) {
        router.replace('/login');
      }
    }, 1);
  }, [userSession.isOnboarded, userSession.isLoggedIn, navigationState?.key, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
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
        <Stack.Screen name="appointments/index" options={{ title: 'Upcoming Trials', headerBackTitle: 'Back' }} />
        <Stack.Screen name="appointments/book" options={{ title: 'Schedule Appointment', headerBackTitle: 'Back' }} />
        <Stack.Screen name="customer/[id]" options={{ title: 'Customer Details', headerBackTitle: 'Back' }} />
        <Stack.Screen name="customer/new" options={{ title: 'New Customer', headerBackTitle: 'Back' }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Order Details', headerBackTitle: 'Back' }} />
        <Stack.Screen name="order/new" options={{ title: 'New Order', headerBackTitle: 'Back' }} />
      </Stack>
      <CustomAlertView />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutContent />
    </AppProvider>
  );
}
