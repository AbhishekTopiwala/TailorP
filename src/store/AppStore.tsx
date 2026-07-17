import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Credit';
export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid';
export type OrderStatus =
  | 'Measurement Taken'
  | 'Fabric Received'
  | 'Cutting'
  | 'Stitching'
  | 'Trial'
  | 'Final Stitch'
  | 'Ready'
  | 'Delivered'
  | 'Completed';

export type GarmentType =
  | 'Shirt' | 'Pant' | 'Kurta' | 'Blazer' | 'Sherwani'
  | 'Blouse' | 'Lehenga' | 'Kids Wear' | 'Custom';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  note?: string;
}

export interface OrderItem {
  id: string;
  garmentType: GarmentType;
  quantity: number;
  price: number;
  measurements: Record<string, string>;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  orderDate: string;
  deliveryDate: string;
  trialDate?: string;
  status: OrderStatus;
  priority: 'Normal' | 'Urgent';
  items: OrderItem[];
  fabricDetails?: string;
  specialInstructions?: string;
  totalAmount: number;
  advancePaid: number;
  payments: Payment[];
}

export interface Customer {
  id: string;
  displayCode: string;
  name: string;
  phone: string;
  altPhone?: string;
  address?: string;
  gender?: 'Male' | 'Female' | 'Other';
  notes?: string;
  createdDate: string;
  isActive: boolean;
}

