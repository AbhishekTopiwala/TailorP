import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, useColorScheme, KeyboardAvoidingView, Platform, Keyboard, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/store/AppStore';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
];

export default function BookAppointmentScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { customers, addAppointment, showAlert } = useAppStore();
  const activeCustomers = customers.filter(c => c.isActive);

  const [selectedCustomerId, setSelectedCustomerId] = useState(activeCustomers[0]?.id || '');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [notes, setNotes] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}`);
    }
  };

  function handleBook() {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      showAlert('Error', 'Please select a customer first.');
      return;
    }

    addAppointment({
      customerId: selectedCustomerId,
      customerName: customer.name,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      notes: notes.trim() || undefined,
    });

    showAlert('Success', 'Appointment booked successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  }

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedCustomerName = selectedCustomer?.name || 'Select Customer';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Schedule Appointment',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' }
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 60}
      >
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={[s.container, { paddingBottom: keyboardVisible ? 120 : 48 }]} showsVerticalScrollIndicator={false}>
        {/* Date Strip */}
        <View style={s.sectionHeaderRow}>
          <MaterialIcons name="event" size={16} color={colors.textSecondary} />
          <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>SELECT DATE</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dateStrip} contentContainerStyle={{ paddingRight: 24, alignItems: 'center' }}>
          {daysList.map((day) => {
            const isSelected = selectedDate === day.fullString;
            return (
              <TouchableOpacity
                key={day.fullString}
                style={[
                  s.dateCard,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                  isSelected && [s.dateCardSelected, { backgroundColor: colors.primary, borderColor: colors.primary }]
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

          {Platform.OS !== 'web' && (() => {
            const isCustomDate = !daysList.some(day => day.fullString === selectedDate);
            const customDateDisplay = isCustomDate 
              ? (() => {
                  const d = new Date(selectedDate);
                  return isNaN(d.getTime()) ? 'Choose' : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                })()
              : 'Choose';

            return (
              <TouchableOpacity
                style={[
                  s.dateCard,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                  isCustomDate && [s.dateCardSelected, { backgroundColor: colors.primary, borderColor: colors.primary }]
                ]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <MaterialIcons 
                  name="calendar-today" 
                  size={18} 
                  color={isCustomDate ? colors.onPrimary : colors.textSecondary} 
                  style={{ marginBottom: 4 }}
                />
                <Text style={[s.dayName, { color: isCustomDate ? colors.onPrimary : colors.text, fontSize: 10, fontWeight: '700' }]}>
                  {customDateDisplay}
                </Text>
              </TouchableOpacity>
            );
          })()}
        </ScrollView>

        {Platform.OS === 'web' && (
          <View style={{ marginTop: 8, marginBottom: 16 }}>
            <TextInput
              style={[
                s.webDateInput,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: colors.border,
                }
              ]}
              placeholder="YYYY-MM-DD"
              value={selectedDate}
              onChangeText={setSelectedDate}
            />
          </View>
        )}

        {/* Time Slot Grid */}
        <View style={s.sectionHeaderRow}>
          <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
          <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>SELECT TIME SLOT</Text>
        </View>
        <View style={s.timeGrid}>
          {TIME_SLOTS.map((slot) => {
            const isSelected = selectedTimeSlot === slot;
            return (
              <TouchableOpacity
                key={slot}
                style={[
                  s.timeSlotBtn,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                  isSelected && [s.timeSlotBtnSelected, { backgroundColor: colors.primary, borderColor: colors.primary }]
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
        <View style={s.sectionHeaderRow}>
          <MaterialIcons name="person" size={16} color={colors.textSecondary} />
          <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>SELECT CUSTOMER</Text>
        </View>
        
        <View style={s.dropdownContainer}>
          <TouchableOpacity
            style={[
              s.dropdownHeader, 
              { 
                backgroundColor: colors.backgroundElement, 
                borderColor: isDropdownOpen ? colors.borderFocus : colors.border 
              }
            ]}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialIcons name="account-box" size={20} color={colors.textSecondary} />
              <Text style={[s.dropdownHeaderTxt, { color: colors.text }]}>{selectedCustomerName}</Text>
            </View>
            <MaterialIcons 
              name={isDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={22} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          {isDropdownOpen && (
            <View style={[s.dropdownList, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
                {activeCustomers.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[s.dropdownItem, { borderBottomColor: colors.divider }]}
                    onPress={() => {
                      setSelectedCustomerId(c.id);
                      setIsDropdownOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.dropdownItemTxt, { color: colors.text }]}>{c.name}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{c.phone}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Notes Input */}
        <View style={s.sectionHeaderRow}>
          <MaterialIcons name="rate-review" size={16} color={colors.textSecondary} />
          <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>NOTES / COMPLAINTS</Text>
        </View>
        <TextInput
          style={[
            s.notesInput,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: focusedInput === 'notes' ? colors.borderFocus : colors.border,
              color: colors.text,
            },
          ]}
          placeholder="e.g. Bring fabric sample, fit trial"
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
          onFocus={() => setFocusedInput('notes')}
          onBlur={() => setFocusedInput(null)}
        />

        {/* Save Appointment Button */}
        <TouchableOpacity
          style={[s.bookBtn, { backgroundColor: colors.primary }]}
          onPress={handleBook}
          activeOpacity={0.85}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialIcons name="done" size={20} color={colors.onPrimary} />
            <Text style={[s.bookBtnTxt, { color: colors.onPrimary }]}>Confirm Appointment</Text>
          </View>
        </TouchableOpacity>
        </ScrollView>

        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={(() => {
              const parsed = new Date(selectedDate);
              return isNaN(parsed.getTime()) ? new Date() : parsed;
            })()}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}

        {showDatePicker && Platform.OS === 'ios' && (
          <Modal
            transparent
            animationType="fade"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableOpacity 
              style={s.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setShowDatePicker(false)}
            >
              <View style={[s.pickerModalContainer, { backgroundColor: colors.surface }]}>
                <View style={[s.pickerHeader, { borderBottomColor: colors.divider }]}>
                  <Text style={[s.pickerHeaderTitle, { color: colors.text }]}>Select Trial Date</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={(() => {
                    const parsed = new Date(selectedDate);
                    return isNaN(parsed.getTime()) ? new Date() : parsed;
                  })()}
                  mode="date"
                  display="inline"
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                  style={{ backgroundColor: colors.surface }}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 24,
  },
  sectionHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    marginBottom: 10, 
    marginTop: 20 
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  dateStrip: {
    flexDirection: 'row',
    marginBottom: 8,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  dateCard: {
    width: 62,
    height: 76,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dateCardSelected: {
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateNum: {
    fontSize: 19,
    fontWeight: '800',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlotBtn: {
    width: '31%',
    marginVertical: 5,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  timeSlotBtnSelected: {
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  timeSlotTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  dropdownHeaderTxt: {
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownList: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    borderRadius: 14,
    borderWidth: 1,
    maxHeight: 180,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemTxt: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesInput: {
    height: 86,
    borderRadius: 14,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  bookBtnTxt: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  pickerModalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  pickerHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  webDateInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    height: 52,
  },
});
