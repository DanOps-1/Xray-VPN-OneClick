import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { type Route, SCREEN_TITLES } from '../app/routes.js';

interface NavigationState {
  stack: Route[];
}

type NavigationAction =
  | { type: 'NAVIGATE'; route: Route }
  | { type: 'GO_BACK' }
  | { type: 'RESET' };

function reducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'NAVIGATE':
      return { stack: [...state.stack, action.route] };
    case 'GO_BACK':
      if (state.stack.length <= 1) return state;
      return { stack: state.stack.slice(0, -1) };
    case 'RESET':
      return { stack: [{ screen: 'main-menu' }] };
    default:
      return state;
  }
}

interface NavigationContextValue {
  currentRoute: Route;
  breadcrumb: string[];
  canGoBack: boolean;
  navigate: (route: Route) => void;
  goBack: () => void;
  reset: () => void;
}

const NavigationContext = createContext<NavigationContextValue>({
  currentRoute: { screen: 'main-menu' },
  breadcrumb: ['Home'],
  canGoBack: false,
  navigate: () => {},
  goBack: () => {},
  reset: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    stack: [{ screen: 'main-menu' }],
  });

  const navigate = useCallback((route: Route) => {
    dispatch({ type: 'NAVIGATE', route });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const currentRoute = state.stack[state.stack.length - 1] ?? { screen: 'main-menu' as const };
  const breadcrumb = state.stack.map((r) => SCREEN_TITLES[r.screen]);
  const canGoBack = state.stack.length > 1;

  return (
    <NavigationContext.Provider
      value={{ currentRoute, breadcrumb, canGoBack, navigate, goBack, reset }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  return useContext(NavigationContext);
}
