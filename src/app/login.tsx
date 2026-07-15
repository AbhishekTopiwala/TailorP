import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/store/AppStore';

const MOCK_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
];

export default function LoginScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { login } = useAppStore();

  const [role, setRole] = useState<'tailor' | 'client'>('tailor');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(MOCK_AVATARS[0]);

  // For focus styling states
  const [focusedInput, setFocusedInput] = useState<'name' | 'phone' | 'shop' | null>(null);

  function handleLogin() {
    if (!name.trim()) return;
    if (!phone.trim()) return;

    login(name, phone, role, selectedAvatar, role === 'tailor' ? shopName : undefined);
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <View style={s.headerContainer}>
          <Text style={[s.titleText, { color: colors.text }]}>Welcome to Tailor</Text>
          <Text style={[s.subtitleText, { color: colors.textSecondary }]}>
            Set up your custom workspace to continue
          </Text>
        </View>

        {/* Role Selector Tabs */}
        <Text style={[s.inputLabel, { color: colors.text }]}>I AM A</Text>
        <View style={[s.roleContainer, { backgroundColor: colors.backgroundElement }]}>
          <TouchableOpacity
            style={[
              s.roleTab,
              role === 'tailor' && [s.roleTabActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => setRole('tailor')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                s.roleTabTxt,
                { color: role === 'tailor' ? colors.onPrimary : colors.textSecondary },
              ]}
            >
              Tailor / Designer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              s.roleTab,
              role === 'client' && [s.roleTabActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => setRole('client')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                s.roleTabTxt,
                { color: role === 'client' ? colors.onPrimary : colors.textSecondary },
              ]}
            >
              Customer / Client
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avatar Selection */}
        <Text style={[s.inputLabel, { color: colors.text }]}>CHOOSE AVATAR</Text>
        <View style={s.avatarRow}>
          {MOCK_AVATARS.map((uri) => (
            <TouchableOpacity
              key={uri}
              onPress={() => setSelectedAvatar(uri)}
              activeOpacity={0.7}
              style={[
                s.avatarWrapper,
                selectedAvatar === uri && { borderColor: colors.primary, borderWidth: 3 },
              ]}
            >
              <Image source={{ uri }} style={s.avatarImg} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Inputs */}
        <View style={s.formContainer}>
          <View style={s.inputWrapper}>
            <Text style={[s.inputLabel, { color: colors.text }]}>FULL NAME</Text>
            <TextInput
              style={[
                s.textInput,
                {
                  borderColor: focusedInput === 'name' ? colors.borderFocus : colors.border,
                  backgroundColor: colors.background,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. Rahul Patel"
              placeholderTextColor={colors.placeholder}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={s.inputWrapper}>
            <Text style={[s.inputLabel, { color: colors.text }]}>PHONE NUMBER</Text>
            <TextInput
              style={[
                s.textInput,
                {
                  borderColor: focusedInput === 'phone' ? colors.borderFocus : colors.border,
                  backgroundColor: colors.background,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. 9876543210"
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setFocusedInput('phone')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {role === 'tailor' && (
            <View style={s.inputWrapper}>
              <Text style={[s.inputLabel, { color: colors.text }]}>BOUTIQUE / SHOP NAME</Text>
              <TextInput
                style={[
                  s.textInput,
                  {
                    borderColor: focusedInput === 'shop' ? colors.borderFocus : colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                  },
                ]}
                placeholder="e.g. Royal Stitches"
                placeholderTextColor={colors.placeholder}
                value={shopName}
                onChangeText={setShopName}
                onFocus={() => setFocusedInput('shop')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            s.submitBtn,
            { backgroundColor: name.trim() && phone.trim() ? colors.primary : colors.border },
          ]}
          onPress={handleLogin}
          disabled={!name.trim() || !phone.trim()}
          activeOpacity={0.85}
        >
          <Text style={[s.submitBtnTxt, { color: name.trim() && phone.trim() ? colors.onPrimary : colors.placeholder }]}>
            Continue to App
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  roleTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  roleTabTxt: {
    fontSize: 14,
    fontWeight: '600',
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
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  formContainer: {
    marginTop: 8,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  textInput: {
    height: 54,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  submitBtn: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnTxt: {
    fontSize: 16,
    fontWeight: '700',
  },
});
