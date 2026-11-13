import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
};

export type Order = {
  customer_name: string;
  mobile: string;
  address: string;
  mode: OrderMode;
  items: OrderItem[];
  expected_delivery: string; // ISO date
  notes?: string;
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
