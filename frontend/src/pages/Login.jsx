import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Dumbbell } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#f7f8f4]">
      <div className="w-full max-w-md bg-white/80 border border-[#e1e8e0] rounded-[2rem] shadow-[0_20px_60px_rgba(72,92,78,0.1)] p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#dcebdd] rounded-2xl mb-5 rotate-3">
            <Dumbbell className="w-7 h-7 text-[#4f745a] -rotate-3" />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8a9b8d] mb-2">gym tracker</p>
          <h1 className="text-3xl font-bold text-[#293b32]">Welcome back</h1>
          <p className="text-[#718077] mt-2">Pick up where your last session left off.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#f6e9e7] text-[#a66b68] text-sm rounded-xl border border-[#efd8d5]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
              className="w-full py-3 bg-[#496954] text-white font-medium rounded-xl hover:bg-[#3b5544] disabled:opacity-50 shadow-[0_8px_18px_rgba(73,105,84,0.18)]"
          >
            {loading ? 'signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#718077]">
          dont have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
