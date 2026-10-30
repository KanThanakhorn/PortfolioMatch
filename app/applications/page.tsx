import Link from "next/link";
import { ArrowUpDown, Filter, Search } from "lucide-react";
import { TeacherShell } from "@/components/teacher-shell";
import { Card, MiniProgress, StatusBadge } from "@/components/ui";

const people = [
  ["pimchanok", "พิมชนก ชัยวัฒนา", "โรงเรียนสาธิต มศว", 92, "Shortlisted"],
  ["thanawat", "ธนวัฒน์ ศรีสุข", "โรงเรียนเตรียมอุดมศึกษา", 86, "Review"],
  ["kulthida", "กุลธิดา วงศ์ดี", "โรงเรียนหาดใหญ่วิทยาลัย", 74, "Review"],
  ["naphat", "ณภัทร สุวรรณ", "โรงเรียนกรุงเทพคริสเตียน", 61, "Needs attention"],
];

export default function ApplicationsPage() {
  return <TeacherShell><div className="page"><div className="page-heading"><div><p className="eyebrow">APPLICANTS</p><h1>ผู้สมัครทั้งหมด</h1><p>ตรวจสอบ เปรียบเทียบ และตัดสินใจจากข้อมูลของผู้สมัคร</p></div></div><div className="toolbar"><label className="search"><Search size={17} /><input placeholder="ค้นหาชื่อหรือโรงเรียน..." /></label><button className="button secondary"><Filter size={16} />ตัวกรอง</button><button className="button secondary"><ArrowUpDown size={16} />เรียงลำดับ</button></div><Card className="applicants-list">{people.map(([id, name, school, match, status], index) => <Link href={`/applications/${id}`} className="applicant-list-row" key={String(id)}><div className={`avatar avatar-${index + 1}`}>{String(name).slice(0, 2)}</div><div className="candidate-name"><b>{name}</b><span>{school}</span></div><div className="match-cell wide"><b>{match}% match</b><MiniProgress value={Number(match)} tone={Number(match) > 80 ? "green" : Number(match) > 65 ? "purple" : "amber"} /></div><StatusBadge tone={status === "Shortlisted" ? "green" : status === "Review" ? "blue" : "amber"}>{status}</StatusBadge><span className="view-label">ดูรายละเอียด →</span></Link>)}</Card></div></TeacherShell>;
}
