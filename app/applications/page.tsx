"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { TeacherShell } from "@/components/teacher-shell";
import { Card, MiniProgress, StatusBadge } from "@/components/ui";
import { useDemoData } from "@/lib/use-demo-data";

export default function ApplicationsPage() {
  const { applicants } = useDemoData();
  const [query, setQuery] = useState("");
  const visible = applicants.filter(p => `${p.name} ${p.school}`.toLowerCase().includes(query.toLowerCase()));
  return <TeacherShell><div className="page"><div className="page-heading"><div><p className="eyebrow">APPLICANTS · DEMO</p><h1>ผู้สมัครทั้งหมด</h1><p>ข้อมูลตัวอย่างและใบสมัครที่บันทึกในเบราว์เซอร์นี้</p></div></div><div className="toolbar"><label className="search"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาชื่อหรือโรงเรียน..." /></label></div><Card className="applicants-list">{visible.length === 0 && <p style={{ padding: 24 }}>ไม่พบผู้สมัคร</p>}{visible.map((person, index) => <Link href={`/applications/${person.id}`} className="applicant-list-row" key={person.id}><div className={`avatar avatar-${index % 4 + 1}`}>{person.name.slice(0, 2)}</div><div className="candidate-name"><b>{person.name}</b><span>{person.school}</span></div><div className="match-cell wide"><b>{person.score === null ? "รอการประเมิน" : `${person.score}% match`}</b>{person.score !== null && <MiniProgress value={person.score} tone={person.score > 80 ? "green" : "amber"} />}</div><StatusBadge tone={person.status === "Approved" ? "green" : person.status === "Rejected" ? "amber" : "blue"}>{person.status}</StatusBadge><span className="view-label">ดูรายละเอียด →</span></Link>)}</Card></div></TeacherShell>;
}
