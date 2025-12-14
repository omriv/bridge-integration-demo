import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { MockToggle } from './MockToggle';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';

export function Header() {
  const navigate = useNavigate();
  const { useMock, toggleMock } = useData();
  const [showModeTransition, setShowModeTransition] = useState(false);

  const handleMockToggle = () => {
    setShowModeTransition(true);
    toggleMock();
    setTimeout(() => {
      setShowModeTransition(false);
    }, 2000);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: App Name */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              Bridge <span className="text-amber-600 dark:text-amber-500">Demo</span>
            </h1>
          </div>

          {/* Middle: Data Mode Toggle */}
          <div className="flex items-center justify-center flex-1">
             <MockToggle useMock={useMock} onToggle={handleMockToggle} />
          </div>

          {/* Right: Theme Toggle & Dev Account */}
          <div className="flex items-center gap-3">
             <button
                onClick={() => navigate('/account')}
                disabled={useMock}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  useMock
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20'
                }`}
                title={useMock ? 'Developer Account is only available in real data mode' : 'View Developer Account'}
              >
                <span>👤</span>
                <span>Dev Account</span>
              </button>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Mode Transition Notification */}
        {showModeTransition && (
            <div className="absolute top-16 left-0 right-0 flex justify-center pointer-events-none">
              <div className={`mt-2 px-4 py-2 rounded-full shadow-lg border flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300 ${
                useMock 
                  ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-neutral-800 dark:border-amber-900 dark:text-amber-400' 
                  : 'bg-green-50 border-green-200 text-green-700 dark:bg-neutral-800 dark:border-green-900 dark:text-green-400'
              }`}>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span className="text-sm font-medium">
                  {useMock ? 'Switching to Mock Data...' : 'Switching to Real Data...'}
                </span>
              </div>
            </div>
          )}
      </div>
    </header>
  );
}
