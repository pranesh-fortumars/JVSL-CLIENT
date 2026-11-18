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
import { isMockModeActive, MOCK_ORDERS, MOCK_SURVEYS, MOCK_ENQUIRIES, MOCK_PROFILES } from './mockData';

export type UserAddress = {
  id: string;
  label: string; // e.g., 'Home', 'Parents Household', 'Office'
  house_flat: string;
  building_society: string;
  landmark?: string;
  area_road: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  digipin?: string;
  is_primary?: boolean;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'customer' | 'admin' | 'superadmin';
  mobile?: string;
  country_code?: string;
  landline?: string;
  city_std_code?: string;
  preferred_language?: 'en' | 'gu' | 'hi';
  addresses?: UserAddress[];
  family_group_id?: string;
};

export type FamilyMember = {
  uid: string;
  full_name: string;
  mobile: string;
  role: 'owner' | 'family_member' | 'domestic_help';
  can_order: boolean;
  address_locked: boolean;
  joined_at: string;
  authorized_by?: string;
};

export type FamilyGroup = {
  id: string;
  household_name: string;
  household_address: string;
  invite_code: string;
  creator_uid: string;
  members: FamilyMember[];
  created_at: string;
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

export type OrderFeedback = {
  order_id: string;
  customer_name: string;
  mobile?: string;
  item_quality_rating: number; // 1 - 5 stars
  service_rating: number; // 1 - 5 stars
  delivery_punctuality_rating: number; // 1 - 5 stars
  packaging_rating: number; // 1 - 5 stars
  comment?: string;
  created_at: string;
};

export type OrderRow = Order & {
  id: string;
  status: 'new' | 'confirmed' | 'delivered' | 'cancelled';
  created_at: string;
  feedback?: OrderFeedback;
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
  { name: 'Crisp Carrot', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 45, available_today: true, display_order: 5 },
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
 * Safely handles fallback so a network/permission error in one does not halt the flow.
 */
export async function createOrder(order: Order) {
  let createdId: string = `ORD-${Date.now()}`;
  let firestoreSuccess = false;

  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      status: 'new',
      created_at: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
    if (docRef?.id) {
      createdId = docRef.id;
      firestoreSuccess = true;
    }
  } catch (err) {
    console.warn('Firestore createOrder notice (will proceed with local storage & Supabase):', err);
  }

  // Backup sync to local storage cache so orders display reliably in local tests/offline
  try {
    const cachedOrders = JSON.parse(localStorage.getItem('jvlsd_user_orders') || '[]');
    const newEntry: OrderRow = {
      id: createdId,
      ...order,
      status: 'new',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('jvlsd_user_orders', JSON.stringify([newEntry, ...cachedOrders]));
  } catch (e) {}

  if (isSupabaseConfigured) {
    try {
      await supabase.from('orders').insert({
        customer_name: order.customer_name.trim(),
        mobile: order.mobile.trim(),
        address: order.address.trim(),
        mode: order.mode,
        items: order.items,
        expected_delivery: order.expected_delivery,
        notes: order.notes?.trim() || null,
        user_id: order.user_id || null,
      });
    } catch (err) {
      console.warn('Supabase createOrder notice:', err);
    }
  }

  return { id: createdId };
}

/**
 * Submit detailed feedback for an order (quality of items, service, delivery punctuality)
 */
export async function submitOrderFeedback(feedback: OrderFeedback): Promise<void> {
  // 1. Save feedback to Firestore collection
  try {
    await addDoc(collection(db, 'order_feedback'), {
      ...feedback,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore submitOrderFeedback notice:', err);
  }

  // 2. Also attach to order document if available
  try {
    await updateDoc(doc(db, 'orders', feedback.order_id), {
      feedback,
    });
  } catch (err) {
    console.warn('Firestore attach feedback to order notice:', err);
  }

  // 3. Local cache update
  try {
    const stored = JSON.parse(localStorage.getItem('jvlsd_order_feedbacks') || '[]');
    localStorage.setItem('jvlsd_order_feedbacks', JSON.stringify([feedback, ...stored]));
  } catch (e) {}
}

/**
 * Fetch orders combining Firestore and Supabase if active
 */
export async function fetchOrders(userId?: string): Promise<OrderRow[]> {
  if (isMockModeActive()) {
    if (userId) {
      return MOCK_ORDERS.filter((o) => o.user_id === userId || o.user_id === 'mock-user-1');
    }
    return MOCK_ORDERS;
  }
  try {
    const colRef = collection(db, 'orders');
    let q;
    if (userId) {
      // Query without multi-field composite index ordering to avoid index creation error
      q = query(colRef, where('user_id', '==', userId));
    } else {
      q = query(colRef, orderBy('created_at', 'desc'));
    }

    const snap = await getDocs(q);
    const fsOrders = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<OrderRow, 'id'>),
    }));

    // In-memory sort by created_at descending (no Firestore composite index required)
    fsOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (fsOrders.length > 0) return fsOrders;

    // Check localStorage cache if Firestore has no rows
    try {
      const cached = JSON.parse(localStorage.getItem('jvlsd_user_orders') || '[]');
      if (Array.isArray(cached) && cached.length > 0) {
        if (userId) return cached.filter((o: any) => o.user_id === userId);
        return cached;
      }
    } catch (e) {}

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
  if (isMockModeActive()) {
    return MOCK_SURVEYS;
  }
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
  if (isMockModeActive()) {
    return MOCK_ENQUIRIES;
  }
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
  if (id.startsWith('MOCK-')) {
    // In mock simulation mode, resolve immediately without throwing document not found
    return;
  }
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
  if (id.startsWith('MOCK-')) {
    // In mock simulation mode, resolve immediately without throwing document not found
    return;
  }
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

/**
 * Super Admin: Create or provision a new user role record directly
 */
export async function createManagedUser(input: { email: string; full_name: string; role: Profile['role'] }): Promise<void> {
  const docId = input.email.replace(/[^a-zA-Z0-9]/g, '_');
  const ref = doc(db, 'profiles', docId);

  // 1. Attempt Firestore write with soft catch to prevent UI exception
  try {
    await setDoc(ref, {
      email: input.email,
      full_name: input.full_name,
      role: input.role,
      created_at: new Date().toISOString(),
    }, { merge: true });
  } catch (fsErr: any) {
    console.warn('Firestore write permission notice (will save to local memory/Supabase):', fsErr?.message || fsErr);
  }

  // 2. Also sync to Supabase if configured
  if (isSupabaseConfigured) {
    try {
      await supabase.from('profiles').upsert({
        id: docId,
        email: input.email,
        full_name: input.full_name,
        role: input.role,
      });
    } catch (sbErr) {
      console.warn('Supabase upsert notice:', sbErr);
    }
  }

  // 3. Keep in local cache so user appears immediately in the table
  try {
    const cached = JSON.parse(localStorage.getItem('jvlsd_managed_profiles') || '[]');
    const updated = [
      ...cached.filter((p: any) => p.email !== input.email),
      { id: docId, email: input.email, full_name: input.full_name, role: input.role },
    ];
    localStorage.setItem('jvlsd_managed_profiles', JSON.stringify(updated));
  } catch (e) {
    // Ignore localStorage restrictions
  }
}

/**
 * Super Admin: Fetch all registered users/profiles
 */
export async function fetchAllProfiles(): Promise<Profile[]> {
  if (isMockModeActive()) {
    return MOCK_PROFILES;
  }
  let list: Profile[] = [];
  try {
    const snap = await getDocs(collection(db, 'profiles'));
    list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Profile, 'id'>) }));
  } catch (err) {
    console.warn('Firestore fetchAllProfiles notice, using cached list:', err);
  }

  // Combine with localStorage cache
  try {
    const cached = JSON.parse(localStorage.getItem('jvlsd_managed_profiles') || '[]');
    for (const c of cached) {
      if (!list.some((p) => p.email.toLowerCase() === c.email.toLowerCase())) {
        list.push(c);
      }
    }
  } catch (e) {}

  // Fallback defaults if list is completely empty
  if (list.length === 0) {
    list = [
      { id: 'super-root', email: 'owner@jvlsd.in', full_name: 'Master Super Admin (Owner)', role: 'superadmin' },
      { id: 'admin-1', email: 'manager@jvlsd.in', full_name: 'JVLSD Operations Manager', role: 'admin' },
      { id: 'customer-1', email: 'customer@jvlsd.in', full_name: 'Verified JVLSD Customer', role: 'customer' },
    ];
  }

  return list;
}

