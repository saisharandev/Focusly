import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import api from '../../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold text-text-primary mb-1">Reset your password</h2>
      <p className="text-text-muted text-sm mb-6">
        {sent ? "Check your inbox for a reset link." : "Enter your email and we'll send you a link."}
      </p>

      {!sent ? (
        <>
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button type="submit" isLoading={isLoading} className="w-full">
              Send Reset Link
            </Button>
          </form>
        </>
      ) : (
        <div className="px-4 py-4 rounded-xl bg-accent-teal/10 border border-accent-teal/30 text-accent-teal text-sm text-center">
          If that email exists, a reset link was sent.
        </div>
      )}

      <p className="mt-5 text-center text-sm text-text-muted">
        <Link to="/login" className="text-accent-teal hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  )
}
