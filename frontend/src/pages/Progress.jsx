import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import { TrendingUp, TrendingDown, Minus, Trophy, Weight, Repeat } from 'lucide-react'
import { format } from 'date-fns'

export default function Progress() {
  const { token } = useAuth()
  const [exercises, setExercises] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchExercises = async () => {
      const { data } = await supabase
        .from('exercises')
        .select('*')
        .order('name')
      setExercises(data || [])
    }
    fetchExercises()
  }, [])

  useEffect(() => {
    if (!selectedId || !token) {
      setProgress(null)
      return
    }
    const fetchProgress = async () => {
      setLoading(true)
      try {
        const data = await apiFetch(`/api/progress/${selectedId}`, {}, token)
        setProgress(data)
      } catch (err) {
        console.error(err)
        setProgress(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [selectedId, token])

  const Indicator = ({ type }) => {
    if (type === 'improved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <TrendingUp className="w-4 h-4" /> Improved
        </span>
      )
    }
    if (type === 'decreased') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          <TrendingDown className="w-4 h-4" /> Decreased
        </span>
      )
    }
    if (type === 'maintained') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          <Minus className="w-4 h-4" /> Maintained
        </span>
      )
    }
    return null
  }

  const SessionCard = ({ title, session }) => {
    if (!session) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
          <p className="text-gray-400 text-sm">No data</p>
        </div>
      )
    }
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
        <p className="text-xs text-gray-400 mb-3">
          {format(new Date(session.date), 'dd MMM yyyy')} • {session.name}
        </p>
        <div className="space-y-1">
          {session.sets.map((s, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-500">Set {i + 1}</span>
              <span className="font-medium">{s.weight} kg × {s.reps}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Progress Tracking</h1>
        <p className="text-gray-500 mt-1">Compare performance and track personal records</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Exercise</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Choose an exercise...</option>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name} ({ex.muscle_group})
            </option>
          ))}
        </select>
      </div>

      {!selectedId && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Select an exercise to view progress</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {progress && !loading && (
        <div className="space-y-6">
          {progress.indicator && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Compared to previous session:</span>
              <Indicator type={progress.indicator} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Weight className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Best Weight</p>
                <p className="text-xl font-bold">{progress.bestWeight} kg</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Repeat className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Best Reps</p>
                <p className="text-xl font-bold">{progress.bestReps}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-lg">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Est. 1RM</p>
                <p className="text-xl font-bold">{progress.estimated1RM} kg</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SessionCard title="Previous Session" session={progress.previous} />
            <SessionCard title="Current Session" session={progress.current} />
          </div>
        </div>
      )}
    </div>
  )
}
