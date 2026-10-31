import Link from "next/link";
import { Logo } from "@/components/ui";
import "./privacy.css";

export const metadata = {
  title: "นโยบายความเป็นส่วนตัว | PortfolioMatch",
};

export default function PrivacyPage() {
  return (
    <div className="applicant-site">
      <header className="applicant-header"><Logo /></header>
      <main className="privacy-page">
        <p className="eyebrow">PORTFOLIOMATCH PROTOTYPE</p>
        <h1>นโยบายความเป็นส่วนตัวสำหรับแบบฟอร์มสาธิต</h1>
        <p className="privacy-lead">
          หน้านี้อธิบายการทำงานของแบบฟอร์มสมัครในต้นแบบ PortfolioMatch
          แบบฟอร์มนี้ยังไม่ใช่ระบบรับสมัครจริง และยังไม่มีการส่งใบสมัครให้คณะกรรมการ
        </p>

        <section>
          <h2>ข้อมูลที่แสดงในแบบฟอร์ม</h2>
          <p>แบบฟอร์มให้กรอกชื่อ นามสกุล อีเมล เบอร์โทรศัพท์ GPAX โรงเรียน คำอธิบายผลงาน และเลือกไฟล์ Portfolio แบบ PDF</p>
        </section>

        <section>
          <h2>การใช้และการเก็บข้อมูลในต้นแบบ</h2>
          <p>เมื่อส่งแบบฟอร์มสาธิต ชื่อ ข้อมูลติดต่อ GPAX โรงเรียน คำอธิบายผลงาน และชื่อไฟล์ PDF จะถูกบันทึกใน localStorage ของเบราว์เซอร์ที่ใช้ เพื่อแสดงในหน้ารายชื่อผู้สมัครสาธิต ไฟล์ PDF จริงไม่ถูกบันทึกหรืออัปโหลด และไม่มีการส่งข้อมูลไปยังเซิร์ฟเวอร์ บริการ AI หรืออีเมล</p>
          <p>เบราว์เซอร์จะจำหมายเลขอ้างอิงของใบสมัครล่าสุดใน sessionStorage ของแท็บ เพื่อแสดงหน้าสำเร็จหลังรีเฟรช สามารถลบสถานะนี้ด้วยปุ่ม “เริ่มใบสมัครใหม่” หรือปิดแท็บได้ แต่ข้อมูลสาธิตใน localStorage จะยังอยู่จนกว่าจะล้างข้อมูลเว็บไซต์ในเบราว์เซอร์</p>
        </section>

        <section>
          <h2>ก่อนใช้ระบบรับสมัครจริง</h2>
          <p>หากนำ PortfolioMatch ไปใช้รับสมัครจริง ทีมงานต้องจัดทำประกาศความเป็นส่วนตัวสำหรับหน่วยงานที่รับสมัคร ระบุผู้รับผิดชอบและช่องทางติดต่อ วัตถุประสงค์ ผู้ที่เข้าถึงข้อมูล ระยะเวลาจัดเก็บ และวิธีใช้สิทธิของเจ้าของข้อมูล ก่อนเปิดให้ส่งข้อมูลจริง</p>
        </section>

        <Link className="button secondary privacy-back" href="/apply/ux-ai-2026">กลับไปแบบฟอร์มสมัคร</Link>
      </main>
    </div>
  );
}
