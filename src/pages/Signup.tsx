import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AuthForm } from '../components/AuthForm'

export function Signup() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const { error: signUpError } = await signUp(email, password)

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      // Navigate to dashboard after successful signup
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Property Portfolio Tracker
          </h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <AuthForm
            mode="signup"
            onSubmit={handleSubmit}
            error={error}
            loading={loading}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
