import React, {createContext, useContext, ReactNode} from 'react';
import useApplyState from 'services/useApplyState';

const ActionContext = createContext<{
  applyState: (state: any) => Promise<void>;
} | null>(null);

export const useActionContext = () => {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error('useActionState must be used within ActionProvider');
  }
  return context;
};

export const ActionProvider = ({children}: {children: ReactNode}) => {
  const {applyState} = useApplyState();
  return <ActionContext.Provider value={{applyState}}>{children}</ActionContext.Provider>;
};
