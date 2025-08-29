import { API_BASE } from "../App";
import { tokenManager } from "./tokenManager";

export const api = {
  refreshTokens: async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          tokenManager.setToken(data.accessToken);
          return data.accessToken;
        }
      }
      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  },

  makeAuthenticatedRequest: async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    let token = tokenManager.getToken();

    // Try to refresh if token is expiring
    if (!token || tokenManager.isTokenExpiring()) {
      token = await api.refreshTokens();
      if (!token) {
        tokenManager.clearToken();
        console.log("debug point 1");
        throw new Error("Authentication failed");
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    // If we get 401, try refreshing once more
    if (response.status === 401) {
      token = await api.refreshTokens();
      if (!token) {
        tokenManager.clearToken();
        console.log("debug point 2");
        throw new Error("Authentication failed");
      }

      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    }

    return response;
  },

  signupWithOTP: async (data: { name: string; dob: string; email: string }) => {
    const response = await fetch(`${API_BASE}/auth/signup/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  signinWithOTP: async (email: string) => {
    const response = await fetch(`${API_BASE}/auth/signin/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  verifySignupOTP: async (data: {
    name: string;
    dob: string;
    email: string;
    otp: string;
  }) => {
    const response = await fetch(`${API_BASE}/auth/signup/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  verifySigninOTP: async (data: { email: string; otp: string }) => {
    const response = await fetch(`${API_BASE}/auth/signin/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  getMe: async () => {
    const response = await api.makeAuthenticatedRequest(`${API_BASE}/auth/me`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },

  logout: async () => {
    try {
      const response = await api.makeAuthenticatedRequest(
        `${API_BASE}/auth/logout`,
        {
          method: "POST",
        }
      );
      return response.ok;
    } catch (error) {
      return true;
    } finally {
      tokenManager.clearToken();
      console.log("debug point 3");
    }
  },

  createNote: async (note: string) => {
    const response = await api.makeAuthenticatedRequest(
      `${API_BASE}/notes/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },

  fetchNotes: async () => {
    const response = await api.makeAuthenticatedRequest(
      `${API_BASE}/notes/fetch`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },

  deleteNotes: async (ids: number[]) => {
    const response = await api.makeAuthenticatedRequest(
      `${API_BASE}/notes/delete`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  },
};
