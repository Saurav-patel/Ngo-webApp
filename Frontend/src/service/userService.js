
import apiClient from "../lib/apiClient.js"
import { BaseService } from "./baseService.js"

class UserService extends BaseService {
  
  async completeProfile(payload, userId) {
    const res = await apiClient.post(`/user/complete-profile/${userId}`, payload)
    return this.validate(res, "Failed to complete profile")
    
  }

  
  async getUserDetails() {
    const res = await apiClient.get(`/user/get-user-details`)
    return this.validate(res, "Failed to fetch user details")
    
  }

  
  async changePassword(payload, userId) {
    const res = await apiClient.post(`/user/change-password/${userId}`, payload)
    return this.validate(res, "Failed to change password")
    
  }

  
  async getMembershipStatus(userId) {
    const res = await apiClient.get(`/user/membership-status/${userId}`)
    return this.parseData(res, "Failed to fetch membership status")
    
  }

  
  async uploadProfilePicture(formData, userId) {
    const res = await apiClient.post(
      `/user/upload-profile-picture/${userId}`,
      formData
    )
    return this.validate(res, "Failed to upload profile picture")
    
  }

 
  async updateProfilePicture(formData, userId) {
    const res = await apiClient.patch(
      `/user/update-profile-picture/${userId}`,
      formData
    )
    return this.validate(res, "Failed to update profile picture")
  }
}

export const userService = new UserService()
