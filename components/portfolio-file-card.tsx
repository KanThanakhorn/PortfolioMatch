"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { databaseMode, getSupabaseBrowser } from "@/lib/supabase";

export function PortfolioFileCard({ applicationId, fileName, hasStoredPdf }: {
  applicationId: string;
  fileName: string;
  hasStoredPdf?: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(Boolean(databaseMode && hasStoredPdf));
  const [error, setError] = useState("");

  useEffect(() => {
    setPreviewUrl("");
    setError("");
    setLoading(Boolean(databaseMode && hasStoredPdf));
    if (!databaseMode || !hasStoredPdf) return;
    let active = true;
    let objectUrl = "";
    const controller = new AbortController();
    const load = async () => {
      try {
        const client = getSupabaseBrowser();
        const { data } = await client!.auth.getSession();
        if (!data.session?.access_token) throw new Error("กรุณาเข้าสู่ระบบกรรมการอีกครั้ง");
        const response = await fetch(`/api/applications/${encodeURIComponent(applicationId)}/portfolio`, {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("เปิด PDF ไม่สำเร็จ กรุณาลองอีกครั้ง");
        const blob = await response.blob();
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "เปิด PDF ไม่สำเร็จ");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [applicationId, hasStoredPdf]);

  return <Card className="portfolio-card"><h2>Portfolio</h2><p>{fileName}</p>
    {previewUrl ? <>
      <div className="portfolio-file-actions">
        <a className="button secondary" href={previewUrl} target="_blank" rel="noopener noreferrer">เปิด PDF ในแท็บใหม่</a>
        <a href={previewUrl} download={fileName}>ดาวน์โหลด PDF</a>
      </div>
      <iframe className="portfolio-pdf-preview" src={previewUrl} title={`ตัวอย่าง Portfolio ${fileName}`} />
    </> : <p role={error ? "alert" : "status"}>{error || (loading ? "กำลังโหลด PDF จาก Google Drive..." : databaseMode ? "ใบสมัครนี้ยังไม่มี PDF ที่เก็บไว้ใน Google Drive" : "โหมดข้อมูลในเบราว์เซอร์เก็บเฉพาะชื่อไฟล์ PDF")}</p>}
  </Card>;
}
