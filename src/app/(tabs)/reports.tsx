import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAppStore, getBalance, getTotalPaid } from '@/store/AppStore';
import { MaterialIcons } from '@expo/vector-icons';

type Period = 'Daily' | 'Weekly' | 'Monthly';

export default function ReportsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { orders, customers } = useAppStore();
  const [period, setPeriod] = useState<Period>('Monthly');

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const monthStr = now.toISOString().slice(0, 7);
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());

  function inPeriod(dateStr: string) {
    const d = new Date(dateStr);
    if (period === 'Daily') return dateStr === todayStr;
    if (period === 'Weekly') return d >= weekStart;
    return dateStr.startsWith(monthStr);
  }

  const periodOrders = orders.filter(o => inPeriod(o.orderDate));
  const periodPayments = orders.flatMap(o => o.payments).filter(p => inPeriod(p.date));
  const incomeCollected = periodPayments.reduce((s, p) => s + p.amount, 0);
  const ordersCreated = periodOrders.length;
  const ordersDelivered = periodOrders.filter(o => ['Delivered', 'Completed'].includes(o.status)).length;

  // Overall stats
  const totalPendingBalance = orders.reduce((s, o) => s + Math.max(0, getBalance(o)), 0);
  const overdueCount = orders.filter(o =>
    new Date(o.deliveryDate) < now && !['Delivered', 'Completed'].includes(o.status)
  ).length;

  // Garment breakdown
  const garmentCount: Record<string, number> = {};
  orders.forEach(o => o.items.forEach(i => {
    garmentCount[i.garmentType] = (garmentCount[i.garmentType] || 0) + i.quantity;
  }));
  const sortedGarments = Object.entries(garmentCount).sort((a, b) => b[1] - a[1]);

  // Top customers by spend
  const customerSpend: Record<string, number> = {};
  orders.forEach(o => {
    customerSpend[o.customerId] = (customerSpend[o.customerId] || 0) + getTotalPaid(o);
  });
  const topCustomers = Object.entries(customerSpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.background }]}>
        <Text style={[s.headerTitle, { color: colors.text }]}>Reports</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={s.periodRow}>
          {(['Daily', 'Weekly', 'Monthly'] as Period[]).map(p => {
            const isSelected = period === p;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  s.periodBtn,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.backgroundElement,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setPeriod(p)}
                activeOpacity={0.8}
              >
                <Text style={[s.periodTxt, { color: isSelected ? colors.onPrimary : colors.textSecondary }]}>
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Period Stats */}
        <Text style={[s.section, { color: colors.textSecondary }]}>
          {period === 'Daily' ? "Today's" : period === 'Weekly' ? "This Week's" : "This Month's"} Summary
        </Text>
        <View style={s.grid}>
          <StatCard
            icon="payments"
            label="Income Collected"
            value={`₹${incomeCollected.toLocaleString('en-IN')}`}
            iconColor="#16A34A"
            colors={colors}
          />
          <StatCard
            icon="create"
            label="Orders Created"
            value={String(ordersCreated)}
            iconColor={colors.primary}
            colors={colors}
          />
          <StatCard
            icon="check-circle"
            label="Delivered"
            value={String(ordersDelivered)}
            iconColor="#2563EB"
            colors={colors}
          />
          <StatCard
            icon="hourglass-empty"
            label="Still Active"
            value={String(ordersCreated - ordersDelivered)}
            iconColor="#D97706"
            colors={colors}
          />
        </View>

        {/* Overall Health */}
        <Text style={[s.section, { color: colors.textSecondary, marginTop: 12 }]}>Overall Business Health</Text>
        <View style={[s.overallCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Row label="Total Active Customers" value={String(customers.filter(c => c.isActive).length)} colors={colors} />
          <View style={[s.divider, { backgroundColor: colors.divider }]} />
          <Row label="Total Orders Booked" value={String(orders.length)} colors={colors} />
          <View style={[s.divider, { backgroundColor: colors.divider }]} />
          <Row
            label="Total Outstanding Balance"
            value={`₹${totalPendingBalance.toLocaleString('en-IN')}`}
            valueColor={totalPendingBalance > 0 ? colors.error : '#16A34A'}
            colors={colors}
          />
          <View style={[s.divider, { backgroundColor: colors.divider }]} />
          <Row
            label="Overdue Orders"
            value={String(overdueCount)}
            valueColor={overdueCount > 0 ? colors.error : '#16A34A'}
            colors={colors}
          />
        </View>

        {/* Garment Breakdown */}
        {sortedGarments.length > 0 && (
          <>
            <View style={s.sectionHeaderRow}>
              <MaterialIcons name="content-cut" size={16} color={colors.textSecondary} />
              <Text style={[s.section, { color: colors.textSecondary, marginTop: 0, marginBottom: 0 }]}>Garments by Volume</Text>
            </View>
            <View style={[s.overallCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              {sortedGarments.map(([type, count], idx) => (
                <View key={type}>
                  {idx > 0 && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
                  <View style={s.garmentRow}>
                    <Text style={[s.garmentType, { color: colors.text }]}>{type}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[s.barBg, { backgroundColor: colors.divider }]}>
                        <View
                          style={[
                            s.barFill,
                            {
                              width: `${Math.round((count / sortedGarments[0][1]) * 100)}%`,
                              backgroundColor: colors.primary,
                            }
                          ]}
                        />
                      </View>
                      <Text style={[s.garmentCount, { color: colors.text }]}>{count}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Top Customers */}
        {topCustomers.length > 0 && (
          <>
            <View style={s.sectionHeaderRow}>
              <MaterialIcons name="star-rate" size={16} color={colors.textSecondary} />
              <Text style={[s.section, { color: colors.textSecondary, marginTop: 0, marginBottom: 0 }]}>Top Customers by Spend</Text>
            </View>
            <View style={[s.overallCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              {topCustomers.map(([cid, spend], idx) => {
                const cust = customers.find(c => c.id === cid);
                if (!cust) return null;
                return (
                  <View key={cid}>
                    {idx > 0 && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
                    <Row
                      label={`${idx + 1}. ${cust.name}`}
                      value={`₹${spend.toLocaleString('en-IN')}`}
                      valueColor={colors.primary}
                      colors={colors}
                    />
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, iconColor, colors }: any) {
  return (
    <View style={[s.statCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <View style={[s.statIconCircle, { backgroundColor: iconColor + '12' }]}>
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[s.statVal, { color: colors.text }]}>{value}</Text>
      <Text style={[s.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function Row({ label, value, valueColor, colors }: any) {
  return (
    <View style={s.rowItem}>
      <Text style={[s.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[s.rowValue, { color: valueColor || colors.text }]}>{value}</Text>
    </View>
  );
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
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  periodBtn: { flex: 1, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  periodTxt: { fontWeight: '700', fontSize: 13 },
  section: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statCard: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2
  },
  statIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statVal: { fontSize: 20, fontWeight: '800', marginBottom: 2, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '700' },
  overallCard: { borderRadius: 20, borderWidth: 1, padding: 8, marginBottom: 20 },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, alignItems: 'center' },
  rowLabel: { fontSize: 14, fontWeight: '600' },
  rowValue: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1, marginHorizontal: 14 },
  garmentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  garmentType: { fontSize: 14, flex: 1, fontWeight: '600' },
  barBg: { width: 80, height: 6, borderRadius: 3, overflow: 'hidden', marginRight: 12 },
  barFill: { height: '100%', borderRadius: 3 },
  garmentCount: { fontSize: 14, fontWeight: '700', width: 24, textAlign: 'right' },
});
