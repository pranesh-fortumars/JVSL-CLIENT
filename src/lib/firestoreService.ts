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
  removal_pending?: boolean;
  removal_requested_by?: string;
  removal_reason?: string;
};

export type FamilyGroup = {
  id: string;
  household_name: string;
  household_address: string;
  invite_code: string;
  creator_uid: string;
  member_uids?: string[];
  members: FamilyMember[];
  created_at: string;
  removal_audit_log?: {
    id: string;
    target_uid: string;
    requested_by_uid: string;
    confirmed_by_target: boolean;
    timestamp: string;
    status: 'pending_target_confirmation' | 'completed' | 'declined';
  }[];
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
    console.warn('Firestore fetch products failed, using fallback:', err);
    return INITIAL_PRODUCTS.map((p, idx) => ({ id: `local-${idx}`, ...p }));
  }
}

/**
 * Direct submission for Enquiries to Firestore
 */
export async function submitEnquiry(enquiry: Enquiry) {
  const firestoreRes = await addDoc(collection(db, 'enquiries'), {
    ...enquiry,
    status: 'new',
    created_at: new Date().toISOString(),
    timestamp: serverTimestamp(),
  });
  return firestoreRes;
}

/**
 * Direct submission for Surveys to Firestore
 */
export async function submitSurvey(survey: SurveySubmission) {
  const firestoreRes = await addDoc(collection(db, 'survey_submissions'), {
    ...survey,
    status: 'new',
    created_at: new Date().toISOString(),
    timestamp: serverTimestamp(),
  });
  return firestoreRes;
}

/**
 * Authoritative Firestore Submission for Orders
 */
export async function createOrder(order: Order) {
  let createdId: string = `ORD-${Date.now()}`;

  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      status: 'new',
      created_at: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
    if (docRef?.id) {
      createdId = docRef.id;
    }
  } catch (err) {
    console.warn('Firestore createOrder notice:', err);
  }

  // Check if this is the user's first order, and award the ₹50 promotional balance
  if (order.user_id) {
    try {
      const userOrdersSnap = await getDocs(query(collection(db, 'orders'), where('user_id', '==', order.user_id)));
      // If this is their 1st qualifying order (snap docs length <= 1)
      if (userOrdersSnap.docs.length <= 1) {
        const userFinRef = doc(db, 'user_financials', order.user_id);
        const finSnap = await getDoc(userFinRef);
        const currentPromo = finSnap.exists() ? (finSnap.data().promo_balance || 0) : 0;
        await setDoc(userFinRef, {
          promo_balance: currentPromo + 50,
          promo_granted_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        }, { merge: true });

        // Record in wallet ledger
        await addDoc(collection(db, 'wallet_ledger'), {
          id: 'promo_' + Date.now(),
          user_id: order.user_id,
          type: 'promo_credit',
          amount: 50,
          description: 'First Qualifying Order Promotional Credit (+₹50)',
          created_at: new Date().toISOString(),
          order_id: createdId,
        });
      }
    } catch (promoErr) {
      console.warn('First order promo grant notice:', promoErr);
    }
  }

  // Trigger Master Franchisee ₹1 backend royalty ledger calculation for qualifying member
  try {
    await recordMasterFranchiseeRoyalty({
      id: createdId,
      user_id: order.user_id,
      customer_name: order.customer_name,
      mobile: order.mobile,
    });
  } catch (mfErr) {
    console.warn('Master Franchisee Royalty trigger notice:', mfErr);
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
      q = query(colRef, where('user_id', '==', userId));
    } else {
      q = query(colRef, orderBy('created_at', 'desc'));
    }

    const snap = await getDocs(q);
    const fsOrders = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<OrderRow, 'id'>),
    }));

    fsOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return fsOrders;
  } catch (err) {
    console.warn('Error in fetchOrders:', err);
    return [];
  }
}

/**
 * Fetch surveys directly from Firestore
 */
