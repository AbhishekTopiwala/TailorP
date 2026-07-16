import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/store/AppStore';
import { MaterialIcons } from '@expo/vector-icons';

export default function NewCustomerScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { addCustomer, customers } = useAppStore();

  const [form, setForm] = useState({
    name: '', phone: '', altPhone: '',
    address: '', gender: 'Male' as 'Male' | 'Female' | 'Other', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  function validate() {
    const errs: Record<string, string> = {};
    const trimmedName = form.name.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedAltPhone = form.altPhone.trim();

    if (!trimmedName) {
      errs.name = 'Full name is required';
    } else if (trimmedName.length < 3) {
      errs.name = 'Name must be at least 3 characters';
    } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      errs.name = 'Name can only contain letters and spaces';
    }

    if (!trimmedPhone) {
      errs.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(trimmedPhone)) {
      errs.phone = 'Enter a valid 10-digit phone number';
    } else {
      const duplicate = customers.find(c => c.isActive && c.phone === trimmedPhone);
      if (duplicate) {
        errs.phone = 'A client with this phone number already exists';
      }
    }

    if (trimmedAltPhone) {
      if (!/^\d{10}$/.test(trimmedAltPhone)) {
        errs.altPhone = 'Enter a valid 10-digit alternate phone number';
      } else if (trimmedAltPhone === trimmedPhone) {
        errs.altPhone = 'Alternate phone must be different from primary phone';
      }
    }

    return errs;
  }

  const f = (key: string, val: string) => {
    setForm(p => ({ ...p, [key]: val }));
    // Clear field-specific error as user types
    if (errors[key]) {
      setErrors(p => {
        const copy = { ...p };
        delete copy[key];
        return copy;
      });
    }
  };

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
    Alert.alert('Customer Added!', `${c.name} has been successfully added.`, [
      { text: 'Add Order', onPress: () => router.replace(`/order/new?customerId=${c.id}`) },
      { text: 'View Profile', onPress: () => router.replace(`/customer/${c.id}`) },
      { text: 'Done', onPress: () => router.back() },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Add Client' }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={[s.iconBox, { backgroundColor: colors.backgroundElement }]}>
            <View style={[s.avatarCircle, { backgroundColor: colors.primary + '10' }]}>
              <MaterialIcons name="person-add-alt-1" size={40} color={colors.primary} />
            </View>
            <Text style={[s.avatarTitle, { color: colors.text }]}>New Client Profile</Text>
          </View>

          <FieldGroup label="Full Name *" error={errors.name} colors={colors}>
            <TextInput
              style={[
                s.input,
                {
                  backgroundColor: colors.backgroundElement,
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
                  backgroundColor: colors.backgroundElement,
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

          <FieldGroup label="Alternate Phone" error={errors.altPhone} colors={colors}>
            <TextInput
              style={[
                s.input,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: errors.altPhone
                    ? colors.error
                    : focusedInput === 'altPhone'
                    ? colors.borderFocus
                    : colors.border
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
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: focusedInput === 'address' ? colors.borderFocus : colors.border,
                  paddingVertical: 12
                }
              ]}
              placeholder="e.g. Street, City, landmark..."
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
              {(['Male', 'Female', 'Other'] as const).map(g => {
                const isSelected = form.gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    style={[
                      s.genderBtn,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.backgroundElement,
                        borderColor: isSelected ? colors.primary : colors.border
                      }
                    ]}
                    onPress={() => f('gender', g)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.genderTxt, { color: isSelected ? colors.onPrimary : colors.textSecondary }]}>{g}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FieldGroup>

          <FieldGroup label="Notes / Preferences" colors={colors}>
            <TextInput
              style={[
                s.input,
                s.multiline,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: focusedInput === 'notes' ? colors.borderFocus : colors.border,
                  paddingVertical: 12
                }
              ]}
              placeholder="e.g. Prefers loose fit, custom sleeve length..."
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="check" size={20} color={colors.onPrimary} />
              <Text style={[s.saveTxt, { color: colors.onPrimary }]}>Save Customer</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function FieldGroup({ label, children, error, colors }: { label: string; children: React.ReactNode; error?: string; colors: any }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={[s.label, { color: colors.text }]}>{label}</Text>
      {children}
      {error ? <Text style={[s.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  iconBox: { alignItems: 'center', paddingVertical: 24, borderRadius: 20, marginBottom: 24 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 4, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, height: 52 },
  multiline: { height: 90, textAlignVertical: 'top' },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  genderTxt: { fontSize: 13, fontWeight: '700' },
  error: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  saveBtn: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  saveTxt: { fontSize: 16, fontWeight: '700' },
});
