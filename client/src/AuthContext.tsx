// src/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  user_id: number;
  email: string;
  fname: string;
  lname: string;
  neptun: string;
  role: "STDUSER" | "ADMIN";
  prof_pic_url?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  //check cookie or session once on mount
  const refreshUser = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.id && !data.user_id) data.user_id = data.id;
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch {
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  //On mount, restore cached user immediately
  useEffect(() => {
    const cashedUser = localStorage.getItem("user");
    if (cashedUser) {
      setUser(JSON.parse(cashedUser));
    }
    refreshUser();
  }, []);

  return (
    <>
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: !!user,
          login,
          logout,
          refreshUser,
          loading,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
