import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import GoogleSignInButton from '../../components/auth/GoogleSignInButton'
import { useAuth } from '../../context/AuthContext'

function PasswordStrength({ password }) {
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)]
  const score = checks.filter(Boolean).length
  const labels = ['', 'Weak', 'Fair', 'Strong']
  const colors = ['', 'bg-accent-red', 'bg-accent-amber', 'bg-accent-teal']

  if (!password) return null

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-text-muted">{labels[score]}</p>
    </div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const { signup, loginWithGoogle } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', university: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(errs => ({ ...errs, [e.target.name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setIsLoading(true)
    try {
      await signup({ name: form.name, email: form.email, password: form.password, university: form.university })
      navigate('/dashboard')
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Something went wrong' })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleCredential(credential) {
    try {
      await loginWithGoogle(credential)
      navigate('/dashboard')
    } catch {
      setErrors({ submit: 'Google sign-in failed. Please try again.' })
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold text-text-primary mb-1">Create your account</h2>
      <p className="text-text-muted text-sm mb-6">Start studying smarter today.</p>

      {errors.submit && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" name="name" placeholder="Sai Sharan" value={form.name} onChange={handleChange} error={errors.name} required />
        <Input label="Email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} required />
        <div>
          <Input label="Password" name="password" type="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} error={errors.password} required />
          <div className="mt-2"><PasswordStrength password={form.password} /></div>
        </div>
        <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />
        <Input label="University (optional)" name="university" placeholder="e.g. MIT Bangalore" value={form.university} onChange={handleChange} />

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          Create Account
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-text-muted">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <GoogleSignInButton onCredential={handleGoogleCredential} />

      <p className="mt-5 text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-teal hover:underline font-medium">Log in</Link>
      </p>
    </AuthLayout>
  )
}
