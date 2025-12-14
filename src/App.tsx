import { Routes, Route } from 'react-router-dom'
// Components
import { Header } from './components/Header'
// Pages
import { HomePage } from './pages/HomePage'
import { WalletOverviewPage } from './pages/WalletOverviewPage'
import { DeveloperAccountPage } from './pages/DeveloperAccountPage'

function App() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/account" element={<DeveloperAccountPage />} />
        <Route path="/:customerId/:walletId" element={<WalletOverviewPage />} />
      </Routes>
    </div>
  )
}

export default App
