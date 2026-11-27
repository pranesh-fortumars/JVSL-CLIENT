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
  assigned_stores?: string[]; // Store operator store assignment e.g. ['store_navrangpura', 'store_thaltej']
  can_manage_discount_toggles?: boolean; // Allowed by Super Admin/Admin
  can_manage_subscription_scheme?: boolean; // Allowed by Super Admin/Admin
  is_family_approver?: boolean; // One person in family profile has authority approval to accept/reject via SMS/WhatsApp
  mobile?: string;
  country_code?: string;
  landline?: string;
  city_std_code?: string;
  preferred_language?: 'en' | 'gu' | 'hi';
  addresses?: UserAddress[];
  family_group_id?: string;
};

export type FamilyMemberRole =
  | 'owner'
  | 'family_member'
  | 'housemaid'
  | 'helper'
  | 'driver'
  | 'caretaker'
  | 'personal_security'
  | 'family_manager'
  | 'officestaff'
  | 'domestic_help'; // backward compatibility

export type MemberClassification = 'family' | 'family_support_staff';

export type HouseholdSizeType =
  | 'S' // Single / Bachelor [01]
  | 'NF_NW' // Nuclear family / newly wed [02]
  | 'L' // Large [04]
  | 'XL' // Extra Large [06]
  | 'JF_EF' // Joint Family / Extended family [08+]
  | 'FF_FG' // Family function / Family Gathering [10+]
  | 'P'; // Party

export interface HouseholdScaleDefinition {
  code: HouseholdSizeType;
  badge: string;
  label: string;
  countRange: string;
  memberCountMin: number;
  icon: string;
  bgGradient: string;
  textColor: string;
  borderColor: string;
  description: string;
}

export const HOUSEHOLD_SCALE_DEFINITIONS: Record<HouseholdSizeType, HouseholdScaleDefinition> = {
  S: {
    code: 'S',
    badge: 'S',
    label: 'Single / Bachelor',
    countRange: '01 Person',
    memberCountMin: 1,
    icon: '👤',
    bgGradient: 'from-sky-500 to-blue-600',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-300',
    description: 'Quick pantry, essential daily 250g vegetables & milk.',
  },
  NF_NW: {
    code: 'NF_NW',
    badge: 'NF / NW',
    label: 'Nuclear Family / Newly Wed',
    countRange: '02 Persons',
    memberCountMin: 2,
    icon: '👫',
    bgGradient: 'from-emerald-500 to-teal-600',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    description: 'Balanced daily kitchen basket, morning tea & fresh salads.',
  },
  L: {
    code: 'L',
    badge: 'L',
    label: 'Large Household',
    countRange: '04 Persons',
    memberCountMin: 4,
    icon: '👨‍👩‍👧‍👦',
    bgGradient: 'from-amber-500 to-orange-600',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
    description: 'Daily curries, morning breakfast milk, snacks & variety veggies.',
  },
  XL: {
    code: 'XL',
    badge: 'XL',
    label: 'Extra Large Household',
    countRange: '06 Persons',
    memberCountMin: 6,
    icon: '🏡',
    bgGradient: 'from-purple-500 to-indigo-600',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
    description: 'High volume produce, multi-generation daily kitchen baskets.',
  },
  JF_EF: {
    code: 'JF_EF',
    badge: 'JF / EF',
    label: 'Joint / Extended Family',
    countRange: '08+ Persons',
    memberCountMin: 8,
    icon: '🏰',
    bgGradient: 'from-rose-500 to-pink-600',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-300',
    description: 'Multi-family joint kitchen, wholesale farm-fresh morning drops.',
  },
  FF_FG: {
    code: 'FF_FG',
    badge: 'FF / FG',
    label: 'Family Function / Gathering',
    countRange: '10+ Persons',
    memberCountMin: 10,
    icon: '🎉',
    bgGradient: 'from-amber-400 via-rose-500 to-purple-600',
    textColor: 'text-amber-900',
    borderColor: 'border-amber-400',
    description: 'Special weekend feasts, festival pooja & festive kitchen baskets.',
  },
  P: {
    code: 'P',
    badge: 'P',
    label: 'Party & Celebration Feast',
    countRange: 'Special Event',
    memberCountMin: 15,
    icon: '✨',
    bgGradient: 'from-fuchsia-600 to-pink-600',
    textColor: 'text-fuchsia-800',
    borderColor: 'border-fuchsia-300',
    description: 'Custom celebration volumes & specialized culinary baskets.',
  },
};

/**
 * Computes household size classification from total member count
 */
export function computeHouseholdScale(count: number): HouseholdScaleDefinition {
  if (count <= 1) return HOUSEHOLD_SCALE_DEFINITIONS.S;
  if (count === 2 || count === 3) return HOUSEHOLD_SCALE_DEFINITIONS.NF_NW;
  if (count >= 4 && count <= 5) return HOUSEHOLD_SCALE_DEFINITIONS.L;
  if (count >= 6 && count <= 7) return HOUSEHOLD_SCALE_DEFINITIONS.XL;
  if (count >= 8 && count <= 9) return HOUSEHOLD_SCALE_DEFINITIONS.JF_EF;
  return HOUSEHOLD_SCALE_DEFINITIONS.FF_FG;
}

export type FamilyMember = {
  uid: string;
  full_name: string;
  mobile: string;
  role: FamilyMemberRole;
  classification?: MemberClassification; // 'family' | 'family_support_staff'
  can_order: boolean;
  address_locked: boolean;
  joined_at: string;
  authorized_by?: string;
  is_family_approver?: boolean; // Authority approval for orders/subscription changes for this address
  is_approved?: boolean; // Master single one-time approval for ordering access
  can_use_wallet?: boolean; // false for housemaid, helper, driver, officestaff
  can_use_loyalty?: boolean; // false for housemaid, helper, driver, officestaff
  can_order_daily_subscription_only?: boolean; // true for housemaid, helper, driver, officestaff
  synced_digipin?: string; // Double verification syncing with DIGIPIN
  additional_addresses?: string[]; // Permitted additional addresses once verified by master
  removal_pending?: boolean;
  removal_requested_by?: string;
  removal_reason?: string;
};

