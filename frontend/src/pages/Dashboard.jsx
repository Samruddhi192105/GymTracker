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
      <div className="p-4 bg-[#f6e9e7] text-[#a66b68] rounded-2xl border border-[#efd8d5]">
        couldnt load dashboard: {error}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Workouts',
      value: stats?.totalWorkouts ?? 0,
      icon: Calendar,
      color: 'bg-[#dcebdd] text-[#4c7458]',
    },
    {
      title: 'Exercises Performed',
      value: stats?.totalExercisesPerformed ?? 0,
      icon: Dumbbell,
      color: 'bg-[#e8e0ef] text-[#77648a]',
    },
    {
      title: 'Total Volume',
      value: `${(stats?.totalVolume ?? 0).toLocaleString()} kg`,
      icon: Weight,
      color: 'bg-[#e4efe9] text-[#4f8064]',
    },
    {
      title: 'This Week',
      value: stats?.workoutsThisWeek ?? 0,
      icon: Activity,
      color: 'bg-[#f4e6d5] text-[#a2744d]',
    },
  ]

  return (
    <div>
      <div className="mb-9 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8a9b8d] mb-2">your training journal</p>
          <h1 className="text-3xl font-bold text-[#293b32]">A quieter way to get stronger.</h1>
          <p className="text-[#718077] mt-2">A small look at the work you have been putting in.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-[#718077] bg-white/70 border border-[#e1e8e0] rounded-full px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-[#8caf96]" />
          steady progress
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.title}
            className="bg-white/75 rounded-2xl border border-[#e1e8e0] p-5 shadow-[0_10px_30px_rgba(72,92,78,0.05)] animate-[fadeIn_500ms_ease_both]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{c.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
              </div>
              <div className={`${c.color} p-3 rounded-2xl`}>
                <c.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden bg-[#3f5f4c] rounded-[2rem] p-7 text-[#f5f7f1] shadow-[0_16px_40px_rgba(63,95,76,0.18)]">
        <div className="absolute -right-10 -top-16 w-44 h-44 rounded-full border-[18px] border-white/10" />
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/10"><Flame className="w-6 h-6" /></span>
          <h2 className="text-xl font-bold">Workout Streak</h2>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[#c8dbca] text-sm">Current</p>
            <p className="text-4xl font-bold mt-1">
              {stats?.currentStreak ?? 0}
              <span className="text-lg font-normal"> days</span>
            </p>
          </div>
          <div>
            <p className="text-[#c8dbca] text-sm flex items-center gap-1">
              <Trophy className="w-4 h-4" /> Longest
            </p>
            <p className="text-4xl font-bold mt-1">
              {stats?.longestStreak ?? 0}
              <span className="text-lg font-normal"> days</span>
            </p>
          </div>
        </div>
        {(stats?.currentStreak ?? 0) > 0 && (
          <p className="mt-4 text-[#c8dbca] text-sm">keep showing up. consistency compounds.</p>
        )}
      </div>
    </div>
  )
}
