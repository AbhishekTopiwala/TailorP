import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore, Order, isOverdue, getBalance, getPaymentStatus } from '@/store/AppStore';
import { MaterialIcons } from '@expo/vector-icons';

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
      <View style={[s.header, { backgroundColor: colors.background }]}>
        <Text style={[s.headerTitle, { color: colors.text }]}>Orders</Text>
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/order/new')}
          activeOpacity={0.8}
        >
          <Text style={[s.addBtnText, { color: colors.onPrimary }]}>+ New Order</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={s.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS as any}
          keyExtractor={f => f}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12 }}
          renderItem={({ item: f }) => {
            const isSelected = activeFilter === f;
            return (
              <TouchableOpacity
                style={[
                  s.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.backgroundElement,
                  }
                ]}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.8}
              >
                <Text style={[s.chipTxt, { color: isSelected ? colors.onPrimary : colors.textSecondary }]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          }}
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
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        ListEmptyComponent={
          <EmptyState
            icon="receipt"
            message={`No orders found matching the "${activeFilter}" filter.`}
            colors={colors}
          />
        }
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

              <View style={{ flex: 1, paddingLeft: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={[s.ordNum, { color: colors.textSecondary }]}>{order.orderNumber}</Text>
                  {order.priority === 'Urgent' && (
                    <View style={[s.urgentBadge, { backgroundColor: colors.warning + '15' }]}>
                      <MaterialIcons name="whatshot" size={10} color={colors.warning} />
                      <Text style={{ fontSize: 9, color: colors.warning, fontWeight: '800', letterSpacing: 0.5 }}>URGENT</Text>
                    </View>
                  )}
                </View>

                <Text style={[s.custName, { color: colors.text }]}>{custName}</Text>
                <Text style={[s.garments, { color: colors.textSecondary }]}>
                  {order.items.map(i => `${i.garmentType} (x${i.quantity})`).join(' · ')}
                </Text>

                <View style={s.badgeRow}>
                  <StatusBadge status={order.status} colors={colors} />
                  <PayBadge status={payStatus} balance={balance} colors={colors} />
                </View>

                <View style={[s.row, { marginTop: 14, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 12 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
                    <MaterialIcons name="event" size={14} color={overdue ? colors.error : colors.textSecondary} />
                    <Text style={[s.meta, { color: overdue ? colors.error : colors.textSecondary, fontWeight: overdue ? '700' : '500' }]}>
                      Due: {formatDate(order.deliveryDate)}
                      {overdue ? ' (OVERDUE)' : ''}
                    </Text>
                  </View>
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
    'Measurement Taken': '#475569',
    'Fabric Received': '#475569',
    'Cutting': '#D97706',
    'Stitching': '#D97706',
    'Trial': '#2563EB',
    'Final Stitch': '#2563EB',
    'Ready': '#16A34A',
    'Delivered': '#16A34A',
    'Completed': '#64748B',
  };
  const c = map[status] || colors.primary;
  return (
    <View style={[s.badge, { backgroundColor: c + '08', borderColor: c }]}>
      <Text style={[s.badgeTxt, { color: c }]}>{status}</Text>
    </View>
  );
}

function PayBadge({ status, balance, colors }: any) {
  const map: Record<string, string> = {
    'Paid': '#16A34A',
    'Partial': '#D97706',
    'Unpaid': '#EF4444'
  };
  const c = map[status] || colors.textSecondary;
  return (
    <View style={[s.badge, { backgroundColor: c + '08', borderColor: c }]}>
      <Text style={[s.badgeTxt, { color: c }]}>
        {status === 'Partial' ? `Bal: ₹${balance}` : status}
      </Text>
    </View>
  );
}

function EmptyState({ icon, message, colors }: any) {
  return (
    <View style={{ alignItems: 'center', marginTop: 100, paddingHorizontal: 40 }}>
      <View style={[s.emptyIconContainer, { backgroundColor: colors.backgroundElement }]}>
        <MaterialIcons name={icon} size={36} color={colors.textSecondary} />
      </View>
      <Text style={{ color: colors.textSecondary, marginTop: 16, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
        {message}
      </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  addBtn: { paddingHorizontal: 16, height: 40, borderRadius: 20, justifyContent: 'center' },
  addBtnText: { fontWeight: '700', fontSize: 13 },
  filterContainer: { marginBottom: 4 },
  chip: { paddingHorizontal: 16, height: 38, borderRadius: 19, justifyContent: 'center', marginRight: 8 },
  chipTxt: { fontSize: 13, fontWeight: '700' },
  countText: { fontSize: 13, marginLeft: 24, marginBottom: 2, marginTop: 12, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
    paddingLeft: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2
  },
  cardIndicator: { width: 4, borderRadius: 2, height: '100%' },
  ordNum: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  custName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2, marginTop: 2, marginBottom: 2 },
  garments: { fontSize: 13, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeTxt: { fontSize: 10, fontWeight: '700', letterSpacing: 0.1 },
  meta: { fontSize: 12, fontWeight: '500' },
  amount: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  }
});
