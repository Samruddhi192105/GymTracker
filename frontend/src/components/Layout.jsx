import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  Dumbbell, 
  Calendar, 
  TrendingUp, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/exercises', icon: Dumbbell, label: 'Exercises' },
  { to: '/workouts', icon: Calendar, label: 'Workouts' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex md:flex-col w-64 bg-[#f1f4ef]/90 border-r border-[#dfe7df]">
        <div className="p-6 border-b border-[#dfe7df]">
          <h1 className="text-xl font-bold text-[#3f5f4c] flex items-center gap-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-[#dcebdd]">
              <Dumbbell className="w-5 h-5" />
            </span>
            <span>Gym Tracker</span>
          </h1>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a9b8d] mt-3 ml-11">move with intention</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#dfece1] text-[#3f604b] shadow-sm'
                    : 'text-[#718077] hover:bg-white/70 hover:text-[#3f5f4c]'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[#dfe7df]">
          <div className="px-4 py-2 text-xs text-[#7c8c82] truncate mb-2">
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[#a66b68] hover:bg-[#f6e9e7] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#f1f4ef] border-b border-[#dfe7df] px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#3f5f4c] flex items-center gap-2">
          <Dumbbell className="w-5 h-5" />
          Gym Tracker
        </h1>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-[#f1f4ef] border-b border-[#dfe7df] p-4 space-y-1" onClick={e => e.stopPropagation()}>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-[#dfece1] text-[#3f604b]' : 'text-[#718077]'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-[#a66b68]"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 md:ml-0 pt-16 md:pt-0 overflow-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
