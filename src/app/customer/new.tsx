import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/store/AppStore';

export default function NewCustomerScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { addCustomer } = useAppStore();

  const [form, setForm] = useState({
    name: '', phone: '', altPhone: '',
    address: '', gender: 'Male' as 'Male' | 'Female' | 'Other', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.phone.trim() || form.phone.trim().length < 10) errs.phone = 'Valid 10-digit phone required';
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const c = addCustomer({
      name: form.name.trim(),
      phone: form.phone.trim(),
      altPhone: form.altPhone.trim(),
      address: form.address.trim(),
      gender: form.gender,
      notes: form.notes.trim()
    });
    Alert.alert('✅ Customer Added!', `${c.name} has been successfully added.`, [
      { text: 'Add Order', onPress: () => router.replace(`/order/new?customerId=${c.id}`) },
      { text: 'View Profile', onPress: () => router.replace(`/customer/${c.id}`) },
      { text: 'Done', onPress: () => router.back() },
    ]);
  }

  const f = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  return (
    <>
      <Stack.Screen options={{ title: 'Add Customer' }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

          <View style={[s.iconBox, { backgroundColor: colors.backgroundElement }]}>
            <Text style={{ fontSize: 48 }}>👤</Text>
          </View>

          <FieldGroup label="Full Name *" error={errors.name} colors={colors}>
            <TextInput
              style={[
                s.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: errors.name ? colors.error : (focusedInput === 'name' ? colors.borderFocus : colors.border)
                }
              ]}
              placeholder="e.g. Ramesh Sharma"
              placeholderTextColor={colors.placeholder}
              value={form.name}
              onChangeText={v => f('name', v)}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
            />
          </FieldGroup>

          <FieldGroup label="Phone Number *" error={errors.phone} colors={colors}>
            <TextInput
              style={[
                s.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: errors.phone ? colors.error : (focusedInput === 'phone' ? colors.borderFocus : colors.border)
                }
              ]}
              placeholder="e.g. 9876543210"
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={v => f('phone', v)}
              onFocus={() => setFocusedInput('phone')}
              onBlur={() => setFocusedInput(null)}
            />
          </FieldGroup>

          <FieldGroup label="Alternate Phone" colors={colors}>
            <TextInput
              style={[
                s.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: focusedInput === 'altPhone' ? colors.borderFocus : colors.border
                }
              ]}
              placeholder="Optional alternate number"
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
              value={form.altPhone}
              onChangeText={v => f('altPhone', v)}
              onFocus={() => setFocusedInput('altPhone')}
              onBlur={() => setFocusedInput(null)}
            />
          </FieldGroup>

          <FieldGroup label="Address" colors={colors}>
            <TextInput
              style={[
                s.input,
                s.multiline,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: focusedInput === 'address' ? colors.borderFocus : colors.border
                }
              ]}
              placeholder="e.g. Street, City, landmark…"
              placeholderTextColor={colors.placeholder}
              multiline
              value={form.address}
              onChangeText={v => f('address', v)}
              onFocus={() => setFocusedInput('address')}
              onBlur={() => setFocusedInput(null)}
            />
          </FieldGroup>

          <FieldGroup label="Gender" colors={colors}>
            <View style={s.genderRow}>
              {(['Male', 'Female', 'Other'] as const).map(g => (
                <TouchableOpacity
                  key={g}
                  style={[
                    s.genderBtn,
                    {
                      backgroundColor: form.gender === g ? colors.primary : colors.backgroundElement,
                      borderColor: form.gender === g ? colors.primary : colors.border
                    }
                  ]}
                  onPress={() => f('gender', g)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 16, marginBottom: 4 }}>{g === 'Male' ? '👨' : g === 'Female' ? '👩' : '🧑'}</Text>
                  <Text style={[s.genderTxt, { color: form.gender === g ? colors.onPrimary : colors.text }]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </FieldGroup>

          <FieldGroup label="Notes / Preferences" colors={colors}>
            <TextInput
              style={[
                s.input,
                s.multiline,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: focusedInput === 'notes' ? colors.borderFocus : colors.border
                }
              ]}
              placeholder="e.g. Prefers loose fit, custom sleeve length…"
              placeholderTextColor={colors.placeholder}
              multiline
              value={form.notes}
              onChangeText={v => f('notes', v)}
              onFocus={() => setFocusedInput('notes')}
              onBlur={() => setFocusedInput(null)}
            />
          </FieldGroup>

          <TouchableOpacity
            style={[s.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={[s.saveTxt, { color: colors.onPrimary }]}>✓ Save Customer</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function FieldGroup({ label, children, error, colors }: { label: string; children: React.ReactNode; error?: string; colors: any }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[s.label, { color: colors.text }]}>{label}</Text>
      {children}
      {error ? <Text style={[s.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  iconBox: { alignItems: 'center', paddingVertical: 24, borderRadius: 16, marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, height: 52 },
  multiline: { height: 80, textAlignVertical: 'top' },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, alignItems: 'center' },
  genderTxt: { fontSize: 13, fontWeight: '600' },
  error: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  saveBtn: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  saveTxt: { fontSize: 16, fontWeight: '700' },
});
