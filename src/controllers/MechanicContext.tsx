import { createContext, useContext, useState, ReactNode } from 'react';

interface MechanicContextType {
  isActive: boolean;
  setIsActive: (v: boolean) => void;
}

const MechanicContext = createContext<MechanicContextType | undefined>(undefined);

export function MechanicProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  return (
    <MechanicContext.Provider value={{ isActive, setIsActive }}>
      {children}
    </MechanicContext.Provider>
  );
}

export function useMechanic() {
  const ctx = useContext(MechanicContext);
  if (!ctx) throw new Error('useMechanic must be used within MechanicProvider');
  return ctx;
}