export async function fetchSurveys(): Promise<SurveyRow[]> {
  if (isMockModeActive()) {
    return MOCK_SURVEYS;
  }
  try {
    const colRef = collection(db, 'survey_submissions');
    const q = query(colRef, orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SurveyRow, 'id'>),
    }));
  } catch (err) {
    console.warn('Error in fetchSurveys:', err);
    return [];
  }
}

/**
 * Fetch enquiries directly from Firestore
 */
export async function fetchEnquiries(): Promise<EnquiryRow[]> {
  if (isMockModeActive()) {
    return MOCK_ENQUIRIES;
  }
  try {
    const colRef = collection(db, 'enquiries');
    const q = query(colRef, orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<EnquiryRow, 'id'>),
    }));
  } catch (err) {
    console.warn('Error in fetchEnquiries:', err);
    return [];
  }
}

/**
 * Update order status in Firestore
 */
export async function updateOrderStatus(id: string, status: OrderRow['status']) {
  if (id.startsWith('MOCK-')) {
    return;
  }
  await updateDoc(doc(db, 'orders', id), { status }).catch((e) =>
    console.warn('Firestore updateOrderStatus notice:', e)
  );
}

/**
 * Update survey status in Firestore
 */
export async function updateSurveyStatus(id: string, status: SurveyRow['status']) {
  if (id.startsWith('MOCK-')) {
    return;
  }
  await updateDoc(doc(db, 'survey_submissions', id), { status }).catch((e) =>
    console.warn('Firestore updateSurveyStatus notice:', e)
  );
}

/**
 * Update enquiry status in Firestore
 */
export async function updateEnquiryStatus(id: string, status: EnquiryRow['status']) {
  await updateDoc(doc(db, 'enquiries', id), { status }).catch((e) =>
    console.warn('Firestore updateEnquiryStatus notice:', e)
  );
}

/**
 * Super Admin: Create or provision a new user role record directly
 */
export async function createManagedUser(input: { email: string; full_name: string; role: Profile['role'] }): Promise<void> {
  const docId = input.email.replace(/[^a-zA-Z0-9]/g, '_');
  const ref = doc(db, 'profiles', docId);

  try {
    await setDoc(ref, {
      email: input.email,
      full_name: input.full_name,
      role: input.role,
      created_at: new Date().toISOString(),
    }, { merge: true });
  } catch (fsErr: any) {
    console.warn('Firestore write permission notice:', fsErr?.message || fsErr);
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
    console.warn('Firestore fetchAllProfiles notice:', err);
  }

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
  const group: FamilyGroup & { member_uids: string[] } = {
    id: 'grp_' + Date.now(),
    household_name: householdName,
    household_address: householdAddress,
    invite_code: code,
    creator_uid: creator.uid,
    member_uids: [creator.uid],
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
    const updatedMemberUids = Array.from(new Set([...(targetGroup as any).member_uids || [], user.uid]));

    try {
      await updateDoc(doc(db, 'family_groups', targetGroup.id), {
        members: targetGroup.members,
        member_uids: updatedMemberUids,
      });
      await setDoc(doc(db, 'profiles', user.uid), { family_group_id: targetGroup.id }, { merge: true });
    } catch (err) {
      console.warn('Firestore update family members notice:', err);
    }
  }

  return targetGroup;
}

/**
 * B: Request Family Member Removal (Two-Party Mutual Confirmation Rule)
 * Requires both the requester and the member being removed to confirm.
 */
