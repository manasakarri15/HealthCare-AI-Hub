export type HealthCategoryId =
  | 'diabetes'
  | 'heart'
  | 'skin'
  | 'women'
  | 'bone'
  | 'mental'
  | 'general';

export interface HealthCategory {
  id: HealthCategoryId;
  name: string;
  tagline: string;
  iconName: string;
  overview: string;
  keyStatistics: string[];
  symptoms: string[];
  lifestyleTips: string[];
  clinicalRedFlags: string[];
  specialistTitle: string;
  hasAiAssessment: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  categoryId: HealthCategoryId;
  qualifications: string;
  hospital: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  image: string;
  about: string;
  consultationFee: number;
  telehealthFee: number;
  availableDays: string[];
  nextAvailableSlot: string;
  timeSlots: string[];
  languages: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  categoryId: HealthCategoryId;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: string;
  description: string;
  clinicalHighlights: string[];
  usageInstructions: string;
  stockCount: number;
  inStock: boolean;
  dosageOrSize: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string;
  date: string;
  time: string;
  type: 'telehealth' | 'in-person';
  fee: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  patientName: string;
  patientEmail: string;
  notes?: string;
  createdAt: string;
}

export interface DiabetesAssessmentInput {
  glucose: number; // Fasting plasma glucose (mg/dL) - normal: 70-99, pre: 100-125, diab: >=126
  bmi: number; // BMI kg/m2 - normal: 18.5-24.9, over: 25-29.9, obese: >=30
  age: number; // Years
  bloodPressure: number; // Diastolic mm Hg - normal: <80, high: >=80
  insulin: number; // 2-hour serum insulin (mu U/ml) - normal: 16-166
  pregnancies: number; // Number of pregnancies (or 0)
  familyHistory: 'none' | 'first-degree' | 'second-degree';
  waistCircumference: number; // cm
  physicalActivity: 'sedentary' | 'light' | 'moderate' | 'active';
}

export interface FeatureImpact {
  feature: string;
  label: string;
  value: string;
  impactScore: number; // positive = increases risk, negative = protects
  direction: 'increase' | 'decrease' | 'neutral';
  explanation: string;
}

export interface DiabetesAssessmentResult {
  id: string;
  timestamp: string;
  inputs: DiabetesAssessmentInput;
  riskProbability: number; // 0 to 100
  riskLevel: 'Low' | 'Medium' | 'High';
  clinicalSummary: string;
  topDrivers: FeatureImpact[];
  protectiveFactors: FeatureImpact[];
  recommendations: string[];
  recommendedSpecialist: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  trackingNumber: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'appointment' | 'assessment' | 'order' | 'general' | 'vital';
  linkTab?: 'assessments' | 'appointments' | 'orders' | 'metrics';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  bloodType: string;
  primaryCondition?: string;
  avatar: string;
}

export interface VitalLog {
  id: string;
  timestamp: string; // ISO date string
  heartRate: number; // bpm (e.g. 72)
  oxygenSaturation: number; // SpO2 % (e.g. 98)
  sleepHours: number; // hours (e.g. 7.5)
  sleepQuality?: 'poor' | 'fair' | 'good' | 'optimal';
  bloodPressureSystolic?: number; // mmHg (e.g. 118)
  bloodPressureDiastolic?: number; // mmHg (e.g. 76)
  source: 'simulated_sensor' | 'manual_entry';
  notes?: string;
}
