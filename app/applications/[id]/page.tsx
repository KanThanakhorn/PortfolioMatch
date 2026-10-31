"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { TeacherShell } from "@/components/teacher-shell";
import { Button, Card, MiniProgress, StatusBadge } from "@/components/ui";
import { readData, writeData } from "@/lib/demo-data";
import { useDemoData } from "@/lib/use-demo-data";

export default function ApplicantDetail() {
  const { id } = useParams<{ id: string }>();
  const { applicants, campaign } = useDemoData();
  const person = applicants.find(item => item.id === id);
  const decide = (status: "Approved" | "Rejected") => {
    const data = readData();
    writeData({ ...data, applicants: data.applicants.map(item => item.id === id ? { ...item, status } : item) });
  };
  return <TeacherShell><div className="page detail-page"><Link className="back-link" href="/applications"><ArrowLeft size={16} />กลับไปหน้าผู้สมัคร</Link>{!person ? <Card><h1>ไม่พบผู้สมัคร</h1></Card> : <><div className="applicant-hero"><div className="avatar avatar-large avatar-1">{person.name.slice(0, 2)}</div><div><div className="title-row"><h1>{person.name}</h1><StatusBadge tone={person.status === "Approved" ? "green" : person.status === "Rejected" ? "amber" : "blue"}>{person.status}</StatusBadge></div><p>{person.school} · GPAX {person.gpax}</p><span>{person.email} · {person.phone}</span></div><div className="decision-actions"><Button className="reject" onClick={() => decide("Rejected")}><X size={17} />Reject</Button><Button className="approve" onClick={() => decide("Approved")}><Check size={17} />Approve</Button></div></div><div className="detail-grid"><div className="detail-main"><Card className="ai-summary-card"><h2>{person.score === null ? "รอการประเมิน" : "คะแนนตัวอย่างสำหรับเดโม"}</h2><p>{person.score === null ? "ใบสมัครใหม่นี้ยังไม่มีคะแนนหรือผลวิเคราะห์ AI" : `คะแนนตัวอย่าง ${person.score}/100 จากข้อมูล mock ที่เตรียมไว้ล่วงหน้า ไม่ได้วิเคราะห์จากไฟล์จริง`}</p>{person.score !== null && <MiniProgress value={person.score} />}<p className="ai-disclaimer">ผู้พิจารณาควรอ่าน Portfolio ต้นฉบับก่อนตัดสินใจ</p></Card><Card className="criteria-card"><h2>Requirement ของรอบนี้</h2><p>{campaign.requirement}</p><h3>คำแนะนำ Portfolio</h3><p>{person.intro || "ไม่มีข้อความเพิ่มเติม"}</p></Card></div><aside className="portfolio-panel"><Card className="portfolio-card"><h2>Portfolio</h2><p>{person.fileName}</p><p>เดโมนี้บันทึกเฉพาะชื่อไฟล์ จึงไม่สามารถเปิดไฟล์ต้นฉบับจากหน้านี้ได้</p></Card><Card className="info-card"><h3>ข้อมูลการสมัคร</h3><div><span>สาขา</span><b>{campaign.faculty}</b></div><div><span>สถานะ</span><b>{person.status}</b></div></Card></aside></div></>}</div></TeacherShell>;
}
