// src/services/ngoService.js
import apiClient from "../lib/apiClient.js"
import { BaseService } from "./baseService.js"

class NgoService extends BaseService {
  async getNgoInfo() {
    const res = await apiClient.get("/ngo/about")
    return this.parseData(res, "Failed to fetch NGO information")
  }
}

export const ngoService = new NgoService()
