"use client";

import { useState, useCallback, useEffect } from "react";
import * as leadsAPI from "@/lib/api/leads";

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =====================
  // FETCH LEADS
  // =====================
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await leadsAPI.getLeads();
      setLeads(data || []);
    } catch (err) {
      setError(err?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================
  // CREATE LEAD
  // =====================
  const createLead = useCallback(async (payload) => {
    try {
      setError(null);

      const newLead = await leadsAPI.createLead(payload);

      setLeads((prev) => [newLead, ...prev]);

      return { success: true, data: newLead };
    } catch (err) {
      const msg = err?.message || "Failed to create lead";
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // =====================
  // REFRESH
  // =====================
  const refresh = useCallback(() => {
    return fetchLeads();
  }, [fetchLeads]);

  // =====================
  // INITIAL LOAD
  // =====================
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    loading,
    error,
    fetchLeads,
    createLead,
    refresh,
  };
}