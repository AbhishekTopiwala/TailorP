import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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

// ─── Seed Data ────────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

const SEED_CUSTOMERS: Customer[] = [
  { id: 'c1', displayCode: 'C-0001', name: 'Ramesh Sharma', phone: '9876543210', address: '12 MG Road, Jaipur', gender: 'Male', createdDate: yesterday, isActive: true },
  { id: 'c2', displayCode: 'C-0002', name: 'Priya Patel', phone: '9123456789', address: '5 Lal Bagh, Bhopal', gender: 'Female', createdDate: yesterday, isActive: true },
  { id: 'c3', displayCode: 'C-0003', name: 'Suresh Kumar', phone: '9988776655', address: '78 Station Road, Indore', gender: 'Male', createdDate: today, isActive: true },
];

const SEED_ORDERS: Order[] = [
  {
    id: 'o1', orderNumber: 'ORD-2026-0001', customerId: 'c1',
    orderDate: yesterday, deliveryDate: today, status: 'Ready', priority: 'Normal',
    items: [{ id: 'oi1', garmentType: 'Shirt', quantity: 2, price: 600, measurements: { Length: '28', Chest: '40', Shoulder: '17' } }],
    totalAmount: 1200, advancePaid: 500,
    payments: [{ id: 'p1', orderId: 'o1', amount: 500, date: yesterday, mode: 'Cash' }],
  },
  {
    id: 'o2', orderNumber: 'ORD-2026-0002', customerId: 'c2',
    orderDate: yesterday, deliveryDate: tomorrow, status: 'Stitching', priority: 'Urgent',
    items: [{ id: 'oi2', garmentType: 'Blouse', quantity: 1, price: 800, measurements: { Bust: '36', Length: '14' } }],
    totalAmount: 800, advancePaid: 400,
    payments: [{ id: 'p2', orderId: 'o2', amount: 400, date: yesterday, mode: 'UPI' }],
  },
  {
    id: 'o3', orderNumber: 'ORD-2026-0003', customerId: 'c3',
    orderDate: today, deliveryDate: nextWeek, status: 'Measurement Taken', priority: 'Normal',
    items: [{ id: 'oi3', garmentType: 'Pant', quantity: 1, price: 500, measurements: { Waist: '34', Hip: '40' } }],
    totalAmount: 500, advancePaid: 0,
    payments: [],
  },
  {
    id: 'o4', orderNumber: 'ORD-2026-0004', customerId: 'c1',
    orderDate: yesterday, deliveryDate: yesterday, status: 'Delivered', priority: 'Normal',
    items: [{ id: 'oi4', garmentType: 'Kurta', quantity: 1, price: 700, measurements: { Length: '42', Chest: '42' } }],
    totalAmount: 700, advancePaid: 700,
    payments: [{ id: 'p4', orderId: 'o4', amount: 700, date: yesterday, mode: 'Cash' }],
  },
];

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
}

const AppContext = createContext<AppContextType | null>(null);

let customerCounter = SEED_CUSTOMERS.length;
let orderCounter = SEED_ORDERS.length;
let paymentCounter = 10;

export function AppProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);

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

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 'ap1', customerId: 'c1', customerName: 'Ramesh Sharma', date: today, timeSlot: '11:00 AM', status: 'Confirmed', notes: 'Fitting session' },
    { id: 'ap2', customerId: 'c2', customerName: 'Priya Patel', date: today, timeSlot: '03:00 PM', status: 'Pending', notes: 'Take Blouse measurements' },
    { id: 'ap3', customerId: 'c3', customerName: 'Suresh Kumar', date: tomorrow, timeSlot: '10:00 AM', status: 'Confirmed', notes: 'Pant trial check' },
  ]);

  const addCustomer = useCallback((c: Omit<Customer, 'id' | 'displayCode' | 'createdDate' | 'isActive'>) => {
    customerCounter++;
    const newCustomer: Customer = {
      ...c, id: `c${Date.now()}`,
      displayCode: `C-${String(customerCounter).padStart(4, '0')}`,
      createdDate: new Date().toISOString().slice(0, 10),
      isActive: true,
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, isActive: false } : c));
  }, []);

  const addOrder = useCallback((o: Omit<Order, 'id' | 'orderNumber' | 'payments'>) => {
    orderCounter++;
    const year = new Date().getFullYear();
    const newOrder: Order = {
      ...o, id: `o${Date.now()}`,
      orderNumber: `ORD-${year}-${String(orderCounter).padStart(4, '0')}`,
      payments: [],
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, []);

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
    paymentCounter++;
    const payment: Payment = { ...p, id: `pay${paymentCounter}`, orderId };
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

  return (
    <AppContext.Provider value={{
      customers, orders,
      addCustomer, updateCustomer, deleteCustomer,
      addOrder, updateOrder, updateOrderStatus, deleteOrder,
      addPayment, getCustomerOrders,
      userSession, login, logout, completeOnboarding, updateUserSession,
      appointments, addAppointment, cancelAppointment,
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