export type FamilyGroup = {
  id: string;
  household_name: string;
  household_address: string;
  household_digipin?: string;
  invite_code: string;
  creator_uid: string;
  member_uids?: string[];
  members: FamilyMember[];
  household_scale?: HouseholdSizeType;
  custom_scale_override?: HouseholdSizeType; // e.g. for Party P or Family Function
  created_at: string;
  removal_audit_log?: {
    id: string;
    target_uid: string;
    requested_by_uid: string;
    confirmed_by_target: boolean;
    timestamp: string;
    status: 'pending_target_confirmation' | 'completed' | 'declined';
  }[];
  approver_uid?: string; // UID of the authorized family member who approves orders/subscriptions via SMS/WhatsApp
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

export type CutVegPreference = {
  preparation_type: 'individual' | 'mixed_box' | 'recipe';
  recipe_name?: string;
  cut_size?: 'fine' | 'thin' | 'small_dice' | 'medium_dice' | 'large_dice';
  pack_size?: '200g' | '250g' | '500g';
  box_style?: 'individual_pack' | 'assorted_separated_box';
};

export type OrderItem = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  price?: number;
  cut_preference?: CutVegPreference;
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
  subtotal?: number;
  delivery_charge?: number;
  discount_amount?: number;
  total_amount?: number;
  payment_method?: string;
  undelivered_reason?: 'non_availability_no_instruction' | 'customer_refused' | 'address_unreachable' | 'cancelled_by_customer';
  refund_accounting?: {
    refunded_produce_amount: number;
    discount_accounted_deduction: number;
    delivery_charge_retained: number; // Delivery charge strictly NOT refunded
    net_refund_credited: number;
    refunded_at: string;
    refund_channel: string;
    notes: string;
  };
};

export type UndeliveredIncident = {
  id: string;
  order_id: string;
  customer_phone: string;
  customer_name: string;
  incident_date: string; // ISO string
  quarter_key: string; // e.g. "2026-Q1"
  year_key: string; // e.g. "2026"
  reason: 'non_availability_no_instruction';
  details: string;
};

