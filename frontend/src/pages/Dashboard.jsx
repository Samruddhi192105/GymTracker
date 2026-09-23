import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import { Dumbbell, Calendar, Weight, Flame, Trophy, Activity } from 'lucide-react'

export default function Dashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return

    async function load() {
      try {
        const data = await apiFetch('/api/dashboard', {}, token)
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        couldnt load dashboard: {error}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Workouts',
      value: stats?.totalWorkouts ?? 0,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Exercises Performed',
      value: stats?.totalExercisesPerformed ?? 0,
      icon: Dumbbell,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Volume',
      value: `${(stats?.totalVolume ?? 0).toLocaleString()} kg`,
      icon: Weight,
      color: 'bg-green-500',
    },
    {
      title: 'This Week',
      value: stats?.workoutsThisWeek ?? 0,
      icon: Activity,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">overview of your training</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.title}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{c.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
              </div>
              <div className={`${c.color} p-3 rounded-lg text-white`}>
                <c.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* streak */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="w-8 h-8" />
          <h2 className="text-xl font-bold">Workout Streak</h2>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-orange-100 text-sm">Current</p>
            <p className="text-4xl font-bold mt-1">
              {stats?.currentStreak ?? 0}
              <span className="text-lg font-normal"> days</span>
            </p>
          </div>
          <div>
            <p className="text-orange-100 text-sm flex items-center gap-1">
              <Trophy className="w-4 h-4" /> Longest
            </p>
            <p className="text-4xl font-bold mt-1">
              {stats?.longestStreak ?? 0}
              <span className="text-lg font-normal"> days</span>
            </p>
          </div>
        </div>
        {(stats?.currentStreak ?? 0) > 0 && (
          <p className="mt-4 text-orange-100 text-sm">keep going, dont break the streak</p>
        )}
      </div>
    </div>
  )
}
