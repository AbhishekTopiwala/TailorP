import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAppStore, getBalance, getTotalPaid } from '@/store/AppStore';

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
      <View style={[s.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
        <Text style={[s.headerTitle, { color: colors.text }]}>📊 Reports</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Period Selector */}
        <View style={s.periodRow}>
          {(['Daily', 'Weekly', 'Monthly'] as Period[]).map(p => (
            <TouchableOpacity
              key={p}
              style={[
                s.periodBtn,
                {
                  backgroundColor: period === p ? colors.primary : colors.backgroundElement,
                  borderColor: period === p ? colors.primary : colors.border,
                }
              ]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.8}
            >
              <Text style={[s.periodTxt, { color: period === p ? colors.onPrimary : colors.text }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Period Stats */}
        <Text style={[s.section, { color: colors.text }]}>
          {period === 'Daily' ? "Today's" : period === 'Weekly' ? "This Week's" : "This Month's"} Summary
        </Text>
        <View style={s.grid}>
          <StatCard emoji="💰" label="Income Collected" value={`₹${incomeCollected.toLocaleString('en-IN')}`} accent={colors.success} colors={colors} />
          <StatCard emoji="📝" label="Orders Created" value={String(ordersCreated)} accent={colors.primary} colors={colors} />
          <StatCard emoji="✅" label="Delivered" value={String(ordersDelivered)} accent={colors.success} colors={colors} />
          <StatCard emoji="🕐" label="Still Active" value={String(ordersCreated - ordersDelivered)} accent={colors.warning} colors={colors} />
        </View>

        {/* Overall Health */}
        <Text style={[s.section, { color: colors.text }]}>Overall Business Health</Text>
        <View style={[s.overallCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Row label="Total Customers" value={String(customers.filter(c => c.isActive).length)} colors={colors} />
          <Row label="Total Orders" value={String(orders.length)} colors={colors} />
          <Row label="Total Pending Balance" value={`₹${totalPendingBalance.toLocaleString('en-IN')}`} valueColor={totalPendingBalance > 0 ? colors.error : colors.success} colors={colors} />
          <Row label="Overdue Orders" value={String(overdueCount)} valueColor={overdueCount > 0 ? colors.error : colors.success} colors={colors} />
        </View>

        {/* Garment Breakdown */}
        {sortedGarments.length > 0 && (
          <>
            <Text style={[s.section, { color: colors.text }]}>🧵 Garments by Volume</Text>
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
            <Text style={[s.section, { color: colors.text }]}>⭐ Top Customers by Spend</Text>
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

function StatCard({ emoji, label, value, accent, colors }: any) {
  return (
    <View style={[s.statCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border, borderLeftColor: accent, borderLeftWidth: 4 }]}>
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', letterSpacing: -0.5 },
  periodRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  periodBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, alignItems: 'center' },
  periodTxt: { fontWeight: '700', fontSize: 13 },
  section: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1
  },
  statVal: { fontSize: 20, fontWeight: '800', marginTop: 10, marginBottom: 2, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '600' },
  overallCard: { borderRadius: 16, borderWidth: 1.5, padding: 8, marginBottom: 20 },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  rowLabel: { fontSize: 14, fontWeight: '500' },
  rowValue: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1.5, marginHorizontal: 12 },
  garmentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  garmentType: { fontSize: 14, flex: 1, fontWeight: '500' },
  barBg: { width: 80, height: 8, borderRadius: 4, overflow: 'hidden', marginRight: 8 },
  barFill: { height: '100%', borderRadius: 4 },
  garmentCount: { fontSize: 14, fontWeight: '700', width: 24, textAlign: 'right' },
});
