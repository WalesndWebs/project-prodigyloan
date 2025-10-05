import { createClient } from '@supabase/supabase-js'

// Supabase project configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wittyftnqarnvowbonuq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpdHR5ZnRucWFybnZvd2JvbnVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjI1ODQsImV4cCI6MjA3NTA5ODU4NH0.KZxq3tW1GGXeeRf1sNisWgCeVPd0E0pkMb4SDHUfo1k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'borrower' | 'investor' | 'admin'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  // Multi-role support
  is_borrower?: boolean
  is_investor?: boolean
  full_name?: string
  phone?: string
  created_at: string
  // Department-based access for admins
  department?: string
}

export interface LoanProduct {
  id: string
  name: string
  description: string
  min_amount: number
  max_amount: number
  interest_rate: number
  term_months: number
  created_at: string
}

export interface LoanApplication {
  id: string
  user_id: string
  loan_product_id: string
  amount: number
  purpose: string
  status: 'pending' | 'approved' | 'rejected' | 'disbursed'
  created_at: string
  updated_at: string
}

export interface InvestmentProduct {
  id: string
  name: string
  description: string
  min_investment: number
  expected_return: number
  risk_level: 'low' | 'medium' | 'high'
  duration_months: number
  created_at: string
}

export interface Investment {
  id: string
  user_id: string
  investment_product_id: string
  amount: number
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment' | 'investment' | 'return'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  description: string
  created_at: string
}

export interface LoanRepayment {
  id: string
  loan_application_id: string
  amount: number
  due_date: string
  paid_date?: string
  status: 'pending' | 'paid' | 'overdue'
  created_at: string
}
