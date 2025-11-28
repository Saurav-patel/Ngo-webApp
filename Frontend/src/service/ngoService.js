import apiClient from "../lib/apiClient.js";

class NgoService {
    validate(response, fallbackMessage = "Something went wrong") {
        const data = response?.data
        if (!data?.success) {
            throw new Error(data?.message || fallbackMessage)
        }
        return data
    }

    async getNgoInfo() {
        const res = await apiClient.get("/ngo/about")
        const data = this.validate(res, "Failed to fetch NGO information")
        return data.data // ngo info object
    }
}
export const ngoService = new NgoService()