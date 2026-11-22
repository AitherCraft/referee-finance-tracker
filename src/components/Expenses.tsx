import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Expense } from '../types'
import { format } from 'date-fns'
import { Plus, Trash2, Edit2 } from 'lucide-react'

const CATEGORIES = ['Travel', 'Equipment', 'Meals', 'Uniform', 'Training', 'Other']

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [form, setForm] = useState({
    expense_date: '',
    category: 'Travel',
    amount: '',
    description: '',
    notes: '',
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })
    if (!error) setExpenses(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setForm({
      expense_date: '',
      category: 'Travel',
      amount: '',
      description: '',
      notes: '',
    })
    setEditing(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      expense_date: form.expense_date,
      category: form.category,
      amount: parseFloat(form.amount) || 0,
      description: form.description,
      notes: form.notes || null,
    }

    if (editing) {
      await supabase.from('expenses').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('expenses').insert(payload)
    }
    resetForm()
    fetchExpenses()
  }

  const handleEdit = (e: Expense) => {
    setEditing(e)
    setForm({
      expense_date: e.expense_date,
      category: e.category,
      amount: e.amount.toString(),
      description: e.description,
      notes: e.notes || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this expense?')) {
      await supabase.from('expenses').delete().eq('id', id)
      fetchExpenses()
    }
  }

  if (loading) return <div>Loading expenses...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">{editing ? 'Edit' : 'New'} Expense</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" value={form.expense_date} onChange={e => setForm({...form, expense_date: e.target.value})} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border rounded px-3 py-2">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border rounded px-3 py-2" rows={2} />
            </div>
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
            <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map(e => (
              <tr key={e.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{format(new Date(e.expense_date), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4 text-sm">{e.category}</td>
                <td className="px-6 py-4 text-sm">{e.description}</td>
                <td className="px-6 py-4 text-sm text-red-600">${e.amount.toFixed(2)}</td>
                <td className="px-6 py-4 text-right text-sm space-x-2">
                  <button onClick={() => handleEdit(e)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4 inline" /></button>
                  <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && <p className="p-6 text-center text-gray-500">No expenses yet.</p>}
      </div>
    </div>
  )
}