export type CustomerLienProfile = {
  phone_or_uid: string;
  customer_name: string;
  incidents: UndeliveredIncident[];
  is_cautious_marked: boolean; // Flagged as "be cautious"
  is_in_lien_period: boolean; // Active penalty observation period
  lien_start_date?: string;
  lien_end_date?: string; // 1 year after trigger
  quarterly_incident_counts: Record<string, number>; // e.g. { "2026-Q1": 3 }
  yearly_incident_count: number;
  penalty_delivery_fee_3km: number; // ₹30 for all deliveries irrespective of value within 3km
  penalty_delivery_fee_3_10km: number; // ₹100 for 3-10km
  is_services_cancelled?: boolean; // Cancellation of nextday + subscription services if repeated
  observation_notes: string;
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
  // Vegetables with weight breakdown
  { name: 'Fresh Tomato (ટામેટા)', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 40, available_today: true, display_order: 1 },
  { name: 'Red Onion (ડુંગળી - Immediate Dispatch Only)', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 50, available_today: true, display_order: 2 },
  { name: 'Farm Potato (બટાકા - Immediate Dispatch Only)', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 35, available_today: true, display_order: 3 },
  { name: 'Fresh Methi Leaves (લીલી મેથી - 250g / 500g)', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 60, available_today: true, display_order: 4 },
  { name: 'Green Spinach Palak (તાજી પાલક - 250g / 500g)', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 50, available_today: true, display_order: 5 },
  { name: 'Cabbage Patta Gobi (કોબીજ)', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 35, available_today: true, display_order: 6 },
  { name: 'Cauliflower Phool Gobi (ફ્લાવર)', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 45, available_today: true, display_order: 7 },
  { name: 'Raw Green Banana (કાચા કેળા - શાક માટે)', category: 'vegetable', image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 40, available_today: true, display_order: 8 },

  // Fruits with piece, size, kg weight breakdowns
  { name: 'Robusta Big Banana (મોટા કેળા - 1 Pc / 6 Pcs / 1 Dozen)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', unit: 'dozen', price: 60, available_today: true, display_order: 9 },
  { name: 'Kerala Nendran Banana (કેરાલા કેળા - Per Kg)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 85, available_today: true, display_order: 10 },
  { name: 'Elaichi Small Banana (એલચી કેળા - Per Kg)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 90, available_today: true, display_order: 11 },
  { name: 'Royal Apple Shimla (સફરજન - Medium/Large)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 180, available_today: true, display_order: 12 },
  { name: 'Sweet Orange Mosambi (મોસંબી)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 80, available_today: true, display_order: 13 },
  { name: 'Nagpur Orange (સંતરા)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 95, available_today: true, display_order: 14 },
  { name: 'Fresh Pineapple (અનાનસ - Per Piece / Whole)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80', unit: 'piece', price: 75, available_today: true, display_order: 15 },
  { name: 'Green Kiwi (કીવી - Pack of 3 / Size Grade)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?auto=format&fit=crop&w=600&q=80', unit: 'pack', price: 90, available_today: true, display_order: 16 },
  { name: 'Sweet Chiku Sapota (ચીકુ)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1596450514735-2425897368ce?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 65, available_today: true, display_order: 17 },
  { name: 'Muskmelon Kharbooja (શક્કરટેટી)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 50, available_today: true, display_order: 18 },
  { name: 'Fresh Grapes (દ્રાક્ષ - Green Seedless)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 110, available_today: true, display_order: 19 },
  { name: 'Red Dragon Fruit (ડ્રેગન ફ્રુટ)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=600&q=80', unit: 'piece', price: 95, available_today: true, display_order: 20 },
  { name: 'Ruby Pomegranate (દાડમ - Grade A)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 160, available_today: true, display_order: 21 },
  { name: 'Combo Whole Fruit Harvest Basket (સંપૂર્ણ ફ્રૂટ કોમ્બો - 1.5kg / 2.5kg)', category: 'fruit', image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80', unit: 'kg', price: 240, available_today: true, display_order: 22 },

  // Dairy Pouch & Packet Options with Detailed Description
  { name: 'Desi Cow Milk (A2 ગાયનું દૂધ - 500ml Pouch)', category: 'milk', image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', unit: '500ml pouch', price: 35, available_today: true, display_order: 23 },
  { name: 'Pure Farm Buffalo Milk (ભેંસનું દૂધ - 500ml Pouch)', category: 'milk', image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80', unit: '500ml pouch', price: 38, available_today: true, display_order: 24 },
  { name: 'Fresh Cultured Curd Dahi (તાજું મોળું દહીં - 400g Seal Pack)', category: 'milk', image_url: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=600&q=80', unit: 'pack', price: 40, available_today: true, display_order: 25 },
  { name: 'Traditional Spiced Chaas (મસાલા છાશ - 500ml Pouch)', category: 'milk', image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80', unit: '500ml pouch', price: 18, available_today: true, display_order: 26 },
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
 * Fails closed if the database write is not confirmed.
 */
export async function createOrder(order: Order): Promise<{ id: string }> {
  // If in mock mode, return an explicit mock identifier
  if (isMockModeActive()) {
    const mockId = `MOCK-ORD-${Date.now()}`;
    return { id: mockId };
  }

  // Authoritative Firestore write - MUST throw/fail closed if rejected
  const docRef = await addDoc(collection(db, 'orders'), {
    ...order,
    status: 'new',
    created_at: new Date().toISOString(),
    timestamp: serverTimestamp(),
  });

  if (!docRef?.id) {
    throw new Error('Database write rejected: failed to persist order.');
  }

  const createdId = docRef.id;

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
 * Helper to compute quarter key: e.g. "2026-Q1", "2026-Q2"
 */
export function getQuarterKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 to 11
  const q = Math.floor(month / 3) + 1;
  return `${year}-Q${q}`;
}

/**
 * Fetch or compute Customer Lien Profile & Observation Status:
 * Revised Rules:
 * 1. Standard Delivery Charges:
 *    - ₹0 for <= 3 km radius
 *    - ₹30 for 3 to 10 km radius
 *    - Beyond 10 km: Strictly for Bites only (₹75 by our service for minimum value ₹500)
 * 2. In case of non-availability, no response to calls, and no instructions where to deliver (e.g. next-door):
 *    - The order is returned and an update message is sent to WhatsApp.
 * 3. In case this situation is repeated 3 times in any quarter (even continuously) OR 5 times in a year:
 *    - Possibility of cancellation of next-day + subscription services, even after confirmation of non-repetition after 1 year.
 *    - If customer wishes to continue after initial trouble:
 *      * Penalty delivery charge within 3 km: ₹30 for all deliveries irrespective of value
 *      * Penalty delivery charge for 3 to 10 km: ₹100 for all deliveries
 */
export async function fetchCustomerLienProfile(phoneOrUid: string): Promise<CustomerLienProfile> {
  const cleanKey = phoneOrUid.trim().replace(/\D/g, '') || phoneOrUid.trim();

  let profile: CustomerLienProfile = {
    phone_or_uid: cleanKey,
    customer_name: '',
    incidents: [],
    is_cautious_marked: false,
    is_in_lien_period: false,
    quarterly_incident_counts: {},
    yearly_incident_count: 0,
    penalty_delivery_fee_3km: 30, // ₹30 within 3km for penalty customers
    penalty_delivery_fee_3_10km: 100, // ₹100 for 3-10km for penalty customers
    is_services_cancelled: false,
    observation_notes: '',
  };

  try {
    const snap = await getDoc(doc(db, 'customer_liens', cleanKey));
    if (snap.exists()) {
      profile = { ...profile, ...(snap.data() as CustomerLienProfile) };
    }
  } catch (e) {}

  // Local storage fallback / sync
  try {
    const stored = localStorage.getItem(`jvlsd_lien_${cleanKey}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      profile = { ...profile, ...parsed };
    }
  } catch (e) {}

  // Check if penalty observation period has expired (> 1 year)
  if (profile.is_in_lien_period && profile.lien_end_date) {
    const now = new Date().getTime();
    const expiry = new Date(profile.lien_end_date).getTime();
    if (now > expiry) {
      // 1 year observation completed with non-repetition confirmation
      profile.is_in_lien_period = false;
      profile.observation_notes = '1-Year observation period completed with non-repetition confirmation. Standard delivery rates restored (₹0 within 3km, ₹30 for 3-10km).';
      try {
        localStorage.setItem(`jvlsd_lien_${cleanKey}`, JSON.stringify(profile));
      } catch (e) {}
    }
  }

  return profile;
}

/**
 * Record an undelivered incidence (due to customer non-availability without alternate doorstep instruction)
 */
export async function recordUndeliveredIncident(order: OrderRow, details: string = 'Customer unavailable, no response to call, and no instruction where to deliver.'): Promise<CustomerLienProfile> {
  const cleanKey = (order.mobile || order.user_id || '').trim().replace(/\D/g, '');
  const now = new Date();
  const qKey = getQuarterKey(now);
  const yKey = String(now.getFullYear());

  const currentProfile = await fetchCustomerLienProfile(cleanKey);
  currentProfile.customer_name = order.customer_name || currentProfile.customer_name;

  const newIncident: UndeliveredIncident = {
    id: 'inc_' + Date.now(),
    order_id: order.id,
    customer_phone: order.mobile,
    customer_name: order.customer_name,
    incident_date: now.toISOString(),
    quarter_key: qKey,
    year_key: yKey,
    reason: 'non_availability_no_instruction',
    details,
  };

  const updatedIncidents = [newIncident, ...currentProfile.incidents];
  currentProfile.incidents = updatedIncidents;

  // Recalculate quarterly & yearly counts
  const qCount = updatedIncidents.filter((i) => i.quarter_key === qKey).length;
  const yCount = updatedIncidents.filter((i) => i.year_key === yKey).length;

  currentProfile.quarterly_incident_counts[qKey] = qCount;
  currentProfile.yearly_incident_count = yCount;

  // Always send WhatsApp update on return:
  try {
    await sendSmsWhatsAppAlert({
      recipient_phone: order.mobile,
      channel: 'both',
      type: 'delivery_update',
      title: '📦 Order Returned: Non-Availability & No Delivery Instruction',
      message: `Dear ${order.customer_name || 'Customer'}, your delivery on ${now.toLocaleDateString('en-IN')} could not be completed as you were unavailable with no response to calls and no alternate delivery instructions (e.g. next-door / guard drop) provided. The produce has been safely returned. Please note incident recorded (${qCount}/3 this quarter, ${yCount}/5 annually).`,
      action_target_id: order.id,
      approval_status: 'accepted',
    });
  } catch (e) {}

  // Criteria: repeated 3 times in any quarter (even continuously) OR 5 times in year
  if (qCount >= 3 || yCount >= 5) {
    currentProfile.is_cautious_marked = true;
    currentProfile.is_in_lien_period = true;
    currentProfile.lien_start_date = now.toISOString();
    
    // 1 Year observation period
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    currentProfile.lien_end_date = oneYearLater.toISOString();

    // Cancellation of next-day & subscription services flag
    currentProfile.is_services_cancelled = true;
    currentProfile.penalty_delivery_fee_3km = 30; // ₹30 for all deliveries within 3km
    currentProfile.penalty_delivery_fee_3_10km = 100; // ₹100 for 3-10km
    currentProfile.observation_notes = `Repeated non-availability (Quarterly: ${qCount}/3, Annual: ${yCount}/5). Next-day and subscription services subject to cancellation. Penalty rates apply: ₹30 within 3km, ₹100 for 3-10km upon reactivation.`;

    // Send warning notification via Audio & WhatsApp/SMS
    try {
      await sendSmsWhatsAppAlert({
        recipient_phone: order.mobile,
        channel: 'both',
        type: 'subscription_change',
        title: '⚠️ REPEATED UNDELIVERED INCIDENCE NOTICE',
        message: `Important Notice for ${order.customer_name}: Undelivered incidences reached ${qCount} times this quarter (${yCount} annually). As per store policy, your next-day pre-order and subscription services are placed on hold/cancellation. To continue service after non-repetition confirmation, penalty delivery charges apply: ₹30 for all deliveries within 3km, and ₹100 for 3-10km.`,
        action_target_id: order.id,
        approval_status: 'accepted',
      });
    } catch (e) {}
  } else {
    currentProfile.observation_notes = `${qCount} of 3 quarterly incidents recorded (${yCount} annual). Order returned with WhatsApp notification.`;
  }

  // Persist in Firestore & Local storage
  try {
    await setDoc(doc(db, 'customer_liens', cleanKey), currentProfile, { merge: true });
  } catch (e) {}

  try {
    localStorage.setItem(`jvlsd_lien_${cleanKey}`, JSON.stringify(currentProfile));
  } catch (e) {}

  return currentProfile;
}

/**
 * Cancel Order with Refund Accounting:
 * Rule:
 * 1. Discount amount refund accounted on order cancellation.
 * 2. Delivery charge is strictly NOT refunded if collected.
 */
export async function cancelOrderWithAccounting(
  orderId: string,
  cancelledBy: string = 'customer',
  reason: string = 'Order cancelled by customer'
): Promise<OrderRow['refund_accounting']> {
  playAudioAlert();

  let orderSnap: any = null;
  let orderData: OrderRow | null = null;

  try {
    orderSnap = await getDoc(doc(db, 'orders', orderId));
    if (orderSnap.exists()) {
      orderData = { id: orderSnap.id, ...(orderSnap.data() as Omit<OrderRow, 'id'>) };
    }
  } catch (e) {}

  // Local fallback
  if (!orderData) {
    try {
      const list: OrderRow[] = JSON.parse(localStorage.getItem('jvlsd_completed_orders') || '[]');
      const found = list.find((o) => o.id === orderId);
      if (found) orderData = found;
    } catch (e) {}
  }

  const produceTotal = orderData?.subtotal || (orderData?.items ? orderData.items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0) : (orderData?.total_amount || 0));
  const discountGiven = orderData?.discount_amount || 0;
  const deliveryCharge = orderData?.delivery_charge || 0; // Strictly NOT refunded

  // Refund calculation:
  // Net refund to wallet/original mode = Produce amount - discount accounted deduction.
  // Delivery fee remains with the logistics partner / platform.
  const netRefund = Math.max(0, (produceTotal - discountGiven));

  const refundRecord: NonNullable<OrderRow['refund_accounting']> = {
    refunded_produce_amount: produceTotal,
    discount_accounted_deduction: discountGiven,
    delivery_charge_retained: deliveryCharge,
    net_refund_credited: netRefund,
    refunded_at: new Date().toISOString(),
    refund_channel: 'Prepaid Wallet / Source Account',
    notes: `Refund processed: ₹${produceTotal} produce less ₹${discountGiven} discount adjustment. Delivery charge of ₹${deliveryCharge} is strictly non-refundable. Net credited: ₹${netRefund}.`,
  };

  // Update order in Firestore
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'cancelled',
      refund_accounting: refundRecord,
      undelivered_reason: 'cancelled_by_customer',
    });
  } catch (e) {}

  // Update local storage
  try {
    const list: OrderRow[] = JSON.parse(localStorage.getItem('jvlsd_completed_orders') || '[]');
    const updated = list.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' as const, refund_accounting: refundRecord } : o));
    localStorage.setItem('jvlsd_completed_orders', JSON.stringify(updated));
  } catch (e) {}

  // Credit wallet if member has wallet
  if (orderData?.user_id && netRefund > 0) {
    try {
      await reloadUserWallet(orderData.user_id, netRefund, `Refund for cancelled order #${orderId.slice(-6)} (Delivery fee of ₹${deliveryCharge} retained)`);
    } catch (e) {}
  }

  // Send WhatsApp / SMS Confirmation of Cancellation & Non-Refunded Delivery Charge
  if (orderData?.mobile) {
    try {
      await sendSmsWhatsAppAlert({
        recipient_phone: orderData.mobile,
        channel: 'both',
        type: 'subscription_change',
        title: 'Order Cancellation & Refund Settlement',
        message: `Namaste ${orderData.customer_name}. Order #${orderId.slice(-6)} has been cancelled. Net produce refund of ₹${netRefund} (accounting for applied discount) has been processed. Note: As per policy, delivery charge of ₹${deliveryCharge} is retained and non-refundable.`,
        action_target_id: orderId,
        approval_status: 'accepted',
      });
    } catch (e) {}
  }

  return refundRecord;
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
export async function createManagedUser(input: {
  email: string;
  full_name: string;
  role: Profile['role'];
  assigned_stores?: string[];
  can_manage_discount_toggles?: boolean;
  can_manage_subscription_scheme?: boolean;
}): Promise<void> {
  const docId = input.email.replace(/[^a-zA-Z0-9]/g, '_');
  const ref = doc(db, 'profiles', docId);

  const payload: Partial<Profile> & { created_at: string } = {
    email: input.email,
    full_name: input.full_name,
    role: input.role,
    assigned_stores: input.assigned_stores || [],
    can_manage_discount_toggles: !!input.can_manage_discount_toggles,
    can_manage_subscription_scheme: !!input.can_manage_subscription_scheme,
    created_at: new Date().toISOString(),
  };

  try {
    await setDoc(ref, payload, { merge: true });
  } catch (fsErr: any) {
    console.warn('Firestore write permission notice:', fsErr?.message || fsErr);
  }

  // Persist locally for immediate availability and mock mode
  try {
    const list: Profile[] = JSON.parse(localStorage.getItem('jvlsd_managed_profiles') || '[]');
    const filtered = list.filter((p) => p.email.toLowerCase() !== input.email.toLowerCase());
    const newProf: Profile = {
      id: docId,
      email: input.email,
      full_name: input.full_name,
      role: input.role,
      assigned_stores: input.assigned_stores || [],
      can_manage_discount_toggles: !!input.can_manage_discount_toggles,
      can_manage_subscription_scheme: !!input.can_manage_subscription_scheme,
    };
    localStorage.setItem('jvlsd_managed_profiles', JSON.stringify([newProf, ...filtered]));
  } catch (e) {}
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

  // Include locally managed/provisioned profiles if not already present
  try {
    const localManaged: Profile[] = JSON.parse(localStorage.getItem('jvlsd_managed_profiles') || '[]');
    for (const lm of localManaged) {
      if (!list.some((p) => p.email.toLowerCase() === lm.email.toLowerCase())) {
        list.push(lm);
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
}

/**
 * Family Groups: Create or Join Family Group
 */
export async function createFamilyGroup(
  creator: { uid: string; name: string; mobile: string },
  householdName: string,
  householdAddress: string,
  householdDigipin?: string
): Promise<FamilyGroup> {
  const code = 'FAM-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  const group: FamilyGroup & { member_uids: string[] } = {
    id: 'grp_' + Date.now(),
    household_name: householdName,
    household_address: householdAddress,
    household_digipin: householdDigipin,
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
        is_approved: true,
        can_use_wallet: true,
        can_use_loyalty: true,
        can_order_daily_subscription_only: false,
        synced_digipin: householdDigipin,
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
  user: { uid: string; name: string; mobile: string; address?: string; digipin?: string },
  code: string,
  role: FamilyMemberRole = 'family_member'
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
    const isDomesticOrStaff = ['housemaid', 'helper', 'driver', 'caretaker', 'personal_security', 'family_manager', 'officestaff', 'domestic_help'].includes(role);
    const isOwnerOrDirectFamily = role === 'family_member' || role === 'owner';
    const classification: MemberClassification = isDomesticOrStaff ? 'family_support_staff' : 'family';

    // Backend verification: syncing with DIGIPIN for double verification
    const verifiedDigipin = user.digipin || targetGroup.household_digipin;

    const newMember: FamilyMember = {
      uid: user.uid,
      full_name: user.name,
      mobile: user.mobile,
      role,
      classification,
      // If direct family, ordering is approved; if domestic help/driver/staff, master must approve once
      is_approved: isOwnerOrDirectFamily,
      can_order: isOwnerOrDirectFamily,
      address_locked: isDomesticOrStaff,
      joined_at: new Date().toISOString(),
      authorized_by: targetGroup.creator_uid,
      // Rule: housemaid, helper, driver, officestaff have NO access to family wallet or loyalty points
      can_use_wallet: !isDomesticOrStaff,
      can_use_loyalty: !isDomesticOrStaff,
      // Rule: domestic staff can only place daily subscription orders for the family
      can_order_daily_subscription_only: isDomesticOrStaff,
      synced_digipin: verifiedDigipin,
      additional_addresses: [],
    };
    targetGroup.members.push(newMember);

    // Recalculate household scale
    targetGroup.household_scale = computeHouseholdScale(targetGroup.members.length).code;
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
 * Master One-Time Approval for Family / Domestic Staff
 */
export async function approveFamilyMemberOrdering(
  groupId: string,
  targetMemberUid: string,
  approved: boolean,
  allowAdditionalAddress?: string
): Promise<FamilyGroup | null> {
  const group = await fetchFamilyGroup(groupId);
  if (!group) return null;

  const member = group.members.find((m) => m.uid === targetMemberUid);
  if (member) {
    member.is_approved = approved;
    member.can_order = approved;
    if (allowAdditionalAddress) {
      member.additional_addresses = Array.from(new Set([...(member.additional_addresses || []), allowAdditionalAddress]));
    }
  }

  try {
    await updateDoc(doc(db, 'family_groups', groupId), { members: group.members });
  } catch (e) {
    console.warn('approveFamilyMemberOrdering notice:', e);
  }

  try {
    const list: FamilyGroup[] = JSON.parse(localStorage.getItem('jvlsd_family_groups') || '[]');
    const updated = list.map((g) => (g.id === groupId ? group : g));
    localStorage.setItem('jvlsd_family_groups', JSON.stringify(updated));
  } catch (e) {}

  return group;
}

/**
 * Add Member Directly by Household Owner (with Mobile, Role, and DIGIPIN verification)
 */
export async function addFamilyMemberDirectly(
  groupId: string,
  memberData: {
    fullName: string;
    mobile: string;
    role: FamilyMemberRole;
    additionalAddress?: string;
  }
): Promise<FamilyGroup | null> {
  const group = await fetchFamilyGroup(groupId);
  if (!group) return null;

  const isDomesticOrStaff = ['housemaid', 'helper', 'driver', 'caretaker', 'personal_security', 'family_manager', 'officestaff', 'domestic_help'].includes(memberData.role);
  const classification: MemberClassification = isDomesticOrStaff ? 'family_support_staff' : 'family';
  const tempUid = 'mem_' + memberData.mobile.replace(/\D/g, '') || `mem_${Date.now()}`;

  const newMember: FamilyMember = {
    uid: tempUid,
    full_name: memberData.fullName.toUpperCase(),
    mobile: memberData.mobile.replace(/\D/g, ''),
    role: memberData.role,
    classification,
    joined_at: new Date().toISOString(),
    is_approved: true, // directly approved since added by master
    can_order: true,
    address_locked: isDomesticOrStaff,
    authorized_by: group.creator_uid,
    can_use_wallet: !isDomesticOrStaff,
    can_use_loyalty: !isDomesticOrStaff,
    can_order_daily_subscription_only: isDomesticOrStaff,
    synced_digipin: group.household_digipin,
    additional_addresses: memberData.additionalAddress ? [memberData.additionalAddress.toUpperCase()] : [],
  };

  // Remove existing if duplicate mobile
  group.members = group.members.filter((m) => m.mobile !== newMember.mobile);
  group.members.push(newMember);

  // Recalculate household scale
  group.household_scale = computeHouseholdScale(group.members.length).code;

  try {
    await updateDoc(doc(db, 'family_groups', groupId), { members: group.members });
  } catch (e) {
    console.warn('addFamilyMemberDirectly notice:', e);
  }

  try {
    const list: FamilyGroup[] = JSON.parse(localStorage.getItem('jvlsd_family_groups') || '[]');
    const updated = list.map((g) => (g.id === groupId ? group : g));
    localStorage.setItem('jvlsd_family_groups', JSON.stringify(updated));
  } catch (e) {}

  return group;
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
  isInitialLoadOrDescription?: boolean | string,
  customDescription?: string
): Promise<number> {
  const current = await fetchUserFinancials(userId);

  const isInitialLoad = typeof isInitialLoadOrDescription === 'boolean' ? isInitialLoadOrDescription : false;
  const descriptionText = typeof isInitialLoadOrDescription === 'string'
    ? isInitialLoadOrDescription
    : customDescription || `Prepaid wallet reload (+₹${amount})`;

  // If this is a refund, skip minimum load constraints
  const isRefund = descriptionText.toLowerCase().includes('refund');

  if (!isRefund) {
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
  }

  const newBalance = current.walletBalance + amount;
  const newEntry: WalletLedgerEntry = {
    id: 'tx_' + Date.now(),
    user_id: userId,
    type: isRefund ? 'refund' : 'reload',
    amount,
    description: descriptionText,
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

  // Check if member has an active subscription in user_financials
  let isSubscribed = false; // Must strictly be verified as active
  try {
    const snap = await getDoc(doc(db, 'user_financials', memberId));
    if (snap.exists()) {
      const fin = snap.data();
      if (fin.subscription_status === 'active') {
        isSubscribed = true;
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

/* =========================================================================
   System Configuration: 20% Discount Rules, Subscription Schemes & Alerts
   Controlled by Super Admin / Admin (with permission delegation to store operators)
   ========================================================================= */

export type StoreLocation = {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  pincodes: string[];
  operator_name?: string;
  operator_phone?: string;
  operator_email?: string;
  active: boolean;
  is_first_unit?: boolean; // Flag for JVLSD-FD 1st Unit / Central Hub
  opened_date?: string;
};

export type FranchiseeFinancialPeriod = {
  period_key: string; // e.g. "2026-11", "2026-Q4"
  store_id: string;
  store_name: string;
  city: string;
  state: string;
  operator_name: string;
  total_orders: number;
  gross_revenue: number; // Total customer order billing
  cost_of_produce_goods: number; // Wholesale procurement cost (~65%)
  packaging_and_logistics_expense: number; // Cold chain, cut boxes, delivery (~10%)
  operating_expenses: number; // Local store overhead, utilities (~5%)
  total_expenses: number;
  net_profit: number; // Gross Revenue - Total Expenses
  jvlsd_parent_share_60: number; // 60% portion to JVLSD-FD 1st Unit
  unit_operator_share_40: number; // 40% portion with person running the unit
  settlement_status: 'pending' | 'settled' | 'processing';
  settled_at?: string;
};

export const AVAILABLE_STORES: StoreLocation[] = [
  // Primary City: Ahmedabad, Gujarat (Replicable Foundation)
  {
    id: 'store_navrangpura',
    name: 'Navrangpura Central Hub (1st Unit)',
    code: 'NAV-01',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincodes: ['380009', '380014', '380006'],
    operator_name: 'JVLSD-FD Central Operations',
    operator_phone: '9825112233',
    operator_email: 'navrangpura@jvlsd.in',
    active: true,
    is_first_unit: true,
    opened_date: '2025-01-01',
  },
  {
    id: 'store_memnagar',
    name: 'Memnagar / Gurukul Store',
    code: 'MEM-02',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincodes: ['380052'],
    operator_name: 'Rajesh Shah (Franchisee Partner)',
    operator_phone: '9898123456',
    operator_email: 'memnagar@jvlsd.in',
    active: true,
    is_first_unit: false,
    opened_date: '2025-03-15',
  },
  {
    id: 'store_thaltej',
    name: 'Thaltej & Drive-In Store',
    code: 'THA-03',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincodes: ['380054'],
    operator_name: 'Pooja Patel (Franchisee Partner)',
    operator_phone: '9879234567',
    operator_email: 'thaltej@jvlsd.in',
    active: true,
    is_first_unit: false,
    opened_date: '2025-06-01',
  },
  {
    id: 'store_bodakdev',
    name: 'Bodakdev / SG Highway Store',
    code: 'BDK-04',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincodes: ['380051'],
    operator_name: 'Amit Dave (Franchisee Partner)',
    operator_phone: '9824345678',
    operator_email: 'bodakdev@jvlsd.in',
    active: true,
    is_first_unit: false,
    opened_date: '2025-09-10',
  },
  {
    id: 'store_vadaj',
    name: 'Vadaj / Ashram Road Store',
    code: 'VDJ-05',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincodes: ['380013'],
    operator_name: 'Ketan Trivedi (Franchisee Partner)',
    operator_phone: '9825456789',
    operator_email: 'vadaj@jvlsd.in',
    active: true,
    is_first_unit: false,
    opened_date: '2025-11-20',
  },

  // Expansion Tier 1: Multiple Cities in Same State (Gujarat Replication)
  {
    id: 'store_surat_vesu',
    name: 'Surat Vesu & VIP Road Unit',
    code: 'SUR-01',
    city: 'Surat',
    state: 'Gujarat',
    pincodes: ['395007', '395009'],
    operator_name: 'Hitesh Jariwala (Franchisee Partner)',
    operator_phone: '9825098765',
    operator_email: 'surat@jvlsd.in',
    active: true,
    is_first_unit: false,
    opened_date: '2026-02-01',
  },
  {
    id: 'store_vadodara_alkapuri',
    name: 'Vadodara Alkapuri & Old Padra Unit',
    code: 'BRD-01',
    city: 'Vadodara',
    state: 'Gujarat',
    pincodes: ['390007', '390020'],
    operator_name: 'Nilesh Amin (Franchisee Partner)',
    operator_phone: '9825123987',
    operator_email: 'vadodara@jvlsd.in',
    active: true,
    is_first_unit: false,
    opened_date: '2026-04-15',
  },
  {
    id: 'store_rajkot_kalawad',
    name: 'Rajkot Kalawad Road Unit',
    code: 'RAJ-01',
    city: 'Rajkot',
    state: 'Gujarat',
    pincodes: ['360005', '360001'],
    operator_name: 'Bhavin Vora (Franchisee Partner)',
    operator_phone: '9825345123',
    operator_email: 'rajkot@jvlsd.in',
    active: true,
    is_first_unit: false,
    opened_date: '2026-07-01',
  },

  // Expansion Tier 2: Multiple States Pan-India Replication Blueprint
  {
    id: 'store_mumbai_bandra',
    name: 'Mumbai Bandra West Unit',
    code: 'MUM-01',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincodes: ['400050', '400052'],
    operator_name: 'Sunita Mehra (Franchisee Partner)',
    operator_phone: '9820112244',
    operator_email: 'mumbai@jvlsd.in',
    active: true,
    is_first_unit: false,
    opened_date: '2026-09-01',
  },
  {
    id: 'store_pune_kothrud',
    name: 'Pune Kothrud & Baner Unit',
    code: 'PUN-01',
    city: 'Pune',
    state: 'Maharashtra',
    pincodes: ['411038', '411045'],
    operator_name: 'Vikram Deshmukh (Franchisee Partner)',
    operator_phone: '9822334455',
    operator_email: 'pune@jvlsd.in',
    active: true,
    is_first_unit: false,
    opened_date: '2026-10-15',
  },
  {
    id: 'store_bengaluru_indiranagar',
    name: 'Bengaluru Indiranagar & Koramangala Unit',
    code: 'BLR-01',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincodes: ['560038', '560034'],
    operator_name: 'Arjun Rao (Franchisee Partner)',
    operator_phone: '9845012345',
    operator_email: 'bengaluru@jvlsd.in',
    active: true,
    is_first_unit: false,
    opened_date: '2026-11-01',
  },
];

/**
 * Fetch list of all managed stores across cities/states
 */
export async function fetchAllManagedStores(): Promise<StoreLocation[]> {
  try {
    const snap = await getDocs(collection(db, 'stores'));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StoreLocation, 'id'>) }));
    }
  } catch (e) {}

  try {
    const local = localStorage.getItem('jvlsd_managed_stores');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return AVAILABLE_STORES;
}

/**
 * Super Admin: Provision or Update a Franchisee Store Unit
 */
export async function saveManagedStore(store: StoreLocation): Promise<void> {
  try {
    await setDoc(doc(db, 'stores', store.id), store, { merge: true });
  } catch (e) {
    console.warn('Firestore saveManagedStore notice:', e);
  }

  try {
    const current = await fetchAllManagedStores();
    const filtered = current.filter((s) => s.id !== store.id);
    const updated = [store, ...filtered];
    localStorage.setItem('jvlsd_managed_stores', JSON.stringify(updated));
  } catch (e) {}
}

/**
 * Multi-Franchisee 60% / 40% Net Profit Share Accounting Engine
 * Business Plan Rule:
 * - Each online store unit operates as an independent Revenue - Cost - Profit Center.
 * - Replicated across multiple pincodes, multiple cities in same state, and multiple states Pan-India.
 * - Net Profit Share:
 *   * 60% portion to JVLSD-FD 1st Unit (Parent / Central Entity)
 *   * 40% portion to Person running the Franchisee Unit (Store Operator)
 */
export function calculateFranchiseeUnitPnL(
  store: StoreLocation,
  orders: OrderRow[],
  periodKey: string = 'All-Time'
): FranchiseeFinancialPeriod {
  // Filter orders mapped to this store's pincodes or explicit assigned store
  const unitOrders = orders.filter((o) => {
    if (o.status === 'cancelled') return false;
    const pin = o.pincode || (o.address.match(/\b(380\d{3}|395\d{3}|390\d{3}|360\d{3}|400\d{3}|411\d{3}|560\d{3})\b/) || [])[1];
    if (pin && store.pincodes.includes(pin)) return true;
    if (store.id === 'store_navrangpura') {
      // Primary default hub for unassigned or central orders
      return true;
    }
    return false;
  });

  const grossRevenue = unitOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  // Accounting Cost Centers (Standardized retail produce execution benchmarks):
  // 1. Direct Wholesale Farm Procurement Cost: 62% of gross revenue
  const costOfProduce = Math.round(grossRevenue * 0.62 * 100) / 100;

  // 2. Packaging, Cold-Chain & Local Dispatch: 11% of gross revenue
  const packagingAndLogistics = Math.round(grossRevenue * 0.11 * 100) / 100;

  // 3. Local Store Operational Overhead (electricity, sanitization, tech handling): 7% of gross revenue
  const operatingExpenses = Math.round(grossRevenue * 0.07 * 100) / 100;

  const totalExpenses = Math.round((costOfProduce + packagingAndLogistics + operatingExpenses) * 100) / 100;
  const netProfit = Math.max(0, Math.round((grossRevenue - totalExpenses) * 100) / 100);

  // 60% to JVLSD-FD 1st Unit / 40% to Unit Operator
  const jvlsdShare60 = Math.round(netProfit * 0.60 * 100) / 100;
  const operatorShare40 = Math.round(netProfit * 0.40 * 100) / 100;

  return {
    period_key: periodKey,
    store_id: store.id,
    store_name: store.name,
    city: store.city,
    state: store.state,
    operator_name: store.operator_name || 'Unit Franchisee Partner',
    total_orders: unitOrders.length,
    gross_revenue: grossRevenue,
    cost_of_produce_goods: costOfProduce,
    packaging_and_logistics_expense: packagingAndLogistics,
    operating_expenses: operatingExpenses,
    total_expenses: totalExpenses,
    net_profit: netProfit,
    jvlsd_parent_share_60: jvlsdShare60,
    unit_operator_share_40: operatorShare40,
    settlement_status: 'pending',
  };
}

export type SystemDiscountConfig = {
  // Master switch for all stores or individual store toggle
  master_discount_switch: boolean;
  // Store-specific activation map (store_id -> boolean)
  store_discount_activation: Record<string, boolean>;

  // Condition 1: 20% discount on 1st purchase ₹500+ every month, which then unlocks 20% for smaller ₹100+ purchases any time in month
  require_first_purchase_500_for_100_tier: boolean;

  // Condition 2: 20% discount for smaller ₹100+ purchases allowed ONLY if customer has made less than 3 smaller ₹100+ purchases in month
  limit_smaller_100_purchases_to_under_3: boolean;

  // Subscription Scheme toggle & settings
  subscription_scheme_active: boolean;
  store_subscription_activation: Record<string, boolean>;
  subscription_additional_discount_percent: number; // default 2%
};

export const DEFAULT_DISCOUNT_CONFIG: SystemDiscountConfig = {
  master_discount_switch: true,
  store_discount_activation: {
    store_navrangpura: true,
    store_memnagar: true,
    store_thaltej: true,
    store_bodakdev: true,
    store_vadaj: true,
  },
  require_first_purchase_500_for_100_tier: true,
  limit_smaller_100_purchases_to_under_3: true,
  subscription_scheme_active: true,
  store_subscription_activation: {
    store_navrangpura: true,
    store_memnagar: true,
    store_thaltej: true,
    store_bodakdev: true,
    store_vadaj: true,
  },
  subscription_additional_discount_percent: 2,
};

export async function fetchSystemDiscountConfig(): Promise<SystemDiscountConfig> {
  try {
    const snap = await getDoc(doc(db, 'system_config', 'discount_rules'));
    if (snap.exists()) {
      return { ...DEFAULT_DISCOUNT_CONFIG, ...(snap.data() as Partial<SystemDiscountConfig>) };
    }
  } catch (e) {
    console.warn('Firestore fetchSystemDiscountConfig notice:', e);
  }
  try {
    const local = localStorage.getItem('jvlsd_system_discount_config');
    if (local) return { ...DEFAULT_DISCOUNT_CONFIG, ...JSON.parse(local) };
  } catch (e) {}
  return DEFAULT_DISCOUNT_CONFIG;
}

export async function updateSystemDiscountConfig(config: Partial<SystemDiscountConfig>): Promise<void> {
  try {
    await setDoc(doc(db, 'system_config', 'discount_rules'), config, { merge: true });
  } catch (e) {
    console.warn('Firestore updateSystemDiscountConfig notice:', e);
  }
  try {
    const current = await fetchSystemDiscountConfig();
    const updated = { ...current, ...config };
    localStorage.setItem('jvlsd_system_discount_config', JSON.stringify(updated));
  } catch (e) {}
}

/* =========================================================================
   Subscription Scheme: Frequency, Items by weight/count, Pause/Resume & Extensions
   ========================================================================= */

export type SubscriptionFrequency = 'daily' | 'alternate' | 'weekly' | 'biweekly' | 'monthly';

export type SubscriptionItem = {
  id: string;
  name: string;
  category: 'vegetable' | 'fruit' | 'milk';
  unit: string;
  quantity: number;
  by_weight_or_count: string; // e.g. "500g", "1kg", "6 pieces", "1 dozen", "500ml pouch"
  price: number;
};

export type CustomerSubscription = {
  id: string;
  user_id: string;
  customer_name: string;
  mobile: string;
  address: string;
  pincode?: string;
  digipin?: string;
  family_group_id?: string;
  frequency: SubscriptionFrequency;
  items: SubscriptionItem[];
  status: 'active' | 'paused' | 'cancelled' | 'pending_family_approval';
  start_date: string;
  paused_until?: string; // date string if paused for a day, few days, or month
  extended_until?: string; // extension end date
  created_at: string;
  updated_at: string;
  additional_discount_percent: number; // 2%
  // Approval metadata
  approval_status?: 'approved' | 'pending' | 'rejected';
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
};

export async function fetchCustomerSubscription(userId: string): Promise<CustomerSubscription | null> {
  try {
    const snap = await getDocs(query(collection(db, 'subscriptions'), where('user_id', '==', userId)));
    if (!snap.empty) {
      const docData = snap.docs[0].data() as CustomerSubscription;
      return { ...docData, id: snap.docs[0].id };
    }
  } catch (e) {
    console.warn('Firestore fetchCustomerSubscription notice:', e);
  }
  try {
    const list: CustomerSubscription[] = JSON.parse(localStorage.getItem('jvlsd_customer_subscriptions') || '[]');
    const found = list.find((s) => s.user_id === userId);
    if (found) return found;
  } catch (e) {}
  return null;
}

export async function saveCustomerSubscription(sub: CustomerSubscription): Promise<void> {
  try {
    await setDoc(doc(db, 'subscriptions', sub.id), sub, { merge: true });
  } catch (e) {
    console.warn('Firestore saveCustomerSubscription notice:', e);
  }
  try {
    const list: CustomerSubscription[] = JSON.parse(localStorage.getItem('jvlsd_customer_subscriptions') || '[]');
    const filtered = list.filter((s) => s.id !== sub.id);
    localStorage.setItem('jvlsd_customer_subscriptions', JSON.stringify([sub, ...filtered]));
  } catch (e) {}
}

/* =========================================================================
   Audio & SMS / WhatsApp Alert Notification Trigger
   Plays chime audio + generates SMS/WhatsApp verification message with approval link
   ========================================================================= */

export function playAudioAlert() {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Pleasant double chime: 523.25Hz (C5) -> 659.25Hz (E5)
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.log('Audio alert fallback/skipped:', e);
  }
}

export type AlertLog = {
  id: string;
  timestamp: string;
  recipient_phone: string;
  channel: 'sms' | 'whatsapp' | 'both';
  type:
    | 'subscription_change'
    | 'pause'
    | 'resume'
    | 'extend'
    | 'family_approval_request'
    | 'approval_confirmed'
    | 'approval_rejected'
    | 'delivery_update';
  title: string;
  message: string;
  approval_status?: 'pending' | 'accepted' | 'rejected';
  action_target_id?: string;
  decided_by?: string;
  decided_at?: string;
};

export async function sendSmsWhatsAppAlert(alert: Omit<AlertLog, 'id' | 'timestamp'>): Promise<AlertLog> {
  const fullAlert: AlertLog = {
    ...alert,
    id: `ALT_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  // Play audio alert instantly for user awareness
  playAudioAlert();

  // Save to alert audit log in Firestore & local storage
  try {
    await setDoc(doc(db, 'notification_alerts', fullAlert.id), fullAlert);
  } catch (e) {
    console.warn('Firestore sendSmsWhatsAppAlert notice:', e);
  }
  try {
    const list: AlertLog[] = JSON.parse(localStorage.getItem('jvlsd_notification_alerts') || '[]');
    localStorage.setItem('jvlsd_notification_alerts', JSON.stringify([fullAlert, ...list]));
  } catch (e) {}

  return fullAlert;
}

export async function fetchNotificationAlerts(recipientPhone?: string): Promise<AlertLog[]> {
  try {
    let q = query(collection(db, 'notification_alerts'), orderBy('timestamp', 'desc'));
    if (recipientPhone) {
      q = query(collection(db, 'notification_alerts'), where('recipient_phone', '==', recipientPhone));
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as AlertLog);
    }
  } catch (e) {}
  try {
    const list: AlertLog[] = JSON.parse(localStorage.getItem('jvlsd_notification_alerts') || '[]');
    if (recipientPhone) {
      return list.filter((a) => a.recipient_phone === recipientPhone);
    }
    return list;
  } catch (e) {
    return [];
  }
}

export async function updateAlertApprovalStatus(
  alertId: string,
  decision: 'accepted' | 'rejected',
  approverName: string
): Promise<void> {
  playAudioAlert();
  try {
    await updateDoc(doc(db, 'notification_alerts', alertId), {
      approval_status: decision,
      decided_by: approverName,
      decided_at: new Date().toISOString(),
    });
  } catch (e) {}
  try {
    const list: AlertLog[] = JSON.parse(localStorage.getItem('jvlsd_notification_alerts') || '[]');
    const updated = list.map((a) => (a.id === alertId ? { ...a, approval_status: decision } : a));
    localStorage.setItem('jvlsd_notification_alerts', JSON.stringify(updated));
  } catch (e) {}
}
