import type { User } from "../interface/User.tsx";

export const tokenManager = {
  setToken: (token: string) => {
    try {
      const expiry = Date.now() + 14 * 60 * 1000;
      localStorage.setItem("hd_auth_token", token);
      localStorage.setItem("hd_auth_token_expiry", expiry.toString());
      localStorage.setItem("hd_auth_timestamp", Date.now().toString());
    } catch (error) {
      console.error("Failed to store token:", error);
    }
  },

  getToken: (): string | null => {
    try {
      const token = localStorage.getItem("hd_auth_token");
      const expiry = localStorage.getItem("hd_auth_token_expiry");

      if (!token || !expiry) return null;

      if (Date.now() > parseInt(expiry)) {
        tokenManager.clearToken();
        console.log("debug point 4");
        return null;
      }

      return token;
    } catch (error) {
      console.error("Failed to get token:", error);
      return null;
    }
  },

  clearToken: () => {
    try {
      localStorage.removeItem("hd_auth_token");
      localStorage.removeItem("hd_auth_token_expiry");
      localStorage.removeItem("hd_auth_timestamp");
      localStorage.removeItem("hd_auth_user");
    } catch (error) {
      console.error("Failed to clear token:", error);
    }
  },

  setUser: (user: User) => {
    try {
      localStorage.setItem("hd_auth_user", JSON.stringify(user));
    } catch (error) {
      console.error("Failed to store user:", error);
    }
  },

  getUser: (): User | null => {
    try {
      const userStr = localStorage.getItem("hd_auth_user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Failed to get user:", error);
      return null;
    }
  },

  isTokenExpiring: (): boolean => {
    try {
      const expiry = localStorage.getItem("hd_auth_token_expiry");
      if (!expiry) return true;

      return Date.now() > parseInt(expiry) - 2 * 60 * 1000;
    } catch (error) {
      return true;
    }
  },

  hasValidToken: (): boolean => {
    const token = tokenManager.getToken();
    return !!token;
  },
};