export async function requestFamilyMemberRemoval(
  groupId: string,
  requestedByUid: string,
  targetMemberUid: string,
  reason: string = 'Household separation request'
): Promise<void> {
  const group = await fetchFamilyGroup(groupId);
  if (!group) throw new Error('Family group not found');

  const member = group.members.find((m) => m.uid === targetMemberUid);
  if (!member) throw new Error('Member not found in family group');

  member.removal_pending = true;
  member.removal_requested_by = requestedByUid;
  member.removal_reason = reason;

  const logEntry = {
    id: `rem_${Date.now()}`,
    target_uid: targetMemberUid,
    requested_by_uid: requestedByUid,
    confirmed_by_target: requestedByUid === targetMemberUid, // auto-confirm if self-removal
    timestamp: new Date().toISOString(),
    status: (requestedByUid === targetMemberUid
      ? 'completed'
      : 'pending_target_confirmation') as 'pending_target_confirmation' | 'completed' | 'declined',
  };

  group.removal_audit_log = [logEntry, ...(group.removal_audit_log || [])];

  if (logEntry.status === 'completed') {
    group.members = group.members.filter((m) => m.uid !== targetMemberUid);
  }

  try {
    await updateDoc(doc(db, 'family_groups', groupId), {
      members: group.members,
      removal_audit_log: group.removal_audit_log,
    });
  } catch (e) {
    console.warn('requestFamilyMemberRemoval notice:', e);
  }

  try {
    const list: FamilyGroup[] = JSON.parse(localStorage.getItem('jvlsd_family_groups') || '[]');
    const updated = list.map((g) => (g.id === groupId ? group : g));
    localStorage.setItem('jvlsd_family_groups', JSON.stringify(updated));
  } catch (e) {}
}

export async function confirmFamilyMemberRemoval(
  groupId: string,
  targetMemberUid: string,
  accept: boolean
): Promise<void> {
  const group = await fetchFamilyGroup(groupId);
  if (!group) throw new Error('Family group not found');

  const member = group.members.find((m) => m.uid === targetMemberUid);
  if (!member) throw new Error('Member not found in family group');

  if (accept) {
    group.members = group.members.filter((m) => m.uid !== targetMemberUid);
    if (group.removal_audit_log && group.removal_audit_log.length > 0) {
      const log = group.removal_audit_log.find((l) => l.target_uid === targetMemberUid);
      if (log) {
        log.confirmed_by_target = true;
        log.status = 'completed';
      }
    }
    // Atomically unlink the family group ID from the member's profile
    try {
      await updateDoc(doc(db, 'profiles', targetMemberUid), {
        family_group_id: null,
      });
    } catch (profErr) {
      console.warn('Unlink profile from family_group_id notice:', profErr);
    }
  } else {
    delete member.removal_pending;
    delete member.removal_requested_by;
    delete member.removal_reason;
    if (group.removal_audit_log && group.removal_audit_log.length > 0) {
      const log = group.removal_audit_log.find((l) => l.target_uid === targetMemberUid);
      if (log) {
        log.status = 'declined';
      }
    }
  }

  try {
    await updateDoc(doc(db, 'family_groups', groupId), {
      members: group.members,
      removal_audit_log: group.removal_audit_log,
    });
  } catch (e) {
    console.warn('confirmFamilyMemberRemoval notice:', e);
  }

  try {
    const list: FamilyGroup[] = JSON.parse(localStorage.getItem('jvlsd_family_groups') || '[]');
    const updated = list.map((g) => (g.id === groupId ? group : g));
    localStorage.setItem('jvlsd_family_groups', JSON.stringify(updated));
  } catch (e) {}
}

export type WalletLedgerEntry = {
  id: string;
  user_id: string;
  type: 'subscription_credit' | 'reload' | 'order_debit' | 'refund' | 'promo_credit';
  amount: number;
  description: string;
  created_at: string;
  order_id?: string;
};

export type LoyaltyLedgerEntry = {
  id: string;
  user_id: string;
  type: 'earned' | 'redeemed' | 'rollover';
  points: number; // 1 pt = ₹1
  balance_after: number;
  description: string;
  created_at: string;
  order_id?: string;
};

export type DiscountVoucher = {
  id: string;
  user_id: string;
  amount: number; // e.g. ₹200
  source: 'discount_refund' | 'promotional_grant';
  issue_date: string;
  expiry_date: string; // 60 days from issue
  is_redeemed: boolean;
  redeemed_order_id?: string;
  redeemed_at?: string;
};

