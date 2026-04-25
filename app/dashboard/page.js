"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchLeads();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      router.push("/login");
    }
  }

  async function fetchLeads() {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setLeads(data || []);
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Dashboard</h1>

      {leads.map((lead) => (
        <div key={lead.id}>
          {lead.name} — {lead.email}
        </div>
      ))}
    </main>
  );
}
