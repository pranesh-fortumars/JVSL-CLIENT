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
} from 'firebase/firestore';
import { db } from './firebase';
import { supabase, isSupabaseConfigured } from './supabase';

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

/**
 * Fetch products with dual-support:
 * 1. Checks Firestore (and seeds if empty)
 * 2. If configured and available, can also sync/check Supabase
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const colRef = collection(db, 'products');
    const q = query(colRef, orderBy('display_order', 'asc'));
    const snap = await getDocs(q);

    if (snap.empty) {
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
    console.warn('Firestore fetch products failed, checking Supabase/fallback:', err);
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as Product[];
        }
      } catch (sbErr) {
        console.warn('Supabase product fetch fallback error:', sbErr);
      }
    }
    return INITIAL_PRODUCTS.map((p, idx) => ({ id: `local-${idx}`, ...p }));
  }
}

/**
 * Dual database submission for Enquiries:
 * Stores in Firestore AND also syncs with Supabase if configured.
 */
export async function submitEnquiry(enquiry: Enquiry) {
  const firestorePromise = addDoc(collection(db, 'enquiries'), {
    ...enquiry,
    status: 'new',
    created_at: new Date().toISOString(),
    timestamp: serverTimestamp(),
  });

  let supabasePromise = Promise.resolve();
  if (isSupabaseConfigured) {
    supabasePromise = Promise.resolve(
      supabase.from('enquiries').insert({
        name: enquiry.name.trim(),
        email: enquiry.email?.trim() || null,
        phone: enquiry.phone.trim(),
        subject: enquiry.subject,
        message: enquiry.message.trim(),
      })
    ).then(({ error }) => {
      if (error) console.warn('Dual-write to Supabase enquiries warning:', error);
    }).catch((err) => console.warn('Supabase enquiry error:', err));
  }

  const [firestoreRes] = await Promise.all([firestorePromise, supabasePromise]);
  return firestoreRes;
}

/**
 * Dual database submission for Surveys:
 * Stores in Firestore AND also syncs with Supabase if configured.
 */
export async function submitSurvey(survey: SurveySubmission) {
  const firestorePromise = addDoc(collection(db, 'survey_submissions'), {
    ...survey,
    status: 'new',
    created_at: new Date().toISOString(),
    timestamp: serverTimestamp(),
  });

  let supabasePromise = Promise.resolve();
  if (isSupabaseConfigured) {
    supabasePromise = Promise.resolve(
      supabase.from('survey_submissions').insert({
        customer_name: survey.customer_name.trim(),
        mobile: survey.mobile.trim(),
        address: survey.address.trim(),
        family_members: Number(survey.family_members),
        delivery_preference: survey.delivery_preference,
        selections: survey.selections,
        notes: survey.notes?.trim() || null,
      })
    ).then(({ error }) => {
      if (error) console.warn('Dual-write to Supabase survey warning:', error);
    }).catch((err) => console.warn('Supabase survey error:', err));
  }

  const [firestoreRes] = await Promise.all([firestorePromise, supabasePromise]);
  return firestoreRes;
}

/**
 * Dual database submission for Orders:
 * Stores in Firestore AND also syncs with Supabase if configured.
 */
export async function createOrder(order: Order) {
  const firestorePromise = addDoc(collection(db, 'orders'), {
    ...order,
    status: 'new',
    created_at: new Date().toISOString(),
    timestamp: serverTimestamp(),
  });

  let supabasePromise = Promise.resolve();
  if (isSupabaseConfigured) {
    supabasePromise = Promise.resolve(
      supabase.from('orders').insert({
        customer_name: order.customer_name.trim(),
        mobile: order.mobile.trim(),
        address: order.address.trim(),
        mode: order.mode,
        items: order.items,
        expected_delivery: order.expected_delivery,
        notes: order.notes?.trim() || null,
        user_id: order.user_id || null,
      })
    ).then(({ error }) => {
      if (error) console.warn('Dual-write to Supabase order warning:', error);
    }).catch((err) => console.warn('Supabase order error:', err));
  }

  const [firestoreRes] = await Promise.all([firestorePromise, supabasePromise]);
  return firestoreRes;
}

/**
 * Fetch orders combining Firestore and Supabase if active
 */
