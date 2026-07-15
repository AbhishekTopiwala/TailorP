import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, useColorScheme, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore, getBalance, getPaymentStatus } from '@/store/AppStore';

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

  function handleSave() {
    if (!editForm.name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    if (!editForm.phone.trim()) { Alert.alert('Error', 'Phone is required'); return; }
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
          title: 'Customer Details',
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={{ marginRight: 8 }} activeOpacity={0.7}>
              <Text style={{ color: colors.error, fontSize: 15, fontWeight: '600' }}>Delete</Text>
            </TouchableOpacity>
          )
        }}
      />
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Header */}
        <View style={[s.profileBanner, { backgroundColor: colors.backgroundElement, borderBottomColor: colors.divider }]}>
          <View style={[s.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={[s.avatarTxt, { color: colors.onPrimary }]}>{customer.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[s.custName, { color: colors.text }]}>{customer.name}</Text>
          <Text style={[s.custCode, { color: colors.textSecondary }]}>{customer.displayCode}</Text>
        </View>

        <View style={{ padding: 20 }}>
          {/* Summary Cards */}
          <View style={s.summaryRow}>
            <SummaryCard label="Total Orders" value={String(customerOrders.length)} colors={colors} emoji="📋" />
            <SummaryCard label="Total Paid" value={`₹${totalSpend.toLocaleString('en-IN')}`} colors={colors} emoji="💰" />
            <SummaryCard label="Pending" value={`₹${pendingBalance.toLocaleString('en-IN')}`} colors={colors} emoji="⏳" accent={pendingBalance > 0 ? colors.error : colors.success} />
          </View>

          {/* Info Card */}
          <View style={[s.infoCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <View style={[s.infoRow, { borderBottomColor: colors.divider }]}>
              <Text style={s.infoIcon}>📞</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Phone Number</Text>
                <Text style={[s.infoValue, { color: colors.text }]}>{customer.phone}</Text>
              </View>
            </View>
            {customer.address ? (
              <View style={[s.infoRow, { borderBottomColor: colors.divider }]}>
                <Text style={s.infoIcon}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Address</Text>
                  <Text style={[s.infoValue, { color: colors.text }]}>{customer.address}</Text>
                </View>
              </View>
            ) : null}
            {customer.gender ? (
              <View style={[s.infoRow, { borderBottomColor: colors.divider }]}>
                <Text style={s.infoIcon}>👤</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Gender</Text>
                  <Text style={[s.infoValue, { color: colors.text }]}>{customer.gender}</Text>
                </View>
              </View>
            ) : null}
            {customer.notes ? (
              <View style={[s.infoRow, { borderBottomColor: 'transparent' }]}>
                <Text style={s.infoIcon}>📝</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Notes</Text>
                  <Text style={[s.infoValue, { color: colors.text }]}>{customer.notes}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View style={s.actionRow}>
            <TouchableOpacity style={[s.actionBtn, { borderColor: colors.primary, borderWidth: 1.5 }]} onPress={() => setEditing(true)} activeOpacity={0.8}>
              <Text style={[s.actionTxt, { color: colors.primary }]}>✏️ Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.primary }]} onPress={() => router.push(`/order/new?customerId=${id}`)} activeOpacity={0.85}>
              <Text style={[s.actionTxt, { color: colors.onPrimary }]}>📝 New Order</Text>
            </TouchableOpacity>
          </View>

          {/* Order History */}
          <Text style={[s.sectionTitle, { color: colors.text }]}>📋 Order History ({customerOrders.length})</Text>
          {customerOrders.length === 0 ? (
            <View style={[s.emptyCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No orders registered yet</Text>
            </View>
          ) : customerOrders.map(order => {
            const bal = getBalance(order);
            const ps = getPaymentStatus(order);
            return (
              <TouchableOpacity
                key={order.id}
                style={[s.orderCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                onPress={() => router.push(`/order/${order.id}`)}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[s.ordNum, { color: colors.text }]}>{order.orderNumber}</Text>
                  <Text style={[s.ordDate, { color: colors.textSecondary }]}>{formatDate(order.orderDate)}</Text>
                </View>
                <Text style={[s.garments, { color: colors.textSecondary }]}>
                  {order.items.map(i => `${i.garmentType} ×${i.quantity}`).join(', ')}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <StatusBadge status={order.status} colors={colors} />
                  <Text style={[s.amount, { color: ps === 'Paid' ? colors.success : colors.error }]}>
                    {ps === 'Paid' ? '✓ Paid' : `Bal ₹${bal}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editing} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[s.modalHeader, { borderBottomColor: colors.divider }]}>
            <TouchableOpacity onPress={() => setEditing(false)} activeOpacity={0.7}>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[s.modalTitle, { color: colors.text }]}>Edit Customer</Text>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
            <Field
              label="Full Name"
              value={editForm.name}
              onChange={(v: string) => setEditForm(f => ({ ...f, name: v }))}
              colors={colors}
              focused={focusedInput === 'name'}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
            />
            <Field
              label="Phone Number"
              value={editForm.phone}
              onChange={(v: string) => setEditForm(f => ({ ...f, phone: v }))}
              colors={colors}
              keyboardType="phone-pad"
              focused={focusedInput === 'phone'}
              onFocus={() => setFocusedInput('phone')}
              onBlur={() => setFocusedInput(null)}
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

function Field({ label, value, onChange, colors, keyboardType, multiline, focused, onFocus, onBlur }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[s.fieldLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          s.fieldInput,
          {
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: focused ? colors.borderFocus : colors.border,
            height: multiline ? 80 : 52,
            textAlignVertical: multiline ? 'top' : 'center',
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
    </View>
  );
}

function SummaryCard({ label, value, colors, emoji, accent }: any) {
  return (
    <View style={[s.summaryCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={[s.summaryValue, { color: accent || colors.text }]}>{value}</Text>
      <Text style={[s.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function StatusBadge({ status, colors }: any) {
  const map: Record<string, string> = {
    'Ready': colors.success, 'Delivered': colors.success,
    'Stitching': colors.warning, 'Cutting': colors.warning,
    'Final Stitch': colors.secondary,
  };
  const c = map[status] || colors.primary;
  return (
    <View style={[s.badge, { backgroundColor: c + '15', borderColor: c }]}>
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
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryCard: { flex: 1, marginHorizontal: 4, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1 },
  summaryValue: { fontSize: 14, fontWeight: 'bold', marginTop: 6 },
  summaryLabel: { fontSize: 10, marginTop: 3, fontWeight: '600', textAlign: 'center' },
  infoCard: { borderRadius: 16, marginBottom: 24, overflow: 'hidden', borderWidth: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1 },
  infoIcon: { fontSize: 18, marginRight: 12, marginTop: 2 },
  infoLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  actionTxt: { fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  emptyCard: { padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  orderCard: { padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1 },
  ordNum: { fontSize: 14, fontWeight: '700' },
  ordDate: { fontSize: 12 },
  garments: { fontSize: 13, marginTop: 4, fontWeight: '600' },
  amount: { fontSize: 13, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  fieldInput: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, fontSize: 15 },
  saveBtn: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  saveTxt: { fontSize: 16, fontWeight: '700' },
});
