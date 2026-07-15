import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/store/AppStore';

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
];

export default function AppointmentsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { customers, addAppointment } = useAppStore();

  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [notes, setNotes] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Generate next 7 days for horizontal selector
  const daysList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      fullString: d.toISOString().slice(0, 10),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
    };
  });

  const [selectedDate, setSelectedDate] = useState(daysList[0].fullString);

  function handleBook() {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      Alert.alert('Error', 'Please select a customer first.');
      return;
    }

    addAppointment({
      customerId: selectedCustomerId,
      customerName: customer.name,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      notes: notes.trim() || undefined,
    });

    Alert.alert('Success', 'Appointment booked successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  }

  const selectedCustomerName = customers.find(c => c.id === selectedCustomerId)?.name || 'Select Customer';

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={s.container}>
      {/* Date Strip */}
      <Text style={[s.sectionTitle, { color: colors.text }]}>SELECT DATE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dateStrip}>
        {daysList.map((day) => {
          const isSelected = selectedDate === day.fullString;
          return (
            <TouchableOpacity
              key={day.fullString}
              style={[
                s.dateCard,
                { backgroundColor: colors.backgroundElement },
                isSelected && [s.dateCardSelected, { backgroundColor: colors.primary }]
              ]}
              onPress={() => setSelectedDate(day.fullString)}
              activeOpacity={0.8}
            >
              <Text style={[s.dayName, { color: isSelected ? colors.onPrimary : colors.textSecondary }]}>
                {day.dayName}
              </Text>
              <Text style={[s.dateNum, { color: isSelected ? colors.onPrimary : colors.text }]}>
                {day.dateNum}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Time Slot Grid */}
      <Text style={[s.sectionTitle, { color: colors.text }]}>SELECT TIME SLOT</Text>
      <View style={s.timeGrid}>
        {TIME_SLOTS.map((slot) => {
          const isSelected = selectedTimeSlot === slot;
          return (
            <TouchableOpacity
              key={slot}
              style={[
                s.timeSlotBtn,
                { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                isSelected && [s.timeSlotBtnSelected, { backgroundColor: colors.primary }]
              ]}
              onPress={() => setSelectedTimeSlot(slot)}
              activeOpacity={0.8}
            >
              <Text style={[s.timeSlotTxt, { color: isSelected ? colors.onPrimary : colors.text }]}>
                {slot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Customer Selector Dropdown */}
      <Text style={[s.sectionTitle, { color: colors.text }]}>SELECT CUSTOMER</Text>
      <View style={s.dropdownContainer}>
        <TouchableOpacity
          style={[s.dropdownHeader, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          activeOpacity={0.8}
        >
          <Text style={[s.dropdownHeaderTxt, { color: colors.text }]}>{selectedCustomerName}</Text>
          <Text style={{ color: colors.textSecondary }}>▼</Text>
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={[s.dropdownList, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            {customers.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[s.dropdownItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setSelectedCustomerId(c.id);
                  setIsDropdownOpen(false);
                }}
              >
                <Text style={[s.dropdownItemTxt, { color: colors.text }]}>{c.name} ({c.phone})</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Notes Input */}
      <Text style={[s.sectionTitle, { color: colors.text }]}>NOTES / COMPLAINTS</Text>
      <TextInput
        style={[
          s.notesInput,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder="e.g. Bring fabric sample, fit trial"
        placeholderTextColor={colors.placeholder}
        multiline
        numberOfLines={3}
        value={notes}
        onChangeText={setNotes}
      />

      {/* Save Appointment Button */}
      <TouchableOpacity
        style={[s.bookBtn, { backgroundColor: colors.primary }]}
        onPress={handleBook}
        activeOpacity={0.85}
      >
        <Text style={[s.bookBtnTxt, { color: colors.onPrimary }]}>Confirm Appointment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 20,
  },
  dateStrip: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateCard: {
    width: 60,
    height: 75,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dateCardSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateNum: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  timeSlotBtn: {
    width: '31%',
    marginHorizontal: '1%',
    marginVertical: 6,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  timeSlotBtnSelected: {
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timeSlotTxt: {
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  dropdownHeaderTxt: {
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownList: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 180,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemTxt: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesInput: {
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  bookBtn: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bookBtnTxt: {
    fontSize: 16,
    fontWeight: '700',
  },
});