export async function fetchOrders(userId?: string): Promise<OrderRow[]> {
  try {
    const colRef = collection(db, 'orders');
    let q = query(colRef, orderBy('created_at', 'desc'));
    if (userId) {
      q = query(colRef, where('user_id', '==', userId), orderBy('created_at', 'desc'));
    }
    const snap = await getDocs(q);
    const fsOrders = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<OrderRow, 'id'>),
    }));

    if (fsOrders.length > 0) return fsOrders;

    if (isSupabaseConfigured) {
      let sbQuery = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (userId) {
        sbQuery = sbQuery.eq('user_id', userId);
      }
      const { data, error } = await sbQuery;
      if (!error && data) {
        return data as OrderRow[];
      }
    }

    return fsOrders;
  } catch (err) {
    console.warn('Error in fetchOrders, trying Supabase fallback:', err);
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (data) return data as OrderRow[];
    }
    return [];
  }
}

/**
 * Fetch surveys combining Firestore and Supabase if active
 */
export async function fetchSurveys(): Promise<SurveyRow[]> {
  try {
    const colRef = collection(db, 'survey_submissions');
    const q = query(colRef, orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    const fsSurveys = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SurveyRow, 'id'>),
    }));

    if (fsSurveys.length > 0) return fsSurveys;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('survey_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as SurveyRow[];
    }

    return fsSurveys;
  } catch (err) {
    console.warn('Error in fetchSurveys, trying Supabase fallback:', err);
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('survey_submissions').select('*').order('created_at', { ascending: false });
      if (data) return data as SurveyRow[];
    }
    return [];
  }
}

/**
 * Fetch enquiries combining Firestore and Supabase if active
 */
export async function fetchEnquiries(): Promise<EnquiryRow[]> {
  try {
    const colRef = collection(db, 'enquiries');
    const q = query(colRef, orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    const fsEnquiries = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<EnquiryRow, 'id'>),
    }));

    if (fsEnquiries.length > 0) return fsEnquiries;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as EnquiryRow[];
    }

    return fsEnquiries;
  } catch (err) {
    console.warn('Error in fetchEnquiries, trying Supabase fallback:', err);
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
      if (data) return data as EnquiryRow[];
    }
    return [];
  }
}

/**
 * Update order status across both databases
 */
export async function updateOrderStatus(id: string, status: OrderRow['status']) {
  const fsPromise = updateDoc(doc(db, 'orders', id), { status }).catch((e) =>
    console.warn('Firestore updateOrderStatus notice:', e)
  );

  let sbPromise = Promise.resolve();
  if (isSupabaseConfigured) {
    sbPromise = Promise.resolve(supabase.from('orders').update({ status }).eq('id', id)).then(
      () => {}
    ).catch((e) => console.warn('Supabase updateOrderStatus notice:', e));
  }

  await Promise.all([fsPromise, sbPromise]);
}

/**
 * Update survey status across both databases
 */
export async function updateSurveyStatus(id: string, status: SurveyRow['status']) {
  const fsPromise = updateDoc(doc(db, 'survey_submissions', id), { status }).catch((e) =>
    console.warn('Firestore updateSurveyStatus notice:', e)
  );

  let sbPromise = Promise.resolve();
  if (isSupabaseConfigured) {
    sbPromise = Promise.resolve(supabase.from('survey_submissions').update({ status }).eq('id', id)).then(
      () => {}
    ).catch((e) => console.warn('Supabase updateSurveyStatus notice:', e));
  }

  await Promise.all([fsPromise, sbPromise]);
}

/**
 * Update enquiry status across both databases
 */
export async function updateEnquiryStatus(id: string, status: EnquiryRow['status']) {
  const fsPromise = updateDoc(doc(db, 'enquiries', id), { status }).catch((e) =>
    console.warn('Firestore updateEnquiryStatus notice:', e)
  );

  let sbPromise = Promise.resolve();
  if (isSupabaseConfigured) {
    sbPromise = Promise.resolve(supabase.from('enquiries').update({ status }).eq('id', id)).then(
      () => {}
    ).catch((e) => console.warn('Supabase updateEnquiryStatus notice:', e));
  }

  await Promise.all([fsPromise, sbPromise]);
}
