"use client";

import { useEffect, useState } from "react";
import { initialData, readData, type DemoData } from "./demo-data";

export function useDemoData() {
  const [data, setData] = useState<DemoData>(initialData);
  useEffect(() => {
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
