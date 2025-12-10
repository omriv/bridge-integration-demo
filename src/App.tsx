import { Routes, Route } from 'react-router-dom'
// Pages
import { HomePage } from './pages/HomePage'
import { WalletOverviewPage } from './pages/WalletOverviewPage'
import { DeveloperAccountPage } from './pages/DeveloperAccountPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/account" element={<DeveloperAccountPage />} />
      <Route path="/:customerId/:walletId" element={<WalletOverviewPage />} />
    </Routes>
  )
}

export default App
