
import apiClient from "../lib/apiClient.js"
import { BaseService } from "./baseService.js"

class AuthService extends BaseService {

  
  async login(payload) {
    const res = await apiClient.post("/auth/login", payload)
    const data= this.parseData(res, "Login failed")
    
    return data 
    
    
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
    
      const res = await apiClient.post("/auth/logout")
      return this.validate(res, "Logout failed")
   
  }
}

export const authService = new AuthService()
