import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { bridgeAPI } from '../services/bridgeAPI';

type Environment = 'sandbox' | 'qa';

interface EnvironmentContextType {
  environment: Environment;
  setEnvironment: (env: Environment) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment, setEnvironment] = useState<Environment>(
    () => (localStorage.getItem('bridgeEnvironment') as Environment) || 'sandbox'
  );

  // Sync environment changes with bridgeAPI
  useEffect(() => {
    bridgeAPI.setEnvironment(environment);
  }, [environment]);

  const handleSetEnvironment = (env: Environment) => {
    setEnvironment(env);
    localStorage.setItem('bridgeEnvironment', env);
  };

  return (
    <EnvironmentContext.Provider value={{ environment, setEnvironment: handleSetEnvironment }}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within EnvironmentProvider');
  }
  return context;
};
