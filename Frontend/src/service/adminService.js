
import apiClient from "../lib/apiClient.js"
import { BaseService } from "./baseService.js"

class AdminService extends BaseService {
  
  async getAllUsers() {
    const res = await apiClient.get("/admin/all-users")
    return this.parseData(res, "Failed to fetch all users")
  }

  async deleteUser(userId) {
    const res = await apiClient.delete(`/admin/delete-user/${userId}`)
    return this.validate(res, "Failed to delete user")
  }
  async getSingleUser(userId) {
    const res = await apiClient.get(`/admin/single-user/${userId}`)
    return this.parseData(res, "Failed to fetch user details")
  }
  
  async getMembers() {
    const res = await apiClient.get("/admin/members")
    return this.parseData(res, "Failed to fetch members")
  }

  async deleteMember(memberId) {
    const res = await apiClient.delete(`/admin/delete-member/${memberId}`)
    return this.validate(res, "Failed to delete member")
  }

  async addUser(formData) {
    const res = await apiClient.post("/admin/add-user", formData)
    return this.validate(res, "Failed to add user info")
  }

  async updateUser(userId, formData) {
    const res = await apiClient.put(`/admin/update-user/${userId}`, formData)
    return this.validate(res, "Failed to update user info")
  }

  
  async uploadNgoDocuments(formData) {
    const res = await apiClient.post("/admin/upload-ngo-documents", formData)
    return this.validate(res, "Failed to upload NGO documents")
  }
}

export const adminService = new AdminService()
