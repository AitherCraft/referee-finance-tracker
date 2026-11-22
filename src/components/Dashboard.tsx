import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Assignment, Expense } from '../types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export default function Dashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: a } = await supabase.from('assignments').select('*').order('game_date', { ascending: false })
    const { data: e } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false })
    setAssignments(a || [])
    setExpenses(e || [])
    setLoading(false)
  }

  const totalEarned = assignments
    .filter(a => a.status === 'paid')
    .reduce((sum, a) => sum + (a.paid_amount || 0), 0)

  const pending = assignments
    .filter(a => a.status === 'pending')
    .reduce((sum, a) => sum + a.expected_fee, 0)

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const net = totalEarned - totalExpenses

  // Monthly data for last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const monthLabel = format(date, 'MMM yyyy')

    const monthIncome = assignments
      .filter(a => a.status === 'paid' && a.paid_date && new Date(a.paid_date) >= start && new Date(a.paid_date) <= end)
      .reduce((sum, a) => sum + (a.paid_amount || 0), 0)

    const monthExp = expenses
      .filter(e => new Date(e.expense_date) >= start && new Date(e.expense_date) <= end)
      .reduce((sum, e) => sum + e.amount, 0)

    return { month: monthLabel, Income: monthIncome, Expenses: monthExp }
  })

  if (loading) return <div>Loading dashboard...</div>

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Earned</p>
          <p className="text-2xl font-bold text-green-600">${totalEarned.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Pending Payments</p>
          <p className="text-2xl font-bold text-yellow-600">${pending.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Net Income</p>
          <p className={`text-2xl font-bold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>${net.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Last 6 Months</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Income" fill="#10b981" />
            <Bar dataKey="Expenses" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Assignments</h3>
          <div className="space-y-2">
            {assignments.slice(0, 5).map(a => (
              <div key={a.id} className="flex justify-between text-sm border-b pb-2">
                <span>{format(new Date(a.game_date), 'MMM d')} - {a.sport} {a.league}</span>
                <span className={a.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                  ${a.status === 'paid' ? a.paid_amount : a.expected_fee} ({a.status})
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
          <div className="space-y-2">
            {expenses.slice(0, 5).map(e => (
              <div key={e.id} className="flex justify-between text-sm border-b pb-2">
                <span>{format(new Date(e.expense_date), 'MMM d')} - {e.category}</span>
                <span className="text-red-600">${e.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
