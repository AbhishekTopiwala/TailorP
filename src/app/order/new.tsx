import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore, GarmentType } from '@/store/AppStore';

const GARMENT_TYPES: GarmentType[] = ['Shirt', 'Pant', 'Kurta', 'Blazer', 'Sherwani', 'Blouse', 'Lehenga', 'Kids Wear', 'Custom'];
const GARMENT_EMOJIS: Record<string, string> = {
  'Shirt': '👔', 'Pant': '👖', 'Kurta': '🥻', 'Blazer': '🧥',
  'Sherwani': '🎩', 'Blouse': '👚', 'Lehenga': '💃', 'Kids Wear': '🧒', 'Custom': '✂️',
};

const MEASUREMENT_FIELDS: Record<GarmentType, string[]> = {
  'Shirt': ['Length', 'Shoulder', 'Chest', 'Waist', 'Sleeve Length', 'Collar'],
  'Pant': ['Length', 'Waist', 'Hip', 'Thigh', 'Knee', 'Bottom'],
  'Kurta': ['Length', 'Chest', 'Waist', 'Shoulder', 'Sleeve Length', 'Collar'],
  'Blazer': ['Length', 'Chest', 'Waist', 'Shoulder', 'Sleeve Length', 'Armhole'],
  'Sherwani': ['Length', 'Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length'],
  'Blouse': ['Length', 'Bust', 'Waist', 'Shoulder', 'Sleeve Length', 'Armhole'],
  'Lehenga': ['Waist', 'Hip', 'Lehenga Length', 'Waist to Floor'],
  'Kids Wear': ['Length', 'Chest', 'Waist', 'Shoulder', 'Sleeve Length'],
  'Custom': ['Measurement 1', 'Measurement 2', 'Measurement 3'],
};

const FABRIC_SWATCHES = [
  { id: 'Cotton', name: 'Cotton', emoji: '🪶', desc: 'Soft & breathable', color: '#F7F5F0' },
  { id: 'Linen', name: 'Linen', emoji: '🌾', desc: 'Light & textured', color: '#F2ECE4' },
  { id: 'Silk', name: 'Silk', emoji: '✨', desc: 'Luxurious & smooth', color: '#F5EBF0' },
  { id: 'Wool', name: 'Wool', emoji: '🧶', desc: 'Warm & heavy', color: '#ECEFF2' },
];

