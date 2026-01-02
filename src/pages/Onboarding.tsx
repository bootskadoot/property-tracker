import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Database } from '../types/database'

type OnboardingData = {
  fireTargetIncome: number
  fireHorizonYears: number
  riskTolerance: number
  strategyPreference: string
}

export function Onboarding() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, refreshUserProfile } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<OnboardingData>({
    fireTargetIncome: 0,
    fireHorizonYears: 10,
    riskTolerance: 5,
    strategyPreference: 'buy-hold',
  })

  const totalSteps = 5

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    const updateData: Database['public']['Tables']['users']['Update'] = {
      fire_target_income: formData.fireTargetIncome,
      fire_horizon_years: formData.fireHorizonYears,
      risk_tolerance: formData.riskTolerance,
      strategy_preference: formData.strategyPreference,
    }

    // @ts-ignore Supabase type inference issue
    const { error: updateError } = await supabase.from('users').update(updateData).eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      await refreshUserProfile()
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {step} of {totalSteps}</span>
              <span className="text-sm text-gray-500">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center py-8">
              <h1 className="text-3xl font-bold text-primary-900 mb-4">
                Welcome to Property Portfolio Tracker
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Let's set up your FIRE goals and investment strategy in just a few steps.
              </p>
              <button
                onClick={handleNext}
                className="bg-primary-500 text-white py-3 px-8 rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Step 2: FIRE Target Income */}
          {step === 2 && (
            <div className="py-4">
              <h2 className="text-2xl font-bold text-primary-900 mb-2">
                What's your FIRE income goal?
              </h2>
              <p className="text-gray-600 mb-6">
                How much annual income (AUD) do you need to achieve financial independence?
              </p>
              <div className="mb-6">
                <label htmlFor="fireIncome" className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Target Income (AUD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">$</span>
                  <input
                    id="fireIncome"
                    type="number"
                    value={formData.fireTargetIncome || ''}
                    onChange={(e) => setFormData({ ...formData, fireTargetIncome: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                    placeholder="100000"
                    min="0"
                    step="1000"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Example: $80,000 - $150,000 per year for most Australian FIRE investors
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={formData.fireTargetIncome <= 0}
                  className="flex-1 bg-primary-500 text-white py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Timeline */}
          {step === 3 && (
            <div className="py-4">
              <h2 className="text-2xl font-bold text-primary-900 mb-2">
                What's your timeline?
              </h2>
              <p className="text-gray-600 mb-6">
                How many years until you want to reach FIRE?
              </p>
              <div className="mb-6">
                <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                  Years to FIRE
                </label>
                <input
                  id="timeline"
                  type="number"
                  value={formData.fireHorizonYears}
                  onChange={(e) => setFormData({ ...formData, fireHorizonYears: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  min="1"
                  max="50"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Typical range: 10-20 years
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-primary-500 text-white py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Risk Tolerance */}
          {step === 4 && (
            <div className="py-4">
              <h2 className="text-2xl font-bold text-primary-900 mb-2">
                What's your risk tolerance?
              </h2>
              <p className="text-gray-600 mb-6">
                Rate your comfort with investment risk (1 = very conservative, 10 = very aggressive)
              </p>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Conservative</span>
                  <span className="text-2xl font-bold text-primary-500">{formData.riskTolerance}</span>
                  <span className="text-sm text-gray-600">Aggressive</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.riskTolerance}
                  onChange={(e) => setFormData({ ...formData, riskTolerance: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-primary-500 text-white py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Strategy Preference */}
          {step === 5 && (
            <div className="py-4">
              <h2 className="text-2xl font-bold text-primary-900 mb-2">
                What's your investment strategy?
              </h2>
              <p className="text-gray-600 mb-6">
                Choose the strategy that best aligns with your goals
              </p>
              <div className="space-y-3 mb-6">
                <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="strategy"
                    value="buy-hold"
                    checked={formData.strategyPreference === 'buy-hold'}
                    onChange={(e) => setFormData({ ...formData, strategyPreference: e.target.value })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Buy & Hold</div>
                    <div className="text-sm text-gray-600">Long-term appreciation and rental income</div>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="strategy"
                    value="value-add"
                    checked={formData.strategyPreference === 'value-add'}
                    onChange={(e) => setFormData({ ...formData, strategyPreference: e.target.value })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Value-Add</div>
                    <div className="text-sm text-gray-600">Renovations and improvements to increase value</div>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="strategy"
                    value="development"
                    checked={formData.strategyPreference === 'development'}
                    onChange={(e) => setFormData({ ...formData, strategyPreference: e.target.value })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Development</div>
                    <div className="text-sm text-gray-600">Building new properties or subdividing</div>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="strategy"
                    value="mixed"
                    checked={formData.strategyPreference === 'mixed'}
                    onChange={(e) => setFormData({ ...formData, strategyPreference: e.target.value })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Mixed Strategy</div>
                    <div className="text-sm text-gray-600">Combination of different approaches</div>
                  </div>
                </label>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 bg-accent-500 text-white py-3 px-6 rounded-lg hover:bg-accent-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
