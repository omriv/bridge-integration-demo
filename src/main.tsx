import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'
import { EnvironmentProvider } from './context/EnvironmentContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <EnvironmentProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </EnvironmentProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
