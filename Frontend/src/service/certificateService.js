
import apiClient from "../lib/apiClient.js"
import { BaseService } from "./baseService.js"

class CertificateService extends BaseService {

  async issueCertificate(payload) {
    const res = await apiClient.post("/certificates/issue-certificate", payload)
    return this.validate(res, "Failed to issue certificate")
  }

  async getMyCertificates() {
    const res = await apiClient.get(`/certificates/my-certificates`)
    return this.parseData(res, "Failed to fetch my certificates")
  }

  async getAllCertificates() {
    const res = await apiClient.get("/certificates/all-certificates")
    return this.parseData(res, "Failed to fetch all certificates")
  }

  async getCertificateDetails(certificateId) {
    const res = await apiClient.get(`/certificates/get-certificate/${certificateId}`)
    return this.parseData(res, "Failed to fetch certificate details")
  }

  async deleteCertificate(certificateId) {
    const res = await apiClient.delete(`/certificates/delete-certificate/${certificateId}`)
    return this.validate(res, "Failed to delete certificate")
  }
}

export const certificateService = new CertificateService()
