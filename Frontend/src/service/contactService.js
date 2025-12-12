
import apiClient from "../lib/apiClient.js";
import { BaseService } from "./baseService.js";

class ContactService extends BaseService {
  
  async createContactRequest(payload) {
    const res = await apiClient.post("/contact/create-contact-request", payload)
    return this.parseData(res, "Failed to create contact request")
  }

 
  async getContactRequests(query = {}) {
    const res = await apiClient.get("/contact/contact-requests", { params: query })
    return this.parseData(res, "Failed to fetch contact requests")
  }


  async getContactRequestById(id) {
    const res = await apiClient.get(`/contact/contact-request/${id}`)
    return this.parseData(res, "Failed to fetch contact request")
  }

  
  async updateContactRequestStatus(id, body) {
    const res = await apiClient.patch(`/contact/update-contact-request-status/${id}`, body)
    return this.validate(res, "Failed to update contact request status")
  }

 
  async deleteContactRequest(id) {
    const res = await apiClient.delete(`/contact/delete-contact-request/${id}`)
    return this.validate(res, "Failed to delete contact request");
  }


  async getRequestStatus(id) {
    const res = await apiClient.get(`/contact/get-request-status/${id}`)
    return this.parseData(res, "Failed to fetch contact request status")
  }
}

export const contactService = new ContactService()
export default contactService
