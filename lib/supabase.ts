import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Slot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
};

export type Booking = {
  id: string;
  slot_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  payment_method: 'vodafone_cash' | 'insta_pay';
  payment_reference: string;
  status: 'pending' | 'confirmed' | 'rejected';
  notes: string;
  created_at: string;
};
