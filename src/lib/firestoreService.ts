import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'customer' | 'admin';
};

export type Product = {
  id: string;
  name: string;
  category: 'vegetable' | 'fruit' | 'milk';
  image_url: string | null;
  unit: string;
  price?: number;
  available_today: boolean;
  display_order: number;
};

export type Enquiry = {
  name: string;
  email?: string;
  phone: string;
  subject: string;
  message: string;
};

export type SelectionItem = {
  id: string;
  name: string;
  category: 'vegetable' | 'fruit' | 'milk';
  unit: string;
  quantity: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'one-time';
};

export type SurveySubmission = {
  customer_name: string;
  mobile: string;
  address: string;
  pincode?: string;
  digipin?: string;
  family_members: number;
  delivery_preference: string;
  selections: SelectionItem[];
  notes?: string;
};

export type OrderMode = 'same_day' | 'next_day';

export type OrderItem = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  price?: number;
};

export type Order = {
  customer_name: string;
  mobile: string;
  address: string;
  pincode?: string;
  digipin?: string;
  mode: OrderMode;
  items: OrderItem[];
  expected_delivery: string;
  notes?: string;
  user_id?: string;
  total_amount?: number;
  payment_method?: string;
};

export type OrderRow = Order & {
  id: string;
  status: 'new' | 'confirmed' | 'delivered' | 'cancelled';
  created_at: string;
};

export type EnquiryRow = Enquiry & {
  id: string;
  status: 'new' | 'resolved';
  created_at: string;
};

export type SurveyRow = SurveySubmission & {
  id: string;
  status: 'new' | 'reviewed';
  created_at: string;
};

export const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'Fresh Tomato', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 40, available_today: true, display_order: 1 },
  { name: 'Red Onion', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 50, available_today: true, display_order: 2 },
  { name: 'Farm Potato', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 35, available_today: true, display_order: 3 },
  { name: 'Green Spinach (Palak)', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', unit: 'bunch', price: 25, available_today: true, display_order: 4 },
  { name: 'Crisp Carrot', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 45, available_today: true, display_order: 5 },
  { name: 'Cauliflower', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80', unit: 'piece', price: 40, available_today: false, display_order: 6 },
  { name: 'Shimla Apple', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 180, available_today: true, display_order: 7 },
  { name: 'Robusta Banana', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', unit: 'dozen', price: 60, available_today: true, display_order: 8 },
  { name: 'Sweet Orange (Mosambi)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 90, available_today: false, display_order: 9 },
  { name: 'Pure Farm Milk', category: 'milk', image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80', unit: 'litre', price: 65, available_today: true, display_order: 10 },
  { name: 'Farm Cow Milk', category: 'milk', image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', unit: 'litre', price: 70, available_today: true, display_order: 11 },
];

export async function fetchProducts(): Promise<Product[]> {
  try {
    const colRef = collection(db, 'products');
    const q = query(colRef, orderBy('display_order', 'asc'));
    const snap = await getDocs(q);

    if (snap.empty) {
      // Seed default products into Firestore on first load
      const created: Product[] = [];
      for (const item of INITIAL_PRODUCTS) {
        const docRef = await addDoc(colRef, {
          ...item,
          created_at: serverTimestamp(),
        });
        created.push({ id: docRef.id, ...item });
      }
      return created;
    }

    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Product, 'id'>),
    }));
  } catch (err) {
    console.warn('Falling back to local catalog:', err);
    return INITIAL_PRODUCTS.map((p, idx) => ({ id: `local-${idx}`, ...p }));
  }
}

export async function submitEnquiry(enquiry: Enquiry) {
  const colRef = collection(db, 'enquiries');
  return addDoc(colRef, {
    ...enquiry,
    status: 'new',
    created_at: new Date().toISOString(),
    timestamp: serverTimestamp(),
  });
}

export async function submitSurvey(survey: SurveySubmission) {
  const colRef = collection(db, 'survey_submissions');
  return addDoc(colRef, {
    ...survey,
    status: 'new',
    created_at: new Date().toISOString(),
    timestamp: serverTimestamp(),
  });
}

export async function createOrder(order: Order) {
  const colRef = collection(db, 'orders');
  return addDoc(colRef, {
    ...order,
    status: 'new',
    created_at: new Date().toISOString(),
    timestamp: serverTimestamp(),
  });
}

export async function fetchOrders(userId?: string): Promise<OrderRow[]> {
  const colRef = collection(db, 'orders');
  let q = query(colRef, orderBy('created_at', 'desc'));
  if (userId) {
    q = query(colRef, where('user_id', '==', userId), orderBy('created_at', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<OrderRow, 'id'>),
  }));
}

export async function fetchSurveys(): Promise<SurveyRow[]> {
  const colRef = collection(db, 'survey_submissions');
  const q = query(colRef, orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<SurveyRow, 'id'>),
  }));
}

export async function fetchEnquiries(): Promise<EnquiryRow[]> {
  const colRef = collection(db, 'enquiries');
  const q = query(colRef, orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<EnquiryRow, 'id'>),
  }));
}

