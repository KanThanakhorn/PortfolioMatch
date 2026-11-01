import type { Applicant } from "@/lib/demo-data";
import { Card, MiniProgress } from "./ui";

export function PortfolioAnalysisCard({ person }: { person: Applicant }) {
  const analysis = person.analysis;

  if (analysis && person.analysisStatus === "complete") {
    return <Card className="ai-summary-card">
      <p className="eyebrow">AI REVIEW · ข้อมูลประกอบการตัดสินใจ</p>
      <h2>ความสอดคล้องกับเกณฑ์ {analysis.score}/100</h2>
      <MiniProgress value={analysis.score} />
      <p>{analysis.summary}</p>
      <h3>หลักฐานตามเกณฑ์</h3>
      <div className="analysis-criteria">{analysis.criteria.map((item, index) => <div className="analysis-criterion" key={`${item.criterion}-${index}`}><div><b>{item.criterion}</b><span>{item.rating}</span></div><p>{item.evidence}</p>{item.page && <small>{item.page}</small>}</div>)}</div>
      {analysis.strengths.length > 0 && <><h3>จุดแข็งที่พบ</h3><ul>{analysis.strengths.map((item, index) => <li key={index}>{item}</li>)}</ul></>}
      {analysis.gaps.length > 0 && <><h3>ข้อมูลที่ยังขาด</h3><ul>{analysis.gaps.map((item, index) => <li key={index}>{item}</li>)}</ul></>}
      <p className="analysis-uncertainty">ข้อจำกัดของผลวิเคราะห์: {analysis.uncertainty}</p>
      <p className="ai-disclaimer">คะแนนนี้เป็นข้อเสนอแนะจาก AI กรรมการต้องตรวจ Portfolio ต้นฉบับและตัดสินใจเอง</p>
    </Card>;
  }

  return <Card className="ai-summary-card">
    <h2>{person.analysisStatus === "pending" ? "กำลังวิเคราะห์ Portfolio" : person.score === null ? "รอการประเมิน" : "คะแนนตัวอย่างสำหรับเดโม"}</h2>
    <p>{person.analysisStatus === "pending" ? "ระบบกำลังส่ง PDF ไปวิเคราะห์ตามเกณฑ์ โปรดรีเฟรชหน้านี้อีกครั้งในอีกสักครู่" : person.analysisStatus === "error" ? `AI วิเคราะห์ไม่สำเร็จ: ${person.analysisError || "โปรดลองใหม่ภายหลัง"}` : person.score === null ? "ใบสมัครนี้ยังไม่มีคะแนนหรือผลวิเคราะห์ AI" : `คะแนนตัวอย่าง ${person.score}/100 จากข้อมูล mock ที่เตรียมไว้ล่วงหน้า ไม่ได้วิเคราะห์จากไฟล์จริง`}</p>
    {person.score !== null && <MiniProgress value={person.score} />}
    <p className="ai-disclaimer">ผู้พิจารณาควรอ่าน Portfolio ต้นฉบับก่อนตัดสินใจ</p>
  </Card>;
}
