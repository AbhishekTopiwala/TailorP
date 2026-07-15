import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, useColorScheme, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore, getBalance, getTotalPaid, getPaymentStatus, isOverdue, OrderStatus, PaymentMode } from '@/store/AppStore';

const STATUS_FLOW: OrderStatus[] = [
  'Measurement Taken', 'Fabric Received', 'Cutting',
  'Stitching', 'Trial', 'Final Stitch', 'Ready', 'Delivered', 'Completed',
];

const STATUS_EMOJIS: Record<string, string> = {
  'Measurement Taken': '📏', 'Fabric Received': '🧵', 'Cutting': '✂️',
  'Stitching': '🪡', 'Trial': '👔', 'Final Stitch': '🎯',
  'Ready': '✅', 'Delivered': '🚚', 'Completed': '🏁',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { orders, customers, updateOrderStatus, addPayment, deleteOrder } = useAppStore();

  const [payModal, setPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<PaymentMode>('Cash');
  const [payNote, setPayNote] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const order = orders.find(o => o.id === id);
  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSecondary }}>Order not found.</Text>
      </View>
    );
  }

  const confirmedOrder = order;
  const customer = customers.find(c => c.id === confirmedOrder.customerId);
  const totalPaid = getTotalPaid(confirmedOrder);
  const balance = getBalance(confirmedOrder);
  const payStatus = getPaymentStatus(confirmedOrder);
  const overdue = isOverdue(confirmedOrder);

  const currentStatusIdx = STATUS_FLOW.indexOf(confirmedOrder.status);
  const nextStatus = currentStatusIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentStatusIdx + 1] : null;

  function handleSetStatus(targetStatus: OrderStatus) {
    Alert.alert(`Change Status?`, `Do you want to update status to "${targetStatus}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, Update', onPress: () => updateOrderStatus(confirmedOrder.id, targetStatus) }
    ]);
  }

  function handleAddPayment() {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) { Alert.alert('Error', 'Please enter a valid payment amount.'); return; }
    if (amount > balance) { Alert.alert('Error', 'Amount exceeds the remaining balance.'); return; }
    addPayment(confirmedOrder.id, {
      amount,
      date: new Date().toISOString().slice(0, 10),
      mode: payMode,
      note: payNote.trim()
    });
    setPayModal(false);
    setPayAmount('');
    setPayNote('');
  }

  function handleDelete() {
    Alert.alert('Delete Order', `Delete order ${confirmedOrder.orderNumber}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteOrder(confirmedOrder.id); router.back(); } }
    ]);
  }

  const payStatusColor = { 'Paid': colors.success, 'Partial': colors.warning, 'Unpaid': colors.error }[payStatus] || colors.text;

  return (
    <>
      <Stack.Screen
        options={{
          title: confirmedOrder.orderNumber,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} activeOpacity={0.7} style={{ marginRight: 4 }}>
              <Text style={{ color: colors.error, fontSize: 15, fontWeight: '600' }}>Delete</Text>
            </TouchableOpacity>
          )
        }}
      />

      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Status Alert Banner */}
        <View
          style={[
            s.statusBanner,
            {
              backgroundColor: overdue ? colors.error + '08' : colors.primary + '08',
              borderColor: overdue ? colors.error : colors.border,
            }
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>{STATUS_EMOJIS[confirmedOrder.status]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.bannerSub, { color: colors.textSecondary }]}>CURRENT STATUS</Text>
              <Text style={[s.bannerVal, { color: colors.text }]}>{confirmedOrder.status}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {confirmedOrder.priority === 'Urgent' && <Text style={[s.priorityTag, { color: colors.error, borderColor: colors.error }]}>🔥 URGENT</Text>}
            {overdue && <Text style={[s.overdueTag, { color: colors.error, borderColor: colors.error }]}>⚠️ OVERDUE</Text>}
          </View>
        </View>

        {/* Stepper Checklist */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>📍 Order Progress Checklist</Text>
        <View style={[s.timelineCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          {STATUS_FLOW.map((st, idx) => {
            const isCompleted = idx < currentStatusIdx;
            const isCurrent = idx === currentStatusIdx;

            return (
              <TouchableOpacity
                key={st}
                style={[s.timelineRow, { opacity: isCompleted || isCurrent ? 1 : 0.5 }]}
                onPress={() => handleSetStatus(st)}
                activeOpacity={0.7}
              >
                <View style={s.checkContainer}>
                  {isCompleted ? (
                    <View style={[s.checkbox, s.checkedBox, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                      <Text style={[s.checkText, { color: colors.onPrimary }]}>✓</Text>
                    </View>
                  ) : (
                    <View style={[s.checkbox, isCurrent ? { borderColor: colors.primary, borderWidth: 2 } : { borderColor: colors.border }]}>
                      {isCurrent && <View style={[s.currentInner, { backgroundColor: colors.primary }]} />}
                    </View>
                  )}
                  {idx < STATUS_FLOW.length - 1 && (
                    <View style={[s.verticalLine, { backgroundColor: isCompleted ? colors.primary : colors.border }]} />
                  )}
                </View>
                <View style={s.statusInfo}>
                  <Text style={[s.statusName, { color: colors.text, fontWeight: isCurrent ? '700' : '500' }]}>
                    {STATUS_EMOJIS[st]} {st}
                  </Text>
                  {isCurrent && <Text style={[s.statusDesc, { color: colors.primary }]}>Active Phase</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Customer & Details */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>👤 Client & Timing</Text>
        <View style={[s.infoCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[s.infoRow, { borderBottomColor: colors.border }]}
            onPress={() => router.push(`/customer/${customer?.id}`)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 18, marginRight: 12 }}>👤</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Client</Text>
              <Text style={[s.infoValue, { color: colors.primary, fontWeight: '700' }]}>{customer?.name || 'Unknown Client'} →</Text>
            </View>
          </TouchableOpacity>

          <View style={[s.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={{ fontSize: 18, marginRight: 12 }}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Order Date</Text>
              <Text style={[s.infoValue, { color: colors.text }]}>{formatDate(confirmedOrder.orderDate)}</Text>
            </View>
          </View>

          <View style={[s.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={{ fontSize: 18, marginRight: 12 }}>🚚</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Delivery Date</Text>
              <Text style={[s.infoValue, { color: overdue ? colors.error : colors.text }]}>
                {formatDate(confirmedOrder.deliveryDate)} {overdue ? '⚠️' : ''}
              </Text>
            </View>
          </View>

          {confirmedOrder.fabricDetails ? (
            <View style={[s.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={{ fontSize: 18, marginRight: 12 }}>🧵</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Selected Fabric</Text>
                <Text style={[s.infoValue, { color: colors.text }]}>{confirmedOrder.fabricDetails}</Text>
              </View>
            </View>
          ) : null}

          {confirmedOrder.specialInstructions ? (
            <View style={s.infoRow}>
              <Text style={{ fontSize: 18, marginRight: 12 }}>📝</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Special Instructions</Text>
                <Text style={[s.infoValue, { color: colors.text, lineHeight: 18 }]}>{confirmedOrder.specialInstructions}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Items Detail */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>🧥 Garment Specifications</Text>
        {confirmedOrder.items.map(item => (
          <View key={item.id} style={[s.itemCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={[s.garmentTitle, { color: colors.text }]}>{item.garmentType} (x{item.quantity})</Text>
              <Text style={[s.garmentPrice, { color: colors.text }]}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
            </View>
            {Object.keys(item.measurements).length > 0 && (
              <View>
                <Text style={[s.measTitle, { color: colors.textSecondary }]}>Measurements</Text>
                <View style={s.measGrid}>
                  {Object.entries(item.measurements).filter(([, v]) => v).map(([k, v]) => (
                    <View key={k} style={[s.measChip, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <Text style={[s.measKey, { color: colors.textSecondary }]}>{k}</Text>
                      <Text style={[s.measVal, { color: colors.text }]}>{v}"</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Financials & Balance */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 10 }}>
          <Text style={[s.sectionTitle, { color: colors.text, marginBottom: 0 }]}>💰 Payments & Balance</Text>
          {balance > 0 && (
            <TouchableOpacity style={[s.addPayBtn, { backgroundColor: colors.primary }]} onPress={() => setPayModal(true)} activeOpacity={0.8}>
              <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 12 }}>+ Record Payment</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[s.paymentSummary, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <PayRow label="Total Amount" value={`₹${confirmedOrder.totalAmount.toLocaleString('en-IN')}`} colors={colors} />
          <PayRow label="Total Paid" value={`₹${totalPaid.toLocaleString('en-IN')}`} colors={colors} valueColor={colors.success} />
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <PayRow label="Balance Due" value={`₹${balance.toLocaleString('en-IN')}`} colors={colors} valueColor={payStatusColor} bold />
          <View style={[s.statusPill, { backgroundColor: payStatusColor + '10' }]}>
            <Text style={[s.statusPillTxt, { color: payStatusColor }]}>{payStatus.toUpperCase()}</Text>
          </View>
        </View>

        {/* Payment Records */}
        {confirmedOrder.payments.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[s.subTitle, { color: colors.textSecondary }]}>Payment Log</Text>
            {confirmedOrder.payments.map(p => (
              <View key={p.id} style={[s.payItem, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <View>
                  <Text style={[s.payAmount, { color: colors.text }]}>₹{p.amount.toLocaleString('en-IN')}</Text>
                  <Text style={[s.payMeta, { color: colors.textSecondary }]}>{p.mode} · {formatDate(p.date)}</Text>
                  {p.note ? <Text style={[s.payNote, { color: colors.textSecondary }]}>{p.note}</Text> : null}
                </View>
                <View style={[s.payLogCheck, { backgroundColor: colors.success }]}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>✓</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Record Payment Modal */}
      <Modal visible={payModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[s.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setPayModal(false)} activeOpacity={0.7}>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[s.modalTitle, { color: colors.text }]}>Record Payment</Text>
            <TouchableOpacity onPress={handleAddPayment} activeOpacity={0.7}>
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
            <View style={[s.balanceCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <Text style={[s.balLabel, { color: colors.textSecondary }]}>REMAINING BALANCE</Text>
              <Text style={[s.balValue, { color: colors.error }]}>₹{balance.toLocaleString('en-IN')}</Text>
            </View>

            <Text style={[s.fieldLabel, { color: colors.text }]}>Payment Amount (₹) *</Text>
            <TextInput
              style={[
                s.input,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: focusedInput === 'amount' ? colors.borderFocus : colors.border
                }
              ]}
              keyboardType="numeric"
              placeholder="e.g. 500"
              placeholderTextColor={colors.placeholder}
              value={payAmount}
              onChangeText={setPayAmount}
              onFocus={() => setFocusedInput('amount')}
              onBlur={() => setFocusedInput(null)}
            />

            <Text style={[s.fieldLabel, { color: colors.text }]}>Payment Mode</Text>
            <View style={s.modeRow}>
              {(['Cash', 'UPI', 'Card', 'Credit'] as PaymentMode[]).map(m => (
                <TouchableOpacity
                  key={m}
                  style={[
                    s.modeBtn,
                    {
                      backgroundColor: payMode === m ? colors.primary : colors.backgroundElement,
                      borderColor: payMode === m ? colors.primary : colors.border
                    }
                  ]}
                  onPress={() => setPayMode(m)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.modeTxt, { color: payMode === m ? colors.onPrimary : colors.text }]}>
                    {m === 'Cash' ? '💵' : m === 'UPI' ? '📱' : m === 'Card' ? '💳' : '📒'} {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[s.fieldLabel, { color: colors.text }]}>Reference / Note (Optional)</Text>
            <TextInput
              style={[
                s.input,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: focusedInput === 'note' ? colors.borderFocus : colors.border
                }
              ]}
              placeholder="e.g. UPI Ref #12345"
              placeholderTextColor={colors.placeholder}
              value={payNote}
              onChangeText={setPayNote}
              onFocus={() => setFocusedInput('note')}
              onBlur={() => setFocusedInput(null)}
            />

            <TouchableOpacity
              style={[s.savePayBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddPayment}
              activeOpacity={0.85}
            >
              <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '700' }}>✓ Record Payment</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

function PayRow({ label, value, colors, valueColor, bold }: any) {
  return (
    <View style={s.payRow}>
      <Text style={[s.payLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[s.payValue, { color: valueColor || colors.text, fontWeight: bold ? '700' : '500' }]}>{value}</Text>
    </View>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const s = StyleSheet.create({
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 20
  },
  bannerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  bannerVal: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginTop: 2 },
  priorityTag: { fontSize: 10, fontWeight: '800', borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  overdueTag: { fontSize: 10, fontWeight: '800', borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2, marginBottom: 12, marginTop: 12 },
  subTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },
  timelineCard: { borderRadius: 16, borderWidth: 1.5, paddingVertical: 16, paddingHorizontal: 20, marginBottom: 20 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  checkContainer: { alignItems: 'center', width: 24, marginRight: 16, position: 'relative' },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  checkedBox: { borderWidth: 0 },
  checkText: { fontSize: 11, fontWeight: 'bold' },
  currentInner: { width: 10, height: 10, borderRadius: 5 },
  verticalLine: { position: 'absolute', top: 22, bottom: -18, width: 2 },
  statusInfo: { flex: 1 },
  statusName: { fontSize: 14 },
  statusDesc: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  infoCard: { borderRadius: 16, borderWidth: 1.5, marginBottom: 20, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1.5 },
  infoLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '500' },
  itemCard: { borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  garmentTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  garmentPrice: { fontSize: 15, fontWeight: '700' },
  measTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
  measGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  measChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 4 },
  measKey: { fontSize: 12, fontWeight: '600' },
  measVal: { fontSize: 12, fontWeight: '700' },
  addPayBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  paymentSummary: { borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 20 },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  payLabel: { fontSize: 13, fontWeight: '500' },
  payValue: { fontSize: 13 },
  divider: { height: 1.5, marginVertical: 12 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },
  statusPillTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  payItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1.5, marginBottom: 10 },
  payAmount: { fontSize: 15, fontWeight: '700' },
  payMeta: { fontSize: 12, marginTop: 2 },
  payNote: { fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  payLogCheck: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1.5 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  balanceCard: { padding: 16, borderRadius: 16, borderWidth: 1.5, marginBottom: 20, alignItems: 'center' },
  balLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  balValue: { fontSize: 26, fontWeight: '800', marginTop: 4 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, height: 52 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  modeBtn: { flex: 1, minWidth: 70, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, alignItems: 'center' },
  modeTxt: { fontSize: 12, fontWeight: '600' },
  savePayBtn: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 28 },
});
