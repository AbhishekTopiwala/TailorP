import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, TextInput, Alert, useColorScheme, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore, Customer } from '@/store/AppStore';

export default function CustomersScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { customers, orders, addCustomer, deleteCustomer } = useAppStore();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', gender: 'Male' as 'Male' | 'Female' | 'Other' });
  const [formError, setFormError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const activeCustomers = customers.filter(c => c.isActive);
  const filtered = activeCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  function handleSave() {
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    if (!form.phone.trim() || form.phone.length < 10) { setFormError('Valid phone number required'); return; }
    addCustomer({ name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim(), gender: form.gender });
    setForm({ name: '', phone: '', address: '', gender: 'Male' });
    setFormError('');
    setShowForm(false);
  }

  function handleDelete(customer: Customer) {
    Alert.alert('Delete Customer', `Remove ${customer.name}? Their orders will remain.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCustomer(customer.id) }
    ]);
  }

  function getOrderCount(cid: string) {
    return orders.filter(o => o.customerId === cid).length;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
        <Text style={[s.headerTitle, { color: colors.text }]}>👥 Clients</Text>
        <TouchableOpacity style={[s.addBtn, { backgroundColor: colors.primary }]} onPress={() => setShowForm(true)} activeOpacity={0.8}>
          <Text style={[s.addBtnText, { color: colors.onPrimary }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[s.searchBar, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <Text style={{ marginRight: 8, fontSize: 16 }}>🔍</Text>
        <TextInput
          style={[s.searchInput, { color: colors.text }]}
          placeholder="Search client by name or phone…"
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: colors.textSecondary, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Count */}
      <Text style={[s.countText, { color: colors.textSecondary }]}>
        Showing {filtered.length} client{filtered.length !== 1 ? 's' : ''}
      </Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ListEmptyComponent={<EmptyState emoji="👥" message={search ? 'No matches found' : 'No clients registered yet. Tap + Add to begin.'} colors={colors} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
            onPress={() => router.push(`/customer/${item.id}`)}
            activeOpacity={0.8}
          >
            <View style={[s.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[s.avatarText, { color: colors.onPrimary }]}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[s.custName, { color: colors.text }]}>{item.name}</Text>
                {item.gender === 'Female' && <Text style={{ marginLeft: 6, fontSize: 13 }}>👩</Text>}
              </View>
              <Text style={[s.custPhone, { color: colors.textSecondary }]}>📞 {item.phone}</Text>
              <Text style={[s.custCode, { color: colors.textSecondary }]}>{item.displayCode} · {getOrderCount(item.id)} orders</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={12} style={s.deleteBtn} activeOpacity={0.7}>
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Add Customer Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[s.modalHeader, { borderBottomColor: colors.divider }]}>
            <TouchableOpacity onPress={() => { setShowForm(false); setFormError(''); }} activeOpacity={0.7}>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[s.modalTitle, { color: colors.text }]}>Add New Client</Text>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
            {formError ? <Text style={[s.error, { color: colors.error }]}>{formError}</Text> : null}

            <FieldGroup label="Full Name *" error="" colors={colors}>
              <TextInput
                style={[
                  s.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: focusedInput === 'name' ? colors.borderFocus : colors.border
                  }
                ]}
                placeholder="e.g. Ramesh Sharma"
                placeholderTextColor={colors.placeholder}
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
              />
            </FieldGroup>

            <FieldGroup label="Phone Number *" error="" colors={colors}>
              <TextInput
                style={[
                  s.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: focusedInput === 'phone' ? colors.borderFocus : colors.border
                  }
                ]}
                placeholder="e.g. 9876543210"
                placeholderTextColor={colors.placeholder}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={v => setForm(f => ({ ...f, phone: v }))}
                onFocus={() => setFocusedInput('phone')}
                onBlur={() => setFocusedInput(null)}
              />
            </FieldGroup>

            <FieldGroup label="Address" error="" colors={colors}>
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
                placeholder="Street, Area, City…"
                placeholderTextColor={colors.placeholder}
                multiline
                value={form.address}
                onChangeText={v => setForm(f => ({ ...f, address: v }))}
                onFocus={() => setFocusedInput('address')}
                onBlur={() => setFocusedInput(null)}
              />
            </FieldGroup>

            <FieldGroup label="Gender" error="" colors={colors}>
              <View style={s.genderRow}>
                {(['Male', 'Female', 'Other'] as const).map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      s.genderBtn,
                      {
                        backgroundColor: form.gender === g ? colors.primary : colors.backgroundElement,
                        borderColor: form.gender === g ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => setForm(f => ({ ...f, gender: g }))}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.genderTxt, { color: form.gender === g ? colors.onPrimary : colors.text }]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FieldGroup>

            <TouchableOpacity
              style={[s.saveFullBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={[s.saveFullTxt, { color: colors.onPrimary }]}>✓ Save Client</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function FieldGroup({ label, children, error, colors }: { label: string; children: React.ReactNode; error?: string; colors: any }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[s.label, { color: colors.text }]}>{label}</Text>
      {children}
      {error ? <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}

function EmptyState({ emoji, message, colors }: any) {
  return (
    <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 56 }}>{emoji}</Text>
      <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', letterSpacing: -0.5 },
  addBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  addBtnText: { fontWeight: '700', fontSize: 14 },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 20, marginBottom: 8, padding: 12, borderRadius: 14, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15 },
  countText: { fontSize: 12, marginLeft: 24, marginBottom: 4, fontWeight: '600' },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
    marginBottom: 12, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1
  },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold' },
  custName: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  custPhone: { fontSize: 13, marginTop: 2 },
  custCode: { fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 8 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, height: 52 },
  multiline: { height: 80, textAlignVertical: 'top' },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, alignItems: 'center' },
  genderTxt: { fontSize: 13, fontWeight: '600' },
  error: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  saveFullBtn: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  saveFullTxt: { fontSize: 16, fontWeight: '700' },
});
