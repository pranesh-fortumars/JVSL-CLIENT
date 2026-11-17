/**
 * Comprehensive Mock Data Simulation for JVLSD-FD Experience Mode
 * Enables Super Admin and Reviewers to explore all features, tabs, charts,
 * morning packing sheets, surveys, customer accounts, and order flows.
 */

import type { OrderRow, SurveyRow, EnquiryRow, Profile } from './firestoreService';

const MOCK_STORAGE_KEY = 'jvlsd_mock_data_mode';

export function isMockModeActive(): boolean {
  try {
    return localStorage.getItem(MOCK_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setMockModeActive(active: boolean): void {
  try {
    if (active) {
      localStorage.setItem(MOCK_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(MOCK_STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent('jvlsd:mock_mode_changed', { detail: { active } }));
  } catch {
    // ignore
  }
}

export const MOCK_ORDERS: OrderRow[] = [
  {
    id: 'MOCK-ORD-101',
    customer_name: 'Dr. Anand K. Vora',
    mobile: '9825012345',
    address: 'B-402, Shivalik Yash Greens, 132ft Ring Road, Satellite, Ahmedabad, Gujarat 380015 (DIGIPIN: GJ-380-SAT-402)',
    mode: 'next_day',
    status: 'new',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    expected_delivery: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: 'Please pack Methi leaves in dry aerated pouch. Deliver before 7:30 AM.',
    user_id: 'mock-user-1',
    items: [
      { id: 'potato', name: 'Potato - Aloo (બટાકા)', quantity: 2, unit: 'kg' },
      { id: 'onion', name: 'Onion - Pyaaz (ડુંગળી)', quantity: 2, unit: 'kg' },
      { id: 'tomato', name: 'Tomato - Tamatar (ટામેટા)', quantity: 1.5, unit: 'kg' },
      { id: 'methi', name: 'Methi Leaves (મેથી)', quantity: 500, unit: 'g' },
      { id: 'cow-milk', name: 'Desi A2 Gir Cow Milk (તાજું ગાયનું દૂધ)', quantity: 2, unit: 'L' },
    ],
  },
  {
    id: 'MOCK-ORD-102',
    customer_name: 'Bhavna Ben Patel',
    mobile: '9898023456',
    address: 'Flat 6A, Parshwanath Towers, Subhash Chowk, Memnagar, Ahmedabad 380052',
    mode: 'same_day',
    status: 'confirmed',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expected_delivery: new Date().toISOString().slice(0, 10),
    notes: 'Same-day morning emergency dispatch within 3km radius.',
    user_id: 'mock-user-2',
    items: [
      { id: 'coriander', name: 'Fresh Coriander (ધાણા / કોથમરી)', quantity: 250, unit: 'g' },
      { id: 'ginger', name: 'Fresh Ginger (આદુ)', quantity: 250, unit: 'g' },
      { id: 'green-chilli', name: 'Green Chilli (લીલા મરચાં)', quantity: 250, unit: 'g' },
      { id: 'lemon', name: 'Fresh Lemon - Nimbu (લીંબુ)', quantity: 500, unit: 'g' },
    ],
  },
  {
    id: 'MOCK-ORD-103',
    customer_name: 'Rajeshbhai Mehta (Joint Family)',
    mobile: '9712345678',
    address: 'Bungalow 12, Vrindavan Bungalows, Bodakdev, Ahmedabad 380054 (DIGIPIN: GJ-380-BDK-012)',
    mode: 'next_day',
    status: 'confirmed',
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    expected_delivery: new Date().toISOString().slice(0, 10),
    notes: 'Gate guard has instructions to accept morning milk crate directly.',
    user_id: 'mock-user-3',
    items: [
      { id: 'buffalo-milk', name: 'Fresh Pure Buffalo Milk (ભેંસનું દૂધ)', quantity: 3, unit: 'L' },
      { id: 'palak', name: 'Palak Spinach (પાલક)', quantity: 1, unit: 'kg' },
      { id: 'cauliflower', name: 'Cauliflower (ફૂલકોબી)', quantity: 1, unit: 'kg' },
      { id: 'carrot', name: 'Desi Red Carrots (ગાજર)', quantity: 1.5, unit: 'kg' },
      { id: 'apple-shimla', name: 'Crisp Royal Apples (સફરજન)', quantity: 1, unit: 'kg' },
    ],
  },
  {
    id: 'MOCK-ORD-104',
    customer_name: 'Meera Trivedi',
    mobile: '9426098765',
    address: 'C-701, Safal Parisar, South Bopal, Ahmedabad 380058',
    mode: 'next_day',
    status: 'delivered',
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    expected_delivery: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: 'Delivered successfully at doorstep milk hook with ₹300 LSD promo applied.',
    user_id: 'mock-user-4',
    items: [
      { id: 'cow-milk', name: 'Desi A2 Gir Cow Milk (તાજું ગાયનું દૂધ)', quantity: 1.5, unit: 'L' },
      { id: 'banana', name: 'Robusta Banana (કેળાં)', quantity: 1, unit: 'dozen' },
      { id: 'cucumber', name: 'Desi Cucumber (કાકડી)', quantity: 750, unit: 'g' },
    ],
  },
  {
    id: 'MOCK-ORD-105',
    customer_name: 'Suresh Chandra Joshi',
    mobile: '9824056789',
    address: '44, Sharda Society, Near Shreyas Crossing, Ambawadi, Ahmedabad 380015',
    mode: 'next_day',
    status: 'delivered',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expected_delivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: 'Subscribed family basket order.',
    user_id: 'mock-user-5',
    items: [
      { id: 'potato', name: 'Potato - Aloo (બટાકા)', quantity: 3, unit: 'kg' },
      { id: 'onion', name: 'Onion - Pyaaz (ડુંગળી)', quantity: 3, unit: 'kg' },
      { id: 'green-peas', name: 'Fresh Green Vatana (લીલા વટાણા)', quantity: 1, unit: 'kg' },
    ],
  },
  {
    id: 'MOCK-ORD-106',
    customer_name: 'Dharmesh R. Shah',
    mobile: '9898112233',
    address: 'A-502, Indraprastha Greens, Prahlad Nagar, Ahmedabad 380015',
    mode: 'next_day',
    status: 'new',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    expected_delivery: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: 'Monthly recurring ₹1,000 wallet subscriber. Deliver early morning 6:45 AM.',
    user_id: 'mock-user-6',
    items: [
      { id: 'cow-milk', name: 'Desi A2 Gir Cow Milk (તાજું ગાયનું દૂધ)', quantity: 2, unit: 'L' },
      { id: 'methi', name: 'Methi Leaves (મેથી)', quantity: 500, unit: 'g' },
      { id: 'tomato', name: 'Tomato - Tamatar (ટામેટા)', quantity: 2, unit: 'kg' },
      { id: 'ginger', name: 'Fresh Ginger (આદુ)', quantity: 250, unit: 'g' },
    ],
  },
  {
    id: 'MOCK-ORD-107',
    customer_name: 'Priyanka D. Goswami',
    mobile: '9723045612',
    address: 'Flat 102, Applewoods Township, Shela, Ahmedabad 380058',
    mode: 'same_day',
    status: 'confirmed',
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    expected_delivery: new Date().toISOString().slice(0, 10),
    notes: 'Same-day emergency 3km dispatch for evening guest dinner.',
    user_id: 'mock-user-7',
    items: [
      { id: 'paneer', name: 'Fresh Soft Malai Paneer', quantity: 500, unit: 'g' },
      { id: 'green-peas', name: 'Fresh Green Vatana (લીલા વટાણા)', quantity: 1, unit: 'kg' },
      { id: 'coriander', name: 'Fresh Coriander (ધાણા / કોથમરી)', quantity: 250, unit: 'g' },
    ],
  },
  {
    id: 'MOCK-ORD-108',
    customer_name: 'Harishbhai K. Prajapati',
    mobile: '9427019823',
    address: '18, Sarjan Bungalows, Near Science City, Sola, Ahmedabad 380060',
    mode: 'next_day',
    status: 'delivered',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    expected_delivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: 'Standing weekly produce basket delivered.',
    user_id: 'mock-user-8',
    items: [
      { id: 'buffalo-milk', name: 'Fresh Pure Buffalo Milk (ભેંસનું દૂધ)', quantity: 2, unit: 'L' },
      { id: 'potato', name: 'Potato - Aloo (બટાકા)', quantity: 2, unit: 'kg' },
      { id: 'onion', name: 'Onion - Pyaaz (ડુંગળી)', quantity: 2, unit: 'kg' },
      { id: 'carrot', name: 'Desi Red Carrots (ગાજર)', quantity: 1, unit: 'kg' },
    ],
  },
  {
    id: 'MOCK-ORD-109',
    customer_name: 'Nirmalaben V. Somani',
    mobile: '9825633441',
    address: 'B-304, Venus Atlantis, Anandnagar Road, Prahlad Nagar, Ahmedabad 380015',
    mode: 'next_day',
    status: 'confirmed',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    expected_delivery: new Date().toISOString().slice(0, 10),
    notes: 'Senior citizen household. Kindly ring doorbell twice gently.',
    user_id: 'mock-user-9',
    items: [
      { id: 'cow-milk', name: 'Desi A2 Gir Cow Milk (તાજું ગાયનું દૂધ)', quantity: 1, unit: 'L' },
      { id: 'lauki', name: 'Fresh Bottle Gourd (દૂધી)', quantity: 1, unit: 'piece' },
      { id: 'apple-shimla', name: 'Crisp Royal Apples (સફરજન)', quantity: 1, unit: 'kg' },
    ],
  },
];

export const MOCK_SURVEYS: SurveyRow[] = [
  {
    id: 'MOCK-SURV-201',
    customer_name: 'Kavita Harshil Dave',
    mobile: '9825112233',
    address: 'A-301, Goyal Intercity, Drive-In Road, Thaltej, Ahmedabad 380054 (DIGIPIN: GJ-380-DRV-301)',
    family_members: 5,
    delivery_preference: 'Early Morning 6:00 AM - 7:30 AM (Before School/Tiffin)',
    status: 'new',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    notes: 'Need 1.5 L Gir Cow milk daily and green vegetable basket every Tuesday and Friday.',
    selections: [
      { id: 's-1', name: 'Desi A2 Gir Cow Milk', category: 'milk', unit: 'L', quantity: 1.5, frequency: 'daily' },
      { id: 's-2', name: 'Methi & Palak Green Leafy Bunch', category: 'vegetable', unit: 'kg', quantity: 1, frequency: 'weekly' },
      { id: 's-3', name: 'Seasonal Fruit Basket (Apple, Banana)', category: 'fruit', unit: 'kg', quantity: 2, frequency: 'weekly' },
    ],
  },
  {
    id: 'MOCK-SURV-202',
    customer_name: 'Deepak & Suman Agrawal',
    mobile: '9879034567',
    address: '15, Nilgiri Bungalows, Science City Road, Sola, Ahmedabad 380060',
    family_members: 4,
    delivery_preference: 'Morning 7:30 AM - 9:00 AM',
    status: 'reviewed',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    notes: 'Elder in family is diabetic; require seasonal methi, bitter gourd (karela) and sugar-free seasonal produce.',
    selections: [
      { id: 's-4', name: 'Karela - Bitter Gourd', category: 'vegetable', unit: 'kg', quantity: 0.5, frequency: 'weekly' },
      { id: 's-5', name: 'Methi Leaves (Diabetic Care)', category: 'vegetable', unit: 'g', quantity: 500, frequency: 'weekly' },
      { id: 's-6', name: 'Fresh A2 Cow Milk', category: 'milk', unit: 'L', quantity: 1, frequency: 'daily' },
    ],
  },
  {
    id: 'MOCK-SURV-203',
    customer_name: 'Pooja Chawla',
    mobile: '9428045612',
    address: 'Penthouse 1401, Gala Haven, South Bopal, Ahmedabad 380058',
    family_members: 3,
    delivery_preference: 'Alternative Days Morning Delivery',
    status: 'reviewed',
    created_at: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    notes: 'Interested in ₹1,000 monthly subscription wallet and Shakhwala direct morning delivery.',
    selections: [
      { id: 's-7', name: 'Báremās Staple Basket (Aloo, Pyaaz, Tamatar)', category: 'vegetable', unit: 'kg', quantity: 5, frequency: 'weekly' },
      { id: 's-8', name: 'Farm Fresh Buffalo Milk', category: 'milk', unit: 'L', quantity: 2, frequency: 'daily' },
    ],
  },
  {
    id: 'MOCK-SURV-204',
    customer_name: 'Manish & Tejal Shah',
    mobile: '9825499112',
    address: 'B-601, Godrej Garden City, SG Highway, Ahmedabad 382470',
    family_members: 4,
    delivery_preference: 'Early Morning 6:00 AM - 7:00 AM',
    status: 'new',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    notes: 'Require pure A2 Gir Cow Milk every morning before Jain puja and tiffin preparation.',
    selections: [
      { id: 's-9', name: 'Desi A2 Gir Cow Milk', category: 'milk', unit: 'L', quantity: 2, frequency: 'daily' },
      { id: 's-10', name: 'Fresh Green Leafy Basket (Palak & Methi)', category: 'vegetable', unit: 'kg', quantity: 1, frequency: 'weekly' },
    ],
  },
  {
    id: 'MOCK-SURV-205',
    customer_name: 'Dr. Ketan Bhatt',
    mobile: '9898055443',
    address: '22, Doctors Enclave, Near Sterling Hospital, Memnagar, Ahmedabad 380052',
    family_members: 3,
    delivery_preference: 'Morning 7:00 AM - 8:30 AM',
    status: 'reviewed',
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    notes: 'Focus on seasonal immune-boosting organic citrus fruits and farm milk.',
    selections: [
      { id: 's-11', name: 'Desi A2 Gir Cow Milk', category: 'milk', unit: 'L', quantity: 1, frequency: 'daily' },
      { id: 's-12', name: 'Seasonal Fruit Basket (Orange, Pomegranate)', category: 'fruit', unit: 'kg', quantity: 2, frequency: 'weekly' },
    ],
  },
];

export const MOCK_ENQUIRIES: EnquiryRow[] = [
  {
    id: 'MOCK-ENQ-301',
    name: 'Hemant Zaveri (Secretary, Orchid Heights Society)',
    email: 'secretary.orchid@gmail.com',
    phone: '9825544332',
    subject: 'Society Bulk Morning Delivery Franchisee Model',
    message: 'We have 140 flats in our gated community and want JVLSD-FD through Shakhwala to set up a daily 6:30 AM drop-point for milk and seasonal veggies. Please connect with our committee.',
    status: 'new',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'MOCK-ENQ-302',
    name: 'Gaurang S. Desai',
    email: 'gaurang.desai@yahoo.com',
    phone: '9909012890',
    subject: 'A2 Gir Cow Milk Certification and Lab Reports',
    message: 'Appreciate the Ayurvedic notes on your survey page! Could you share the lab certificate regarding A2 beta-casein protein and zero pesticide residue for the morning milk deliveries?',
    status: 'resolved',
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'MOCK-ENQ-303',
    name: 'Sonal Ben V. Choksi',
    email: 'sonal.choksi@gmail.com',
    phone: '9825129988',
    subject: 'Bulk Monthly Family Pass for Fresh Greens',
    message: 'Can we configure standing daily deliveries for our joint family of 8 members with fixed weekly billing through the customer wallet?',
    status: 'new',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'MOCK-ENQ-304',
    name: 'Nilesh M. Parmar',
    email: 'nilesh.parmar@rediffmail.com',
    phone: '9879100234',
    subject: 'Franchisee Distribution Center Route Enquiry',
    message: 'Interested in partnering with JVLSD as a local hyper-local morning pickup kiosk partner in the Bopal area. Please send the franchise deck.',
    status: 'resolved',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_PROFILES: Profile[] = [
  {
    id: 'super-root',
    email: 'owner@jvlsd.in',
    full_name: 'Jagatpati Vigneshwara LSD LLP (Owner)',
    role: 'superadmin',
  },
  {
    id: 'admin-manager',
    email: 'manager@jvlsd.in',
    full_name: 'Mahesh Solanki (Procurement & Logistics Mgr)',
    role: 'admin',
  },
  {
    id: 'admin-operations',
    email: 'admin@jvlsd.in',
    full_name: 'Pravin R. Joshi (Shakhwala Morning Operations)',
    role: 'admin',
  },
  {
    id: 'mock-user-1',
    email: 'customer@jvlsd.in',
    full_name: 'Dr. Anand K. Vora (Loyalty Tier: Gold)',
    role: 'customer',
  },
  {
    id: 'mock-user-2',
    email: 'bhavna.patel@gmail.com',
    full_name: 'Bhavna Ben Patel',
    role: 'customer',
  },
  {
    id: 'mock-user-3',
    email: 'rajesh.mehta@yahoo.com',
    full_name: 'Rajeshbhai Mehta (Joint Family)',
    role: 'customer',
  },
  {
    id: 'mock-user-6',
    email: 'dharmesh.shah@gmail.com',
    full_name: 'Dharmesh R. Shah (Subscriber)',
    role: 'customer',
  },
  {
    id: 'mock-user-7',
    email: 'priyanka.goswami@outlook.com',
    full_name: 'Priyanka D. Goswami',
    role: 'customer',
  },
  {
    id: 'mock-user-8',
    email: 'harish.prajapati@gmail.com',
    full_name: 'Harishbhai K. Prajapati',
    role: 'customer',
  },
  {
    id: 'mock-user-9',
    email: 'nirmala.somani@gmail.com',
    full_name: 'Nirmalaben V. Somani',
    role: 'customer',
  },
];
