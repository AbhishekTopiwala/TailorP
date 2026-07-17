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
  // Seed sample data
  seedSampleData: () => void;
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

  const seedSampleData = useCallback(() => {
    const now = Date.now();
    const c1Id = `c_${now}_1`;
    const c2Id = `c_${now}_2`;
    const c3Id = `c_${now}_3`;
    const c4Id = `c_${now}_4`;
    const c5Id = `c_${now}_5`;

    const nextCNum = customers.length > 0
      ? Math.max(...customers.map(item => {
          const num = parseInt(item.displayCode.replace('C-', ''), 10);
          return isNaN(num) ? 0 : num;
        })) + 1
      : 1;

    const newCustomers: Customer[] = [
      {
        id: c1Id,
        displayCode: `C-${String(nextCNum).padStart(4, '0')}`,
        name: 'Aarav Mehta',
        phone: '9876543210',
        altPhone: '9876543211',
        address: '102, Shanti Sadan, Navsari, Gujarat',
        gender: 'Male',
        notes: 'Prefers tight fits, likes linen shirts.',
        createdDate: new Date().toISOString().slice(0, 10),
        isActive: true,
      },
      {
        id: c2Id,
        displayCode: `C-${String(nextCNum + 1).padStart(4, '0')}`,
        name: 'Priya Patel',
        phone: '9922334455',
        address: '405, Shivam Heights, Surat, Gujarat',
        gender: 'Female',
        notes: 'Wedding outfit. Double check embroidery.',
        createdDate: new Date().toISOString().slice(0, 10),
        isActive: true,
      },
      {
        id: c3Id,
        displayCode: `C-${String(nextCNum + 2).padStart(4, '0')}`,
        name: 'Rajesh Sharma',
        phone: '9898989898',
        address: 'Mota Bazar, Navsari',
        gender: 'Male',
        notes: 'Needs trial before final stitching.',
        createdDate: new Date().toISOString().slice(0, 10),
        isActive: true,
      },
      {
        id: c4Id,
        displayCode: `C-${String(nextCNum + 3).padStart(4, '0')}`,
        name: 'Anjali Desai',
        phone: '9090909090',
        address: 'Lunsikui, Navsari',
        gender: 'Female',
        notes: 'Wants elbow-length sleeves.',
        createdDate: new Date().toISOString().slice(0, 10),
        isActive: true,
      },
      {
        id: c5Id,
        displayCode: `C-${String(nextCNum + 4).padStart(4, '0')}`,
        name: 'Kabir Shah',
        phone: '9112233445',
        address: 'Grid Road, Navsari',
        gender: 'Male',
        notes: 'Kid wear order. Comfort focus.',
        createdDate: new Date().toISOString().slice(0, 10),
        isActive: true,
      }
    ];

    const nextONum = orders.length > 0
      ? Math.max(...orders.map(item => {
          const parts = item.orderNumber.split('-');
          const num = parts.length > 2 ? parseInt(parts[2], 10) : 0;
          return isNaN(num) ? 0 : num;
        })) + 1
      : 1;

    const year = new Date().getFullYear();
    const todayStr = new Date().toISOString().slice(0, 10);
    const getFutureDate = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    };

    const newOrders: Order[] = [
      {
        id: `o_${now}_1`,
        orderNumber: `ORD-${year}-${String(nextONum).padStart(4, '0')}`,
        customerId: c1Id,
        orderDate: todayStr,
        deliveryDate: getFutureDate(7),
        status: 'Stitching',
        priority: 'Normal',
        items: [
          {
            id: `oi_${now}_1_1`,
            garmentType: 'Shirt',
            quantity: 1,
            price: 800,
            measurements: { 'Length': '28.5', 'Chest': '40', 'Shoulder': '18', 'Sleeve': '24' }
          },
          {
            id: `oi_${now}_1_2`,
            garmentType: 'Pant',
            quantity: 1,
            price: 1000,
            measurements: { 'Length': '40', 'Waist': '32', 'Hip': '38', 'Inseam': '30' }
          }
        ],
        fabricDetails: 'Brought 4 meters linen fabric',
        specialInstructions: 'Contrast buttons on shirt',
        totalAmount: 1800,
        advancePaid: 500,
        payments: [
          {
            id: `pay_${now}_1`,
            orderId: `o_${now}_1`,
            amount: 500,
            date: todayStr,
            mode: 'UPI',
            note: 'Advance payment'
          }
        ]
      },
      {
        id: `o_${now}_2`,
        orderNumber: `ORD-${year}-${String(nextONum + 1).padStart(4, '0')}`,
        customerId: c2Id,
        orderDate: todayStr,
        deliveryDate: getFutureDate(15),
        status: 'Cutting',
        priority: 'Urgent',
        items: [
          {
            id: `oi_${now}_2_1`,
            garmentType: 'Lehenga',
            quantity: 1,
            price: 7500,
            measurements: { 'Waist': '28', 'Length': '42', 'Blouse Bust': '34', 'Blouse Length': '14' }
          }
        ],
        fabricDetails: 'Red silk and net fabric provided',
        specialInstructions: 'Heavy latkans on lehenga strings',
        totalAmount: 7500,
        advancePaid: 3000,
        payments: [
          {
            id: `pay_${now}_2`,
            orderId: `o_${now}_2`,
            amount: 3000,
            date: todayStr,
            mode: 'Cash',
            note: 'Advance payment'
          }
        ]
      },
      {
        id: `o_${now}_3`,
        orderNumber: `ORD-${year}-${String(nextONum + 2).padStart(4, '0')}`,
        customerId: c3Id,
        orderDate: todayStr,
        deliveryDate: getFutureDate(5),
        status: 'Ready',
        priority: 'Normal',
        items: [
          {
            id: `oi_${now}_3_1`,
            garmentType: 'Kurta',
            quantity: 1,
            price: 2200,
            measurements: { 'Length': '42', 'Chest': '38', 'Sleeve': '25', 'Neck': '15.5' }
          }
        ],
        fabricDetails: 'Boutique cotton fabric',
        specialInstructions: 'Mandarin collar with subtle embroidery',
        totalAmount: 2200,
        advancePaid: 2200,
        payments: [
          {
            id: `pay_${now}_3`,
            orderId: `o_${now}_3`,
            amount: 2200,
            date: todayStr,
            mode: 'Card',
            note: 'Full payment upfront'
          }
        ]
      },
      {
        id: `o_${now}_4`,
        orderNumber: `ORD-${year}-${String(nextONum + 3).padStart(4, '0')}`,
        customerId: c4Id,
        orderDate: todayStr,
        deliveryDate: getFutureDate(10),
        status: 'Measurement Taken',
        priority: 'Normal',
        items: [
          {
            id: `oi_${now}_4_1`,
            garmentType: 'Blouse',
            quantity: 1,
            price: 1200,
            measurements: { 'Bust': '36', 'Waist': '30', 'Shoulder': '14.5', 'Front Neck': '7.5', 'Back Neck': '9' }
          }
        ],
        fabricDetails: 'Golden brocade fabric',
        specialInstructions: 'Padded blouse, dori at back',
        totalAmount: 1200,
        advancePaid: 0,
        payments: []
      },
      {
        id: `o_${now}_5`,
        orderNumber: `ORD-${year}-${String(nextONum + 4).padStart(4, '0')}`,
        customerId: c5Id,
        orderDate: todayStr,
        deliveryDate: getFutureDate(8),
        status: 'Final Stitch',
        priority: 'Normal',
        items: [
          {
            id: `oi_${now}_5_1`,
            garmentType: 'Kids Wear',
            quantity: 1,
            price: 1500,
            measurements: { 'Length': '22', 'Chest': '24', 'Sleeve': '14', 'Pant Length': '24' }
          }
        ],
        fabricDetails: 'Soft cotton lining, blue velvet exterior',
        specialInstructions: 'Ensure soft margins so it does not itch',
        totalAmount: 1500,
        advancePaid: 1000,
        payments: [
          {
            id: `pay_${now}_5`,
            orderId: `o_${now}_5`,
            amount: 1000,
            date: todayStr,
            mode: 'UPI',
            note: 'Advance payment'
          }
        ]
      }
    ];

    const newAppointments: Appointment[] = [
      {
        id: `app_${now}_1`,
        customerId: c1Id,
        customerName: 'Aarav Mehta',
        date: getFutureDate(3),
        timeSlot: '11:00 AM',
        notes: 'Fit check for linen shirt',
        status: 'Confirmed'
      },
      {
        id: `app_${now}_2`,
        customerId: c2Id,
        customerName: 'Priya Patel',
        date: getFutureDate(10),
        timeSlot: '04:00 PM',
        notes: 'Bridal Lehenga fitting trial',
        status: 'Pending'
      }
    ];

    setCustomers(prev => [...newCustomers, ...prev]);
    setOrders(prev => [...newOrders, ...prev]);
    setAppointments(prev => [...newAppointments, ...prev]);
  }, [customers, orders]);

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
      seedSampleData,
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
