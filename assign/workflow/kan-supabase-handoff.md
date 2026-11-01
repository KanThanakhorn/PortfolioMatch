# งานกานต์: Supabase database integration สำหรับเดโม

วันที่: 1 พฤศจิกายน 2569 · branch `kan/backend`

## สถานะที่ทำจริง

- ใช้ Supabase MCP ลง migration 2 ชุดในโปรเจกต์ `ipqqtuvxiuwhdimccacn` แล้ว: `portfolio_core_20261101` และ `portfolio_fk_indexes_20261101`. ไฟล์ต้นทางอยู่ใน `supabase/migrations/` ตามลำดับชื่อไฟล์.
- เพิ่มบัญชี Supabase Auth ที่ผู้ใช้สร้างไว้ 1 บัญชีเป็นกรรมการใน `teacher_members`. ตั้งค่า URL, publishable key และ secret key ใน `.env.local` แล้ว โดยไม่ commit key.
- ทดสอบผ่าน production server ในเครื่องกับ Supabase จริง: เปิดรอบรับสมัคร QA ผ่าน API, ส่งใบสมัครจำลอง 2 รายการ (ไม่ยินยอม AI / ยินยอม AI), วิเคราะห์ Gemini สำเร็จและบันทึกคะแนน 65 กับเกณฑ์ 4 ข้อ. ตรวจ DB แล้วรายการไม่ยินยอม AI ไม่มีคะแนนและสถานะ `not_requested`; รายการยินยอม AI มีสถานะ `complete`.
- ทดสอบ token วิเคราะห์ผิดได้ HTTP 403 และ slug รอบที่ไม่พบได้ HTTP 404. ผู้ใช้ไม่ลงชื่อเข้าใช้เรียกตารางโดยตรงไม่ได้; จำลองบทบาทกรรมการผ่าน RLS อ่านข้อมูลและเปลี่ยนสถานะได้ (ทดลองใน transaction แล้ว rollback); บัญชีที่ไม่อยู่ใน allowlist เห็น 0 รายการ. Supabase security advisor ไม่พบคำเตือน.
- `npm run typecheck` และ `npm run build` ผ่าน. การเข้าสู่ระบบผ่าน UI ด้วยรหัสผ่านจริงและ flow บนเบราว์เซอร์สองเครื่องยังต้องให้ตง retest; ไม่ได้ขอรหัสผ่านจากผู้ใช้.

## โครงสร้างที่ทำไว้

- Migration `supabase/migrations/20261101000000_portfolio_core.sql` สร้าง `teacher_members`, `campaigns`, `applications` พร้อม foreign key, validation, index, timestamp และ RLS.
- `teacher_members` เป็น allowlist ของบัญชีกรรมการใน Supabase Auth. ผู้สมัครทั่วไปไม่มีสิทธิ์อ่านตารางใบสมัครหรือแก้สถานะโดยตรง.
- กรรมการล็อกอินก่อนเปิด Dashboard, Applicants และ Create. กรรมการสร้างรอบใน Supabase; ลิงก์สมัครอ้าง slug ของรอบ. ใบสมัครถูกบันทึกผ่าน API ฝั่งเซิร์ฟเวอร์. กรรมการเปลี่ยน Approved/Rejected ผ่าน RLS.
- การยินยอม AI แยกจากการยินยอมหลัก. PDF ถูกส่ง Gemini ชั่วคราว; ผลวิเคราะห์บันทึกกับใบสมัครใน Supabase. ระบบบันทึกเวลาและเวอร์ชันข้อความยินยอมสาธิต.
- หากไม่ตั้งค่า Supabase แอปยังใช้ localStorage แบบเดิม. ข้อมูลเก่าใน localStorage และคะแนนตัวอย่างไม่ถูกย้ายเข้าฐานข้อมูล.
- ยังไม่เก็บ PDF ต้นฉบับ. กรรมการเห็นชื่อไฟล์และผล AI แต่เปิด PDF จากระบบย้อนหลังไม่ได้.

