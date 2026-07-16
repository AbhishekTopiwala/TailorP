import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/store/AppStore';
import { MaterialIcons } from '@expo/vector-icons';

const MOCK_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
];

export default function LoginScreen() {
  const colors = Colors.light; // Force light mode
  const { login } = useAppStore();

  const role = 'tailor';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(MOCK_AVATARS[0]);

  // For focus/touch styling states
  const [focusedInput, setFocusedInput] = useState<'name' | 'phone' | 'shop' | null>(null);
  const [touchedInputs, setTouchedInputs] = useState<{ name?: boolean; phone?: boolean; shop?: boolean }>({});

  const nameError = !name.trim()
    ? 'Name is required'
    : name.trim().length < 3
    ? 'Name must be at least 3 characters'
    : !/^[A-Za-z\s]+$/.test(name)
    ? 'Name can only contain letters and spaces'
    : '';

  const phoneError = !phone.trim()
    ? 'Phone number is required'
    : !/^\d{10}$/.test(phone)
    ? 'Enter a valid 10-digit phone number'
    : '';

  const shopNameError = !shopName.trim()
    ? 'Shop name is required'
    : shopName.trim().length < 3
    ? 'Shop name must be at least 3 characters'
    : !/^[A-Za-z0-9\s&'\-\.]+$/.test(shopName)
    ? "Shop name can only contain letters, numbers, spaces, and & ' - ."
    : '';

  const isFormValid = !nameError && !phoneError && !shopNameError;

  const handleBlur = (field: 'name' | 'phone' | 'shop') => {
    setFocusedInput(null);
    setTouchedInputs(prev => ({ ...prev, [field]: true }));
  };

  const handleChangeText = (field: 'name' | 'phone' | 'shop', value: string) => {
    if (field === 'name') setName(value);
    else if (field === 'phone') setPhone(value);
    else if (field === 'shop') setShopName(value);

    setTouchedInputs(prev => ({ ...prev, [field]: true }));
  };

  function handleLogin() {
    if (!isFormValid) {
      setTouchedInputs({ name: true, phone: true, shop: true });
      return;
    }
    login(name.trim(), phone.trim(), role, selectedAvatar, shopName.trim());
    router.replace('/(tabs)');
  }

  const hasNameError = !!(touchedInputs.name && nameError);
  const hasPhoneError = !!(touchedInputs.phone && phoneError);
  const hasShopNameError = !!(touchedInputs.shop && shopNameError);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Designer Brand Icon */}
          <View style={s.brandLogoContainer}>
            <View style={[s.brandIconWrapper, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '18' }]}>
              <MaterialIcons name="design-services" size={32} color={colors.primary} />
            </View>
          </View>

          {/* Title */}
          <View style={s.headerContainer}>
            <Text style={[s.titleText, { color: colors.text }]}>Welcome to TailorP</Text>
            <Text style={[s.subtitleText, { color: colors.textSecondary }]}>
              Set up your custom boutique workspace to manage details & orders.
            </Text>
          </View>

          {/* Avatar Selection */}
          <Text style={[s.inputLabel, { color: colors.textSecondary }]}>CHOOSE PROFILE PICTURE</Text>
          <View style={s.avatarRow}>
            {MOCK_AVATARS.map((uri) => (
              <TouchableOpacity
                key={uri}
                onPress={() => setSelectedAvatar(uri)}
                activeOpacity={0.7}
                style={[
                  s.avatarWrapper,
                  selectedAvatar === uri ? { borderColor: colors.primary } : { borderColor: colors.border },
                ]}
              >
                <Image source={{ uri }} style={s.avatarImg} />
                {selectedAvatar === uri && (
                  <View style={[s.avatarCheck, { backgroundColor: colors.primary }]}>
                    <MaterialIcons name="check" size={10} color={colors.onPrimary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Inputs */}
          <View style={s.formContainer}>
            <View style={s.inputWrapper}>
              <Text style={[s.inputLabel, { color: colors.textSecondary }]}>FULL NAME</Text>
              <TextInput
                style={[
                  s.textInput,
                  {
                    borderColor: hasNameError
                      ? colors.error
                      : focusedInput === 'name'
                      ? colors.borderFocus
                      : colors.border,
                    backgroundColor: colors.backgroundElement,
                    color: colors.text,
                  },
                ]}
                placeholder="e.g. Ramesh Sharma"
                placeholderTextColor={colors.placeholder}
                value={name}
                onChangeText={(text) => handleChangeText('name', text)}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => handleBlur('name')}
              />
              {hasNameError && (
                <Text style={[s.errorText, { color: colors.error }]}>{nameError}</Text>
              )}
            </View>

            <View style={s.inputWrapper}>
              <Text style={[s.inputLabel, { color: colors.textSecondary }]}>PHONE NUMBER</Text>
              <TextInput
                style={[
                  s.textInput,
                  {
                    borderColor: hasPhoneError
                      ? colors.error
                      : focusedInput === 'phone'
                      ? colors.borderFocus
                      : colors.border,
                    backgroundColor: colors.backgroundElement,
                    color: colors.text,
                  },
                ]}
                placeholder="e.g. 9876543210"
                placeholderTextColor={colors.placeholder}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => handleChangeText('phone', text)}
                onFocus={() => setFocusedInput('phone')}
                onBlur={() => handleBlur('phone')}
              />
              {hasPhoneError && (
                <Text style={[s.errorText, { color: colors.error }]}>{phoneError}</Text>
              )}
            </View>

            <View style={s.inputWrapper}>
              <Text style={[s.inputLabel, { color: colors.textSecondary }]}>BOUTIQUE / SHOP NAME</Text>
              <TextInput
                style={[
                  s.textInput,
                  {
                    borderColor: hasShopNameError
                      ? colors.error
                      : focusedInput === 'shop'
                      ? colors.borderFocus
                      : colors.border,
                    backgroundColor: colors.backgroundElement,
                    color: colors.text,
                  },
                ]}
                placeholder="e.g. Royal Stitches"
                placeholderTextColor={colors.placeholder}
                value={shopName}
                onChangeText={(text) => handleChangeText('shop', text)}
                onFocus={() => setFocusedInput('shop')}
                onBlur={() => handleBlur('shop')}
              />
              {hasShopNameError && (
                <Text style={[s.errorText, { color: colors.error }]}>{shopNameError}</Text>
              )}
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              s.submitBtn,
              { backgroundColor: isFormValid ? colors.primary : colors.divider },
            ]}
            onPress={handleLogin}
            disabled={!isFormValid}
            activeOpacity={0.85}
          >
            <Text style={[s.submitBtnTxt, { color: isFormValid ? colors.onPrimary : colors.placeholder }]}>
              Continue to App
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 36,
    paddingBottom: 80,
    flexGrow: 1,
    justifyContent: 'center',
  },
  brandLogoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandIconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 28,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subtitleText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  roleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleTabActive: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  roleTabTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    padding: 2,
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    resizeMode: 'cover',
  },
  avatarCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    marginTop: 8,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  textInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  submitBtn: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 48,
  },
  submitBtnTxt: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
});
