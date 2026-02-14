import apiClient from "../lib/apiClient.js";
import { BaseService } from "./baseService.js";



export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
class DonationService extends BaseService {
  async createDonationOrder(payload) {
    const res = await apiClient.post("/donation/create-order", payload, { withCredentials: true });
    return this.parseData(res, "Failed to create donation order");
  }

  async verifyDonationPayment(payload) {
    const res = await apiClient.post("/donation/verify-donation", payload, { withCredentials: true });
    return this.parseData(res, "Failed to verify donation payment");
  }

  async getDonationHistory() {
    const res = await apiClient.get("/donation/my-donations", { withCredentials: true });
    return this.parseData(res, "Failed to fetch donation history");
  }

  async getAllDonations() {
    const res = await apiClient.get("/donation/all-donations", { withCredentials: true });
    return this.parseData(res, "Failed to fetch all donations");
  }

  async getSingleDonation(donationId) {
    const res = await apiClient.get(`/donation/single-donation/${donationId}`, { withCredentials: true });
    return this.parseData(res, "Failed to fetch donation details");
  }
  async getDonationStats() {
    const res = await apiClient.get("/donation/donation-stats", { withCredentials: true });
    return this.parseData(res, "Failed to fetch donation statistics");
  }

  async getDonationStatus(orderId) {
    const res = await apiClient.get(`/donation/status/${orderId}`);
    return this.parseData(res, "Failed to fetch donation status");
  }
}

export const donationService = new DonationService();