## การเปิดใช้

1. ในโปรเจกต์ที่เชื่อมได้ทำ migration, เพิ่มกรรมการ และตั้งค่า `.env.local` แล้ว. เมื่อใช้ Supabase โปรเจกต์อื่น ให้ลง migration ทั้ง 2 ไฟล์ตามลำดับ, สร้างบัญชีกรรมการ และเพิ่ม `user_id` ลง `public.teacher_members`.
2. ตั้งค่า `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` ใน `.env.local` ของเครื่องรัน. Secret key ห้ามอยู่ใน client หรือ commit.
3. รัน `npm run dev` หรือ build ใหม่หลังเปลี่ยนตัวแปร environment. ให้ตงทดสอบ flow ข้ามสองเบราว์เซอร์.

## ข้อจำกัดที่ต้องพูดตามจริง

- ฐานข้อมูลช่วยให้รอบและใบสมัครข้ามเครื่องได้ แต่ยังเป็น **เดโม**: public submission API ไม่มี rate limit แบบ durable, ไม่มี file storage, backup/retention workflow, audit log หรือการทดสอบโหลดจริง.
- การวิเคราะห์ AI ไม่ใช่ผลตัดสินรับสมัคร. คะแนนอาจผิด; กรรมการต้องตรวจหลักฐานต้นฉบับนอกระบบ.
- หากรีเฟรชหน้าผู้สมัครระหว่าง Gemini กำลังทำงาน ระบบไม่มี PDF สำหรับส่งซ้ำและรายการอาจค้าง `pending`; ต้องมี job queue/recovery ก่อนใช้งานจริง.
- ข้อความ deadline ยังเป็นข้อความแสดงผล ไม่บังคับปิดรอบตามวัน; `is_open` ใน DB ใช้ปิดรอบผ่านผู้ดูแลได้.
- `AI_REVIEW_PUBLIC_DEMO=true` เปิด endpoint Gemini ใน production; ยังไม่ควรเปิดสาธารณะจนมี abuse protection และงบประมาณ API.

## งานที่นัทต้องอัปเดต

แก้ architecture จาก localStorage-only เป็นสองโหมด และเพิ่ม Supabase Auth, PostgreSQL/RLS, Next.js Route Handler, Gemini. ระบุว่าเดโม DB เก็บข้อมูลผู้สมัครและผล AI ข้ามเครื่อง แต่ **ไม่เก็บ PDF ต้นฉบับ**. แยกผลที่ทดสอบจริงบน Supabase ออกจากผล localStorage เดิม; อย่าใส่ Pass ก่อนมีหลักฐาน. อัปเดตทรัพยากร/ต้นทุนของ Supabase และ Gemini จากข้อมูลใช้งานจริง.

## งานที่ตงต้อง retest

1. เข้าสู่ระบบกรรมการที่มีสิทธิ์และบัญชีที่ไม่มีสิทธิ์; ต้องไม่เห็น PII เมื่อไม่มีสิทธิ์.
2. สร้างรอบบนเบราว์เซอร์กรรมการ แล้วเปิดลิงก์ที่อีกเบราว์เซอร์/เครื่อง; ตรวจว่าฟอร์มแสดงข้อมูลรอบตรงกัน.
3. ส่ง PDF โดยไม่ยินยอม AI และโดยยินยอม AI; ตรวจผลหลังรีเฟรชและจากเบราว์เซอร์กรรมการ.
4. Approve/Reject แล้วรีเฟรชสองเบราว์เซอร์; Dashboard และ Applicants ต้องตรงกับ DB.
5. ทดสอบไฟล์ผิดชนิด/เกิน 50 MiB, ฟอร์มผิด, ลิงก์รอบไม่ถูกต้อง, Gemini ล้มเหลว และออกจากระบบ.
6. เก็บ Pass/Fail, browser/version, viewport, screenshot และ issue. การทดสอบ TC-01–14 เดิมเป็น baseline ของโหมด localStorage/Gemini ก่อน Supabase.
