"use client";

import { useState } from "react";
import { ArrowRight, Check, Clipboard, Link2 } from "lucide-react";
import { TeacherShell } from "@/components/teacher-shell";
import { Button, Card } from "@/components/ui";
import { readData, writeData, type Campaign } from "@/lib/demo-data";
import { useDemoData } from "@/lib/use-demo-data";

export default function CreateAdmissionPage() {
  const { campaign } = useDemoData();
  const [draft, setDraft] = useState<Campaign | null>(null);
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const value = draft ?? campaign;
  const update = (field: keyof Campaign, text: string) => setDraft({ ...value, [field]: text });
  const save = () => {
    if (Object.values(value).some(text => !text.trim())) { window.alert("กรุณากรอกข้อมูลการรับสมัครให้ครบ"); return; }
    try { writeData({ ...readData(), campaign: value }); setCreated(true); window.scrollTo(0, 0); }
    catch { window.alert("บันทึกข้อมูลในเบราว์เซอร์ไม่สำเร็จ"); }
  };
  const link = typeof window === "undefined" ? "/apply/ux-ai-2026" : `${window.location.origin}/apply/ux-ai-2026`;
  const copy = async () => { await navigator.clipboard.writeText(link); setCopied(true); };

  return <TeacherShell><div className="page create-page"><div className="page-heading compact"><div><p className="eyebrow">ADMISSION SETUP · DEMO</p><h1>สร้างการรับสมัคร</h1><p>ตั้งค่ารอบรับสมัครและแชร์ลิงก์สำหรับแบบฟอร์มสาธิต</p></div></div>
    {created ? <Card className="success-card"><div className="success-icon"><Check size={28} /></div><h2>ลิงก์รับสมัครพร้อมแล้ว</h2><p>ข้อมูลรอบรับสมัครถูกบันทึกในเบราว์เซอร์นี้</p><div className="link-box"><Link2 size={18} /><span>{link}</span><button type="button" onClick={copy}><Clipboard size={16} />{copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}</button></div><div className="success-details"><div><span>ชื่อการรับสมัคร</span><b>{value.title}</b></div><div><span>ปิดรับสมัคร</span><b>{value.deadline}</b></div></div><div className="success-actions"><a className="button primary" href="/apply/ux-ai-2026" target="_blank">เปิดหน้าผู้สมัคร <ArrowRight size={17} /></a><Button className="secondary" onClick={() => setCreated(false)}>แก้ไขข้อมูล</Button></div></Card> :
    <div className="create-layout"><Card className="form-card"><h2>ข้อมูลการรับสมัคร</h2><div className="field-row"><label className="field"><span>ชื่อการรับสมัคร</span><input value={value.title} onChange={e => update("title", e.target.value)} required /></label><label className="field"><span>ปีการศึกษา</span><input value={value.year} onChange={e => update("year", e.target.value)} required /></label></div><div className="field-row"><label className="field"><span>คณะ / สาขา</span><input value={value.faculty} onChange={e => update("faculty", e.target.value)} required /></label><label className="field"><span>วันปิดรับสมัคร</span><input value={value.deadline} onChange={e => update("deadline", e.target.value)} required /></label></div></Card><Card className="form-card requirement-form"><h2>Requirement หลัก</h2><p>ข้อความนี้แสดงให้ผู้สมัครเห็นและใช้ประกอบการอธิบายเกณฑ์</p><label className="field"><span>เกณฑ์การพิจารณา</span><textarea value={value.requirement} onChange={e => update("requirement", e.target.value)} required /></label></Card><div className="form-actions"><Button className="primary" onClick={save}>บันทึกและสร้างลิงก์ <ArrowRight size={17} /></Button></div></div>}
  </div></TeacherShell>;
}
