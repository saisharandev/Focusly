import { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

const initialState = { user: null, token: null, isLoading: true }

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':   return { ...state, user: action.user, token: action.token, isLoading: false }
    case 'SET_LOADING':return { ...state, isLoading: action.value }
    case 'LOGOUT':     return { user: null, token: null, isLoading: false }
    default:           return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('focusly_token')
    if (!token) {
      dispatch({ type: 'SET_LOADING', value: false })
      return
    }
    api.get('/api/auth/me')
      .then(res => dispatch({ type: 'SET_USER', user: res.data.user, token }))
      .catch(() => {
        localStorage.removeItem('focusly_token')
        dispatch({ type: 'LOGOUT' })
      })
  }, [])

  async function login(email, password) {
    const res = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('focusly_token', res.data.token)
    dispatch({ type: 'SET_USER', user: res.data.user, token: res.data.token })
    return res.data
  }

  async function signup(data) {
    const res = await api.post('/api/auth/signup', data)
    localStorage.setItem('focusly_token', res.data.token)
    dispatch({ type: 'SET_USER', user: res.data.user, token: res.data.token })
    return res.data
  }

  async function logout() {
    await api.post('/api/auth/logout').catch(() => {})
    localStorage.removeItem('focusly_token')
    dispatch({ type: 'LOGOUT' })
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, isAuthenticated: !!state.user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
