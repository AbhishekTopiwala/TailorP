import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, useColorScheme, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/store/AppStore';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { userSession, logout, updateUserSession, customers, orders } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userSession.name);
  const [shopName, setShopName] = useState(userSession.shopName || '');
  const [focusedInput, setFocusedInput] = useState<'name' | 'shop' | null>(null);

  function handleSave() {
    updateUserSession({ name, shopName: userSession.role === 'tailor' ? shopName : undefined });
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully.');
  }

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed').length;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={s.container}>
      {/* Header Profile Section */}
      <View style={[s.profileCard, { backgroundColor: colors.backgroundElement }]}>
        <View style={s.avatarWrapper}>
          <Image
            source={{ uri: userSession.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120' }}
            style={s.avatar}
          />
        </View>
        <Text style={[s.nameText, { color: colors.text }]}>{userSession.name}</Text>
        <Text style={[s.roleText, { color: colors.textSecondary }]}>
          {userSession.role === 'tailor' ? `Tailor • ${userSession.shopName || 'Boutique owner'}` : 'Customer Account'}
        </Text>
      </View>

      {/* Stats Counter Section */}
      <View style={s.statsContainer}>
        <View style={[s.statBox, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[s.statNumber, { color: colors.text }]}>{customers.length}</Text>
          <Text style={[s.statLabel, { color: colors.textSecondary }]}>Customers</Text>
        </View>
        <View style={[s.statBox, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[s.statNumber, { color: colors.text }]}>{activeOrdersCount}</Text>
          <Text style={[s.statLabel, { color: colors.textSecondary }]}>Active Orders</Text>
        </View>
      </View>

      {/* Settings Options */}
      <View style={s.sectionHeader}>
        <Text style={[s.sectionTitle, { color: colors.text }]}>Account Information</Text>
      </View>

      {isEditing ? (
        <View style={[s.editForm, { backgroundColor: colors.backgroundElement }]}>
          <View style={s.inputWrapper}>
            <Text style={[s.inputLabel, { color: colors.text }]}>DISPLAY NAME</Text>
            <TextInput
              style={[
                s.textInput,
                {
                  borderColor: focusedInput === 'name' ? colors.borderFocus : colors.border,
                  backgroundColor: colors.background,
                  color: colors.text,
                },
              ]}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {userSession.role === 'tailor' && (
            <View style={s.inputWrapper}>
              <Text style={[s.inputLabel, { color: colors.text }]}>BOUTIQUE / SHOP NAME</Text>
              <TextInput
                style={[
                  s.textInput,
                  {
                    borderColor: focusedInput === 'shop' ? colors.borderFocus : colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                  },
                ]}
                value={shopName}
                onChangeText={setShopName}
                onFocus={() => setFocusedInput('shop')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          )}

          <View style={s.btnRow}>
            <TouchableOpacity
              style={[s.halfBtn, s.cancelBtn, { borderColor: colors.border }]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={[s.cancelBtnTxt, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.halfBtn, s.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={[s.saveBtnTxt, { color: colors.onPrimary }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[s.detailsCard, { backgroundColor: colors.backgroundElement }]}>
          <View style={s.detailRow}>
            <Text style={[s.detailLabel, { color: colors.textSecondary }]}>Full Name</Text>
            <Text style={[s.detailValue, { color: colors.text }]}>{userSession.name}</Text>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={s.detailRow}>
            <Text style={[s.detailLabel, { color: colors.textSecondary }]}>Phone Number</Text>
            <Text style={[s.detailValue, { color: colors.text }]}>{userSession.phone}</Text>
          </View>
          {userSession.role === 'tailor' && (
            <>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <View style={s.detailRow}>
                <Text style={[s.detailLabel, { color: colors.textSecondary }]}>Shop Name</Text>
                <Text style={[s.detailValue, { color: colors.text }]}>{userSession.shopName}</Text>
              </View>
            </>
          )}
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={s.detailRow}>
            <Text style={[s.detailLabel, { color: colors.textSecondary }]}>App State</Text>
            <Text style={[s.detailValue, { color: colors.success, fontWeight: '700' }]}>● Offline Synchronized</Text>
          </View>

          <TouchableOpacity
            style={[s.editBtn, { borderColor: colors.primary }]}
            onPress={() => setIsEditing(true)}
            activeOpacity={0.7}
          >
            <Text style={[s.editBtnTxt, { color: colors.primary }]}>Edit Profile Details</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logout CTA */}
      <TouchableOpacity
        style={[s.logoutBtn, { backgroundColor: colors.error }]}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Text style={s.logoutBtnTxt}>Sign Out / Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  roleText: {
    fontSize: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  editBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  editBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  editForm: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  halfBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelBtn: {
    borderWidth: 1.5,
  },
  cancelBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  saveBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutBtnTxt: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
