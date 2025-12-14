import { useState } from 'react';

interface MockToggleProps {
  useMock: boolean;
  onToggle: (useMock: boolean) => void;
}

export function MockToggle({ useMock, onToggle }: MockToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle(!useMock);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="flex items-center gap-3 relative">
      {/* Mode Badge */}
      <div className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
        useMock 
          ? 'bg-orange-500/10 text-orange-400 border-2 border-orange-500/30' 
          : 'bg-green-500/10 text-green-400 border-2 border-green-500/30'
      }`}>
        {useMock ? '🎭 Mock Data' : '🌐 Real Data'}
      </div>

      {/* Toggle Switch with Tooltip */}
      <div 
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
            useMock 
              ? 'bg-orange-500 focus:ring-orange-500' 
              : 'bg-green-500 focus:ring-green-500'
          } ${isAnimating ? 'scale-95' : 'scale-100'}`}
          role="switch"
          aria-checked={useMock}
          aria-label="Toggle between mock and real data"
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              useMock ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute top-full mt-2 right-0 z-50 w-64 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl border border-slate-700">
            <div className="font-semibold mb-1">Data Source Toggle</div>
            <div className="text-slate-300">
              {useMock 
                ? 'Currently using local mock data. Switch to use real Bridge API.' 
                : 'Currently using Bridge API. Switch to use local mock data for testing.'}
            </div>
            <div className="absolute -top-1 right-6 w-2 h-2 bg-slate-800 border-t border-l border-slate-700 transform rotate-45"></div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="text-xs text-slate-400 hidden md:block">
        {useMock ? 'Using local mock data' : 'Using Bridge API'}
      </div>
    </div>
  );
}
