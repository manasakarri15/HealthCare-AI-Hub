import { Appointment, CartItem, DiabetesAssessmentResult, NotificationItem, Order, UserProfile, VitalLog } from '../types';
import { INITIAL_APPOINTMENTS, INITIAL_ASSESSMENTS, INITIAL_NOTIFICATIONS, INITIAL_ORDERS, INITIAL_USER, INITIAL_VITALS } from '../data/mockData';

const KEYS = {
  USER: 'hc_hub_user',
  CART: 'hc_hub_cart',
  APPOINTMENTS: 'hc_hub_appointments',
  ASSESSMENTS: 'hc_hub_assessments',
  ORDERS: 'hc_hub_orders',
  NOTIFICATIONS: 'hc_hub_notifications',
  VITALS: 'hc_hub_health_metrics',
};

export const storage = {
  getUser: (): UserProfile => {
    try {
      const data = localStorage.getItem(KEYS.USER);
      return data ? JSON.parse(data) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  },
  setUser: (user: UserProfile) => {
    try {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch {}
  },

  getCart: (): CartItem[] => {
    try {
      const data = localStorage.getItem(KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  setCart: (cart: CartItem[]) => {
    try {
      localStorage.setItem(KEYS.CART, JSON.stringify(cart));
    } catch {}
  },

  getAppointments: (): Appointment[] => {
    try {
      const data = localStorage.getItem(KEYS.APPOINTMENTS);
      return data ? JSON.parse(data) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  },
  setAppointments: (appointments: Appointment[]) => {
    try {
      localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch {}
  },

  getAssessments: (): DiabetesAssessmentResult[] => {
    try {
      const data = localStorage.getItem(KEYS.ASSESSMENTS);
      return data ? JSON.parse(data) : INITIAL_ASSESSMENTS;
    } catch {
      return INITIAL_ASSESSMENTS;
    }
  },
  setAssessments: (assessments: DiabetesAssessmentResult[]) => {
    try {
      localStorage.setItem(KEYS.ASSESSMENTS, JSON.stringify(assessments));
    } catch {}
  },

  getOrders: (): Order[] => {
    try {
      const data = localStorage.getItem(KEYS.ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  },
  setOrders: (orders: Order[]) => {
    try {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    } catch {}
  },

  getNotifications: (): NotificationItem[] => {
    try {
      const data = localStorage.getItem(KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },
  setNotifications: (notifications: NotificationItem[]) => {
    try {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {}
  },

  getVitals: (): VitalLog[] => {
    try {
      const data = localStorage.getItem(KEYS.VITALS);
      return data ? JSON.parse(data) : INITIAL_VITALS;
    } catch {
      return INITIAL_VITALS;
    }
  },
  setVitals: (vitals: VitalLog[]) => {
    try {
      localStorage.setItem(KEYS.VITALS, JSON.stringify(vitals));
    } catch {}
  },
};
