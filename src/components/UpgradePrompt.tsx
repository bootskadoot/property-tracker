import { X } from 'lucide-react'

interface UpgradePromptProps {
  onClose: () => void
}

export function UpgradePrompt({ onClose }: UpgradePromptProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Upgrade to Pro</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Pricing */}
          <div className="bg-primary-50 border-2 border-primary-500 rounded-lg p-6 mb-6 text-center">
            <p className="text-sm font-medium text-primary-700 mb-2">Professional Plan</p>
            <p className="text-5xl font-bold text-primary-900 mb-2">$15</p>
            <p className="text-gray-600">per month</p>
          </div>

          {/* Features Comparison */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>

            <div className="space-y-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-accent-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Unlimited Properties</p>
                  <p className="text-sm text-gray-600">Track as many properties as you want (Free: 2 max)</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-accent-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Advanced Charts & Analytics</p>
                  <p className="text-sm text-gray-600">Portfolio value over time, performance comparison, and more</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-accent-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">FIRE Goal Tracking</p>
                  <p className="text-sm text-gray-600">Progress dashboard, calculator, and timeline projections</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-accent-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Property Comparison Table</p>
                  <p className="text-sm text-gray-600">Sortable table comparing all properties side-by-side</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-accent-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Export to CSV</p>
                  <p className="text-sm text-gray-600">Download your portfolio data for analysis in Excel</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-500">AI-Powered Insights</p>
                  <p className="text-sm text-gray-400">Coming soon: Smart recommendations and alerts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Free vs Pro Comparison */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Comparison</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-3">Free</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ 2 properties max</li>
                  <li>✓ Basic dashboard</li>
                  <li>✓ Property tracking</li>
                  <li>✓ Cashflow tracking</li>
                  <li>✓ Simple charts</li>
                </ul>
              </div>
              <div className="border-2 border-primary-500 rounded-lg p-4 bg-primary-50">
                <p className="font-semibold text-primary-900 mb-3">Pro</p>
                <ul className="space-y-2 text-sm text-primary-900">
                  <li>✓ Unlimited properties</li>
                  <li>✓ Advanced analytics</li>
                  <li>✓ FIRE tracking</li>
                  <li>✓ Portfolio comparison</li>
                  <li>✓ CSV export</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button className="bg-gray-300 text-gray-600 py-3 px-8 rounded-lg font-medium cursor-not-allowed mb-2">
              Payment Coming Soon
            </button>
            <p className="text-sm text-gray-500">
              Payment processing will be available soon
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
