import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Timer, Users, BarChart3, User,
  LogOut, Menu, X, Trophy,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/session/new',  label: 'Focus Session', icon: Timer },
  { to: '/rooms',        label: 'Study Rooms',  icon: Users },
  { to: '/leaderboard',  label: 'Leaderboard',  icon: Trophy },
  { to: '/analytics',    label: 'Analytics',    icon: BarChart3, soon: true },
  { to: '/profile',      label: 'Profile',      icon: User, soon: true },
]

function FocusDot({ status }) {
  const colors = {
    focused:   'bg-accent-teal shadow-[0_0_8px_#14B8A6]',
    idle:      'bg-accent-amber',
    distracted:'bg-accent-red',
    default:   'bg-text-muted',
  }
  return (
    <span className={`w-2 h-2 rounded-full ${colors[status] || colors.default}`} />
  )
}

function NavItems({ onClose }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, soon }) => (
        soon ? (
          <div
            key={to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted cursor-not-allowed opacity-50 text-sm"
          >
            <Icon size={18} />
            <span>{label}</span>
            <span className="ml-auto text-xs bg-white/10 px-1.5 py-0.5 rounded-full">Soon</span>
          </div>
        ) : (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-accent-teal/10 text-accent-teal border-l-2 border-accent-teal font-medium'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        )
      ))}
    </nav>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/8">
        <span className="text-xl font-bold text-text-primary tracking-tight">Focusly</span>
      </div>

      <NavItems onClose={() => setMobileOpen(false)} />

      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-accent-teal/20 flex items-center justify-center text-accent-teal font-semibold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <FocusDot status="default" />
              <span className="text-xs text-text-muted">Idle</span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-accent-red hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-60 bg-bg-surface border-r border-white/8 flex-col fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </div>

      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-bg-surface border border-white/10 text-text-secondary"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-60 bg-bg-surface border-r border-white/8 flex flex-col"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <button
                className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </button>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
