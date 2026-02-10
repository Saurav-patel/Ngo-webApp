import apiClient from "../lib/apiClient.js";
import { BaseService } from "./baseService.js";



// load Razorpay script
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


export const createDonationOrder = async (payload) => {
  const { data } = await apiClient.post("/donation/create-order", payload, { withCredentials: true });
  return this.parseData(data, "Failed to create donation order");
};


export const verifyDonationPayment = async (payload) => {
  const { data } = await apiClient.post("/donation/verify-donation", payload, { withCredentials: true });
  return this.parseData(data, "Failed to verify donation payment");
};
