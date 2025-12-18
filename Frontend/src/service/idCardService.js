
import apiClient from "../lib/apiClient.js"
import { BaseService } from "./baseService.js"

class IdCardService extends BaseService {

  async applyForIdCard() {
    const res = await apiClient.post("/idCards/apply")
    return this.validate(res, "Failed to apply for ID Card")
  }

  async renewIdCard(cardId) {
    const res = await apiClient.post(`/idCards/renew/${cardId}`)
    return this.validate(res, "Failed to renew ID Card")
  }

  async getMyIdCard() {
    const res = await apiClient.get(`/idCards/my-card`)
    return this.parseData(res, "Failed to fetch my ID Card")
  }

  async getAllIdCards() {
    const res = await apiClient.get("/idCards/all-cards")
    return this.parseData(res, "Failed to fetch all ID Cards")
  }

  async getSingleIdCard(cardId) {
    const res = await apiClient.get(`/idCards/card/${cardId}`)
    return this.parseData(res, "Failed to fetch ID Card details")
  }
}

export const idCardService = new IdCardService()
