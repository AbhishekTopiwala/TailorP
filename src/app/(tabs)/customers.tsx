import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore, Customer, getBalance } from '@/store/AppStore';
import { MaterialIcons } from '@expo/vector-icons';

export default function CustomersScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { customers, orders, deleteCustomer, showAlert } = useAppStore();

  const [search, setSearch] = useState('');

  const activeCustomers = customers.filter(c => c.isActive);
  const filtered = activeCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.displayCode.toLowerCase().includes(search.toLowerCase())
  );



  function handleDelete(customer: Customer) {
    showAlert('Delete Customer', `Remove ${customer.name}? Their orders will remain.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCustomer(customer.id) }
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
        <Text style={[s.headerTitle, { color: colors.text }]}>Customers</Text>
      </View>

      {/* Floating Search Bar */}
      <View style={[s.searchBar, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={[s.searchInput, { color: colors.text }]}
          placeholder="Search customer name, phone or bill number..."
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Count */}
      <Text style={[s.countText, { color: colors.textSecondary }]}>
        Showing {filtered.length} client{filtered.length !== 1 ? 's' : ''}
      </Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState
            icon="people"
            message={search ? 'No matches found' : 'No customers registered yet. Tap the button below to add one.'}
            colors={colors}
          />
        }
        renderItem={({ item }) => {
          const customerOrders = orders.filter(o => o.customerId === item.id);
          const pendingOrders = customerOrders.filter(o => !['Delivered', 'Completed'].includes(o.status));
          const totalPendingAmount = customerOrders.reduce((sum, o) => sum + Math.max(0, getBalance(o)), 0);

          // Get nearest upcoming delivery date
          const pendingDeliveries = pendingOrders
            .map(o => new Date(o.deliveryDate))
            .sort((a, b) => a.getTime() - b.getTime());
          
          const nearestDeliveryDate = pendingDeliveries[0] 
            ? pendingDeliveries[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) 
            : null;

          // Determine status chip
          let statusChip: 'Pending' | 'Completed' | 'Delivered' | 'Urgent' | null = null;
          if (customerOrders.length > 0) {
            if (customerOrders.some(o => o.priority === 'Urgent' && !['Delivered', 'Completed'].includes(o.status))) {
              statusChip = 'Urgent';
            } else if (pendingOrders.length > 0) {
              statusChip = 'Pending';
            } else if (customerOrders.some(o => o.status === 'Delivered')) {
              statusChip = 'Delivered';
            } else {
              statusChip = 'Completed';
            }
          }

          return (
            <TouchableOpacity
              style={[s.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
              onPress={() => router.push(`/customer/${item.id}`)}
              activeOpacity={0.8}
            >
              <View style={[s.avatar, { backgroundColor: colors.primary + '10' }]}>
                <Text style={[s.avatarText, { color: colors.primary }]}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              
              <View style={{ flex: 1, marginLeft: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Text style={[s.custName, { color: colors.text }]}>{item.name}</Text>
                  {item.gender === 'Female' && (
                    <MaterialIcons name="face" size={14} color={colors.textSecondary} style={{ marginLeft: 6 }} />
                  )}
                </View>
                
                <Text style={[s.custPhone, { color: colors.textSecondary }]}>{item.phone}</Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8, flexWrap: 'wrap' }}>
                  <Text style={[s.custCode, { color: colors.textSecondary }]}>{item.displayCode}</Text>
                  <Text style={{ color: colors.border, fontSize: 10 }}>•</Text>
                  <Text style={[s.custCode, { color: colors.textSecondary }]}>{customerOrders.length} orders</Text>
                </View>

                {(nearestDeliveryDate || totalPendingAmount > 0) && (
                  <View style={s.metaContainer}>
                    {nearestDeliveryDate && (
                      <View style={s.metaItem}>
                        <MaterialIcons name="event" size={12} color={colors.textSecondary} />
                        <Text style={[s.metaText, { color: colors.textSecondary }]}>Delivery: {nearestDeliveryDate}</Text>
                      </View>
                    )}
                    {totalPendingAmount > 0 && (
                      <View style={s.metaItem}>
                        <MaterialIcons name="payment" size={12} color={colors.error} />
                        <Text style={[s.metaText, { color: colors.error, fontWeight: '600' }]}>Pending: ₹{totalPendingAmount}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', minHeight: 70 }}>
                {statusChip && <StatusChip status={statusChip} colors={colors} />}
                
                <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={12} style={s.deleteBtn} activeOpacity={0.7}>
                  <MaterialIcons name="delete-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={[s.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={() => router.push('/customer/new')}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color={colors.onPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function StatusChip({ status, colors }: { status: 'Pending' | 'Completed' | 'Delivered' | 'Urgent'; colors: any }) {
  const map = {
    Urgent: { bg: '#FEF2F2', text: '#EF4444' },
    Pending: { bg: '#FFFBEB', text: '#D97706' },
    Delivered: { bg: '#F0FDF4', text: '#15803D' },
    Completed: { bg: '#F1F5F9', text: '#475569' }
  };
  const config = map[status] || { bg: '#F1F5F9', text: '#475569' };
  return (
    <View style={[s.statusChip, { backgroundColor: config.bg }]}>
      <Text style={[s.statusChipTxt, { color: config.text }]}>{status}</Text>
    </View>
  );
}

function FieldGroup({ label, children, error, colors }: { label: string; children: React.ReactNode; error?: string; colors: any }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[s.label, { color: colors.textSecondary }]}>{label}</Text>
      {children}
      {error ? <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
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

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },
  countText: { fontSize: 13, marginLeft: 24, marginBottom: 8, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700' },
  custName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  custPhone: { fontSize: 13, marginTop: 2 },
  custCode: { fontSize: 12 },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteBtn: { padding: 8 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 99,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    height: 56,
  },
  multiline: { height: 100, paddingTop: 16, textAlignVertical: 'top' },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderBtn: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  genderTxt: { fontSize: 14, fontWeight: '600' },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8
  },
  error: { fontSize: 14, fontWeight: '600' },
  saveFullBtn: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  saveFullTxt: { fontSize: 16, fontWeight: '700' },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusChipTxt: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  }
});

