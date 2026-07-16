import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, useColorScheme, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/store/AppStore';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { userSession, logout, updateUserSession, customers, orders } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userSession.name);
  const [shopName, setShopName] = useState(userSession.shopName || '');
  const [focusedInput, setFocusedInput] = useState<'name' | 'shop' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedShop = shopName.trim();

    if (!trimmedName) {
      errs.name = 'Name is required';
    } else if (trimmedName.length < 3) {
      errs.name = 'Name must be at least 3 characters';
    } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      errs.name = 'Name can only contain letters and spaces';
    }

    if (userSession.role === 'tailor') {
      if (!trimmedShop) {
        errs.shopName = 'Shop name is required';
      } else if (trimmedShop.length < 3) {
        errs.shopName = 'Shop name must be at least 3 characters';
      } else if (!/^[A-Za-z0-9\s&'\-\.]+$/.test(trimmedShop)) {
        errs.shopName = "Shop name can only contain letters, numbers, spaces, and & ' - .";
      }
    }

    return errs;
  }

  function handleFieldChange(field: 'name' | 'shopName', value: string) {
    if (field === 'name') setName(value);
    else setShopName(value);

    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    updateUserSession({ name: name.trim(), shopName: userSession.role === 'tailor' ? shopName.trim() : undefined });
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully.');
  }

  function startEditing() {
    setName(userSession.name);
    setShopName(userSession.shopName || '');
    setErrors({});
    setIsEditing(true);
  }

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed').length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Profile',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' }
        }}
      />
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
        {/* Header Profile Section */}
        <View style={[s.profileCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <View style={s.avatarWrapper}>
            <Image
              source={{ uri: userSession.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120' }}
              style={s.avatar}
            />
          </View>
          <Text style={[s.nameText, { color: colors.text }]}>{userSession.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <MaterialIcons name="storefront" size={14} color={colors.textSecondary} />
            <Text style={[s.roleText, { color: colors.textSecondary }]}>
              {userSession.role === 'tailor' ? `Tailor · ${userSession.shopName || 'Boutique Owner'}` : 'Customer Account'}
            </Text>
          </View>
        </View>

        {/* Stats Counter Section */}
        <View style={s.statsContainer}>
          <View style={[s.statBox, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <MaterialIcons name="people-outline" size={20} color={colors.primary} style={{ marginBottom: 4 }} />
            <Text style={[s.statNumber, { color: colors.text }]}>{customers.length}</Text>
            <Text style={[s.statLabel, { color: colors.textSecondary }]}>Customers</Text>
          </View>
          <View style={[s.statBox, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <MaterialIcons name="shopping-bag" size={20} color={colors.primary} style={{ marginBottom: 4 }} />
            <Text style={[s.statNumber, { color: colors.text }]}>{activeOrdersCount}</Text>
            <Text style={[s.statLabel, { color: colors.textSecondary }]}>Active Orders</Text>
          </View>
        </View>

        {/* Settings Options */}
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>Account Details</Text>
        </View>

        {isEditing ? (
          <View style={[s.editForm, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <View style={s.inputWrapper}>
              <Text style={[s.inputLabel, { color: colors.text }]}>Display Name</Text>
              <TextInput
                style={[
                  s.textInput,
                  {
                    borderColor: errors.name ? colors.error : (focusedInput === 'name' ? colors.borderFocus : colors.border),
                    backgroundColor: colors.background,
                    color: colors.text,
                  },
                ]}
                value={name}
                onChangeText={(v) => handleFieldChange('name', v)}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
              />
              {errors.name && (
                <Text style={[s.errorText, { color: colors.error }]}>{errors.name}</Text>
              )}
            </View>

            {userSession.role === 'tailor' && (
              <View style={s.inputWrapper}>
                <Text style={[s.inputLabel, { color: colors.text }]}>Boutique / Shop Name</Text>
                <TextInput
                  style={[
                    s.textInput,
                    {
                      borderColor: errors.shopName ? colors.error : (focusedInput === 'shop' ? colors.borderFocus : colors.border),
                      backgroundColor: colors.background,
                      color: colors.text,
                    },
                  ]}
                  value={shopName}
                  onChangeText={(v) => handleFieldChange('shopName', v)}
                  onFocus={() => setFocusedInput('shop')}
                  onBlur={() => setFocusedInput(null)}
                />
                {errors.shopName && (
                  <Text style={[s.errorText, { color: colors.error }]}>{errors.shopName}</Text>
                )}
              </View>
            )}

            <View style={s.btnRow}>
              <TouchableOpacity
                style={[s.halfBtn, s.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setIsEditing(false)}
                activeOpacity={0.7}
              >
                <Text style={[s.cancelBtnTxt, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.halfBtn, s.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={[s.saveBtnTxt, { color: colors.onPrimary }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[s.detailsCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <View style={s.detailRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="person-outline" size={18} color={colors.textSecondary} />
                <Text style={[s.detailLabel, { color: colors.textSecondary }]}>Full Name</Text>
              </View>
              <Text style={[s.detailValue, { color: colors.text }]}>{userSession.name}</Text>
            </View>
            <View style={[s.divider, { backgroundColor: colors.divider }]} />
            
            <View style={s.detailRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="phone" size={18} color={colors.textSecondary} />
                <Text style={[s.detailLabel, { color: colors.textSecondary }]}>Phone Number</Text>
              </View>
              <Text style={[s.detailValue, { color: colors.text }]}>{userSession.phone}</Text>
            </View>
            
            {userSession.role === 'tailor' && (
              <>
                <View style={[s.divider, { backgroundColor: colors.divider }]} />
                <View style={s.detailRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialIcons name="storefront" size={18} color={colors.textSecondary} />
                    <Text style={[s.detailLabel, { color: colors.textSecondary }]}>Shop Name</Text>
                  </View>
                  <Text style={[s.detailValue, { color: colors.text }]}>{userSession.shopName}</Text>
                </View>
              </>
            )}
            
            <View style={[s.divider, { backgroundColor: colors.divider }]} />
            <View style={s.detailRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="sync" size={18} color={colors.textSecondary} />
                <Text style={[s.detailLabel, { color: colors.textSecondary }]}>App Sync State</Text>
              </View>
              <Text style={[s.detailValue, { color: colors.success }]}>Online Sync</Text>
            </View>

            <TouchableOpacity
              style={[s.editBtn, { borderColor: colors.primary }]}
              onPress={startEditing}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialIcons name="edit" size={16} color={colors.primary} />
                <Text style={[s.editBtnTxt, { color: colors.primary }]}>Edit Profile Details</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout CTA */}
        <TouchableOpacity
          style={[s.logoutBtn, { backgroundColor: colors.error }]}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialIcons name="logout" size={18} color="#FFFFFF" />
            <Text style={s.logoutBtnTxt}>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  detailsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  editBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  editBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  editForm: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  textInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  halfBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  cancelBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  logoutBtnTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
});
