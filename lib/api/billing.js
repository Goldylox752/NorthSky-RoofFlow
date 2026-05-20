import { api } from "./client";

export const billingAPI = {
  createPortal: (email) =>
    api.post("/billing/portal", { email }),

  getCustomer: (email) =>
    api.get(`/billing/customer?email=${email}`),

  cancelSubscription: (email) =>
    api.post("/billing/cancel", { email }),
};