export default function NewOrderScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { customers, orders, addOrder } = useAppStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customerId, setCustomerId] = useState('');
  const [custSearch, setCustSearch] = useState('');
  const [garmentType, setGarmentType] = useState<GarmentType>('Shirt');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [fabric, setFabric] = useState('Cotton');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [deliveryDate, setDeliveryDate] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'Urgent'>('Normal');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const activeCustomers = customers.filter(c => c.isActive);
  const filteredCustomers = custSearch
    ? activeCustomers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.phone.includes(custSearch))
    : activeCustomers;

  const selectedCustomer = customers.find(c => c.id === customerId);
  const fields = MEASUREMENT_FIELDS[garmentType];

  // Auto-fill measurements from previous order
  function autoFill() {
    if (!customerId) return;
    const prev = orders
      .filter(o => o.customerId === customerId && o.items.some(i => i.garmentType === garmentType))
      .sort((a, b) => b.orderDate.localeCompare(a.orderDate))[0];
    if (!prev) {
      Alert.alert('No previous measurements', `We couldn't find any past ${garmentType} orders for this client to auto-fill.`);
      return;
    }
    const prevItem = prev.items.find(i => i.garmentType === garmentType);
    if (prevItem) {
      setMeasurements({ ...prevItem.measurements });
      Alert.alert('Success', 'Loaded measurements from previous order!');
    }
  }

  function validateAndNext() {
    if (step === 1) {
      if (!customerId) { setErrors({ customerId: 'Please select a customer' }); return; }
      setErrors({}); setStep(2);
    } else if (step === 2) {
      const errs: Record<string, string> = {};
      if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.price = 'Enter a valid price';
      if (!quantity || Number(quantity) < 1) errs.quantity = 'Quantity must be 1 or more';
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      setErrors({}); setStep(3);
    }
  }

  function handleSubmit() {
    const errs: Record<string, string> = {};
    if (!deliveryDate) {
      errs.deliveryDate = 'Delivery date is required';
    } else {
      // Validate date format YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(deliveryDate)) {
        errs.deliveryDate = 'Use YYYY-MM-DD format';
      }
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const today = new Date().toISOString().slice(0, 10);
    const total = Number(price) * Number(quantity);

    addOrder({
      customerId,
      orderDate: today,
      deliveryDate,
      status: 'Measurement Taken',
      priority,
      items: [{
        id: `oi-${Date.now()}`,
        garmentType,
        quantity: Number(quantity),
        price: Number(price),
        measurements,
      }],
      fabricDetails: fabric,
      specialInstructions: specialInstructions.trim(),
      totalAmount: total,
      advancePaid: 0,
    });

    Alert.alert('✅ Order Created!', `Order placed for ${selectedCustomer?.name}.`, [
      { text: 'View Orders', onPress: () => router.push('/(tabs)/orders') }
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Step ${step} of 3`,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' }
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        {/* Progress Bar */}
        <View style={{ height: 3, backgroundColor: colors.divider }}>
          <View style={{ height: 3, backgroundColor: colors.primary, width: `${(step / 3) * 100}%` }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          {/* ─── Step 1: Customer ─── */}
          {step === 1 && (
            <View>
              <Text style={[s.stepTitle, { color: colors.text }]}>Choose a Client</Text>
              <Text style={[s.stepSub, { color: colors.textSecondary }]}>Select an existing client to bind to this new order.</Text>

              <View style={[s.searchBar, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <Text style={{ marginRight: 8, fontSize: 16 }}>🔍</Text>
                <TextInput
                  style={[s.searchInput, { color: colors.text }]}
                  placeholder="Search client by name or phone…"
                  placeholderTextColor={colors.placeholder}
                  value={custSearch}
                  onChangeText={setCustSearch}
                />
              </View>
              {errors.customerId && <Text style={{ color: colors.error, fontSize: 14, fontWeight: '600', marginBottom: 12 }}>{errors.customerId}</Text>}

              <View style={{ gap: 10 }}>
                {filteredCustomers.slice(0, 5).map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      s.custItem,
                      {
                        backgroundColor: customerId === c.id ? colors.primary + '10' : colors.backgroundElement,
                        borderColor: customerId === c.id ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => setCustomerId(c.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[s.avatar, { backgroundColor: customerId === c.id ? colors.primary : colors.divider }]}>
                      <Text style={[s.avatarTxt, { color: customerId === c.id ? colors.onPrimary : colors.text }]}>
                        {c.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 16, flex: 1 }}>
                      <Text style={[s.custName, { color: colors.text }]}>{c.name}</Text>
                      <Text style={[s.custPhone, { color: colors.textSecondary }]}>{c.phone} · {c.displayCode}</Text>
                    </View>
                    {customerId === c.id && (
                      <View style={[s.checkCircle, { backgroundColor: colors.primary }]}>
                        <Text style={{ color: colors.onPrimary, fontSize: 11, fontWeight: 'bold' }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
                {filteredCustomers.length === 0 && (
                  <View style={{ alignItems: 'center', padding: 24 }}>
                    <Text style={{ fontSize: 40, marginBottom: 8 }}>👥</Text>
                    <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No matching clients found.</Text>
                    <TouchableOpacity
                      style={{ marginTop: 12 }}
                      onPress={() => {
                        router.push('/(tabs)/customers');
                      }}
                    >
                      <Text style={{ color: colors.primary, fontWeight: '700' }}>+ Add New Client</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ─── Step 2: Garment & Measurements ─── */}
          {step === 2 && (
            <View>
              <Text style={[s.stepTitle, { color: colors.text }]}>Order Details</Text>
              <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 20 }}>Client: {selectedCustomer?.name}</Text>

              {/* Garment Selector */}
              <Text style={[s.fieldLabel, { color: colors.text }]}>Garment Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20, marginHorizontal: -20, paddingHorizontal: 20 }}>
                {GARMENT_TYPES.map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      s.garmentChip,
                      {
                        backgroundColor: garmentType === g ? colors.primary : colors.backgroundElement,
                        borderColor: garmentType === g ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => { setGarmentType(g); setMeasurements({}); }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 22, marginBottom: 6 }}>{GARMENT_EMOJIS[g]}</Text>
                    <Text style={[s.garmentChipTxt, { color: garmentType === g ? colors.onPrimary : colors.text }]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Fabric Swatches */}
              <Text style={[s.fieldLabel, { color: colors.text }]}>Fabric Type</Text>
              <View style={s.fabricGrid}>
                {FABRIC_SWATCHES.map(f => {
                  const isSelected = fabric === f.id;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[
                        s.fabricCard,
                        {
                          backgroundColor: isSelected ? colors.primary + '08' : colors.backgroundElement,
                          borderColor: isSelected ? colors.primary : colors.border,
                        }
                      ]}
                      onPress={() => setFabric(f.id)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontSize: 18, marginRight: 6 }}>{f.emoji}</Text>
                        <Text style={[s.fabricName, { color: colors.text }]}>{f.name}</Text>
                      </View>
                      <Text style={[s.fabricDesc, { color: colors.textSecondary }]}>{f.desc}</Text>
                      {isSelected && (
                        <View style={[s.fabricCheck, { backgroundColor: colors.primary }]}>
                          <Text style={{ color: colors.onPrimary, fontSize: 10, fontWeight: 'bold' }}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Quantity & Price */}
              <View style={[s.row, { marginTop: 8 }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[s.fieldLabel, { color: colors.text }]}>Quantity</Text>
                  <View style={[s.qtyRow, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
                    <TouchableOpacity
                      style={s.qtyBtn}
                      onPress={() => setQuantity(q => String(Math.max(1, Number(q) - 1)))}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>−</Text>
                    </TouchableOpacity>
                    <Text style={[s.qtyVal, { color: colors.text }]}>{quantity}</Text>
                    <TouchableOpacity
                      style={s.qtyBtn}
                      onPress={() => setQuantity(q => String(Number(q) + 1))}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[s.fieldLabel, { color: colors.text }]}>Price (₹)</Text>
                  <TextInput
                    style={[
                      s.input,
                      {
                        backgroundColor: colors.backgroundElement,
                        color: colors.text,
                        borderColor: errors.price ? colors.error : (focusedInput === 'price' ? colors.borderFocus : colors.border)
                      }
                    ]}
                    keyboardType="numeric"
                    placeholder="e.g. 800"
                    placeholderTextColor={colors.placeholder}
                    value={price}
                    onChangeText={setPrice}
                    onFocus={() => setFocusedInput('price')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  {errors.price && <Text style={{ color: colors.error, fontSize: 11, marginTop: 4 }}>{errors.price}</Text>}
                </View>
              </View>

              {price && quantity && (
                <View style={[s.totalRow, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
                  <Text style={[s.totalLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                  <Text style={[s.totalVal, { color: colors.text }]}>₹{(Number(price) * Number(quantity)).toLocaleString('en-IN')}</Text>
                </View>
              )}

              {/* Measurements grid */}
              <View style={s.measHeader}>
                <Text style={[s.fieldLabel, { marginTop: 0, color: colors.text }]}>Measurements (inches)</Text>
                <TouchableOpacity onPress={autoFill} style={[s.autoFillBtn, { borderColor: colors.primary }]} activeOpacity={0.7}>
                  <Text style={[s.autoFillTxt, { color: colors.primary }]}>↑ Auto-Fill</Text>
                </TouchableOpacity>
              </View>

              <View style={s.measGrid}>
                {fields.map(field => (
                  <View key={field} style={[s.measCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                    <Text style={[s.measCardLabel, { color: colors.text }]}>{field}</Text>
                    <View style={s.measInputRow}>
                      <TouchableOpacity
                        onPress={() => {
                          const cur = Number(measurements[field] || 0);
                          if (cur > 0) setMeasurements(m => ({ ...m, [field]: String(parseFloat((cur - 0.5).toFixed(1))) }));
                        }}
                        style={[s.measCardBtn, { backgroundColor: colors.background }]}
                        activeOpacity={0.7}
                      >
                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>−</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[s.measCardVal, { color: colors.text }]}
                        keyboardType="decimal-pad"
                        value={measurements[field] || ''}
                        onChangeText={v => setMeasurements(m => ({ ...m, [field]: v }))}
                        placeholder="0.0"
                        placeholderTextColor={colors.placeholder}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          const cur = Number(measurements[field] || 0);
                          setMeasurements(m => ({ ...m, [field]: String(parseFloat((cur + 0.5).toFixed(1))) }));
                        }}
                        style={[s.measCardBtn, { backgroundColor: colors.background }]}
                        activeOpacity={0.7}
                      >
                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ─── Step 3: Delivery & Confirm ─── */}
          {step === 3 && (
            <View>
              <Text style={[s.stepTitle, { color: colors.text }]}>Finalize Order</Text>
              <Text style={[s.stepSub, { color: colors.textSecondary }]}>Set completion date, priority levels and verify client overview details.</Text>

              {/* Order Summary */}
              <View style={[s.summaryCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <Text style={[s.summaryTitle, { color: colors.text }]}>Order Summary</Text>
                <SummaryRow label="Client Name" value={selectedCustomer?.name || ''} colors={colors} />
                <SummaryRow label="Garment & Qty" value={`${GARMENT_EMOJIS[garmentType]} ${garmentType} (x${quantity})`} colors={colors} />
                <SummaryRow label="Fabric selected" value={`${fabric}`} colors={colors} />
                <SummaryRow label="Total Amount" value={`₹${(Number(price) * Number(quantity)).toLocaleString('en-IN')}`} colors={colors} bold />
                <SummaryRow label="Filled Details" value={`${Object.values(measurements).filter(v => v).length} of ${fields.length} measurements`} colors={colors} />
              </View>

              <Text style={[s.fieldLabel, { color: colors.text }]}>Delivery Date *</Text>
              <TextInput
                style={[
                  s.input,
                  {
                    backgroundColor: colors.backgroundElement,
                    color: colors.text,
                    borderColor: errors.deliveryDate ? colors.error : (focusedInput === 'deliveryDate' ? colors.borderFocus : colors.border)
                  }
                ]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.placeholder}
                value={deliveryDate}
                onChangeText={setDeliveryDate}
                onFocus={() => setFocusedInput('deliveryDate')}
                onBlur={() => setFocusedInput(null)}
              />
              {errors.deliveryDate && <Text style={{ color: colors.error, fontSize: 11, marginTop: 4 }}>{errors.deliveryDate}</Text>}

              <Text style={[s.fieldLabel, { color: colors.text }]}>Priority</Text>
              <View style={s.priorityRow}>
                {(['Normal', 'Urgent'] as const).map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      s.priorityBtn,
                      {
                        backgroundColor: priority === p ? (p === 'Urgent' ? colors.error : colors.primary) : colors.backgroundElement,
                        borderColor: priority === p ? (p === 'Urgent' ? colors.error : colors.primary) : colors.border,
                      }
                    ]}
                    onPress={() => setPriority(p)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.priorityTxt, { color: priority === p ? colors.onPrimary : colors.text }]}>
                      {p === 'Urgent' ? '🔥 Urgent' : '✅ Normal'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.fieldLabel, { color: colors.text }]}>Special Instructions</Text>
              <TextInput
                style={[
                  s.input,
                  s.multiline,
                  {
                    backgroundColor: colors.backgroundElement,
                    color: colors.text,
                    borderColor: focusedInput === 'instructions' ? colors.borderFocus : colors.border
                  }
                ]}
                placeholder="e.g. Extra pocket, loose cuffs, specific cuts…"
                placeholderTextColor={colors.placeholder}
                multiline
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                onFocus={() => setFocusedInput('instructions')}
                onBlur={() => setFocusedInput(null)}
              />

              <TouchableOpacity
                style={[s.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                <Text style={[s.submitTxt, { color: colors.onPrimary }]}>✓ Create Order</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Bottom Nav */}
        <View style={[s.bottomNav, { backgroundColor: colors.background, borderTopColor: colors.divider }]}>
          {step > 1 && (
            <TouchableOpacity style={[s.navBtn, s.backBtn, { borderColor: colors.border }]} onPress={() => setStep(s => (s - 1) as any)} activeOpacity={0.7}>
              <Text style={[s.navBtnTxt, { color: colors.text }]}>Back</Text>
            </TouchableOpacity>
          )}
          {step < 3 ? (
            <TouchableOpacity
              style={[s.navBtn, s.nextBtn, { backgroundColor: colors.primary, flex: step > 1 ? 1 : undefined, width: step === 1 ? '100%' : undefined }]}
              onPress={validateAndNext}
              activeOpacity={0.8}
            >
              <Text style={[s.navBtnTxt, { color: colors.onPrimary }]}>Next</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>
    </>
  );
}

function SummaryRow({ label, value, colors, bold }: any) {
  return (
    <View style={s.summaryRow}>
      <Text style={[s.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[s.summaryValue, { color: colors.text, fontWeight: bold ? '700' : '500' }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  stepTitle: { fontSize: 22, fontWeight: 'bold', letterSpacing: -0.5, marginBottom: 4 },
  stepSub: { fontSize: 13, lineHeight: 18, marginBottom: 20 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, padding: 12, borderRadius: 14, borderWidth: 1.5 },
  searchInput: { flex: 1, fontSize: 15 },
  input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, height: 52 },
  multiline: { height: 80, textAlignVertical: 'top', paddingVertical: 14 },
  custItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1.5, position: 'relative' },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 16, fontWeight: 'bold' },
  custName: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  custPhone: { fontSize: 12, marginTop: 2 },
  checkCircle: { position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  garmentChip: { alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1.5, marginRight: 10, minWidth: 90 },
  garmentChipTxt: { fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, borderWidth: 1.5, height: 52, paddingHorizontal: 6 },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  qtyVal: { fontSize: 16, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1.5, marginTop: 16 },
  totalLabel: { fontSize: 13, fontWeight: '600' },
  totalVal: { fontSize: 18, fontWeight: '700' },
  measHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  autoFillBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5 },
  autoFillTxt: { fontSize: 12, fontWeight: '700' },
  measGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  measCard: { width: '48%', borderRadius: 16, borderWidth: 1.5, padding: 12 },
  measCardLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  measInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  measCardBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderStyle: 'solid' },
  measCardVal: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', paddingVertical: 2 },
  fabricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  fabricCard: { width: '48%', borderRadius: 16, borderWidth: 1.5, padding: 14, position: 'relative' },
  fabricName: { fontSize: 14, fontWeight: '700' },
  fabricDesc: { fontSize: 11 },
  fabricCheck: { position: 'absolute', top: 12, right: 12, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  summaryCard: { borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 20 },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 14, letterSpacing: -0.3 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13 },
  priorityRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  priorityBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, alignItems: 'center' },
  priorityTxt: { fontSize: 13, fontWeight: '700' },
  submitBtn: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  submitTxt: { fontSize: 16, fontWeight: '700' },
  bottomNav: { flexDirection: 'row', padding: 16, borderTopWidth: 1, gap: 12 },
  navBtn: { height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', flex: 1 },
  backBtn: { borderWidth: 1.5 },
  nextBtn: {},
  navBtnTxt: { fontSize: 15, fontWeight: '700' },
});
