import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore, getBalance } from '@/store/AppStore';

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
      <View style={[s.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
        <Text style={[s.headerTitle, { color: colors.text }]}>🔍 Search</Text>
      </View>

      {/* Search Input */}
      <View style={[s.searchBox, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={[s.input, { color: colors.text }]}
          placeholder="Search by client, phone, or order #…"
          placeholderTextColor={colors.placeholder}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
            <Text style={{ color: colors.textSecondary, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {q.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 80, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 56 }}>🔍</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 14, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
            Search for client names, phone numbers,{'\n'}or specific order tracking numbers
          </Text>
        </View>
      ) : !hasResults ? (
        <View style={{ alignItems: 'center', marginTop: 80, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 56 }}>😕</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 14, fontSize: 15, textAlign: 'center' }}>
            No results matched "{query}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...(matchedCustomers.length > 0 ? [{ type: 'header', label: `👥 Clients (${matchedCustomers.length})` }] : []),
            ...matchedCustomers.map(c => ({ type: 'customer', data: c })),
            ...(matchedOrders.length > 0 ? [{ type: 'header', label: `📋 Orders (${matchedOrders.length})` }] : []),
            ...matchedOrders.map(o => ({ type: 'order', data: o })),
          ]}
          keyExtractor={(item: any, i) => `${item.type}-${item.data?.id || i}`}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          renderItem={({ item }: any) => {
            if (item.type === 'header') {
              return <Text style={[s.sectionLabel, { color: colors.text }]}>{item.label}</Text>;
            }
            if (item.type === 'customer') {
              const c = item.data;
              return (
                <TouchableOpacity
                  style={[s.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                  onPress={() => router.push(`/customer/${c.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={[s.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={[s.avatarTxt, { color: colors.onPrimary }]}>{c.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text style={[s.name, { color: colors.text }]}>{c.name}</Text>
                    <Text style={[s.sub, { color: colors.textSecondary }]}>📞 {c.phone} · {c.displayCode}</Text>
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 20 }}>›</Text>
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
                  activeOpacity={0.8}
                >
                  <View style={[s.orderIcon, { backgroundColor: colors.divider }]}>
                    <Text style={{ fontSize: 18 }}>📋</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={[s.name, { color: colors.text }]}>{o.orderNumber}</Text>
                    <Text style={[s.sub, { color: colors.textSecondary }]}>{cust?.name} · {o.status}</Text>
                    <Text style={[s.sub, { color: colors.textSecondary, fontWeight: '600' }]}>
                      ₹{o.totalAmount.toLocaleString('en-IN')} {balance > 0 ? `· Bal ₹${balance}` : '· Paid'}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 20 }}>›</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', letterSpacing: -0.5 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5
  },
  input: { flex: 1, fontSize: 15 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1
  },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 16, fontWeight: 'bold' },
  orderIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  sub: { fontSize: 12, marginTop: 2 },
});