/**
 * Fetch active, non-expired ₹200 discount refund vouchers for a user
 */
export async function fetchUserDiscountVouchers(userId: string): Promise<DiscountVoucher[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'discount_vouchers'), where('user_id', '==', userId))
    );
    const now = new Date().toISOString();
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<DiscountVoucher, 'id'>) }))
      .filter((v) => !v.is_redeemed && v.expiry_date > now);
  } catch (err) {
    console.warn('fetchUserDiscountVouchers notice:', err);
    return [];
  }
}

/**
 * Issue a ₹200 discount refund voucher valid for 60 days (2 months)
 */
export async function issueDiscountRefundVoucher(userId: string, amount: number = 200): Promise<DiscountVoucher> {
  const issueDate = new Date();
  const expiryDate = new Date(issueDate.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days
  const voucher: Omit<DiscountVoucher, 'id'> = {
    user_id: userId,
    amount,
    source: 'discount_refund',
    issue_date: issueDate.toISOString(),
    expiry_date: expiryDate.toISOString(),
    is_redeemed: false,
  };

  const ref = await addDoc(collection(db, 'discount_vouchers'), voucher);
  return { id: ref.id, ...voucher };
}

/**
 * Redeem a discount refund voucher against an order
 */
export async function redeemDiscountVoucher(voucherId: string, orderId: string): Promise<void> {
  await updateDoc(doc(db, 'discount_vouchers', voucherId), {
    is_redeemed: true,
    redeemed_order_id: orderId,
    redeemed_at: new Date().toISOString(),
  });
}

export type MasterFranchiseeRoyaltyEntry = {
  id: string; // Idempotency key: MF_{member_id}_{date}
  member_id: string;
  customer_name: string;
  mobile: string;
  order_id: string;
  amount: number; // ₹1.00 per active subscribed member per qualifying day
  qualifying_date: string; // YYYY-MM-DD
  status: 'payable' | 'disbursed';
  created_at: string;
};

export type FamilyExpenseProposal = {
  id: string;
  family_group_id: string;
  proposed_by_uid: string;
  proposed_by_name: string;
  category: string;
  description: string;
  amount: number;
  expected_date: string;
  status: 'under_discussion' | 'agreed' | 'denied';
  votes: Record<string, 'agreed' | 'denied' | 'under_discussion'>; // uid -> vote
  created_at: string;
};

/**
 * Authoritative User Financial State (Wallet, Loyalty & Promotional Credits)
 * Client Rule:
 * - Default Promo Balance starts at ₹0.
 * - ₹50 is credited strictly AFTER the first qualifying order is placed.
 * - Wallet and Loyalty balances are pulled from Firestore, not localStorage.
 */
export async function fetchUserFinancials(userId: string) {
  let walletBalance = 0;
  let loyaltyPoints = 0;
  let promoBalance = 0;
  let transactions: WalletLedgerEntry[] = [];
  let loyaltyHistory: LoyaltyLedgerEntry[] = [];

  try {
    const snap = await getDoc(doc(db, 'user_financials', userId));
    if (snap.exists()) {
      const data = snap.data();
      walletBalance = data.wallet_balance ?? 0;
      loyaltyPoints = data.loyalty_points ?? 0;
      promoBalance = data.promo_balance ?? 0;
    }
  } catch (err) {
    console.warn('Firestore fetchUserFinancials notice:', err);
  }

  // Fetch verified ledger history directly from Firestore
  try {
    const walletSnap = await getDocs(
      query(collection(db, 'wallet_ledger'), where('user_id', '==', userId))
    );
    transactions = walletSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<WalletLedgerEntry, 'id'>),
    }));
    transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (wErr) {
    console.warn('Firestore wallet_ledger fetch notice:', wErr);
  }

  try {
    const loyaltySnap = await getDocs(
      query(collection(db, 'loyalty_ledger'), where('user_id', '==', userId))
    );
    loyaltyHistory = loyaltySnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<LoyaltyLedgerEntry, 'id'>),
    }));
    loyaltyHistory.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (lErr) {
    console.warn('Firestore loyalty_ledger fetch notice:', lErr);
  }

  return {
    walletBalance,
    loyaltyPoints,
    promoBalance,
    transactions,
    loyaltyHistory,
  };
}

