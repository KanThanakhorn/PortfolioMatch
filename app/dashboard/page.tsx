"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, UsersRound } from "lucide-react";
import { TeacherShell } from "@/components/teacher-shell";
import { Card, MiniProgress, StatusBadge } from "@/components/ui";
import { useDemoData } from "@/lib/use-demo-data";

export default function DashboardPage() {
  const { applicants, campaign } = useDemoData();
  const scored = applicants.filter(p => p.score !== null);
  const average = scored.length ? Math.round(scored.reduce((sum, p) => sum + (p.score ?? 0), 0) / scored.length) : 0;
  return <TeacherShell><div className="page dashboard-page"><div className="page-heading"><div><p className="eyebrow">OVERVIEW · DEMO</p><h1>ภาพรวมการรับสมัคร</h1><p>{campaign.title}</p></div><Link className="button primary" href="/create"><BriefcaseBusiness size={17} />จัดการรอบรับสมัคร</Link></div><section className="metric-grid"><Card className="metric-card"><div className="metric-icon purple"><UsersRound size={20} /></div><div><span>ผู้สมัครทั้งหมด</span><strong>{applicants.length}</strong></div></Card><Card className="metric-card"><div><span>คะแนนเฉลี่ยที่มีข้อมูล</span><strong>{average}%</strong><small>จาก {scored.length} ราย (AI หรือข้อมูลตัวอย่าง)</small></div></Card><Card className="metric-card"><div><span>รอการตรวจสอบ</span><strong>{applicants.filter(p => p.status === "Review").length}</strong></div></Card><Card className="metric-card"><div><span>อนุมัติแล้ว</span><strong>{applicants.filter(p => p.status === "Approved").length}</strong></div></Card></section><Card className="table-card"><div className="card-head"><div><h2>ผู้สมัครล่าสุด</h2><p>สถานะอัปเดตจากการตัดสินใจในเบราว์เซอร์นี้</p></div><Link className="text-link" href="/applications">ดูทั้งหมด <ArrowRight size={15} /></Link></div><div className="candidate-table">{applicants.slice(0, 5).map((person, index) => <div className="candidate-row" key={person.id}><div className={`avatar avatar-${index % 4 + 1}`}>{person.name.slice(0, 2)}</div><div className="candidate-name"><Link href={`/applications/${person.id}`}>{person.name}</Link><span>{person.school}</span></div><div className="match-cell"><b>{person.score === null ? "รอประเมิน" : `${person.score}%`}</b>{person.score !== null && <MiniProgress value={person.score} />}</div><StatusBadge tone={person.status === "Approved" ? "green" : person.status === "Rejected" ? "amber" : "blue"}>{person.status}</StatusBadge><span className="time">เดโม</span><Link className="row-action" href={`/applications/${person.id}`} aria-label={`ดู ${person.name}`}>→</Link></div>)}</div></Card></div></TeacherShell>;
}
