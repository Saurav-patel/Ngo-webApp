
import apiClient from "../lib/apiClient.js"
import { BaseService } from "./baseService.js"

class EventService extends BaseService {
  
  async getAllEvents() {
    const res = await apiClient.get("/events/all-events")
    return this.parseData(res, "Failed to fetch all events")
  }

  async getEventDetails(eventId) {
    const res = await apiClient.get(`/events/single-event/${eventId}`)
    return this.parseData(res, "Failed to fetch event details")
  }

  
  async registerParticipants(eventId) {
    const res = await apiClient.post(`/events/register/${eventId}`)
    return this.validate(res, "Failed to register participants")
  }

  async myParticipatedEvents() {
    const res = await apiClient.get(`/events/my-participation`)
    return this.parseData(res, "Failed to fetch my participated events")
  }

  
  async createEvent(formData) {
    const res = await apiClient.post("/event/create-event", formData)
    return this.validate(res, "Failed to create event")
  }

  async updateEvent(eventId, formData) {
    const res = await apiClient.put(`/event/update-event/${eventId}`, formData)
    return this.validate(res, "Failed to update event")
  }

  async deleteEvent(eventId) {
    const res = await apiClient.delete(`/event/delete-event/${eventId}`)
    return this.validate(res, "Failed to delete event")
  }

  
  async getAllParticipants(eventId) {
    const res = await apiClient.get(`/participation/all-participants/${eventId}`)
    return this.parseData(res, "Failed to fetch all participants")
  }

  async getUserParticipation(userId) {
    const res = await apiClient.get(`/participation/user-participation/${userId}`)
    return this.parseData(res, "Failed to fetch user participation")
  }

  async updateParticipationStatus(participationId, payload) {
    const res = await apiClient.put(
      `/participation/update-status/${participationId}`,
      payload
    )
    return this.validate(res, "Failed to update participation status")
  }
}

export const eventService = new EventService()
