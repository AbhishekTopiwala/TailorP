import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, useColorScheme, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore, getBalance, getTotalPaid, getPaymentStatus, isOverdue, OrderStatus, PaymentMode } from '@/store/AppStore';
import { MaterialIcons } from '@expo/vector-icons';

const STATUS_FLOW: OrderStatus[] = [
  'Measurement Taken', 'Fabric Received', 'Cutting',
  'Stitching', 'Trial', 'Final Stitch', 'Ready', 'Delivered', 'Completed',
];

const STATUS_ICONS: Record<string, string> = {
  'Measurement Taken': 'straighten',
  'Fabric Received': 'texture',
  'Cutting': 'content-cut',
  'Stitching': 'design-services',
  'Trial': 'checkroom',
  'Final Stitch': 'done',
  'Ready': 'done-all',
  'Delivered': 'local-shipping',
  'Completed': 'verified',
};

const MODE_ICONS: Record<string, string> = {
  'Cash': 'payments',
  'UPI': 'phone-android',
  'Card': 'credit-card',
  'Credit': 'book',
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleAmountChange(v: string) {
    setPayAmount(v);
    if (errors.amount) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.amount;
        return copy;
      });
    }
  }

  function handleNoteChange(v: string) {
    setPayNote(v);
    if (errors.note) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.note;
        return copy;
      });
    }
  }

  function startPayment() {
    setPayAmount('');
    setPayNote('');
    setPayMode('Cash');
    setErrors({});
    setPayModal(true);
  }

  const order = orders.find(o => o.id === id);
  if (!order) {
    return (
      <View style={[s.centerContainer, { backgroundColor: colors.background }]}>
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

  function handleSetStatus(targetStatus: OrderStatus) {
    Alert.alert(`Change Status?`, `Do you want to update status to "${targetStatus}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, Update', onPress: () => updateOrderStatus(confirmedOrder.id, targetStatus) }
    ]);
  }

  function handleAddPayment() {
    const errs: Record<string, string> = {};
    const amountNum = Number(payAmount);
    if (!payAmount) {
      errs.amount = 'Amount is required';
    } else if (isNaN(amountNum) || amountNum <= 0) {
      errs.amount = 'Please enter a valid positive number';
    } else if (amountNum > balance) {
      errs.amount = `Amount cannot exceed remaining balance (₹${balance})`;
    }

    if (payNote.trim().length > 100) {
      errs.note = 'Note must be 100 characters or less';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    addPayment(confirmedOrder.id, {
      amount: amountNum,
      date: new Date().toISOString().slice(0, 10),
      mode: payMode,
      note: payNote.trim()
    });
    setPayModal(false);
    setPayAmount('');
    setPayNote('');
    setErrors({});
  }

  function handleDelete() {
    Alert.alert('Delete Order', `Delete order ${confirmedOrder.orderNumber}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteOrder(confirmedOrder.id); router.back(); } }
    ]);
  }

  const payStatusColor = { 'Paid': '#16A34A', 'Partial': '#D97706', 'Unpaid': '#EF4444' }[payStatus] || colors.text;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: confirmedOrder.orderNumber,
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} activeOpacity={0.7} style={{ marginRight: 8, padding: 8 }}>
              <MaterialIcons name="delete-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          )
        }}
      />

      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
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
            <View style={[s.bannerIconCircle, { backgroundColor: (overdue ? colors.error : colors.primary) + '12' }]}>
              <MaterialIcons
                name={STATUS_ICONS[confirmedOrder.status] as any}
                size={22}
                color={overdue ? colors.error : colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.bannerSub, { color: colors.textSecondary }]}>CURRENT STATUS</Text>
              <Text style={[s.bannerVal, { color: colors.text }]}>{confirmedOrder.status}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            {confirmedOrder.priority === 'Urgent' && (
              <View style={[s.badgeTag, { backgroundColor: colors.warning + '12', borderColor: colors.warning }]}>
                <MaterialIcons name="whatshot" size={10} color={colors.warning} />
                <Text style={{ fontSize: 9, color: colors.warning, fontWeight: '800' }}>URGENT</Text>
              </View>
            )}
            {overdue && (
              <View style={[s.badgeTag, { backgroundColor: colors.error + '12', borderColor: colors.error }]}>
                <MaterialIcons name="warning" size={10} color={colors.error} />
                <Text style={{ fontSize: 9, color: colors.error, fontWeight: '800' }}>OVERDUE</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stepper Checklist */}
        <View style={s.sectionHeaderRow}>
          <MaterialIcons name="checklist" size={16} color={colors.textSecondary} />
          <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>Order Progress Checklist</Text>
        </View>
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
                      <MaterialIcons name="check" size={12} color={colors.onPrimary} />
                    </View>
                  ) : (
                    <View style={[s.checkbox, isCurrent ? { borderColor: colors.primary, borderWidth: 2 } : { borderColor: colors.border }]}>
                      {isCurrent && <View style={[s.currentInner, { backgroundColor: colors.primary }]} />}
                    </View>
                  )}
                  {idx < STATUS_FLOW.length - 1 && (
                    <View style={[s.verticalLine, { backgroundColor: isCompleted ? colors.primary : colors.divider }]} />
                  )}
                </View>
                <View style={s.statusInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialIcons name={STATUS_ICONS[st] as any} size={14} color={isCurrent ? colors.primary : colors.textSecondary} />
                    <Text style={[s.statusName, { color: colors.text, fontWeight: isCurrent ? '700' : '600' }]}>
                      {st}
                    </Text>
                  </View>
                  {isCurrent && <Text style={[s.statusDesc, { color: colors.primary }]}>Active Phase</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Customer & Details */}
        <View style={s.sectionHeaderRow}>
          <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
          <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>Client & Timing</Text>
        </View>
        <View style={[s.infoCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[s.infoRow, { borderBottomColor: colors.divider }]}
            onPress={() => router.push(`/customer/${customer?.id}`)}
            activeOpacity={0.75}
          >
            <MaterialIcons name="person" size={18} color={colors.textSecondary} style={s.infoIcon} />
            <View style={{ flex: 1 }}>
              <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Client</Text>
              <Text style={[s.infoValue, { color: colors.primary, fontWeight: '700' }]}>
                {customer?.name || 'Unknown Client'}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[s.infoRow, { borderBottomColor: colors.divider }]}>
            <MaterialIcons name="event" size={18} color={colors.textSecondary} style={s.infoIcon} />
            <View style={{ flex: 1 }}>
              <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Order Date</Text>
              <Text style={[s.infoValue, { color: colors.text }]}>{formatDate(confirmedOrder.orderDate)}</Text>
            </View>
          </View>

          <View style={[s.infoRow, { borderBottomColor: colors.divider }]}>
            <MaterialIcons name="local-shipping" size={18} color={colors.textSecondary} style={s.infoIcon} />
            <View style={{ flex: 1 }}>
              <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Delivery Date</Text>
              <Text style={[s.infoValue, { color: overdue ? colors.error : colors.text, fontWeight: overdue ? '700' : '500' }]}>
                {formatDate(confirmedOrder.deliveryDate)}
              </Text>
            </View>
          </View>

          {confirmedOrder.fabricDetails ? (
            <View style={[s.infoRow, { borderBottomColor: colors.divider }]}>
              <MaterialIcons name="texture" size={18} color={colors.textSecondary} style={s.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Selected Fabric</Text>
                <Text style={[s.infoValue, { color: colors.text }]}>{confirmedOrder.fabricDetails}</Text>
              </View>
            </View>
          ) : null}

          {confirmedOrder.specialInstructions ? (
            <View style={s.infoRow}>
              <MaterialIcons name="notes" size={18} color={colors.textSecondary} style={s.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[s.infoLabel, { color: colors.textSecondary }]}>Special Instructions</Text>
                <Text style={[s.infoValue, { color: colors.text, lineHeight: 18 }]}>{confirmedOrder.specialInstructions}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Items Detail */}
        <View style={s.sectionHeaderRow}>
          <MaterialIcons name="content-cut" size={16} color={colors.textSecondary} />
          <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>Garment Specifications</Text>
        </View>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialIcons name="payments" size={16} color={colors.textSecondary} />
            <Text style={[s.sectionTitle, { color: colors.textSecondary, marginBottom: 0 }]}>Payments & Balance</Text>
          </View>
          {balance > 0 && (
            <TouchableOpacity
              style={[s.addPayBtn, { backgroundColor: colors.primary }]}
              onPress={startPayment}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialIcons name="add-card" size={14} color={colors.onPrimary} />
                <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 11 }}>Record Payment</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={[s.paymentSummary, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <PayRow label="Total Amount" value={`₹${confirmedOrder.totalAmount.toLocaleString('en-IN')}`} colors={colors} />
          <PayRow label="Total Paid" value={`₹${totalPaid.toLocaleString('en-IN')}`} colors={colors} valueColor="#16A34A" />
          <View style={[s.divider, { backgroundColor: colors.divider }]} />
          <PayRow label="Balance Due" value={`₹${balance.toLocaleString('en-IN')}`} colors={colors} valueColor={payStatusColor} bold />
          <View style={[s.statusPill, { backgroundColor: payStatusColor + '08', borderColor: payStatusColor }]}>
            <Text style={[s.statusPillTxt, { color: payStatusColor }]}>{payStatus.toUpperCase()}</Text>
          </View>
        </View>

        {/* Payment Records */}
        {confirmedOrder.payments.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[s.subTitle, { color: colors.textSecondary }]}>Payment Log</Text>
            {confirmedOrder.payments.map(p => (
              <View key={p.id} style={[s.payItem, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialIcons name={MODE_ICONS[p.mode] as any} size={14} color={colors.textSecondary} />
                    <Text style={[s.payAmount, { color: colors.text }]}>₹{p.amount.toLocaleString('en-IN')}</Text>
                  </View>
                  <Text style={[s.payMeta, { color: colors.textSecondary, marginLeft: 20 }]}>{p.mode} · {formatDate(p.date)}</Text>
                  {p.note ? <Text style={[s.payNote, { color: colors.textSecondary, marginLeft: 20 }]}>{p.note}</Text> : null}
                </View>
                <View style={[s.payLogCheck, { backgroundColor: '#16A34A' }]}>
                  <MaterialIcons name="check" size={10} color="#fff" />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Record Payment Modal */}
      <Modal visible={payModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[s.modalHeader, { borderBottomColor: colors.divider }]}>
            <TouchableOpacity onPress={() => setPayModal(false)} activeOpacity={0.7} style={{ paddingVertical: 8 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[s.modalTitle, { color: colors.text }]}>Record Payment</Text>
            <TouchableOpacity onPress={handleAddPayment} activeOpacity={0.7} style={{ paddingVertical: 8 }}>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
                  borderColor: errors.amount ? colors.error : (focusedInput === 'amount' ? colors.borderFocus : colors.border)
                }
              ]}
              keyboardType="numeric"
              placeholder="e.g. 500"
              placeholderTextColor={colors.placeholder}
              value={payAmount}
              onChangeText={handleAmountChange}
              onFocus={() => setFocusedInput('amount')}
              onBlur={() => setFocusedInput(null)}
            />
            {errors.amount && (
              <Text style={[s.errorText, { color: colors.error }]}>{errors.amount}</Text>
            )}

            <Text style={[s.fieldLabel, { color: colors.text }]}>Payment Mode</Text>
            <View style={s.modeRow}>
              {(['Cash', 'UPI', 'Card', 'Credit'] as PaymentMode[]).map(m => {
                const isSelected = payMode === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      s.modeBtn,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.backgroundElement,
                        borderColor: isSelected ? colors.primary : colors.border
                      }
                    ]}
                    onPress={() => setPayMode(m)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialIcons name={MODE_ICONS[m] as any} size={14} color={isSelected ? colors.onPrimary : colors.textSecondary} />
                      <Text style={[s.modeTxt, { color: isSelected ? colors.onPrimary : colors.text }]}>
                        {m}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[s.fieldLabel, { color: colors.text }]}>Reference / Note (Optional)</Text>
            <TextInput
              style={[
                s.input,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: errors.note ? colors.error : (focusedInput === 'note' ? colors.borderFocus : colors.border)
                }
              ]}
              placeholder="e.g. UPI Ref #12345"
              placeholderTextColor={colors.placeholder}
              value={payNote}
              onChangeText={handleNoteChange}
              onFocus={() => setFocusedInput('note')}
              onBlur={() => setFocusedInput(null)}
            />
            {errors.note && (
              <Text style={[s.errorText, { color: colors.error }]}>{errors.note}</Text>
            )}

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
      <Text style={[s.payValue, { color: valueColor || colors.text, fontWeight: bold ? '700' : '600' }]}>{value}</Text>
    </View>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const s = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20
  },
  bannerIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  bannerSub: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  bannerVal: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginTop: 2 },
  badgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, marginTop: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  subTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },
  timelineCard: { borderRadius: 20, borderWidth: 1, paddingVertical: 16, paddingHorizontal: 20, marginBottom: 20 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  checkContainer: { alignItems: 'center', width: 24, marginRight: 16, position: 'relative' },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  checkedBox: { borderWidth: 0 },
  currentInner: { width: 10, height: 10, borderRadius: 5 },
  verticalLine: { position: 'absolute', top: 22, bottom: -18, width: 2 },
  statusInfo: { flex: 1 },
  statusName: { fontSize: 14, letterSpacing: -0.1 },
  statusDesc: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  infoCard: { borderRadius: 20, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  infoIcon: { marginRight: 12 },
  infoLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2, textTransform: 'uppercase' },
  infoValue: { fontSize: 14, fontWeight: '600' },
  itemCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16 },
  garmentTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  garmentPrice: { fontSize: 15, fontWeight: '700' },
  measTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  measGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  measChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 4 },
  measKey: { fontSize: 11, fontWeight: '700' },
  measVal: { fontSize: 11, fontWeight: '800' },
  addPayBtn: { paddingHorizontal: 10, height: 32, borderRadius: 16, justifyContent: 'center' },
  paymentSummary: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20 },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  payLabel: { fontSize: 13, fontWeight: '600' },
  payValue: { fontSize: 13 },
  divider: { height: 1, marginVertical: 12 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4, borderWidth: 1 },
  statusPillTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  payItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 20, borderWidth: 1, marginBottom: 10 },
  payAmount: { fontSize: 15, fontWeight: '700' },
  payMeta: { fontSize: 12, marginTop: 2 },
  payNote: { fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  payLogCheck: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  balanceCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 20, alignItems: 'center' },
  balLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  balValue: { fontSize: 26, fontWeight: '800', marginTop: 4 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, height: 52 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modeBtn: { flex: 1, minWidth: 70, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  modeTxt: { fontSize: 12, fontWeight: '700' },
  savePayBtn: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
});
