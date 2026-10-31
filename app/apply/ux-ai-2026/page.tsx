"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, CheckCircle2, FileText, Info, UploadCloud, X } from "lucide-react";
import { Button, Logo } from "@/components/ui";

export default function ApplicationFormPage() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [ready, setReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSubmitted(sessionStorage.getItem("portwise-application-submitted") === "true");
    setReady(true);
  }, []);

  const handleFileChange = () => {
    const file = fileInput.current?.files?.[0];
    setFileName("");
    if (!file) return;
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      setFileError("กรุณาเลือกไฟล์ PDF เท่านั้น");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setFileError("ไฟล์ PDF ต้องมีขนาดไม่เกิน 50 MB");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setFileError("");
    setFileName(file.name);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fileInput.current?.files?.[0]) {
      setFileError("กรุณาแนบ Portfolio เป็นไฟล์ PDF");
      fileInput.current?.focus();
      return;
    }
    sessionStorage.setItem("portwise-application-submitted", "true");
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startNewApplication = () => {
    sessionStorage.removeItem("portwise-application-submitted");
    setSubmitted(false);
    setFileName("");
    setFileError("");
    if (fileInput.current) fileInput.current.value = "";
  };

  if (!ready) return null;

  if (submitted) return <div className="applicant-site"><header className="applicant-header"><Logo /></header><main className="submission-success"><div className="success-icon"><Check size={30} /></div><p className="eyebrow">APPLICATION PREVIEW</p><h1>ตรวจสอบแบบฟอร์มเรียบร้อย</h1><p>นี่เป็นการสาธิตขั้นตอนส่งใบสมัคร ข้อมูลและไฟล์ยังไม่ได้บันทึกลงระบบหรือส่งอีเมล</p><button className="button secondary" type="button" onClick={startNewApplication}>เริ่มใบสมัครใหม่</button></main></div>;

  return <div className="applicant-site"><header className="applicant-header"><Logo /><div>แบบฟอร์มสาธิต ยังไม่มีการส่งข้อมูลจริง</div></header><main className="application-wrap"><section className="application-intro"><span className="uni-mark">ศ</span><p className="eyebrow">PORTFOLIO ADMISSION 2569</p><h1>สาขาออกแบบนิเทศศิลป์</h1><p>คณะศิลปกรรมศาสตร์ · รอบ Portfolio</p><div><span><b>ปิดรับสมัคร</b> 30 สิงหาคม 2569</span><i /><span><b>ใช้เวลา</b> ประมาณ 5 นาที</span></div></section><div className="application-columns"><form className="application-form" onSubmit={handleSubmit}><div className="form-heading"><span>1</span><div><h2>ข้อมูลส่วนตัว</h2><p>กรอกข้อมูลให้ครบถ้วนตามเอกสารทางราชการ</p></div></div><div className="field-row"><label className="field"><span>ชื่อ <em>*</em></span><input placeholder="ชื่อจริง" required /></label><label className="field"><span>นามสกุล <em>*</em></span><input placeholder="นามสกุล" required /></label></div><label className="field"><span>อีเมล <em>*</em></span><input type="email" placeholder="name@email.com" required /></label><div className="field-row"><label className="field"><span>เบอร์โทรศัพท์ <em>*</em></span><input type="tel" inputMode="numeric" pattern="0[0-9]{9}" title="กรุณากรอกเบอร์โทรศัพท์ 10 หลักขึ้นต้นด้วย 0" placeholder="08XXXXXXXX" required /></label><label className="field"><span>GPAX <em>*</em></span><input type="number" min="0" max="4" step="0.01" placeholder="เช่น 3.75" required /></label></div><label className="field"><span>โรงเรียน <em>*</em></span><input placeholder="ชื่อโรงเรียนปัจจุบัน" required /></label>
          <div className="form-heading second"><span>2</span><div><h2>Portfolio</h2><p>อัปโหลดผลงานที่สะท้อนความสามารถของคุณ</p></div></div><input ref={fileInput} type="file" accept="application/pdf,.pdf" hidden onChange={handleFileChange} />{fileName ? <div className="uploaded-file"><div className="pdf-icon"><FileText size={20} /></div><div><b>{fileName}</b><span>PDF พร้อมอัปโหลด</span></div><CheckCircle2 size={19} /><button type="button" onClick={() => { if (fileInput.current) fileInput.current.value = ""; setFileName(""); }} aria-label="ลบไฟล์"><X size={17} /></button></div> : <button type="button" className="upload-zone" onClick={() => fileInput.current?.click()}><UploadCloud size={30} /><b>คลิกเพื่อเลือกไฟล์ PDF</b><span>ขนาดไม่เกิน 50 MB</span><i>เลือกไฟล์จากเครื่อง</i></button>}{fileError && <p role="alert" className="field-error">{fileError}</p>}
          <label className="field"><span>แนะนำ Portfolio ของคุณสั้น ๆ <em className="optional">ไม่บังคับ</em></span><textarea placeholder="ผลงานชิ้นไหนที่สะท้อนตัวตนของคุณมากที่สุด และเพราะอะไร?" /></label><label className="consent"><input type="checkbox" required /><span>ฉันยืนยันว่าข้อมูลและผลงานทั้งหมดเป็นของฉัน และยินยอมให้คณะกรรมการใช้ข้อมูลเพื่อพิจารณาการสมัคร <a href="#">อ่านนโยบายความเป็นส่วนตัว</a></span></label><Button type="submit" className="primary submit-button">ส่งใบสมัคร <ArrowRight size={17} /></Button></form>
        <aside className="requirement-aside"><div className="aside-sticky"><h3>สิ่งที่เรากำลังมองหา</h3><p>Portfolio ไม่จำเป็นต้องสมบูรณ์แบบ เราอยากเห็นวิธีคิดและตัวตนของคุณผ่านผลงาน</p><ul><li><Check size={15} />กระบวนการ Design Thinking</li><li><Check size={15} />ทักษะการสื่อสารด้วยภาพ</li><li><Check size={15} />ความสามารถด้านเครื่องมือดิจิทัล</li><li><Check size={15} />ความสนใจในการออกแบบเพื่อสังคม</li></ul><div className="aside-note"><Info size={16} /><span>ระบบ AI จะช่วยคณะกรรมการสรุป Portfolio แต่การตัดสินใจสุดท้ายจะทำโดยอาจารย์ผู้พิจารณา</span></div></div></aside></div></main><footer className="applicant-footer"><span>© 2569 Portwise Admissions</span><span>พบปัญหาในการสมัคร? <a href="mailto:support@portwise.app">ติดต่อฝ่ายช่วยเหลือ</a></span></footer></div>;
}
