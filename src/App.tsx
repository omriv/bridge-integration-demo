import { Routes, Route } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { HomePage } from './pages/HomePage'
import { WalletOverviewPage } from './pages/WalletOverviewPage'

function App() {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wallet/:walletId" element={<WalletOverviewPage />} />
      </Routes>
    </DataProvider>
  )
}

export default App
