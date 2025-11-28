// src/services/userService.js
import apiClient from "../lib/apiClient.js"

class UserService {
  // -------- Internal helper to normalize API errors --------
  validate(response, fallbackMessage = "Something went wrong") {
    const data = response?.data
    if (!data?.success) {
      throw new Error(data?.message || fallbackMessage)
    }
    return data
  }

  // -------- Profile Completion --------
  async completeProfile(payload, userId) {
    const res = await apiClient.post(`/user/complete-profile/${userId}`, payload)
    return this.validate(res, "Failed to complete profile")
    // returns full response.data (success, message, data?)
  }

  // -------- Get User Details --------
  async getUserDetails(userId) {
    const res = await apiClient.get(`/user/get-user-details/${userId}`)
    const data = this.validate(res, "Failed to fetch user details")
    return data.data // user object
  }

  // -------- Change Password --------
  async changePassword(payload, userId) {
    const res = await apiClient.post(`/user/change-password/${userId}`, payload)
    return this.validate(res, "Failed to change password")
    // typically: { success, message }
  }

  // -------- Membership Status --------
  async getMembershipStatus(userId) {
    const res = await apiClient.get(`/user/membership-status/${userId}`)
    const data = this.validate(res, "Failed to fetch membership status")
    return data.data // membership info
  }

  // -------- Upload Profile Picture (first time) --------
  async uploadProfilePicture(formData, userId) {
    const res = await apiClient.post(
      `/user/upload-profile-picture/${userId}`,
      formData
      // axios will set multipart Content-Type automatically for FormData
    )
    return this.validate(res, "Failed to upload profile picture")
  }

  // -------- Update Existing Profile Picture --------
  async updateProfilePicture(formData, userId) {
    const res = await apiClient.patch(
      `/user/update-profile-picture/${userId}`,
      formData
    )
    return this.validate(res, "Failed to update profile picture")
  }
}

export const userService = new UserService()
