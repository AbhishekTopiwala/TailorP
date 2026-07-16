import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, useColorScheme, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore, getBalance, getPaymentStatus } from '@/store/AppStore';
import { MaterialIcons } from '@expo/vector-icons';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { customers, orders, updateCustomer, deleteCustomer } = useAppStore();

  const [editing, setEditing] = useState(false);
  const customer = customers.find(c => c.id === id);
  const [editForm, setEditForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    notes: customer?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  if (!customer || !customer.isActive) {
    return (
      <View style={[s.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Customer not found.</Text>
      </View>
    );
  }

  const customerOrders = orders.filter(o => o.customerId === id);
  const totalSpend = customerOrders.flatMap(o => o.payments).reduce((sum, p) => sum + p.amount, 0);
  const pendingBalance = customerOrders.reduce((sum, o) => sum + Math.max(0, getBalance(o)), 0);

  function startEditing() {
    setEditForm({
      name: customer?.name || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      notes: customer?.notes || '',
    });
    setErrors({});
    setEditing(true);
  }

  function validate() {
    const errs: Record<string, string> = {};
    const trimmedName = editForm.name.trim();
    const trimmedPhone = editForm.phone.trim();

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
      const duplicate = customers.find(c => c.isActive && c.id !== id && c.phone === trimmedPhone);
      if (duplicate) {
        errs.phone = 'A client with this phone number already exists';
      }
    }

    return errs;
  }

  const handleFieldChange = (key: string, val: string) => {
    setEditForm(f => ({ ...f, [key]: val }));
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    updateCustomer(id, {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      address: editForm.address.trim(),
      notes: editForm.notes.trim()
    });
    setEditing(false);
  }

  function handleDelete() {
    Alert.alert('Delete Customer', `Are you sure you want to remove ${customer?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteCustomer(id); router.back(); } }
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Client Details',
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={{ marginRight: 8, padding: 8 }} activeOpacity={0.7}>
              <MaterialIcons name="delete-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          )
        }}
      />
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Profile Header Banner */}
        <View style={[s.profileBanner, { backgroundColor: colors.backgroundElement, borderBottomColor: colors.divider }]}>
          <View style={[s.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={[s.avatarTxt, { color: colors.onPrimary }]}>{customer.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[s.custName, { color: colors.text }]}>{customer.name}</Text>
          <Text style={[s.custCode, { color: colors.textSecondary }]}>{customer.displayCode}</Text>
        </View>

        <View style={{ padding: 24 }}>
          {/* Summary Cards */}
          <View style={s.summaryRow}>
            <SummaryCard label="Orders" value={String(customerOrders.length)} colors={colors} icon="assignment" iconColor={colors.primary} />
            <SummaryCard label="Total Paid" value={`₹${totalSpend.toLocaleString('en-IN')}`} colors={colors} icon="payments" iconColor="#16A34A" />
            <SummaryCard label="Pending" value={`₹${pendingBalance.toLocaleString('en-IN')}`} colors={colors} icon="hourglass-empty" iconColor={pendingBalance > 0 ? colors.error : '#16A34A'} accent={pendingBalance > 0 ? colors.error : '#16A34A'} />
          </View>

          {/* Info Card */}
          <View style={[s.infoCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <View style={[s.infoRow, { borderBottomColor: colors.divider }]}>
              <MaterialIcons name="phone" size={18} color={colors.textSecondary} style={s.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Phone Number</Text>
                <Text style={[s.infoValue, { color: colors.text }]}>{customer.phone}</Text>
              </View>
            </View>
            {customer.address ? (
              <View style={[s.infoRow, { borderBottomColor: colors.divider }]}>
                <MaterialIcons name="place" size={18} color={colors.textSecondary} style={s.infoIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Address</Text>
                  <Text style={[s.infoValue, { color: colors.text }]}>{customer.address}</Text>
                </View>
              </View>
            ) : null}
            {customer.gender ? (
              <View style={[s.infoRow, { borderBottomColor: colors.divider }]}>
                <MaterialIcons name="person" size={18} color={colors.textSecondary} style={s.infoIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Gender</Text>
                  <Text style={[s.infoValue, { color: colors.text }]}>{customer.gender}</Text>
                </View>
              </View>
            ) : null}
            {customer.notes ? (
              <View style={[s.infoRow, { borderBottomColor: 'transparent' }]}>
                <MaterialIcons name="notes" size={18} color={colors.textSecondary} style={s.infoIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Notes</Text>
                  <Text style={[s.infoValue, { color: colors.text }]}>{customer.notes}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View style={s.actionRow}>
            <TouchableOpacity
              style={[s.actionBtn, { borderColor: colors.primary, borderWidth: 1 }]}
              onPress={startEditing}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialIcons name="edit" size={16} color={colors.primary} />
                <Text style={[s.actionTxt, { color: colors.primary }]}>Edit Profile</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push(`/order/new?customerId=${id}`)}
              activeOpacity={0.85}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialIcons name="add" size={16} color={colors.onPrimary} />
                <Text style={[s.actionTxt, { color: colors.onPrimary }]}>New Order</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Order History */}
          <View style={s.sectionHeaderRow}>
            <MaterialIcons name="history" size={16} color={colors.textSecondary} />
            <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>Order History ({customerOrders.length})</Text>
          </View>

          {customerOrders.length === 0 ? (
            <View style={[s.emptyCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', fontWeight: '500' }}>No orders registered yet</Text>
            </View>
          ) : (
            customerOrders.map(order => {
              const bal = getBalance(order);
              const ps = getPaymentStatus(order);
              return (
                <TouchableOpacity
                  key={order.id}
                  style={[s.orderCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                  onPress={() => router.push(`/order/${order.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[s.ordNum, { color: colors.textSecondary }]}>{order.orderNumber}</Text>
                    <Text style={[s.ordDate, { color: colors.textSecondary }]}>{formatDate(order.orderDate)}</Text>
                  </View>
                  <Text style={[s.garments, { color: colors.text, marginVertical: 6 }]}>
                    {order.items.map(i => `${i.garmentType} (x${i.quantity})`).join(' · ')}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <StatusBadge status={order.status} colors={colors} />
                    <Text style={[s.amount, { color: ps === 'Paid' ? '#16A34A' : colors.error }]}>
                      {ps === 'Paid' ? '✓ Paid' : `Bal: ₹${bal}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editing} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[s.modalHeader, { borderBottomColor: colors.divider }]}>
            <TouchableOpacity onPress={() => setEditing(false)} activeOpacity={0.7} style={{ paddingVertical: 8 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[s.modalTitle, { color: colors.text }]}>Edit Customer</Text>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.7} style={{ paddingVertical: 8 }}>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Field
              label="Full Name"
              value={editForm.name}
              onChange={(v: string) => handleFieldChange('name', v)}
              colors={colors}
              focused={focusedInput === 'name'}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
              error={errors.name}
            />
            <Field
              label="Phone Number"
              value={editForm.phone}
              onChange={(v: string) => handleFieldChange('phone', v)}
              colors={colors}
              keyboardType="phone-pad"
              focused={focusedInput === 'phone'}
              onFocus={() => setFocusedInput('phone')}
              onBlur={() => setFocusedInput(null)}
              error={errors.phone}
            />
            <Field
              label="Address"
              value={editForm.address}
              onChange={(v: string) => setEditForm(f => ({ ...f, address: v }))}
              colors={colors}
              multiline
              focused={focusedInput === 'address'}
              onFocus={() => setFocusedInput('address')}
              onBlur={() => setFocusedInput(null)}
            />
            <Field
              label="Notes"
              value={editForm.notes}
              onChange={(v: string) => setEditForm(f => ({ ...f, notes: v }))}
              colors={colors}
              multiline
              focused={focusedInput === 'notes'}
              onFocus={() => setFocusedInput('notes')}
              onBlur={() => setFocusedInput(null)}
            />

            <TouchableOpacity
              style={[s.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={[s.saveTxt, { color: colors.onPrimary }]}>✓ Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

function Field({ label, value, onChange, colors, keyboardType, multiline, focused, onFocus, onBlur, error }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[s.fieldLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          s.fieldInput,
          {
            backgroundColor: colors.backgroundElement,
            color: colors.text,
            borderColor: error ? colors.error : (focused ? colors.borderFocus : colors.border),
            height: multiline ? 90 : 52,
            textAlignVertical: multiline ? 'top' : 'center',
            paddingVertical: multiline ? 12 : 0,
          }
        ]}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor={colors.placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {error ? <Text style={{ fontSize: 12, color: colors.error, fontWeight: '600', marginTop: 4, marginLeft: 4 }}>{error}</Text> : null}
    </View>
  );
}

function SummaryCard({ label, value, colors, icon, iconColor, accent }: any) {
  return (
    <View style={[s.summaryCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <View style={[s.summaryIconCircle, { backgroundColor: iconColor + '10' }]}>
        <MaterialIcons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[s.summaryValue, { color: accent || colors.text }]} numberOfLines={1}>{value}</Text>
      <Text style={[s.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function StatusBadge({ status, colors }: any) {
  const map: Record<string, string> = {
    'Ready': '#16A34A',
    'Delivered': '#16A34A',
    'Completed': '#64748B',
    'Stitching': '#D97706',
    'Cutting': '#D97706',
    'Trial': '#2563EB',
    'Final Stitch': '#2563EB',
  };
  const c = map[status] || colors.primary;
  return (
    <View style={[s.badge, { backgroundColor: c + '08', borderColor: c }]}>
      <Text style={[s.badgeTxt, { color: c }]}>{status}</Text>
    </View>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const s = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileBanner: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20, borderBottomWidth: 1 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarTxt: { fontSize: 32, fontWeight: 'bold' },
  custName: { fontSize: 22, fontWeight: 'bold', letterSpacing: -0.5 },
  custCode: { fontSize: 13, marginTop: 4, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 20 },
  summaryCard: { flex: 1, borderRadius: 20, padding: 12, alignItems: 'center', borderWidth: 1 },
  summaryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  summaryValue: { fontSize: 13, fontWeight: '800', marginTop: 2, letterSpacing: -0.2 },
  summaryLabel: { fontSize: 10, marginTop: 2, fontWeight: '700', textAlign: 'center' },
  infoCard: { borderRadius: 20, marginBottom: 24, overflow: 'hidden', borderWidth: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  infoIcon: { marginRight: 12 },
  infoLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2, textTransform: 'uppercase' },
  infoValue: { fontSize: 15, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  actionTxt: { fontSize: 14, fontWeight: '700' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  emptyCard: { padding: 24, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  orderCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2
  },
  ordNum: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  ordDate: { fontSize: 11, fontWeight: '600' },
  garments: { fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
  amount: { fontSize: 14, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeTxt: { fontSize: 10, fontWeight: '700', letterSpacing: 0.1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 4, textTransform: 'uppercase' },
  fieldInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 15 },
  saveBtn: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  saveTxt: { fontSize: 16, fontWeight: '700' },
});
