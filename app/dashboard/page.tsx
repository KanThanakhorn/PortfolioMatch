import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Check, ChevronDown, Clock3, FileText, MoreHorizontal, TrendingUp, UserRoundCheck, UsersRound } from "lucide-react";
import { TeacherShell } from "@/components/teacher-shell";
import { Card, MiniProgress, StatusBadge } from "@/components/ui";

const candidates = [
  { id: "pimchanok", initials: "พช", name: "พิมชนก ชัยวัฒนา", school: "โรงเรียนสาธิต มศว", match: 92, status: "Shortlisted", tone: "green" as const, time: "12 นาทีที่แล้ว" },
  { id: "thanawat", initials: "ธว", name: "ธนวัฒน์ ศรีสุข", school: "โรงเรียนเตรียมอุดมศึกษา", match: 86, status: "Review", tone: "blue" as const, time: "35 นาทีที่แล้ว" },
  { id: "kulthida", initials: "กธ", name: "กุลธิดา วงศ์ดี", school: "โรงเรียนหาดใหญ่วิทยาลัย", match: 74, status: "Review", tone: "blue" as const, time: "1 ชม. ที่แล้ว" },
  { id: "naphat", initials: "ณภ", name: "ณภัทร สุวรรณ", school: "โรงเรียนกรุงเทพคริสเตียน", match: 61, status: "Needs attention", tone: "amber" as const, time: "3 ชม. ที่แล้ว" },
];

export default function DashboardPage() {
  return (
    <TeacherShell>
      <div className="page dashboard-page">
        <div className="page-heading">
          <div><p className="eyebrow">OVERVIEW</p><h1>สวัสดีค่ะ อ. ณัฐชา <span>👋</span></h1><p>นี่คือภาพรวมการรับสมัครล่าสุดของคุณ</p></div>
          <Link className="button primary" href="/create"><BriefcaseBusiness size={17} />สร้างการรับสมัครใหม่</Link>
        </div>

        <section className="metric-grid">
          <Card className="metric-card"><div className="metric-icon purple"><UsersRound size={20} /></div><div><span>ผู้สมัครทั้งหมด</span><strong>128</strong><small className="positive"><TrendingUp size={13} /> 18% จากสัปดาห์ก่อน</small></div></Card>
          <Card className="metric-card"><div className="metric-icon green"><UserRoundCheck size={20} /></div><div><span>ตรงตาม Requirement</span><strong>84%</strong><small>108 จาก 128 คน</small></div></Card>
          <Card className="metric-card"><div className="metric-icon amber"><Clock3 size={20} /></div><div><span>รอการตรวจสอบ</span><strong>24</strong><small>AI วิเคราะห์แล้ว 18 คน</small></div></Card>
          <Card className="metric-card"><div className="metric-icon blue"><Check size={20} /></div><div><span>อนุมัติแล้ว</span><strong>46</strong><small>36% ของผู้สมัครทั้งหมด</small></div></Card>
        </section>

        <div className="dashboard-grid">
          <Card className="chart-card">
            <div className="card-head"><div><h2>ภาพรวมความตรงกัน</h2><p>คะแนนเฉลี่ยของพอร์ตที่ส่งเข้ามา</p></div><button className="select-button">7 วันที่ผ่านมา <ChevronDown size={15} /></button></div>
            <div className="donut-wrap">
              <div className="donut"><div><strong>84%</strong><span>Average match</span></div></div>
              <div className="legend-list">
                <div><span className="legend-dot strong" /><p><b>Strong match</b><small>80–100%</small></p><strong>72</strong></div>
                <div><span className="legend-dot medium" /><p><b>Potential match</b><small>60–79%</small></p><strong>36</strong></div>
                <div><span className="legend-dot low" /><p><b>Low match</b><small>ต่ำกว่า 60%</small></p><strong>20</strong></div>
              </div>
            </div>
          </Card>

          <Card className="admission-card">
            <div className="card-head"><div><h2>การรับสมัครที่เปิดอยู่</h2><p>กำลังเปิดรับ 2 รายการ</p></div><Link href="/create">ดูทั้งหมด</Link></div>
            <div className="admission-item"><div className="doc-icon"><FileText size={20} /></div><div className="grow"><div><h3>สาขาออกแบบนิเทศศิลป์</h3><StatusBadge tone="green">เปิดรับ</StatusBadge></div><p>รอบ Portfolio · ปีการศึกษา 2569</p><MiniProgress value={68} /><small><span>86 ผู้สมัคร</span><span>เหลือ 12 วัน</span></small></div></div>
            <div className="admission-item"><div className="doc-icon orange"><FileText size={20} /></div><div className="grow"><div><h3>สาขาดิจิทัลมีเดีย</h3><StatusBadge tone="green">เปิดรับ</StatusBadge></div><p>รอบ Portfolio · ปีการศึกษา 2569</p><MiniProgress value={42} tone="amber" /><small><span>42 ผู้สมัคร</span><span>เหลือ 18 วัน</span></small></div></div>
          </Card>
        </div>

        <Card className="table-card">
          <div className="card-head"><div><h2>ผู้สมัครล่าสุด</h2><p>พอร์ตที่เพิ่งส่งเข้ามาและรอการตรวจสอบ</p></div><Link className="text-link" href="/applications">ดูผู้สมัครทั้งหมด <ArrowRight size={15} /></Link></div>
          <div className="candidate-table" role="table">
            <div className="candidate-row candidate-header" role="row"><span>ผู้สมัคร</span><span>ความตรงกัน</span><span>สถานะ</span><span>ส่งเมื่อ</span><span /></div>
            {candidates.map((candidate, index) => <div className="candidate-row" role="row" key={candidate.id}><div className={`avatar avatar-${index + 1}`}>{candidate.initials}</div><div className="candidate-name"><Link href={`/applications/${candidate.id}`}>{candidate.name}</Link><span>{candidate.school}</span></div><div className="match-cell"><b>{candidate.match}%</b><MiniProgress value={candidate.match} tone={candidate.match > 80 ? "green" : candidate.match > 65 ? "purple" : "amber"} /></div><StatusBadge tone={candidate.tone}>{candidate.status}</StatusBadge><span className="time">{candidate.time}</span><Link className="row-action" href={`/applications/${candidate.id}`} aria-label={`ดู ${candidate.name}`}><MoreHorizontal size={18} /></Link></div>)}
          </div>
        </Card>
      </div>
    </TeacherShell>
  );
}
