import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore, isDueToday, isOverdue, getBalance } from '@/store/AppStore';
import { MaterialIcons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const colors = Colors.light; // Force light theme
  const { customers, orders, appointments, userSession } = useAppStore();

  const activeCustomers = customers.filter(c => c.isActive);
  const todayDeliveries = orders.filter(o => isDueToday(o) && !['Delivered', 'Completed'].includes(o.status));
  const pendingOrders = orders.filter(o => !['Delivered', 'Completed'].includes(o.status));
  const completedOrders = orders.filter(o => ['Delivered', 'Completed'].includes(o.status));

  // Additional computed stats for reports/reference
  const activeAppointments = appointments.filter(a => a.status !== 'Cancelled' && a.status !== 'Completed');

  const hour = new Date().getHours();
  let timeGreeting = 'Good Morning 👋';
  if (hour >= 12 && hour < 17) timeGreeting = 'Good Afternoon 👋';
  else if (hour >= 17) timeGreeting = 'Good Evening 👋';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundElement }} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[s.shopName, { color: colors.text }]}>{userSession.shopName || 'Royal Boutique'}</Text>
          <Text style={[s.headerSubtitle, { color: colors.textSecondary }]}>Workspace</Text>
        </View>
        <TouchableOpacity
          style={[s.profileBtn, { backgroundColor: colors.background }]}
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="settings" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Beautiful Greeting */}
        <View style={s.greetingContainer}>
          <Text style={[s.greetingTitle, { color: colors.textSecondary }]}>{timeGreeting}</Text>
          <Text style={[s.greetingSub, { color: colors.text }]}>Welcome Back</Text>
        </View>

        {/* Analytics Cards Grid */}
        <View style={s.analyticsGrid}>
          <AnalyticsCard
            icon="people"
            title="Total Customers"
            count={String(activeCustomers.length)}
            colors={colors}
            onPress={() => router.push('/(tabs)/customers')}
          />
          <AnalyticsCard
            icon="hourglass-empty"
            title="Pending Orders"
            count={String(pendingOrders.length)}
            colors={colors}
            onPress={() => router.push('/(tabs)/orders')}
          />
          <AnalyticsCard
            icon="check-circle-outline"
            title="Completed Orders"
            count={String(completedOrders.length)}
            colors={colors}
            onPress={() => router.push('/(tabs)/orders')}
          />
          <AnalyticsCard
            icon="local-shipping"
            title="Today's Delivery"
            count={String(todayDeliveries.length)}
            colors={colors}
            onPress={() => router.push('/(tabs)/orders')}
          />
        </View>

        {/* Quick Actions (Floating Pill Layout) */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>QUICK ACTIONS</Text>
        <View style={s.quickActionsRow}>
          <TouchableOpacity
            style={[s.quickActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/customer/new')}
            activeOpacity={0.7}
          >
            <View style={[s.quickActionIconBg, { backgroundColor: colors.primary + '10' }]}>
              <MaterialIcons name="person-add" size={22} color={colors.primary} />
            </View>
            <Text style={[s.quickActionTxt, { color: colors.text }]} numberOfLines={2}>New Customer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[s.quickActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/order/new')}
            activeOpacity={0.7}
          >
            <View style={[s.quickActionIconBg, { backgroundColor: colors.primary + '10' }]}>
              <MaterialIcons name="add-shopping-cart" size={22} color={colors.primary} />
            </View>
            <Text style={[s.quickActionTxt, { color: colors.text }]} numberOfLines={2}>New Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.quickActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/appointments/book')}
            activeOpacity={0.7}
          >
            <View style={[s.quickActionIconBg, { backgroundColor: colors.primary + '10' }]}>
              <MaterialIcons name="event" size={22} color={colors.primary} />
            </View>
            <Text style={[s.quickActionTxt, { color: colors.text }]} numberOfLines={2}>Trial Booking</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointments List */}
        {activeAppointments.length > 0 && (
          <>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.text }]}>UPCOMING TRIALS</Text>
              <TouchableOpacity onPress={() => router.push('/appointments')}>
                <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }}>View All</Text>
              </TouchableOpacity>
            </View>
            {activeAppointments.slice(0, 2).map(app => (
              <View key={app.id} style={[s.premiumCard, { backgroundColor: colors.surface }]}>
                <View style={s.cardHeaderRow}>
                  <View style={s.customerAvatarPlaceholder}>
                    <Text style={[s.avatarInitial, { color: colors.primary }]}>{app.customerName.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[s.cardTitle, { color: colors.text }]}>{app.customerName}</Text>
                    <Text style={[s.cardSubtitle, { color: colors.textSecondary }]}>
                      Time: {app.timeSlot} · Date: {app.date}
                    </Text>
                  </View>
                  <View style={[s.statusChip, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}>
                    <Text style={[s.statusChipText, { color: colors.primary }]}>{app.status}</Text>
                  </View>
                </View>
                {app.notes && (
                  <View style={[s.notesContainer, { backgroundColor: colors.backgroundElement }]}>
                    <Text style={[s.notesText, { color: colors.textSecondary }]}>
                      "{app.notes}"
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Today's Deliveries */}
        {todayDeliveries.length > 0 && (
          <>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.text }]}>DELIVERIES DUE TODAY</Text>
            </View>
            {todayDeliveries.map(order => {
              const customer = customers.find(c => c.id === order.customerId);
              return (
                <TouchableOpacity
                  key={order.id}
                  style={[s.premiumCard, { backgroundColor: colors.surface }]}
                  onPress={() => router.push(`/order/${order.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={s.cardHeaderRow}>
                    <View style={s.customerAvatarPlaceholder}>
                      <Text style={[s.avatarInitial, { color: colors.primary }]}>{(customer?.name || 'C').charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[s.cardTitle, { color: colors.text }]}>{customer?.name || 'Unknown'}</Text>
                      <Text style={[s.cardSubtitle, { color: colors.textSecondary }]}>
                        {order.orderNumber} · {order.items.map(i => i.garmentType).join(', ')}
                      </Text>
                    </View>
                    <StatusBadge status={order.status} colors={colors} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Recent Orders */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>RECENT ORDERS</Text>
        {orders.slice(0, 3).map(order => {
          const customer = customers.find(c => c.id === order.customerId);
          return (
            <TouchableOpacity
              key={order.id}
              style={[s.premiumCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push(`/order/${order.id}`)}
              activeOpacity={0.8}
            >
              <View style={s.cardHeaderRow}>
                <View style={s.customerAvatarPlaceholder}>
                  <Text style={[s.avatarInitial, { color: colors.primary }]}>{(customer?.name || 'C').charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[s.cardTitle, { color: colors.text }]}>{customer?.name || 'Unknown'}</Text>
                  <Text style={[s.cardSubtitle, { color: colors.textSecondary }]}>
                    {order.orderNumber} · {order.items.map(i => i.garmentType).join(', ')}
                  </Text>
                  <Text style={[s.cardMetaText, { color: colors.textSecondary }]}>
                    Delivery: {new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <StatusBadge status={order.status} colors={colors} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function AnalyticsCard({ icon, title, count, colors, onPress }: any) {
  return (
    <TouchableOpacity
      style={[s.analyticsCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[s.analyticsIconBg, { backgroundColor: colors.primary + '10' }]}>
        <MaterialIcons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={[s.analyticsCount, { color: colors.text }]}>{count}</Text>
      <Text style={[s.analyticsTitle, { color: colors.textSecondary }]}>{title}</Text>
    </TouchableOpacity>
  );
}

function StatusBadge({ status, colors }: any) {
  const badgeColors: Record<string, string> = {
    'Ready': colors.success,
    'Delivered': colors.success,
    'Completed': colors.textSecondary,
    'Stitching': colors.warning,
    'Cutting': colors.warning,
    'Trial': colors.primary,
  };
  const bg = badgeColors[status] || colors.primary;
  return (
    <View style={[s.statusChip, { backgroundColor: bg + '10', borderColor: bg + '20' }]}>
      <Text style={[s.statusChipText, { color: bg }]}>{status}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: -2,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  greetingContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  greetingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  analyticsCard: {
    width: '48%',
    borderRadius: 20, // 20dp rounded as requested
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  analyticsIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsCount: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  analyticsTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 12,
    opacity: 0.6,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
    width: '31%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTxt: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  premiumCard: {
    borderRadius: 20, // 20dp rounded as requested
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  cardMetaText: {
    fontSize: 12,
    marginTop: 4,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
