import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore, Order, isOverdue, getBalance, getPaymentStatus } from '@/store/AppStore';

const FILTERS = ['All', 'Pending', 'Ready', 'Delivered', 'Overdue', 'Unpaid', 'Urgent'] as const;
type Filter = typeof FILTERS[number];

export default function OrdersScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { orders, customers } = useAppStore();

  const [activeFilter, setActiveFilter] = useState<Filter>('All');

  const filtered = orders.filter(o => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Pending') return !['Delivered', 'Completed'].includes(o.status);
    if (activeFilter === 'Ready') return o.status === 'Ready';
    if (activeFilter === 'Delivered') return ['Delivered', 'Completed'].includes(o.status);
    if (activeFilter === 'Overdue') return isOverdue(o);
    if (activeFilter === 'Unpaid') return getBalance(o) > 0;
    if (activeFilter === 'Urgent') return o.priority === 'Urgent';
    return true;
  });

  function getCustomerName(cid: string) {
    return customers.find(c => c.id === cid)?.name || 'Unknown Client';
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
        <Text style={[s.headerTitle, { color: colors.text }]}>📋 Orders</Text>
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/order/new')}
          activeOpacity={0.8}
        >
          <Text style={[s.addBtnText, { color: colors.onPrimary }]}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={[s.filterContainer, { borderBottomColor: colors.divider }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS as any}
          keyExtractor={f => f}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[
                s.chip,
                {
                  backgroundColor: activeFilter === f ? colors.primary : colors.backgroundElement,
                  borderColor: activeFilter === f ? colors.primary : colors.border,
                }
              ]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[s.chipTxt, { color: activeFilter === f ? colors.onPrimary : colors.text }]}>{f}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Count Info */}
      <Text style={[s.countText, { color: colors.textSecondary }]}>
        Showing {filtered.length} order{filtered.length !== 1 ? 's' : ''}
      </Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={o => o.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ListEmptyComponent={<EmptyState message="No orders match this filter." colors={colors} />}
        renderItem={({ item: order }) => {
          const balance = getBalance(order);
          const payStatus = getPaymentStatus(order);
          const overdue = isOverdue(order);
          const custName = getCustomerName(order.customerId);

          // Left indicator line based on urgency/status
          const indicatorColor = overdue
            ? colors.error
            : order.priority === 'Urgent'
            ? colors.warning
            : colors.primary;

          return (
            <TouchableOpacity
              style={[s.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
              onPress={() => router.push(`/order/${order.id}`)}
              activeOpacity={0.85}
            >
              {/* Left indicator strip */}
              <View style={[s.cardIndicator, { backgroundColor: indicatorColor }]} />

              <View style={{ flex: 1, paddingLeft: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={[s.ordNum, { color: colors.textSecondary }]}>{order.orderNumber}</Text>
                  {order.priority === 'Urgent' && <Text style={{ fontSize: 10, color: colors.warning, fontWeight: '800' }}>🔥 URGENT</Text>}
                </View>

                <Text style={[s.custName, { color: colors.text }]}>{custName}</Text>
                <Text style={[s.garments, { color: colors.textSecondary }]}>
                  {order.items.map(i => `${i.garmentType} (x${i.quantity})`).join(' · ')}
                </Text>

                <View style={s.badgeRow}>
                  <StatusBadge status={order.status} colors={colors} />
                  <PayBadge status={payStatus} balance={balance} colors={colors} />
                </View>

                <View style={[s.row, { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 10 }]}>
                  <Text style={[s.meta, { color: colors.textSecondary }]}>
                    🗓 Due: {formatDate(order.deliveryDate)}
                    {overdue ? '  ⚠️ OVERDUE' : ''}
                  </Text>
                  <Text style={[s.amount, { color: colors.text }]}>₹{order.totalAmount.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

function StatusBadge({ status, colors }: any) {
  const map: Record<string, string> = {
    'Measurement Taken': colors.textSecondary,
    'Fabric Received': colors.textSecondary,
    'Cutting': colors.warning,
    'Stitching': colors.warning,
    'Trial': colors.secondary,
    'Final Stitch': colors.secondary,
    'Ready': colors.success,
    'Delivered': colors.success,
    'Completed': colors.textSecondary,
  };
  const c = map[status] || colors.primary;
  return (
    <View style={[s.badge, { backgroundColor: c + '08', borderColor: c }]}>
      <Text style={[s.badgeTxt, { color: c }]}>{status}</Text>
    </View>
  );
}

function PayBadge({ status, balance, colors }: any) {
  const map: Record<string, string> = { 'Paid': colors.success, 'Partial': colors.warning, 'Unpaid': colors.error };
  const c = map[status] || colors.textSecondary;
  return (
    <View style={[s.badge, { backgroundColor: c + '08', borderColor: c }]}>
      <Text style={[s.badgeTxt, { color: c }]}>
        {status === 'Partial' ? `Bal ₹${balance}` : status}
      </Text>
    </View>
  );
}

function EmptyState({ message, colors }: any) {
  return (
    <View style={{ alignItems: 'center', marginTop: 60 }}>
      <Text style={{ fontSize: 56 }}>📋</Text>
      <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 15, textAlign: 'center' }}>{message}</Text>
    </View>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
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
  filterContainer: { borderBottomWidth: 1 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, marginRight: 8 },
  chipTxt: { fontSize: 13, fontWeight: '700' },
  countText: { fontSize: 12, marginLeft: 24, marginBottom: 2, marginTop: 12, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    padding: 16,
    paddingLeft: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1
  },
  cardIndicator: { width: 4, borderRadius: 2, height: '100%' },
  ordNum: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  custName: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2, marginTop: 2, marginBottom: 2 },
  garments: { fontSize: 13, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.2 },
  meta: { fontSize: 12, flex: 1, fontWeight: '500' },
  amount: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
});
