
import apiClient from "../lib/apiClient.js"
import { BaseService } from "./baseService.js"

class UserService extends BaseService {
  
  async completeProfile(payload) {
    const res = await apiClient.post(`/user/me/complete-profile`, payload)
    return this.validate(res, "Failed to complete profile")
    
  }

  
  async getUserDetails() {
    const res = await apiClient.get(`/user/me/get-user-details`)
    return this.parseData(res, "Failed to fetch user details")
    
  }

  
  async changePassword(payload) {
    const res = await apiClient.post(`/user/me/change-password`, payload)
    return this.validate(res, "Failed to change password")
    
  }

  
  async getMembershipStatus() {
    const res = await apiClient.get(`/user/me/membership-status`)
    return this.parseData(res, "Failed to fetch membership status")
    
  }

  
  async uploadProfilePicture(formData) {
    console.log("Uploading profile picture...", formData)
    const res = await apiClient.put(
      `/user/me/profile-picture`,
      formData
    )
    console.log(res)
    return this.validate(res, "Failed to upload profile picture")
    
  }


  async updateProfile(payload) {
    const res = await apiClient.patch(`/user/me/update-profile`, payload)
    return this.validate(res, "Failed to update profile")
  }

}

export const userService = new UserService()
