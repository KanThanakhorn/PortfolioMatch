"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, CheckCircle2, Download, ExternalLink, FileText, Mail, MapPin, RotateCcw, X } from "lucide-react";
import { TeacherShell } from "@/components/teacher-shell";
import { AiLabel, Button, Card, MiniProgress, StatusBadge, Toast } from "@/components/ui";

const criteria = [
  { label: "Design thinking & process", score: 96, note: "แสดงกระบวนการคิดตั้งแต่ research จนถึง iteration ชัดเจน" },
  { label: "Visual communication", score: 91, note: "การจัดวางและ visual hierarchy อยู่ในระดับดีมาก" },
  { label: "Digital tool proficiency", score: 88, note: "มีผลงาน Figma, Adobe CC และ motion design" },
  { label: "Social impact mindset", score: 82, note: "มี 2 โปรเจกต์ที่แก้ปัญหาให้ชุมชน" },
];

export default function ApplicantDetail() {
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  return (
    <TeacherShell>
      <div className="page detail-page">
        {decision ? <Toast>บันทึกผลเป็น {decision === "approved" ? "Approved" : "Rejected"} แล้ว</Toast> : null}
        <Link className="back-link" href="/applications"><ArrowLeft size={16} />กลับไปหน้าผู้สมัคร</Link>
        <div className="applicant-hero">
          <div className="avatar avatar-large avatar-1">พช</div>
          <div><div className="title-row"><h1>พิมชนก ชัยวัฒนา</h1><StatusBadge tone="green">Strong match</StatusBadge></div><p>โรงเรียนสาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ · GPAX 3.82</p><span><Mail size={14} /> pimchanok.c@email.com <i /> <MapPin size={14} /> กรุงเทพมหานคร</span></div>
          <div className="decision-actions"><Button className="reject" onClick={() => setDecision("rejected")}><X size={17} />Reject</Button><Button className="approve" onClick={() => setDecision("approved")}><Check size={17} />Approve</Button></div>
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            <Card className="ai-summary-card">
              <div className="ai-summary-head"><AiLabel confidence={94} /><div className="score-orb"><strong>92</strong><span>/100</span></div></div>
              <h2>ภาพรวมจาก AI</h2>
              <p className="summary-copy">พิมชนกเป็นผู้สมัครที่มีพื้นฐานด้านการออกแบบแข็งแรง แสดงให้เห็นถึงกระบวนการคิดเชิงระบบและความสามารถในการเปลี่ยน insight ให้เป็นงานออกแบบที่ใช้งานได้จริง ผลงานโดดเด่นด้าน visual communication และมีความสนใจในประเด็นสังคมที่ตรงกับเป้าหมายของหลักสูตร</p>
              <div className="callout"><CheckCircle2 size={18} /><p><b>เหตุผลที่แนะนำให้ Shortlist</b><span>ผ่าน Requirement หลักครบ 4 ข้อ และมีหลักฐานประกอบใน Portfolio ทุกข้อ</span></p></div>
              <p className="ai-disclaimer">AI ช่วยสรุปข้อมูลเพื่อประกอบการตัดสินใจ โปรดตรวจสอบ Portfolio ต้นฉบับก่อนอนุมัติ</p>
            </Card>
            <Card className="criteria-card"><div className="card-head"><div><h2>Requirement matching</h2><p>วิเคราะห์จากเกณฑ์ที่คุณกำหนดไว้</p></div><span className="overall">Overall 92%</span></div>{criteria.map((item) => <div className="criterion" key={item.label}><div className="criterion-top"><b>{item.label}</b><strong>{item.score}%</strong></div><MiniProgress value={item.score} tone={item.score > 90 ? "green" : "purple"} /><p>{item.note}</p></div>)}</Card>
          </div>
          <aside className="portfolio-panel">
            <Card className="portfolio-card"><div className="portfolio-head"><div><h2>Portfolio</h2><p>pimchanok_portfolio.pdf · 18.4 MB</p></div><button className="icon-button"><Download size={18} /></button></div><div className="portfolio-preview"><div className="portfolio-cover"><small>SELECTED WORKS</small><div className="cover-shape one" /><div className="cover-shape two" /><h3>PIMCHANOK<br />CHAIWATANA</h3><p>COMMUNICATION DESIGN<br />PORTFOLIO 2026</p></div></div><div className="page-switch"><button>‹</button><span>1 / 24</span><button>›</button></div><button className="button secondary full"><ExternalLink size={16} />เปิด Portfolio แบบเต็มจอ</button></Card>
            <Card className="info-card"><h3>ข้อมูลการสมัคร</h3><div><span>สาขา</span><b>ออกแบบนิเทศศิลป์</b></div><div><span>รอบ</span><b>Portfolio 1/2569</b></div><div><span>ส่งเมื่อ</span><b>4 ส.ค. 2569, 10:42</b></div><div><span>AI วิเคราะห์</span><b className="completed"><CheckCircle2 size={14} />เสร็จสมบูรณ์</b></div><button className="plain-button"><RotateCcw size={15} />วิเคราะห์ใหม่</button></Card>
          </aside>
        </div>
      </div>
    </TeacherShell>
  );
}
