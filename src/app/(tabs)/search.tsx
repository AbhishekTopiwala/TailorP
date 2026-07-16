import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore, getBalance } from '@/store/AppStore';
import { MaterialIcons } from '@expo/vector-icons';

export default function SearchScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { customers, orders } = useAppStore();

  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const matchedCustomers = q.length < 1 ? [] : customers.filter(c =>
    c.isActive && (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.displayCode.toLowerCase().includes(q)
    )
  );
  const matchedOrders = q.length < 1 ? [] : orders.filter(o =>
    o.orderNumber.toLowerCase().includes(q) ||
    customers.find(c => c.id === o.customerId)?.name.toLowerCase().includes(q) ||
    customers.find(c => c.id === o.customerId)?.phone.includes(q)
  );

  const hasResults = matchedCustomers.length > 0 || matchedOrders.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.background }]}>
        <Text style={[s.headerTitle, { color: colors.text }]}>Search</Text>
      </View>

      {/* Search Input Box */}
      <View style={[s.searchBox, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={[s.input, { color: colors.text }]}
          placeholder="Search by name, phone, or order number..."
          placeholderTextColor={colors.placeholder}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7} style={{ padding: 4 }}>
            <MaterialIcons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {q.length === 0 ? (
        <View style={s.centerState}>
          <View style={[s.emptyIconContainer, { backgroundColor: colors.backgroundElement }]}>
            <MaterialIcons name="search" size={36} color={colors.textSecondary} />
          </View>
          <Text style={[s.emptyText, { color: colors.textSecondary }]}>
            Search for client names, phone numbers,{"\n"}or specific order tracking numbers
          </Text>
        </View>
      ) : !hasResults ? (
        <View style={s.centerState}>
          <View style={[s.emptyIconContainer, { backgroundColor: colors.backgroundElement }]}>
            <MaterialIcons name="search-off" size={36} color={colors.textSecondary} />
          </View>
          <Text style={[s.emptyText, { color: colors.textSecondary }]}>
            No results matched "{query}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...(matchedCustomers.length > 0 ? [{ type: 'header', label: 'Clients', count: matchedCustomers.length, icon: 'people' }] : []),
            ...matchedCustomers.map(c => ({ type: 'customer', data: c })),
            ...(matchedOrders.length > 0 ? [{ type: 'header', label: 'Orders', count: matchedOrders.length, icon: 'receipt' }] : []),
            ...matchedOrders.map(o => ({ type: 'order', data: o })),
          ]}
          keyExtractor={(item: any, i) => `${item.type}-${item.data?.id || i}`}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: any) => {
            if (item.type === 'header') {
              return (
                <View style={s.sectionHeaderRow}>
                  <MaterialIcons name={item.icon} size={14} color={colors.textSecondary} />
                  <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
                    {item.label} ({item.count})
                  </Text>
                </View>
              );
            }
            if (item.type === 'customer') {
              const c = item.data;
              return (
                <TouchableOpacity
                  style={[s.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                  onPress={() => router.push(`/customer/${c.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={[s.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={[s.avatarTxt, { color: colors.onPrimary }]}>{c.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text style={[s.name, { color: colors.text }]}>{c.name}</Text>
                    <View style={s.subRow}>
                      <MaterialIcons name="phone" size={12} color={colors.textSecondary} />
                      <Text style={[s.sub, { color: colors.textSecondary }]}>{c.phone} · {c.displayCode}</Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            }
            if (item.type === 'order') {
              const o = item.data;
              const cust = customers.find(c => c.id === o.customerId);
              const balance = getBalance(o);
              return (
                <TouchableOpacity
                  style={[s.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                  onPress={() => router.push(`/order/${o.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={[s.orderIcon, { backgroundColor: colors.divider }]}>
                    <MaterialIcons name="receipt" size={18} color={colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={[s.name, { color: colors.text }]}>{o.orderNumber}</Text>
                    <Text style={[s.sub, { color: colors.textSecondary }]}>{cust?.name} · {o.status}</Text>
                    <Text style={[s.sub, { color: colors.textSecondary, fontWeight: '700', marginTop: 2 }]}>
                      ₹{o.totalAmount.toLocaleString('en-IN')} {balance > 0 ? `· Bal: ₹${balance}` : '· Paid'}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            }
            return null;
          }}
        />
      )}
    </SafeAreaView>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 8,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    borderWidth: 1
  },
  input: { flex: 1, fontSize: 15, fontWeight: '500' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 16, fontWeight: '800' },
  orderIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  sub: { fontSize: 12, fontWeight: '500' },
  centerState: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  emptyText: { marginTop: 16, fontSize: 15, textAlign: 'center', lineHeight: 22, fontWeight: '500' }
});
