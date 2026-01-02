import { ReactNode, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { UpgradePrompt } from './UpgradePrompt'

interface ProFeatureGateProps {
  children: ReactNode
  featureName?: string
}

export function ProFeatureGate({ children, featureName = 'this feature' }: ProFeatureGateProps) {
  const { userProfile } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const isPro = userProfile?.subscription_tier === 'pro'

  if (isPro) {
    return <>{children}</>
  }

  return (
    <>
      <div className="relative">
        {/* Blurred Content */}
        <div className="filter blur-sm pointer-events-none select-none">
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center border-2 border-primary-200">
            <div className="inline-block p-3 bg-accent-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Feature</h3>
            <p className="text-gray-600 mb-6">
              Upgrade to Pro to unlock {featureName}
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-primary-500 text-white py-3 px-8 rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>

      {showUpgradeModal && (
        <UpgradePrompt onClose={() => setShowUpgradeModal(false)} />
      )}
    </>
  )
}
