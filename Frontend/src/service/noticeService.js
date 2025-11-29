
import apiClient from "../lib/apiClient.js"
import { BaseService } from "./baseService.js"

class NoticeService extends BaseService {

  async getAllNotices() {
    const res = await apiClient.get("/notice/getAllNotices")
    return this.parseData(res, "Failed to fetch all notices")
  }

  async getNoticeById(noticeId) {
    const res = await apiClient.get(`/notice/getNoticeById/${noticeId}`)
    return this.parseData(res, "Failed to fetch notice details")
  }

  async addNotice(payload) {
    const res = await apiClient.post("/notice/addNotice", payload)
    return this.validate(res, "Failed to add notice")
  }

  async deleteNotice(noticeId) {
    const res = await apiClient.delete(`/notice/deleteNotice/${noticeId}`)
    return this.validate(res, "Failed to delete notice")
  }

  async editNotice(noticeId, payload) {
    const res = await apiClient.put(`/notice/editNotice/${noticeId}`, payload)
    return this.validate(res, "Failed to edit notice")
  }
}

export const noticeService = new NoticeService()