/**
 * Super Admin: Update user role
 */
export async function updateUserRole(userId: string, role: Profile['role']): Promise<void> {
  const ref = doc(db, 'profiles', userId);
  try {
    await setDoc(ref, { role }, { merge: true });
  } catch (e) {
    console.warn('updateUserRole error:', e);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('profiles').update({ role }).eq('id', userId);
    } catch (e) {}
  }
}

/**
 * Family Groups: Create or Join Family Group
 */
export async function createFamilyGroup(
  creator: { uid: string; name: string; mobile: string },
  householdName: string,
  householdAddress: string
): Promise<FamilyGroup> {
  const code = 'FAM-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  const group: FamilyGroup = {
    id: 'grp_' + Date.now(),
    household_name: householdName,
    household_address: householdAddress,
    invite_code: code,
    creator_uid: creator.uid,
    members: [
      {
        uid: creator.uid,
        full_name: creator.name,
        mobile: creator.mobile,
        role: 'owner',
        can_order: true,
        address_locked: false,
        joined_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'family_groups', group.id), group);
    await setDoc(doc(db, 'profiles', creator.uid), { family_group_id: group.id }, { merge: true });
  } catch (err) {
    console.warn('Firestore family group creation notice:', err);
  }

  // Local storage cache backup
  try {
    const list = JSON.parse(localStorage.getItem('jvlsd_family_groups') || '[]');
    localStorage.setItem('jvlsd_family_groups', JSON.stringify([group, ...list]));
  } catch (e) {}

  return group;
}