export interface UserSession {
  isLoggedIn: boolean;
  isOnboarded: boolean;
  role: 'tailor' | 'client';
  name: string;
  phone: string;
  avatar?: string;
  shopName?: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface CustomAlertButton {
  text: string;
  style?: 'cancel' | 'destructive' | 'default';
  onPress?: () => void;
}

export interface CustomAlertConfig {
  title: string;
  message?: string;
  buttons?: CustomAlertButton[];
}

// ─── Computed Helpers ─────────────────────────────────────────────────────────

export function getTotalPaid(order: Order): number {
  return order.payments.reduce((sum, p) => sum + p.amount, 0);
}

export function getBalance(order: Order): number {
  return order.totalAmount - getTotalPaid(order);
}

export function getPaymentStatus(order: Order): PaymentStatus {
  const paid = getTotalPaid(order);
  if (paid <= 0) return 'Unpaid';
  if (paid >= order.totalAmount) return 'Paid';
  return 'Partial';
}

export function isOverdue(order: Order): boolean {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(order.deliveryDate); due.setHours(0, 0, 0, 0);
  return due < today && order.status !== 'Delivered' && order.status !== 'Completed';
}

export function isDueToday(order: Order): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return order.deliveryDate === today;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextType {
  customers: Customer[];
  orders: Order[];
  addCustomer: (c: Omit<Customer, 'id' | 'displayCode' | 'createdDate' | 'isActive'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addOrder: (o: Omit<Order, 'id' | 'orderNumber' | 'payments'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  addPayment: (orderId: string, p: Omit<Payment, 'id' | 'orderId'>) => void;
  getCustomerOrders: (customerId: string) => Order[];
  // Authentication & Session
  userSession: UserSession;
  login: (name: string, phone: string, role: 'tailor' | 'client', avatar?: string, shopName?: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
  updateUserSession: (updates: Partial<UserSession>) => void;
  // Appointments
  appointments: Appointment[];
  addAppointment: (app: Omit<Appointment, 'id' | 'status'>) => Appointment;
  cancelAppointment: (id: string) => void;
  deleteAppointment: (id: string) => void;
  // Storage & Permissions
  loading: boolean;
  storagePermissionGranted: boolean | null;
  requestStoragePermission: () => Promise<boolean>;
  // Custom Alert Pop-ups
  alertConfig: CustomAlertConfig | null;
  showAlert: (title: string, message?: string, buttons?: CustomAlertButton[]) => void;
  hideAlert: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [storagePermissionGranted, setStoragePermissionGranted] = useState<boolean | null>(null);

  const [alertConfig, setAlertConfig] = useState<CustomAlertConfig | null>(null);

  const showAlert = useCallback((title: string, message?: string, buttons?: CustomAlertButton[]) => {
    setAlertConfig({ title, message, buttons });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(null);
  }, []);

  // Default Session (initialized as logged out & not onboarded for demo)
  const [userSession, setUserSession] = useState<UserSession>({
    isLoggedIn: false,
    isOnboarded: false,
    role: 'tailor',
    name: '',
    phone: '',
    avatar: undefined,
    shopName: '',
  });

  // Load initial data from AsyncStorage
  useEffect(() => {
    async function loadData() {
      try {
        const storedCustomers = await AsyncStorage.getItem('tailorp_customers');
        const storedOrders = await AsyncStorage.getItem('tailorp_orders');
        const storedSession = await AsyncStorage.getItem('tailorp_user_session');
        const storedAppointments = await AsyncStorage.getItem('tailorp_appointments');
        const storedPermission = await AsyncStorage.getItem('tailorp_storage_permission');

        if (storedCustomers) {
          setCustomers(JSON.parse(storedCustomers));
        }
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
        if (storedSession) {
          setUserSession(JSON.parse(storedSession));
        }
        if (storedAppointments) {
          setAppointments(JSON.parse(storedAppointments));
        }
        if (storedPermission) {
          setStoragePermissionGranted(JSON.parse(storedPermission));
        }
      } catch (e) {
        console.error('Failed to load data from storage', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Save data to AsyncStorage when states change (only after loading is complete)
  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem('tailorp_customers', JSON.stringify(customers)).catch(err => console.error(err));
  }, [customers, loading]);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem('tailorp_orders', JSON.stringify(orders)).catch(err => console.error(err));
  }, [orders, loading]);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem('tailorp_user_session', JSON.stringify(userSession)).catch(err => console.error(err));
  }, [userSession, loading]);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem('tailorp_appointments', JSON.stringify(appointments)).catch(err => console.error(err));
  }, [appointments, loading]);

  const requestStoragePermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'TailorP requires storage access to persist your boutique data on this device.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setStoragePermissionGranted(isGranted);
        await AsyncStorage.setItem('tailorp_storage_permission', JSON.stringify(isGranted));
        return isGranted;
      } catch (err) {
        console.warn(err);
        setStoragePermissionGranted(false);
        await AsyncStorage.setItem('tailorp_storage_permission', JSON.stringify(false));
        return false;
      }
    } else {
      // iOS / Web: standard browser / device sandbox storage permissions are implicit.
      // We will save true to indicate it is granted/consented.
      setStoragePermissionGranted(true);
      await AsyncStorage.setItem('tailorp_storage_permission', JSON.stringify(true));
      return true;
    }
  }, []);

  const addCustomer = useCallback((c: Omit<Customer, 'id' | 'displayCode' | 'createdDate' | 'isActive'>) => {
    const nextNum = customers.length > 0
      ? Math.max(...customers.map(item => {
          const num = parseInt(item.displayCode.replace('C-', ''), 10);
          return isNaN(num) ? 0 : num;
        })) + 1
      : 1;

    const newCustomer: Customer = {
      ...c,
      id: `c${Date.now()}`,
      displayCode: `C-${String(nextNum).padStart(4, '0')}`,
      createdDate: new Date().toISOString().slice(0, 10),
      isActive: true,
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  }, [customers]);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, isActive: false } : c));
  }, []);

  const addOrder = useCallback((o: Omit<Order, 'id' | 'orderNumber' | 'payments'>) => {
    const nextNum = orders.length > 0
      ? Math.max(...orders.map(item => {
          const parts = item.orderNumber.split('-');
          const num = parts.length > 2 ? parseInt(parts[2], 10) : 0;
          return isNaN(num) ? 0 : num;
        })) + 1
      : 1;

    const year = new Date().getFullYear();
    const newOrder: Order = {
      ...o,
      id: `o${Date.now()}`,
      orderNumber: `ORD-${year}-${String(nextNum).padStart(4, '0')}`,
      payments: [],
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, [orders]);

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const addPayment = useCallback((orderId: string, p: Omit<Payment, 'id' | 'orderId'>) => {
    const paymentId = `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payment: Payment = { ...p, id: paymentId, orderId };
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payments: [...o.payments, payment] } : o));
  }, []);

  const getCustomerOrders = useCallback((customerId: string) => {
    return orders.filter(o => o.customerId === customerId);
  }, [orders]);

  const login = useCallback((name: string, phone: string, role: 'tailor' | 'client', avatar?: string, shopName?: string) => {
    setUserSession({
      isLoggedIn: true,
      isOnboarded: true,
      role,
      name,
      phone,
      avatar,
      shopName: role === 'tailor' ? (shopName || 'Tailor Shop') : undefined,
    });
  }, []);

  const logout = useCallback(() => {
    setUserSession(prev => ({
      ...prev,
      isLoggedIn: false,
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setUserSession(prev => ({
      ...prev,
      isOnboarded: true,
    }));
  }, []);

  const updateUserSession = useCallback((updates: Partial<UserSession>) => {
    setUserSession(prev => ({ ...prev, ...updates }));
  }, []);

  const addAppointment = useCallback((app: Omit<Appointment, 'id' | 'status'>) => {
    const newApp: Appointment = {
      ...app,
      id: `ap-${Date.now()}`,
      status: 'Confirmed',
    };
    setAppointments(prev => [newApp, ...prev]);
    return newApp;
  }, []);

  const cancelAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      customers, orders,
      addCustomer, updateCustomer, deleteCustomer,
      addOrder, updateOrder, updateOrderStatus, deleteOrder,
      addPayment, getCustomerOrders,
      userSession, login, logout, completeOnboarding, updateUserSession,
      appointments, addAppointment, cancelAppointment, deleteAppointment,
      loading, storagePermissionGranted, requestStoragePermission,
      alertConfig, showAlert, hideAlert,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
