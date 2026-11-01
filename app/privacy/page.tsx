import Link from "next/link";
import { Logo } from "@/components/ui";
import "./privacy.css";

export const metadata = {
  title: "นโยบายความเป็นส่วนตัว | PortfolioMatch",
};

export default function PrivacyPage() {
  const databaseMode = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return (
    <div className="applicant-site">
      <header className="applicant-header"><Logo /></header>
      <main className="privacy-page">
        <p className="eyebrow">PORTFOLIOMATCH PROTOTYPE</p>
        <h1>นโยบายความเป็นส่วนตัวสำหรับแบบฟอร์มสาธิต</h1>
        <p className="privacy-lead">
          หน้านี้อธิบายการทำงานของแบบฟอร์มสมัครในต้นแบบ PortfolioMatch
          แบบฟอร์มนี้ยังเป็นระบบสาธิต และยังไม่ควรใช้รับข้อมูลผู้สมัครจริง
        </p>

        <section>
          <h2>ข้อมูลที่แสดงในแบบฟอร์ม</h2>
          <p>แบบฟอร์มให้กรอกชื่อ นามสกุล อีเมล เบอร์โทรศัพท์ GPAX โรงเรียน คำอธิบายผลงาน และเลือกไฟล์ Portfolio แบบ PDF</p>
        </section>

        <section>
          <h2>การใช้และการเก็บข้อมูลในต้นแบบ</h2>
          <p>{databaseMode ? "เมื่อส่งแบบฟอร์มสาธิต ชื่อ ข้อมูลติดต่อ GPAX โรงเรียน คำอธิบายผลงาน และชื่อไฟล์ PDF จะถูกบันทึกใน Supabase เพื่อให้กรรมการที่ได้รับสิทธิ์ดูใบสมัครข้ามเครื่องได้ ระบบยังไม่เก็บไฟล์ PDF ต้นฉบับ และไม่มีการส่งอีเมล" : "เมื่อส่งแบบฟอร์มสาธิต ชื่อ ข้อมูลติดต่อ GPAX โรงเรียน คำอธิบายผลงาน และชื่อไฟล์ PDF จะถูกบันทึกใน localStorage ของเบราว์เซอร์ที่ใช้ เพื่อแสดงในหน้ารายชื่อผู้สมัครสาธิต ไม่มีการส่งอีเมล"}</p>
          <p>หากเลือกยินยอมให้ AI วิเคราะห์ ไฟล์ PDF จะถูกส่งผ่านเซิร์ฟเวอร์ของแอปไปยัง Gemini API ของ Google พร้อมเกณฑ์การพิจารณา ผลสรุปและคะแนนเบื้องต้นจะถูกบันทึก{databaseMode ? "ใน Supabase" : "ใน localStorage ของเบราว์เซอร์นี้"} แอปไม่เก็บเนื้อไฟล์ PDF ไว้หลังวิเคราะห์ กรุณาใช้ข้อมูลจำลองสำหรับเดโม และให้กรรมการตรวจต้นฉบับก่อนตัดสินใจ</p>
          <p>เบราว์เซอร์จะจำหมายเลขอ้างอิงของใบสมัครล่าสุดใน sessionStorage ของแท็บ เพื่อแสดงหน้าสำเร็จหลังรีเฟรช สามารถลบสถานะนี้ด้วยปุ่ม “เริ่มใบสมัครใหม่” หรือปิดแท็บได้ {databaseMode ? "ข้อมูลใบสมัครใน Supabase จะยังอยู่ตามการจัดการของผู้ดูแลระบบ" : "แต่ข้อมูลสาธิตใน localStorage จะยังอยู่จนกว่าจะล้างข้อมูลเว็บไซต์ในเบราว์เซอร์"}</p>
        </section>

        <section>
          <h2>ก่อนใช้ระบบรับสมัครจริง</h2>
          <p>หากนำ PortfolioMatch ไปใช้รับสมัครจริง ทีมงานต้องจัดทำประกาศความเป็นส่วนตัวสำหรับหน่วยงานที่รับสมัคร ระบุผู้รับผิดชอบและช่องทางติดต่อ วัตถุประสงค์ ผู้ที่เข้าถึงข้อมูล ระยะเวลาจัดเก็บ และวิธีใช้สิทธิของเจ้าของข้อมูล ก่อนเปิดให้ส่งข้อมูลจริง</p>
        </section>

        <Link className="button secondary privacy-back" href={databaseMode ? "/" : "/apply/ux-ai-2026"}>{databaseMode ? "กลับหน้าหลัก" : "กลับไปแบบฟอร์มสมัคร"}</Link>
      </main>
    </div>
  );
}
