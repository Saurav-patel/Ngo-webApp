
import apiClient from "../lib/apiClient.js"
import { BaseService } from "./baseService.js"

class AuthService extends BaseService {

  
  async login(payload) {
    const res = await apiClient.post("/auth/login", payload)
    const data = this.validate(res, "Login failed")

    
    if (data.accessToken) {
      localStorage.setItem("token", data.accessToken)
    }

    const { accessToken, ...user } = data

    return user
  }

  
  async signUp(payload) {
    const res = await apiClient.post("/auth/signup", payload)
    return this.validate(res, "Signup failed")
  }

  
  async getCurrentUser() {
    const res = await apiClient.get("/auth/get-currentUser")
    return this.parseData(res, "Failed to fetch current user")
    
  }

  
  async logout() {
    try {
      const res = await apiClient.post("/auth/logout")
      return this.validate(res, "Logout failed")
    } finally {
      localStorage.removeItem("token")
    }
  }
}

export const authService = new AuthService()
