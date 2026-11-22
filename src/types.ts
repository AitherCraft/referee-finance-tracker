export interface Assignment {
  id: string
  user_id: string
  game_date: string
  sport: string
  league: string
  location: string
  description: string
  expected_fee: number
  status: 'pending' | 'paid' | 'cancelled'
  paid_amount: number | null
  paid_date: string | null
  notes: string | null
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  expense_date: string
  category: string
  amount: number
  description: string
  notes: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
}
