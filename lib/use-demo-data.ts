"use client";

import { useEffect, useState } from "react";
import { initialData, readData, type DemoData } from "./demo-data";
import { loadDatabaseData } from "./database-data";
import { databaseMode, getSupabaseBrowser } from "./supabase";

export function useDemoData() {
  const [data, setData] = useState<DemoData>(databaseMode ? { campaign: initialData.campaign, applicants: [] } : initialData);
  useEffect(() => {
    if (databaseMode) {
      let active = true;
      let requestId = 0;
      const refresh = () => { const current = ++requestId; loadDatabaseData().then(next => { if (active && current === requestId) setData(next); }).catch(() => {
        if (active && current === requestId) setData({ campaign: initialData.campaign, applicants: [] });
      }); };
      refresh();
      const subscription = getSupabaseBrowser()?.auth.onAuthStateChange(() => refresh());
      window.addEventListener("portfoliomatch-db-change", refresh);
      window.addEventListener("focus", refresh);
      const interval = window.setInterval(refresh, 15_000);
      return () => {
        active = false;
        subscription?.data.subscription.unsubscribe();
        window.removeEventListener("portfoliomatch-db-change", refresh);
        window.removeEventListener("focus", refresh);
        window.clearInterval(interval);
      };
    }
    const refresh = () => setData(readData());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("portwise-demo-change", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("portwise-demo-change", refresh);
    };
  }, []);
  return data;
}
