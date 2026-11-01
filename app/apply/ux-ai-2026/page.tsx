"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, FileText, UploadCloud, X } from "lucide-react";
import { Button, Logo } from "@/components/ui";
import { admissionFromSearch, formatAdmissionDate, type Admission } from "@/lib/admission";
import { readData, writeData, type Applicant } from "@/lib/demo-data";
import type { PortfolioAnalysis } from "@/lib/portfolio-analysis";
import { useDemoData } from "@/lib/use-demo-data";
import { databaseMode } from "@/lib/supabase";

export default function ApplicationFormPage() {
  const { campaign, applicants } = useDemoData();
  const [linkedAdmission, setLinkedAdmission] = useState<Admission | null>(null);
  const [databaseCampaign, setDatabaseCampaign] = useState<{ id: string; admission: Admission } | null>(null);
  const [campaignLoading, setCampaignLoading] = useState(databaseMode);
  const [campaignError, setCampaignError] = useState("");
  const [databaseAnalysisStatus, setDatabaseAnalysisStatus] = useState<"not_requested" | "pending" | "complete" | "error">("not_requested");
  const [databaseAnalysisError, setDatabaseAnalysisError] = useState("");
  const [referenceKey, setReferenceKey] = useState("portwise-last-reference");
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const search = window.location.search;
    const key = `portwise-last-reference:${search}`;
    setReferenceKey(key);
    if (databaseMode) {
      const slug = new URLSearchParams(search).get("campaign");
      if (!slug) { setCampaignError("ลิงก์รอบรับสมัครไม่ถูกต้อง"); setCampaignLoading(false); }
      else fetch(`/api/campaigns/${encodeURIComponent(slug)}`).then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "โหลดรอบรับสมัครไม่สำเร็จ");
        const row = result.campaign;
        setDatabaseCampaign({ id: row.id, admission: {
          title: row.title, year: row.year, program: row.faculty,
          deadline: row.deadline, requirements: row.requirement,
          openDate: row.open_date ?? "", question: row.question ?? "",
        } });
      }).catch(cause => setCampaignError(cause instanceof Error ? cause.message : "โหลดรอบรับสมัครไม่สำเร็จ"))
        .finally(() => setCampaignLoading(false));
    } else if (search) setLinkedAdmission(admissionFromSearch(search));
    const savedReference = sessionStorage.getItem(key) ?? "";
    setReference(savedReference);
    if (databaseMode && savedReference) {
      const saved = sessionStorage.getItem(`${key}:analysis`);
      if (saved) {
        try {
          const result = JSON.parse(saved) as { status: typeof databaseAnalysisStatus; error?: string };
          setDatabaseAnalysisStatus(result.status === "pending" ? "error" : result.status);
          setDatabaseAnalysisError(result.status === "pending" ? "การวิเคราะห์ถูกขัดจังหวะหลังรีเฟรช" : result.error ?? "");
        } catch { /* Keep the submission reference visible. */ }
      }
    } else if (savedReference) {
      const data = readData();
      const pending = data.applicants.some(item => item.id === savedReference && item.analysisStatus === "pending");
      if (pending) writeData({ ...data, applicants: data.applicants.map(item => item.id === savedReference ? {
        ...item, analysisStatus: "error", analysisError: "การวิเคราะห์ถูกขัดจังหวะหลังรีเฟรช กรุณาส่งใบสมัครใหม่พร้อม PDF",
      } : item) });
    }
  }, []);
  const admission = databaseCampaign?.admission ?? linkedAdmission ?? {
    title: campaign.title, year: campaign.year, program: campaign.faculty,
    deadline: campaign.deadline, requirements: campaign.requirement, openDate: "", question: "",
  };
  const chooseFile = () => {
    const selected = fileInput.current?.files?.[0];
    setFile(null);
    if (!selected) return;
    if (selected.type !== "application/pdf" || !selected.name.toLowerCase().endsWith(".pdf")) { setError("เลือกไฟล์ PDF เท่านั้น"); if (fileInput.current) fileInput.current.value = ""; return; }
    if (selected.size > 50 * 1024 * 1024) { setError("ไฟล์ต้องไม่เกิน 50 MB"); if (fileInput.current) fileInput.current.value = ""; return; }
    setFile(selected); setError("");
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (!file) { setError("กรุณาแนบ Portfolio PDF"); return; }
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const aiConsent = form.get("aiConsent") === "on";
    if (databaseMode) {
      if (!databaseCampaign) { setError("รอบรับสมัครยังไม่พร้อมใช้งาน"); setSubmitting(false); return; }
      const payload = new FormData();
      for (const name of ["firstName", "lastName", "email", "phone", "gpax", "school", "intro"]) payload.set(name, String(form.get(name) ?? ""));
      payload.set("campaignId", databaseCampaign.id);
      payload.set("portfolio", file);
      payload.set("privacyConsent", form.get("privacyConsent") === "on" ? "true" : "false");
      payload.set("aiConsent", aiConsent ? "true" : "false");
      try {
        const response = await fetch("/api/applications", { method: "POST", body: payload });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "บันทึกใบสมัครไม่สำเร็จ");
        const id = String(result.id);
        sessionStorage.setItem(referenceKey, id);
        setReference(id); window.scrollTo(0, 0);
        const setResult = (status: typeof databaseAnalysisStatus, message = "") => {
          setDatabaseAnalysisStatus(status); setDatabaseAnalysisError(message);
          sessionStorage.setItem(`${referenceKey}:analysis`, JSON.stringify({ status, error: message }));
        };
        setResult(aiConsent ? "pending" : "not_requested");
        if (aiConsent) {
          try {
            const analysisPayload = new FormData();
            analysisPayload.set("portfolio", file);
            analysisPayload.set("applicationId", id);
            analysisPayload.set("submissionToken", String(result.submissionToken));
            const analysisResponse = await fetch("/api/analyze-portfolio", { method: "POST", body: analysisPayload });
            const analysisResult = await analysisResponse.json();
            if (!analysisResponse.ok) throw new Error(analysisResult.error || "วิเคราะห์ Portfolio ไม่สำเร็จ");
            setResult("complete");
          } catch (cause) { setResult("error", cause instanceof Error ? cause.message : "วิเคราะห์ Portfolio ไม่สำเร็จ"); }
        }
      } catch (cause) { setError(cause instanceof Error ? cause.message : "บันทึกใบสมัครไม่สำเร็จ"); }
      finally { setSubmitting(false); }
      return;
    }
    const data = readData();
    const id = `demo-${Date.now()}`;
    const applicant: Applicant = { id, name: `${form.get("firstName")} ${form.get("lastName")}`, school: String(form.get("school")), email: String(form.get("email")), phone: String(form.get("phone")), gpax: String(form.get("gpax")), fileName: file.name, intro: String(form.get("intro") ?? ""), score: null, status: "Review", analysisStatus: aiConsent ? "pending" : "not_requested" };
    try {
      writeData({ ...data, applicants: [applicant, ...data.applicants] });
      sessionStorage.setItem(referenceKey, id);
      setReference(id);
      window.scrollTo(0, 0);
    } catch {
      setError("บันทึกข้อมูลในเบราว์เซอร์ไม่สำเร็จ กรุณาตรวจสอบพื้นที่จัดเก็บ");
      setSubmitting(false);
      return;
    }
    if (!aiConsent) return;

    let analysis: PortfolioAnalysis | undefined;
    let analysisError = "";
    try {
      const payload = new FormData();
      payload.set("portfolio", file);
      payload.set("requirement", admission.requirements);
      const response = await fetch("/api/analyze-portfolio", { method: "POST", body: payload });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "วิเคราะห์ Portfolio ไม่สำเร็จ");
      analysis = result.analysis as PortfolioAnalysis;
    } catch (cause) {
      analysisError = cause instanceof Error ? cause.message : "วิเคราะห์ Portfolio ไม่สำเร็จ";
    }
    const latest = readData();
    writeData({ ...latest, applicants: latest.applicants.map(item => item.id === id ? {
      ...item, score: analysis?.score ?? null, analysis,
      analysisStatus: analysis ? "complete" : "error", analysisError: analysis ? undefined : analysisError,
    } : item) });
  };
  if (databaseMode && campaignLoading) return <div className="applicant-site"><main className="submission-success"><p role="status">กำลังโหลดรอบรับสมัคร...</p></main></div>;
  if (databaseMode && campaignError) return <div className="applicant-site"><main className="submission-success"><h1>เปิดฟอร์มไม่ได้</h1><p role="alert">{campaignError}</p></main></div>;
  if (reference) {
    const currentApplicant = applicants.find(item => item.id === reference);
    const currentStatus = databaseMode ? databaseAnalysisStatus : currentApplicant?.analysisStatus;
    const currentError = databaseMode ? databaseAnalysisError : currentApplicant?.analysisError;
    return <div className="applicant-site"><header className="applicant-header"><Logo /></header><main className="submission-success"><div className="success-icon"><Check size={30} /></div><p className="eyebrow">DEMO APPLICATION</p><h1>บันทึกใบสมัครสาธิตแล้ว</h1><p>{databaseMode ? "ข้อมูลใบสมัครบันทึกใน Supabase แล้ว แต่ยังไม่เก็บ PDF ต้นฉบับและไม่ได้ส่งอีเมล" : "ข้อมูลใบสมัครอยู่ในเบราว์เซอร์นี้และเก็บเฉพาะชื่อไฟล์ PDF ไม่ได้ส่งอีเมล"}</p><div className="reference"><span>หมายเลขอ้างอิง</span><b>{reference}</b></div>{currentStatus === "pending" && <p role="status">กำลังให้ AI วิเคราะห์ Portfolio จากไฟล์ที่เลือก...</p>}{currentStatus === "complete" && <p role="status">AI วิเคราะห์เบื้องต้นแล้ว กรรมการสามารถดูเหตุผลประกอบในหน้ารายละเอียด</p>}{currentStatus === "error" && <p role="status">บันทึกใบสมัครแล้ว แต่ AI วิเคราะห์ไม่สำเร็จ: {currentError}</p>}<a href="/applications">ดูรายชื่อผู้สมัคร</a><button type="button" className="button secondary" onClick={() => { sessionStorage.removeItem(referenceKey); sessionStorage.removeItem(`${referenceKey}:analysis`); setReference(""); setFile(null); setSubmitting(false); }}>เริ่มใบสมัครใหม่</button></main></div>;
  }
  return <div className="applicant-site"><header className="applicant-header"><Logo /><div>{databaseMode ? "แบบฟอร์มสาธิต · ข้อมูลอยู่ใน Supabase" : "แบบฟอร์มสาธิต · ข้อมูลอยู่ในเบราว์เซอร์นี้"}</div></header><main className="application-wrap"><section className="application-intro"><span className="uni-mark">ศ</span><p className="eyebrow">PORTFOLIO ADMISSION {admission.year}</p><h1>{admission.title}</h1><p>{admission.program}</p><div>{admission.openDate && <span><b>เปิดรับสมัคร</b> {formatAdmissionDate(admission.openDate)}</span>}<span><b>ปิดรับสมัคร</b> {admission.deadline}</span></div></section><div className="application-columns"><form className="application-form" onSubmit={submit}><div className="form-heading"><span>1</span><div><h2>ข้อมูลส่วนตัว</h2><p>กรอกข้อมูลให้ครบถ้วน</p></div></div><div className="field-row"><label className="field"><span>ชื่อ <em>*</em></span><input name="firstName" required /></label><label className="field"><span>นามสกุล <em>*</em></span><input name="lastName" required /></label></div><label className="field"><span>อีเมล <em>*</em></span><input name="email" type="email" required /></label><div className="field-row"><label className="field"><span>เบอร์โทรศัพท์ <em>*</em></span><input name="phone" type="tel" pattern="0[0-9]{9}" title="เบอร์โทร 10 หลักขึ้นต้นด้วย 0" required /></label><label className="field"><span>GPAX <em>*</em></span><input name="gpax" type="number" min="0" max="4" step="0.01" required /></label></div><label className="field"><span>โรงเรียน <em>*</em></span><input name="school" required /></label><div className="form-heading second"><span>2</span><div><h2>Portfolio</h2><p>ไฟล์ PDF ไม่เกิน 50 MB</p></div></div><input ref={fileInput} type="file" accept="application/pdf,.pdf" hidden onChange={chooseFile} />{file ? <div className="uploaded-file"><FileText size={20} /><b>{file.name}</b><button type="button" aria-label="ลบไฟล์" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ""; }}><X size={17} /></button></div> : <button type="button" className="upload-zone" onClick={() => fileInput.current?.click()}><UploadCloud size={30} /><b>เลือกไฟล์ PDF</b></button>}{error && <p role="alert" className="field-error">{error}</p>}<label className="field"><span>{admission.question || "แนะนำ Portfolio สั้น ๆ"} <em className="optional">ไม่บังคับ</em></span><textarea name="intro" /></label><label className="consent"><input type="checkbox" name="privacyConsent" required /><span>ฉันได้อ่านข้อมูลความเป็นส่วนตัวและรับทราบว่าแบบฟอร์มนี้ใช้สาธิตเท่านั้น <a href="/privacy" target="_blank" rel="noopener noreferrer">อ่านนโยบายความเป็นส่วนตัว</a></span></label><label className="consent ai-consent"><input type="checkbox" name="aiConsent" /><span>ฉันยินยอมให้ส่งไฟล์ Portfolio PDF ไปยัง Gemini API ของ Google เพื่อวิเคราะห์ตามเกณฑ์เบื้องต้น ไฟล์สำหรับ AI ต้องต่ำกว่า 45 MB และผล AI เป็นเพียงข้อมูลประกอบการพิจารณาของกรรมการ</span></label><Button type="submit" className="primary submit-button" disabled={submitting}>{submitting ? "กำลังบันทึก..." : "ส่งใบสมัคร"} <ArrowRight size={17} /></Button></form><aside className="requirement-aside"><div className="aside-sticky"><h3>สิ่งที่เรากำลังมองหา</h3><p className="admission-requirements">{admission.requirements}</p></div></aside></div></main></div>;
}
