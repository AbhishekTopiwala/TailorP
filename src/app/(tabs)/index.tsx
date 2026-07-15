import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore, isDueToday, isOverdue, getBalance } from '@/store/AppStore';

export default function DashboardScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { customers, orders, appointments, userSession } = useAppStore();

  const todayDeliveries = orders.filter(o => isDueToday(o) && !['Delivered', 'Completed'].includes(o.status));
  const overdueOrders = orders.filter(o => isOverdue(o));
  const pendingOrders = orders.filter(o => !['Delivered', 'Completed'].includes(o.status));
  const readyOrders = orders.filter(o => o.status === 'Ready');
  const pendingPaymentTotal = orders.reduce((sum, o) => sum + Math.max(0, getBalance(o)), 0);
  const monthlyIncome = orders
    .flatMap(o => o.payments)
    .filter(p => p.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, p) => sum + p.amount, 0);

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });

  const activeAppointments = appointments.filter(a => a.status !== 'Cancelled' && a.status !== 'Completed');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
        <View>
          <Text style={[s.shopName, { color: colors.text }]}>{userSession.shopName || 'My Boutique'}</Text>
          <Text style={[s.dateStr, { color: colors.textSecondary }]}>{dateStr}</Text>
        </View>
        <TouchableOpacity
          style={[s.settingsBtn, { backgroundColor: colors.backgroundElement }]}
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Greeting Banner */}
        <View style={[s.greetingBanner, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[s.greetingTxt, { color: colors.text }]}>Hello, {userSession.name || 'Tailor'}</Text>
          <Text style={[s.subGreetingTxt, { color: colors.textSecondary }]}>
            You have {pendingOrders.length} active orders and {activeAppointments.length} upcoming appointments.
          </Text>
        </View>

        {/* Quick Actions */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={s.quickActions}>
          <QuickAction emoji="➕" label="New Client" color={colors.primary} onPress={() => router.push('/customer/new')} />
          <QuickAction emoji="📝" label="New Order" color={colors.primary} onPress={() => router.push('/order/new')} />
          <QuickAction emoji="📅" label="Book Trial" color={colors.primary} onPress={() => router.push('/appointments')} />
        </View>

        {/* Stats Grid */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>Today's Overview</Text>
        <View style={s.grid}>
          <StatCard emoji="🚚" title="Today's Deliveries" value={String(todayDeliveries.length)} accent={colors.text} colors={colors} onPress={() => router.push('/(tabs)/orders')} />
          <StatCard emoji="⚠️" title="Overdue Orders" value={String(overdueOrders.length)} accent={colors.error} colors={colors} onPress={() => router.push('/(tabs)/orders')} />
          <StatCard emoji="🕐" title="Pending Orders" value={String(pendingOrders.length)} accent={colors.text} colors={colors} onPress={() => router.push('/(tabs)/orders')} />
          <StatCard emoji="✅" title="Ready for Pickup" value={String(readyOrders.length)} accent={colors.success} colors={colors} onPress={() => router.push('/(tabs)/orders')} />
          <StatCard emoji="💰" title="Pending Payments" value={`₹${pendingPaymentTotal.toLocaleString('en-IN')}`} accent={colors.text} colors={colors} onPress={() => router.push('/(tabs)/reports')} />
          <StatCard emoji="📈" title="Monthly Income" value={`₹${monthlyIncome.toLocaleString('en-IN')}`} accent={colors.success} colors={colors} onPress={() => router.push('/(tabs)/reports')} />
        </View>

        {/* Upcoming Appointments List */}
        {activeAppointments.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: colors.text }]}>📅 Upcoming Appointments</Text>
            {activeAppointments.slice(0, 3).map(app => (
              <View key={app.id} style={[s.listItem, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.listTitle, { color: colors.text }]}>{app.customerName}</Text>
                  <Text style={[s.listSub, { color: colors.textSecondary }]}>
                    Time: {app.timeSlot} · Date: {app.date}
                  </Text>
                  {app.notes && (
                    <Text style={[s.notesText, { color: colors.textSecondary }]}>
                      Notes: "{app.notes}"
                    </Text>
                  )}
                </View>
                <View style={[s.badge, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                  <Text style={[s.badgeText, { color: colors.primary }]}>{app.status}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Today's Deliveries List */}
        {todayDeliveries.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: colors.text }]}>📦 Due Today</Text>
            {todayDeliveries.map(order => {
              const customer = customers.find(c => c.id === order.customerId);
              return (
                <TouchableOpacity
                  key={order.id}
                  style={[s.listItem, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                  onPress={() => router.push(`/order/${order.id}`)}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.listTitle, { color: colors.text }]}>{customer?.name || 'Unknown'}</Text>
                    <Text style={[s.listSub, { color: colors.textSecondary }]}>
                      {order.orderNumber} · {order.items.map(i => i.garmentType).join(', ')}
                    </Text>
                  </View>
                  <StatusBadge status={order.status} colors={colors} />
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Recent Orders */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>🗂️ Recent Orders</Text>
        {orders.slice(0, 3).map(order => {
          const customer = customers.find(c => c.id === order.customerId);
          return (
            <TouchableOpacity
              key={order.id}
              style={[s.listItem, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
              onPress={() => router.push(`/order/${order.id}`)}>
              <View style={{ flex: 1 }}>
                <Text style={[s.listTitle, { color: colors.text }]}>{customer?.name || 'Unknown'}</Text>
                <Text style={[s.listSub, { color: colors.textSecondary }]}>
                  {order.orderNumber} · {order.items.map(i => i.garmentType).join(', ')}
                </Text>
                <Text style={[s.listSub, { color: colors.textSecondary }]}>
                  Due: {new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              <StatusBadge status={order.status} colors={colors} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ emoji, label, color, onPress }: any) {
  return (
    <TouchableOpacity style={s.qaBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={[s.qaIcon, { backgroundColor: color }]}>
        <Text style={{ fontSize: 22, color: '#FFFFFF' }}>{emoji}</Text>
      </View>
      <Text style={[s.qaLabel, { color: '#1A1F2B' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatCard({ emoji, title, value, accent, colors, onPress }: any) {
  return (
    <TouchableOpacity
      style={[s.statCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border, borderWidth: 1 }]}
      onPress={onPress} activeOpacity={0.8}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={[s.statTitle, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <Text style={[s.statValue, { color: accent }]}>{value}</Text>
    </TouchableOpacity>
  );
}

function StatusBadge({ status, colors }: any) {
  const badgeColors: Record<string, string> = {
    'Ready': colors.success, 'Delivered': colors.success,
    'Completed': colors.textSecondary, 'Stitching': colors.warning,
    'Cutting': colors.warning, 'Trial': colors.secondary,
  };
  const bg = badgeColors[status] || colors.primary;
  return (
    <View style={[s.badge, { backgroundColor: bg + '15', borderColor: bg }]}>
      <Text style={[s.badgeText, { color: bg }]}>{status}</Text>
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
  shopName: { fontSize: 20, fontWeight: 'bold', letterSpacing: -0.5 },
  dateStr: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  settingsBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  greetingBanner: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  greetingTxt: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subGreetingTxt: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginTop: 12 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 4 },
  qaBtn: { alignItems: 'center', width: '30%' },
  qaIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  qaLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  statTitle: { fontSize: 12, fontWeight: '600' },
  listItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderRadius: 16, marginBottom: 12, borderWidth: 1,
  },
  listTitle: { fontSize: 15, fontWeight: '700' },
  listSub: { fontSize: 13, marginTop: 3 },
  notesText: { fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
