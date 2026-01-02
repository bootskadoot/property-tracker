import { BrowserRouter as Router } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-blue-900">
            Property Portfolio Tracker
          </h1>
          <p className="mt-4 text-gray-600">
            Track your property investments and reach FIRE goals
          </p>
        </div>
      </div>
    </Router>
  )
}

export default App
