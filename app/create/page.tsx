"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Clipboard, Link2 } from "lucide-react";
import { TeacherShell } from "@/components/teacher-shell";
import { Button, Card } from "@/components/ui";
import { buildApplicationUrl, type Admission } from "@/lib/admission";
import { readData, writeData, type Campaign } from "@/lib/demo-data";
import { useDemoData } from "@/lib/use-demo-data";

export default function CreateAdmissionPage() {
  const { campaign } = useDemoData();
  const [draft, setDraft] = useState<Campaign | null>(null);
  const [openDate, setOpenDate] = useState("");
  const [question, setQuestion] = useState("");
  const [created, setCreated] = useState(false);
  const [applicationUrl, setApplicationUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const value = draft ?? campaign;
  const update = (field: keyof Campaign, text: string) => setDraft({ ...value, [field]: text });
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const admission: Admission = { title: value.title, year: value.year, program: value.faculty, openDate, deadline: value.deadline, requirements: value.requirement, question };
    try { writeData({ ...readData(), campaign: value }); setApplicationUrl(buildApplicationUrl(window.location.origin, admission)); setCreated(true); setCopied(false); setCopyError(""); window.scrollTo(0, 0); }
    catch { window.alert("บันทึกข้อมูลในเบราว์เซอร์ไม่สำเร็จ"); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(applicationUrl); setCopied(true); setCopyError(""); }
    catch { setCopyError("คัดลอกอัตโนมัติไม่ได้ กรุณาเลือกลิงก์ด้านบนแล้วคัดลอกเอง"); }
  };

  return <TeacherShell><div className="page create-page"><div className="page-heading compact"><div><p className="eyebrow">ADMISSION SETUP · DEMO</p><h1>สร้างการรับสมัคร</h1><p>ตั้งค่ารอบรับสมัครและแชร์ลิงก์สำหรับแบบฟอร์มสาธิต</p></div></div>
    {created ? <Card className="success-card"><div className="success-icon"><Check size={28} /></div><h2>ลิงก์รับสมัครพร้อมแล้ว</h2><p>ข้อมูลรอบรับสมัครถูกบันทึกในเบราว์เซอร์นี้ และรายละเอียดอยู่ในลิงก์สำหรับผู้สมัคร</p><div className="link-box"><Link2 size={18} /><input aria-label="ลิงก์รับสมัคร" readOnly value={applicationUrl} onFocus={event => event.target.select()} /><button type="button" onClick={copy}><Clipboard size={16} />{copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}</button></div>{copyError && <p role="alert" className="field-error">{copyError}</p>}<div className="success-details"><div><span>ชื่อการรับสมัคร</span><b>{value.title}</b></div><div><span>ปิดรับสมัคร</span><b>{value.deadline}</b></div></div><div className="success-actions"><a className="button primary" href={applicationUrl} target="_blank" rel="noopener noreferrer">เปิดหน้าผู้สมัคร <ArrowRight size={17} /></a><Button type="button" className="secondary" onClick={() => setCreated(false)}>แก้ไขข้อมูล</Button></div></Card> :
    <form className="create-layout" onSubmit={save}><Card className="form-card"><h2>ข้อมูลการรับสมัคร</h2><div className="field-row"><label className="field"><span>ชื่อการรับสมัคร</span><input value={value.title} onChange={e => update("title", e.target.value)} required /></label><label className="field"><span>ปีการศึกษา</span><input value={value.year} onChange={e => update("year", e.target.value)} required /></label></div><div className="field-row"><label className="field"><span>คณะ / สาขา</span><input value={value.faculty} onChange={e => update("faculty", e.target.value)} required /></label><label className="field"><span>วันปิดรับสมัคร</span><input value={value.deadline} onChange={e => update("deadline", e.target.value)} required /></label></div><label className="field"><span>วันเปิดรับสมัคร <em className="optional">ไม่บังคับ</em></span><input type="date" lang="th" value={openDate} onChange={e => setOpenDate(e.target.value)} /></label></Card><Card className="form-card requirement-form"><h2>Requirement หลัก</h2><p>ข้อความนี้แสดงให้ผู้สมัครเห็นและใช้ประกอบการอธิบายเกณฑ์</p><label className="field"><span>เกณฑ์การพิจารณา</span><textarea value={value.requirement} onChange={e => update("requirement", e.target.value)} required /></label><label className="field"><span>คำถามเพิ่มเติมสำหรับผู้สมัคร <em className="optional">ไม่บังคับ</em></span><input value={question} onChange={e => setQuestion(e.target.value)} placeholder="เช่น ผลงานชิ้นไหนที่สะท้อนตัวตนของคุณมากที่สุด?" /></label></Card><div className="form-actions"><Button type="submit" className="primary">บันทึกและสร้างลิงก์ <ArrowRight size={17} /></Button></div></form>}
  </div></TeacherShell>;
}
