import apiClient from "../lib/apiClient.js";
import { BaseService } from "./baseService.js";

class MembershipService extends BaseService {
    async createMembership(planId) {
        const res = await apiClient.post("/membership/create", { planId });
        return this.validate(res, "Failed to create membership");
    }

    async getMembershipPlans() {
        const res = await apiClient.get("/membership/plans");
        return this.parseData(res, "Failed to fetch membership plans");
    }

    async getMyMembership() {
        const res = await apiClient.get("/membership/my-membership");
        return this.parseData(res, "Failed to fetch my membership");
    }

    async getAllMembers() {
        const res = await apiClient.get("/membership/all-members");
        return this.parseData(res, "Failed to fetch all members");
    }

}

export const membershipService = new MembershipService()
