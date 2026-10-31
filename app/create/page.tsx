"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Clipboard, Link2, Sparkles } from "lucide-react";
import { TeacherShell } from "@/components/teacher-shell";
import { Button, Card } from "@/components/ui";
import { buildApplicationUrl, defaultAdmission, type Admission } from "@/lib/admission";

export default function CreateAdmissionPage() {
  const [admission, setAdmission] = useState<Admission>({ ...defaultAdmission });
  const [step, setStep] = useState(1);
  const [applicationUrl, setApplicationUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const update = (field: keyof Admission, value: string) => {
    setAdmission((current) => ({ ...current, [field]: value }));
  };

  const createLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApplicationUrl(buildApplicationUrl(window.location.origin, admission));
    setCopied(false);
    setCopyError("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(applicationUrl);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopyError("คัดลอกอัตโนมัติไม่ได้ กรุณาเลือกลิงก์ด้านบนแล้วคัดลอกเอง");
    }
  };

  return (
    <TeacherShell>
      <div className="page create-page">
        <div className="page-heading compact">
          <div>
            <p className="eyebrow">ADMISSION SETUP</p>
            <h1>สร้างการรับสมัครใหม่</h1>
            <p>กำหนดรายละเอียดและเกณฑ์ที่จะแสดงในฟอร์มผู้สมัครตัวอย่าง</p>
          </div>
        </div>

        <div className="stepper">
          <div className="current"><span>{step > 1 ? <Check size={15} /> : "1"}</span><b>กำหนด Requirement</b></div>
          <i />
          <div className={step === 2 ? "current" : ""}><span>2</span><b>รับลิงก์สำหรับผู้สมัคร</b></div>
        </div>

        {step === 1 ? (
          <form className="create-layout" onSubmit={createLink}>
            <Card className="form-card">
              <div className="section-title"><span>1</span><div><h2>ข้อมูลการรับสมัคร</h2><p>ข้อมูลนี้จะแสดงให้ผู้สมัครเห็น</p></div></div>
              <div className="field-row">
                <label className="field"><span>ชื่อการรับสมัคร</span><input value={admission.title} onChange={(e) => update("title", e.target.value)} required /></label>
                <label className="field"><span>ปีการศึกษา</span><input value={admission.year} onChange={(e) => update("year", e.target.value)} required /></label>
              </div>
              <div className="field-row">
                <label className="field"><span>คณะ / สาขา</span><input value={admission.program} onChange={(e) => update("program", e.target.value)} required /></label>
                <label className="field"><span>วันเปิดรับสมัคร <em className="optional">ไม่บังคับ</em></span><input type="date" lang="th" value={admission.openDate} onChange={(e) => update("openDate", e.target.value)} /></label>
              </div>
            </Card>

            <Card className="form-card requirement-form">
              <div className="section-title"><span>2</span><div><h2>ผู้สมัครที่คุณกำลังมองหา</h2><p>ข้อความนี้จะแสดงให้ผู้สมัครอ่านในหน้าฟอร์ม</p></div><span className="ai-pill"><Sparkles size={14} />ตัวอย่าง</span></div>
              <label className="field"><span>Requirement หลัก</span><textarea value={admission.requirements} onChange={(e) => update("requirements", e.target.value)} required /></label>
              <label className="field"><span>คำถามเพิ่มเติมสำหรับผู้สมัคร <em className="optional">ไม่บังคับ</em></span><input value={admission.question} onChange={(e) => update("question", e.target.value)} placeholder="เช่น ผลงานชิ้นไหนที่สะท้อนตัวตนของคุณมากที่สุด?" /></label>
            </Card>

            <div className="form-actions"><Button type="submit" className="primary">สร้างลิงก์รับสมัคร <ArrowRight size={17} /></Button></div>
          </form>
        ) : (
          <Card className="success-card">
            <div className="success-icon"><Check size={28} /></div>
            <p className="eyebrow">READY TO PREVIEW</p>
            <h2>ลิงก์แบบฟอร์มตัวอย่างพร้อมแล้ว</h2>
            <p>ลิงก์นี้พารายละเอียดรอบรับสมัครไปแสดงในฟอร์มผู้สมัคร ยังไม่มีการบันทึกข้อมูลลงระบบจริง</p>
            <div className="link-box"><Link2 size={18} /><input aria-label="ลิงก์รับสมัคร" readOnly value={applicationUrl} onFocus={(event) => event.target.select()} /><button type="button" onClick={copyLink}>{copied ? <><Check size={16} />คัดลอกแล้ว</> : <><Clipboard size={16} />คัดลอกลิงก์</>}</button></div>
            {copyError && <p role="alert" className="field-error">{copyError}</p>}
            <div className="success-details">
              <div><span>ชื่อการรับสมัคร</span><b>{admission.title}</b></div>
              <div><span>คณะ / สาขา</span><b>{admission.program}</b></div>
              <div><span>สถานะ</span><b className="open-dot">ลิงก์พร้อมสาธิต</b></div>
            </div>
            <div className="success-actions">
              <a className="button primary" href={applicationUrl} target="_blank" rel="noopener noreferrer">ทดลองเปิดหน้าผู้สมัคร <ArrowRight size={17} /></a>
              <Button type="button" className="secondary" onClick={() => setStep(1)}>แก้ไข Requirement</Button>
            </div>
          </Card>
        )}
      </div>
    </TeacherShell>
  );
}
