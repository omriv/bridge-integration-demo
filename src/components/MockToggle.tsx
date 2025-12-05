import { useState } from 'react';

interface MockToggleProps {
  useMock: boolean;
  onToggle: (useMock: boolean) => void;
}

export function MockToggle({ useMock, onToggle }: MockToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle(!useMock);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Mode Badge */}
      <div className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
        useMock 
          ? 'bg-orange-100 text-orange-800 border-2 border-orange-300' 
          : 'bg-green-100 text-green-800 border-2 border-green-300'
      }`}>
        {useMock ? '🎭 Mock Data' : '🌐 Real Data'}
      </div>

      {/* Toggle Switch */}
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
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

      {/* Helper Text */}
      <div className="text-xs text-gray-600 hidden md:block">
        {useMock ? 'Using local mock data' : 'Using Bridge API'}
      </div>
    </div>
  );
}
