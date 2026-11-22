import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Assignment } from '../types'
import { format } from 'date-fns'
import { Plus, Trash2, Edit2 } from 'lucide-react'

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Assignment | null>(null)
  const [form, setForm] = useState({
    game_date: '',
    sport: '',
    league: '',
    location: '',
    description: '',
    expected_fee: '',
    status: 'pending' as 'pending' | 'paid' | 'cancelled',
    paid_amount: '',
    paid_date: '',
    notes: '',
  })

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('game_date', { ascending: false })
    if (!error) setAssignments(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setForm({
      game_date: '',
      sport: '',
      league: '',
      location: '',
      description: '',
      expected_fee: '',
      status: 'pending',
      paid_amount: '',
      paid_date: '',
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
      game_date: form.game_date,
      sport: form.sport,
      league: form.league,
      location: form.location,
      description: form.description,
      expected_fee: parseFloat(form.expected_fee) || 0,
      status: form.status,
      paid_amount: form.paid_amount ? parseFloat(form.paid_amount) : null,
      paid_date: form.paid_date || null,
      notes: form.notes || null,
    }

    if (editing) {
      await supabase.from('assignments').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('assignments').insert(payload)
    }
    resetForm()
    fetchAssignments()
  }

  const handleEdit = (a: Assignment) => {
    setEditing(a)
    setForm({
      game_date: a.game_date,
      sport: a.sport,
      league: a.league,
      location: a.location,
      description: a.description,
      expected_fee: a.expected_fee.toString(),
      status: a.status,
      paid_amount: a.paid_amount?.toString() || '',
      paid_date: a.paid_date || '',
      notes: a.notes || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this assignment?')) {
      await supabase.from('assignments').delete().eq('id', id)
      fetchAssignments()
    }
  }

  if (loading) return <div>Loading assignments...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assignments / Games</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Assignment
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">{editing ? 'Edit' : 'New'} Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Game Date</label>
              <input type="date" value={form.game_date} onChange={e => setForm({...form, game_date: e.target.value})} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sport</label>
              <input type="text" value={form.sport} onChange={e => setForm({...form, sport: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="e.g. Soccer, Basketball" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">League</label>
              <input type="text" value={form.league} onChange={e => setForm({...form, league: e.target.value})} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="Teams or details" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Fee ($)</label>
              <input type="number" step="0.01" value={form.expected_fee} onChange={e => setForm({...form, expected_fee: e.target.value})} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="w-full border rounded px-3 py-2">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {form.status === 'paid' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Paid Amount ($)</label>
                  <input type="number" step="0.01" value={form.paid_amount} onChange={e => setForm({...form, paid_amount: e.target.value})} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Paid Date</label>
                  <input type="date" value={form.paid_date} onChange={e => setForm({...form, paid_date: e.target.value})} className="w-full border rounded px-3 py-2" />
                </div>
              </>
            )}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sport / League</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map(a => (
              <tr key={a.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{format(new Date(a.game_date), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4 text-sm">{a.sport} - {a.league}</td>
                <td className="px-6 py-4 text-sm">{a.location}</td>
                <td className="px-6 py-4 text-sm">${a.expected_fee.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    a.status === 'paid' ? 'bg-green-100 text-green-800' :
                    a.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {a.status === 'paid' && a.paid_amount ? `$${a.paid_amount.toFixed(2)}` : '-'}
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-2">
                  <button onClick={() => handleEdit(a)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4 inline" /></button>
                  <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assignments.length === 0 && <p className="p-6 text-center text-gray-500">No assignments yet. Add your first game!</p>}
      </div>
    </div>
  )
}