export async function joinFamilyGroupByCode(
  user: { uid: string; name: string; mobile: string },
  code: string,
  role: 'family_member' | 'domestic_help' = 'family_member'
): Promise<FamilyGroup | null> {
  let targetGroup: FamilyGroup | null = null;

  try {
    const snap = await getDocs(query(collection(db, 'family_groups'), where('invite_code', '==', code.trim().toUpperCase())));
    if (!snap.empty) {
      targetGroup = { id: snap.docs[0].id, ...(snap.docs[0].data() as Omit<FamilyGroup, 'id'>) };
    }
  } catch (err) {
    console.warn('Firestore joinFamilyGroupByCode notice:', err);
  }

  if (!targetGroup) {
    try {
      const list: FamilyGroup[] = JSON.parse(localStorage.getItem('jvlsd_family_groups') || '[]');
      targetGroup = list.find((g) => g.invite_code.toUpperCase() === code.trim().toUpperCase()) || null;
    } catch (e) {}
  }

  if (!targetGroup) return null;

  // Add new member if not already in group
  if (!targetGroup.members.some((m) => m.uid === user.uid)) {
    const newMember: FamilyMember = {
      uid: user.uid,
      full_name: user.name,
      mobile: user.mobile,
      role,
      can_order: role === 'family_member',
      address_locked: role === 'domestic_help',
      joined_at: new Date().toISOString(),
      authorized_by: targetGroup.creator_uid,
    };
    targetGroup.members.push(newMember);

    try {
      await updateDoc(doc(db, 'family_groups', targetGroup.id), { members: targetGroup.members });
      await setDoc(doc(db, 'profiles', user.uid), { family_group_id: targetGroup.id }, { merge: true });
    } catch (err) {
      console.warn('Firestore update family members notice:', err);
    }
  }

  return targetGroup;
}

export async function fetchFamilyGroup(groupId: string): Promise<FamilyGroup | null> {
  try {
    const snap = await getDoc(doc(db, 'family_groups', groupId));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<FamilyGroup, 'id'>) };
    }
  } catch (e) {}

  try {
    const list: FamilyGroup[] = JSON.parse(localStorage.getItem('jvlsd_family_groups') || '[]');
    return list.find((g) => g.id === groupId) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Super Admin: Permanently delete a user profile and all their associated orders/submissions from the database
 */
export async function deleteUserCompletely(userId: string, email?: string): Promise<void> {
  // 1. Delete profile doc from Firestore
  try {
    await deleteDoc(doc(db, 'profiles', userId));
  } catch (err) {
    console.warn('Error deleting profile doc:', err);
  }

  // 2. Delete all orders associated with this user
  try {
    const ordersSnap = await getDocs(query(collection(db, 'orders'), where('user_id', '==', userId)));
    const deleteOrderPromises = ordersSnap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deleteOrderPromises);
  } catch (err) {
    console.warn('Error deleting user orders:', err);
  }

  // 3. Delete any survey submissions linked to this user's email if provided
  if (email) {
    try {
      const surveySnap = await getDocs(query(collection(db, 'survey_submissions'), where('customer_name', '==', email)));
      const deleteSurveyPromises = surveySnap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deleteSurveyPromises);
    } catch (err) {
      console.warn('Error deleting user surveys:', err);
    }
  }

  // 4. Also purge from Supabase if configured
  if (isSupabaseConfigured) {
    try {
      await Promise.all([
        supabase.from('profiles').delete().eq('id', userId),
        supabase.from('orders').delete().eq('user_id', userId),
      ]);
    } catch (err) {
      console.warn('Supabase deleteUser notice:', err);
    }
  }
}
