import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import GoogleSignInButton from '../../components/auth/GoogleSignInButton'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login, loginWithGoogle } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleCredential(credential) {
    try {
      await loginWithGoogle(credential)
      navigate('/dashboard')
    } catch {
      setError('Google sign-in failed. Please try again.')
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold text-text-primary mb-1">Welcome back</h2>
      <p className="text-text-muted text-sm mb-6">Log in to continue studying.</p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-text-muted hover:text-accent-teal transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full">
          Sign In
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-text-muted">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <GoogleSignInButton onCredential={handleGoogleCredential} />

      <p className="mt-5 text-center text-sm text-text-muted">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-accent-teal hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
