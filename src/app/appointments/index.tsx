import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/store/AppStore';
import { MaterialIcons } from '@expo/vector-icons';

export default function AppointmentsListScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { appointments, deleteAppointment, showAlert } = useAppStore();

  // Filter active (upcoming) trials
  const activeAppointments = appointments.filter(a => a.status !== 'Cancelled' && a.status !== 'Completed');

  // Sort by date, then time slot
  const sortedAppointments = [...activeAppointments].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return a.timeSlot.localeCompare(b.timeSlot);
  });

  const handleDelete = (id: string, name: string) => {
    showAlert(
      'Delete Trial Booking',
      `Are you sure you want to delete the trial booking for ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAppointment(id) }
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Upcoming Trials',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/appointments/book')}
              style={{ marginRight: 8 }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={26} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[s.container, { backgroundColor: colors.background }]}>
        {sortedAppointments.length === 0 ? (
          <View style={s.emptyContainer}>
            <View style={[s.emptyIconBg, { backgroundColor: colors.backgroundElement }]}>
              <MaterialIcons name="event-busy" size={48} color={colors.textSecondary} />
            </View>
            <Text style={[s.emptyTitle, { color: colors.text }]}>No Upcoming Trials</Text>
            <Text style={[s.emptySubtitle, { color: colors.textSecondary }]}>
              All scheduled customer trial bookings will appear here.
            </Text>
            <TouchableOpacity
              style={[s.bookBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/appointments/book')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add" size={20} color={colors.onPrimary} />
              <Text style={[s.bookBtnTxt, { color: colors.onPrimary }]}>Book Trial Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
          >
            {sortedAppointments.map((app) => (
              <View key={app.id} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={s.cardHeader}>
                  <View style={s.avatarPlaceholder}>
                    <Text style={[s.avatarInitial, { color: colors.primary }]}>
                      {app.customerName ? app.customerName.charAt(0).toUpperCase() : 'C'}
                    </Text>
                  </View>
                  <View style={s.cardHeaderDetails}>
                    <Text style={[s.customerName, { color: colors.text }]}>{app.customerName}</Text>
                    <Text style={[s.timeText, { color: colors.textSecondary }]}>
                      {app.timeSlot}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={() => handleDelete(app.id, app.customerName)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="delete-outline" size={22} color={colors.error || '#EF4444'} />
                  </TouchableOpacity>
                </View>

                <View style={[s.divider, { backgroundColor: colors.divider }]} />

                <View style={s.cardBody}>
                  <View style={s.detailRow}>
                    <MaterialIcons name="event" size={16} color={colors.textSecondary} />
                    <Text style={[s.detailText, { color: colors.textSecondary }]}>
                      {formatDate(app.date)}
                    </Text>
                  </View>
                  {app.notes ? (
                    <View style={[s.notesContainer, { backgroundColor: colors.backgroundElement }]}>
                      <MaterialIcons name="rate-review" size={14} color={colors.textSecondary} style={{ marginTop: 2 }} />
                      <Text style={[s.notesText, { color: colors.text }]}>{app.notes}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardHeaderDetails: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  cardBody: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  notesText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  bookBtnTxt: {
    fontSize: 15,
    fontWeight: '700',
  },
});
