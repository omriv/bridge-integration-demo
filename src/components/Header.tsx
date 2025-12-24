import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useEnvironment } from '../context/EnvironmentContext';

export function Header() {
  const navigate = useNavigate();
  const { environment, setEnvironment } = useEnvironment();

  const handleEnvironmentToggle = () => {
    const newEnv = environment === 'sandbox' ? 'qa' : 'sandbox';
    setEnvironment(newEnv);
    navigate('/');
    window.location.reload();
  };

  const headerBgClass = environment === 'qa' 
    ? 'bg-lime-500/80 dark:bg-lime-600/80' 
    : 'bg-amber-500/80 dark:bg-amber-600/80';

  return (
    <header className={`sticky top-0 z-50 ${headerBgClass} backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: App Name */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <h1 className="text-xl font-bold text-white">
              Bridge <span className="text-neutral-900 dark:text-white">Demo</span>
            </h1>
          </div>

          {/* Center: Environment Toggle */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              {environment === 'sandbox' ? '🧪 Sandbox' : '🔧 QA'}
            </span>
            <button
              onClick={handleEnvironmentToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 ${
                environment === 'qa' ? 'bg-lime-700' : 'bg-amber-700'
              }`}
              title={`Switch to ${environment === 'sandbox' ? 'QA' : 'Sandbox'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  environment === 'qa' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Right: Theme Toggle & Dev Account */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/account')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
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
