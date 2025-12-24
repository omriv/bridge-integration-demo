import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const navigate = useNavigate();

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

          {/* Right: Theme Toggle & Dev Account */}
          <div className="flex items-center gap-3">
             <button
                onClick={() => navigate('/account')}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                title="View Developer Account"
              >
                <span><i className="fas fa-user"></i></span>
                <span>Dev Account</span>
              </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
