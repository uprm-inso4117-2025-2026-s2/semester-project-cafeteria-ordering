import { createContext, ReactNode, useContext, useState } from 'react';


// User object
// Properties should be updated to match database after integration
type User = {
  fullName: string;
  email: string;
};

type AuthContextType = {
  user: User | null; // user=null if not logged in
  loggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Wraps the app and provides global authentication state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loggedIn: !!user, // true if user exists
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for accessing authentication context
export function useAuth() {
  const context = useContext(AuthContext);

  // Ensures hook is used within provider
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  
  return context;
}