/**
 * P8 & F: Process Wallet Reload with Client Rules:
 * - Initial wallet loading minimum: ₹1,000.
 * - When balance reaches ₹300, subsequent loading can be for any amount above ₹300.
 */
export async function reloadUserWallet(
  userId: string,
  amount: number,
  isInitialLoad: boolean = false
): Promise<number> {
  const current = await fetchUserFinancials(userId);

  if (isInitialLoad || current.transactions.filter(t => t.type === 'reload').length === 0) {
    if (amount < 1000) {
      throw new Error('Initial wallet loading requires a minimum of ₹1,000.');
    }
  } else {
    // If balance has dropped to or below ₹300, subsequent loading must be at least ₹300
    const minSubsequent = current.walletBalance <= 300 ? 300 : 200;
    if (amount < minSubsequent) {
      throw new Error(`Minimum subsequent wallet reload amount is ₹${minSubsequent}.`);
    }
  }

  const newBalance = current.walletBalance + amount;
  const newEntry: WalletLedgerEntry = {
    id: 'tx_' + Date.now(),
    user_id: userId,
    type: 'reload',
    amount,
    description: `Prepaid wallet reload (+₹${amount})`,
    created_at: new Date().toISOString(),
  };

  const updatedTransactions = [newEntry, ...current.transactions];

  try {
    await setDoc(
      doc(db, 'user_financials', userId),
      {
        wallet_balance: newBalance,
        last_updated: new Date().toISOString(),
      },
      { merge: true }
    );
    await addDoc(collection(db, 'wallet_ledger'), newEntry);
  } catch (e) {}

  try {
    localStorage.setItem(
      `jvlsd_wallet_${userId}`,
      JSON.stringify({
        ...current,
        walletBalance: newBalance,
        transactions: updatedTransactions,
      })
    );
  } catch (e) {}

  return newBalance;
}

/**
 * P9: Record Master Franchisee ₹1 Backend Royalty Ledger
 * Business Rule: ₹1 per active subscribed member per qualifying day.
 * - Idempotency key: MF_{member_id}_{qualifying_date}
 * - Only active subscribed members qualify
 * - Multiple orders from the same member on the same day generate only ₹1 in total
 * - Guest users and inactive subscribers generate ₹0
 */
export async function recordMasterFranchiseeRoyalty(order: {
  id: string;
  user_id?: string;
  customer_name: string;
  mobile: string;
  created_at?: string;
}): Promise<void> {
  // If no user_id (guest) or invalid member, skip royalty generation
  if (!order.user_id) {
    return;
  }

  const memberId = order.user_id;
  const orderDate = order.created_at ? order.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const idempotencyId = `MF_${memberId}_${orderDate}`;

  // Check if member has an active subscription in user_financials or profile
  let isSubscribed = true; // default check
  try {
    const snap = await getDoc(doc(db, 'user_financials', memberId));
    if (snap.exists()) {
      const fin = snap.data();
      // If subscription_status is explicitly inactive, skip
      if (fin.subscription_status && fin.subscription_status !== 'active') {
        isSubscribed = false;
      }
    }
  } catch (e) {}

  if (!isSubscribed) {
    return;
  }

  // Check if idempotency key already exists in Firestore
  try {
    const existingSnap = await getDoc(doc(db, 'master_franchisee_royalty', idempotencyId));
    if (existingSnap.exists()) {
      // Royalty for this active subscribed member on this qualifying day has already been accounted for
      return;
    }
  } catch (e) {}

  // Check local ledger cache to prevent duplicate entries
  try {
    const list: MasterFranchiseeRoyaltyEntry[] = JSON.parse(localStorage.getItem('jvlsd_mf_royalty_ledger') || '[]');
    if (list.some((r) => r.id === idempotencyId)) {
      return;
    }
  } catch (e) {}

  const royaltyEntry: MasterFranchiseeRoyaltyEntry = {
    id: idempotencyId,
    member_id: memberId,
    customer_name: order.customer_name,
    mobile: order.mobile,
    order_id: order.id,
    amount: 1.00,
    qualifying_date: orderDate,
    status: 'payable',
    created_at: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'master_franchisee_royalty', royaltyEntry.id), royaltyEntry, { merge: true });
  } catch (err) {
    console.warn('Firestore recordMasterFranchiseeRoyalty notice:', err);
  }

  // Backup to local ledger cache for reliable reporting
  try {
    const list: MasterFranchiseeRoyaltyEntry[] = JSON.parse(localStorage.getItem('jvlsd_mf_royalty_ledger') || '[]');
    if (!list.some((r) => r.id === royaltyEntry.id)) {
      localStorage.setItem('jvlsd_mf_royalty_ledger', JSON.stringify([royaltyEntry, ...list]));
    }
  } catch (e) {}
}

