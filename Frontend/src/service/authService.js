// src/services/authService.js
import apiClient from "../lib/apiClient.js"

class AuthService {
  // -------- Internal helper for consistent error handling --------
  validate(response, fallbackMessage = "Something went wrong") {
    const data = response?.data
    if (!data?.success) {
      throw new Error(data?.message || fallbackMessage)
    }
    return data
  }

  // -------- LOGIN --------
  async login(payload) {
    const res = await apiClient.post("/auth/login", payload)

    const data = this.validate(res, "Login failed")

    // Store only token (your chosen architecture)
    if (data.accessToken) {
      localStorage.setItem("token", data.accessToken)
    }

    return data // { success, message, accessToken, data: { user } }
  }

  // -------- SIGNUP --------
  async signUp(payload) {
    const res = await apiClient.post("/auth/signup", payload)
    return this.validate(res, "Signup failed")
  }

  // -------- GET CURRENT USER --------
  async getCurrentUser() {
    const res = await apiClient.get("/auth/get-currentUser")

    const data = this.validate(res, "Failed to fetch current user")

    return data.data // return only the user object
  }

  // -------- LOGOUT --------
  async logout() {
    try {
      const res = await apiClient.post("/auth/logout")
      const data = this.validate(res, "Logout failed")
      return data
    } finally {
      // Always clear local token even if backend fails
      localStorage.removeItem("token")
    }
  }
}

export const authService = new AuthService()
