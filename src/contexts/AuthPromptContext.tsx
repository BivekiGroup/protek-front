import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AuthRequirementModal from '@/components/AuthModal';

interface AuthPromptOptions {
  targetPath?: string;
}

interface AuthPromptContextValue {
  openAuthPrompt: (options?: AuthPromptOptions) => void;
  closeAuthPrompt: () => void;
}

const AuthPromptContext = createContext<AuthPromptContextValue | undefined>(undefined);

interface AuthPromptProviderProps {
  children: React.ReactNode;
  onRequestLogin: () => void;
}

export const AuthPromptProvider: React.FC<AuthPromptProviderProps> = ({ children, onRequestLogin }) => {
  const [open, setOpen] = useState(false);

  const closeAuthPrompt = useCallback(() => {
    setOpen(false);
  }, []);

  const openAuthPrompt = useCallback((options?: AuthPromptOptions) => {
    setOpen(true);
  }, []);

  const handleRequestLogin = useCallback(() => {
    closeAuthPrompt();
    onRequestLogin();
  }, [closeAuthPrompt, onRequestLogin]);

  const value = useMemo<AuthPromptContextValue>(
    () => ({ openAuthPrompt, closeAuthPrompt }),
    [openAuthPrompt, closeAuthPrompt]
  );

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <AuthRequirementModal
        open={open}
        onClose={closeAuthPrompt}
        onRequestLogin={handleRequestLogin}
      />
    </AuthPromptContext.Provider>
  );
};

export const useAuthPrompt = () => {
  const context = useContext(AuthPromptContext);
  if (!context) {
    throw new Error('useAuthPrompt must be used within an AuthPromptProvider');
  }
  return context;
};
