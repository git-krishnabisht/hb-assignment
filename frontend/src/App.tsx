import { useState, useEffect, useCallback } from "react";
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import { Dashboard } from "./components/Dashboard";
import type { User } from "./interface/User";
import type { AuthState } from "./interface/AuthState";
import { LoadingSpinner } from "./components/Icons";
import { StarIcon } from "lucide-react";
import { tokenManager } from "./utils/tokenManager";
import { api } from "./utils/api";

export const API_BASE = import.meta.env.VITE_API_BASE;
export const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY;
export const TOKEN_EXPIRY_KEY = import.meta.env.VITE_TOKEN_EXPIRY_KEY;

export interface SignInProps {
  onAuth: (user: User, token: string) => void;
  onSwitchToSignUp?: () => void;
}

export interface SignUpProps {
  onAuth: (user: User, token: string) => void;
  onSwitchToSignIn?: () => void;
}

export interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
  });
  const [currentView, setCurrentView] = useState<
    "signin" | "signup" | "dashboard"
  >("signin");

  const initializeAuth = useCallback(async () => {
    try {
      const storedToken = tokenManager.getToken();
      const storedUser = tokenManager.getUser();

      if (storedToken && storedUser) {
        setAuthState((prev) => ({
          ...prev,
          user: storedUser,
          accessToken: storedToken,
          isAuthenticated: true,
          isLoading: true,
          isInitialized: false,
        }));
        setCurrentView("dashboard");

        try {
          const response = await api.getMe();
          if (response.user) {
            tokenManager.setUser(response.user);
            setAuthState({
              user: response.user,
              accessToken: storedToken,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
            });
            return;
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          tokenManager.clearToken();
          console.log("debug point 6");
        }
      }

      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");

      if (tokenFromUrl) {
        tokenManager.setToken(tokenFromUrl);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        try {
          const response = await api.getMe();
          if (response.user) {
            tokenManager.setUser(response.user);
            setAuthState({
              user: response.user,
              accessToken: tokenFromUrl,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
            });
            setCurrentView("dashboard");
            return;
          }
        } catch (error) {
          console.error("OAuth token verification failed:", error);
          tokenManager.clearToken();
          console.log("debug point 8");
        }
      }

      setAuthState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
      setCurrentView("signin");
    } catch (error) {
      console.error("Auth initialization error:", error);
      tokenManager.clearToken();
      console.log("debug point 7");
      setAuthState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
      setCurrentView("signin");
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!authState.isAuthenticated || !authState.isInitialized) return;

    const interval = setInterval(async () => {
      if (tokenManager.isTokenExpiring()) {
        try {
          const newToken = await api.refreshTokens();
          if (!newToken) {
            handleLogout();
          } else {
            setAuthState((prev) => ({ ...prev, accessToken: newToken }));
          }
        } catch (error) {
          console.error("Background token refresh failed:", error);
          handleLogout();
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, authState.isInitialized]);

  const handleAuthSuccess = (userData: User, token: string) => {
    tokenManager.setToken(token);
    tokenManager.setUser(userData);
    setAuthState({
      user: userData,
      accessToken: token,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
    });
    setCurrentView("dashboard");
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenManager.clearToken();
      console.log("debug point 9");
      setAuthState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
      setCurrentView("signin");
    }
  };

  if (!authState.isInitialized) {
    return <LoadingSpinner />;
  }

  if (authState.isAuthenticated && authState.user) {
    return <Dashboard user={authState.user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] lg:flex-row flex-col">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
          <div className="max-w-md mx-auto w-full">
            <div className="flex items-center mb-6 sm:mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
                <StarIcon />
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                HD
              </span>
            </div>

            {currentView === "signin" && (
              <SignIn
                onAuth={handleAuthSuccess}
                onSwitchToSignUp={() => setCurrentView("signup")}
              />
            )}

            {currentView === "signup" && (
              <SignUp
                onAuth={handleAuthSuccess}
                onSwitchToSignIn={() => setCurrentView("signin")}
              />
            )}
          </div>
        </div>

        {/* Right Side - Abstract Background */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 relative overflow-hidden min-h-[200px] lg:min-h-full order-1 lg:order-2">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-80"></div>
          <div
            className="absolute inset-0"
            style={{
              background: `
              radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.8) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(147, 51, 234, 0.8) 0%, transparent 50%),
              radial-gradient(circle at 60% 20%, rgba(16, 185, 129, 0.6) 0%, transparent 50%)
            `,
            }}
          ></div>

          {/* Abstract flowing shapes */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-80 h-80 opacity-30"
              style={{
                background: `
                  conic-gradient(from 0deg, 
                    rgba(59, 130, 246, 0.8) 0deg,
                    rgba(147, 51, 234, 0.8) 120deg,
                    rgba(16, 185, 129, 0.6) 240deg,
                    rgba(59, 130, 246, 0.8) 360deg
                  )
                `,
                borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
                filter: "blur(20px)",
                animation: "float 6s ease-in-out infinite",
              }}
            ></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