export async function fetchMasterFranchiseeRoyaltyLedger(): Promise<MasterFranchiseeRoyaltyEntry[]> {
  let records: MasterFranchiseeRoyaltyEntry[] = [];
  try {
    const snap = await getDocs(query(collection(db, 'master_franchisee_royalty'), orderBy('created_at', 'desc')));
    records = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MasterFranchiseeRoyaltyEntry, 'id'>) }));
  } catch (e) {}

  if (records.length === 0) {
    try {
      records = JSON.parse(localStorage.getItem('jvlsd_mf_royalty_ledger') || '[]');
    } catch (e) {}
  }
  return records;
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

export async function fetchFamilyExpenseProposals(familyGroupId: string): Promise<FamilyExpenseProposal[]> {
  let list: FamilyExpenseProposal[] = [];
  try {
    const snap = await getDocs(
      query(collection(db, 'family_finances'), where('family_group_id', '==', familyGroupId))
    );
    list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FamilyExpenseProposal, 'id'>) }));
  } catch (e) {
    console.warn('Firestore fetchFamilyExpenseProposals notice:', e);
  }

  if (list.length === 0) {
    try {
      list = JSON.parse(localStorage.getItem(`jvlsd_family_expenses_${familyGroupId}`) || '[]');
    } catch (e) {}
  }
  return list;
}

export async function saveFamilyExpenseProposal(proposal: FamilyExpenseProposal): Promise<void> {
  try {
    await setDoc(doc(db, 'family_finances', proposal.id), proposal, { merge: true });
  } catch (e) {
    console.warn('Firestore saveFamilyExpenseProposal notice:', e);
  }

  try {
    const key = `jvlsd_family_expenses_${proposal.family_group_id}`;
    const list: FamilyExpenseProposal[] = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = list.filter((p) => p.id !== proposal.id);
    localStorage.setItem(key, JSON.stringify([proposal, ...filtered]));
  } catch (e) {}
}

export async function updateFamilyExpenseStatus(
  proposalId: string,
  familyGroupId: string,
  status: FamilyExpenseProposal['status'],
  userUid?: string
): Promise<void> {
  try {
    const updatePayload: any = { status };
    if (userUid) {
      updatePayload[`votes.${userUid}`] = status;
    }
    await updateDoc(doc(db, 'family_finances', proposalId), updatePayload);
  } catch (e) {
    console.warn('Firestore updateFamilyExpenseStatus notice:', e);
  }

  try {
    const key = `jvlsd_family_expenses_${familyGroupId}`;
    const list: FamilyExpenseProposal[] = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = list.map((p) => (p.id === proposalId ? { ...p, status } : p));
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {}
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
}
