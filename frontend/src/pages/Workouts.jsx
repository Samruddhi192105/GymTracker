import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Plus, Calendar, ChevronRight, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export default function Workouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', workout_date: format(new Date(), 'yyyy-MM-dd') })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchWorkouts = async () => {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_sets (id)
      `)
      .order('workout_date', { ascending: false })
    if (error) console.error(error)
    else setWorkouts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: form.name.trim(),
          workout_date: form.workout_date
        })
        .select()
        .single()
      if (error) throw error
      setShowModal(false)
      setForm({ name: '', workout_date: format(new Date(), 'yyyy-MM-dd') })
      fetchWorkouts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this workout and all its sets?')) return
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchWorkouts()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workouts</h1>
          <p className="text-gray-500 mt-1">Log and manage your training sessions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Workout
        </button>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No workouts yet. Start your first session!</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-primary-600 font-medium hover:underline"
          >
            + New Workout
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => (
            <Link
              key={w.id}
              to={`/workouts/${w.id}`}
              className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:shadow-sm transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition">
                    {w.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(w.workout_date), 'dd MMMM yyyy')}
                    {w.workout_sets?.length > 0 && (
                      <span className="ml-2">• {w.workout_sets.length} sets</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDelete(w.id, e)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold">New Workout</h2>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workout Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. Chest Day"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.workout_date}
                  onChange={(e) => setForm({ ...form, workout_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
