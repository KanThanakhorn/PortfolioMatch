# สถานะงาน Google Drive สำหรับ PDF Portfolio

วันที่ 2 พฤศจิกายน 2569 · branch `kan/backend`

## สิ่งที่ทำในโค้ด

- เพิ่ม `drive_file_id` ใน `public.applications` ผ่าน Supabase MCP migration `google_drive_file_id_20261102` (ไฟล์ `supabase/migrations/20261102000000_google_drive_file_id.sql`). ค่าเป็น `NULL` สำหรับใบสมัครเดิม.
- ใบสมัครใหม่ในโหมด Supabase ต้องอัปโหลด PDF ไปยัง Google Drive ส่วนตัวที่เชื่อมด้วย OAuth ก่อน จึงบันทึกใบสมัครและรหัสไฟล์ใน Supabase. หากยังไม่ตั้งค่า Drive ระบบตอบ HTTP 503 แทนการรับใบสมัครแต่ทิ้งไฟล์.
- ไฟล์ถูกตั้งชื่อ `PortfolioMatch-<application-id>.pdf` ใน My Drive ของบัญชีที่เชื่อม. แอปไม่ได้สร้างสิทธิ์แชร์สาธารณะ.
- กรรมการเปิดดู/ดาวน์โหลด PDF ในหน้ารายละเอียดผ่าน API ที่ตรวจ Supabase Auth และ `teacher_members` ก่อนดึงไฟล์จาก Drive. เบราว์เซอร์ไม่ได้รับ Google OAuth token หรือ Drive file ID จาก API นี้.
- หากบันทึกใบสมัครใน Supabase ล้มเหลวหลังอัปโหลด ระบบพยายามลบไฟล์ Drive ที่เพิ่งสร้าง. หากเซิร์ฟเวอร์หยุดกะทันหัน อาจมีไฟล์กำพร้า จึงยังต้องมี cleanup/retention workflow ก่อนใช้งานจริง.
- โหมด localStorage ยังเก็บเพียงชื่อไฟล์. ใบสมัครเก่าที่สร้างก่อนระบบ Drive ไม่มี PDF ต้นฉบับให้เปิดย้อนหลังจากชื่อไฟล์อย่างเดียว.

## สถานะทดสอบ

- `npm run typecheck`, `npm run build`, และ `node --check scripts/connect-google-drive.mjs` ผ่าน.
- เชื่อม OAuth กับ Google Drive ส่วนตัวสำเร็จ; refresh token อยู่ใน `.env.local` เท่านั้น ไม่ได้ commit. ตรวจ production server ในเครื่อง: เมื่อยังไม่มี Drive credential, POST `/api/applications` ได้ HTTP 503.
- ทดสอบกับ Google Drive จริงด้วย PDF จำลอง 3,600 ไบต์: ส่งใบสมัครใหม่สำเร็จและมี Drive file ID ใน Supabase. GET PDF โดยไม่ลงชื่อเข้าใช้ได้ HTTP 401; บัญชี Auth ที่ไม่อยู่ใน `teacher_members` ได้ HTTP 403; บัญชีกรรมการ QA ชั่วคราวได้ HTTP 200 และเนื้อไฟล์ตรงต้นฉบับทุกไบต์. ลบบัญชี QA ชั่วคราวหลังทดสอบแล้ว.
- เก็บใบสมัคร QA ใหม่นี้ไว้ให้เปิดดูด้วยบัญชีกรรมการจริง: `a01eb85a-7ae8-495f-8c8b-e9c7b8fa0105`. เติม PDF จำลองต้นฉบับให้ใบสมัครเก่า 2 รายการชื่อ `qa-portfolio.pdf` และผูก Drive file ID แล้ว. ทั้งสามรายการเป็นข้อมูลจำลอง.
- **ยังรอ Frontend QA ผ่านเบราว์เซอร์จริง** สำหรับตัวอย่าง PDF/ปุ่มเปิดแท็บใหม่/ดาวน์โหลดและมือถือ. อย่าระบุส่วน UI ว่าผ่านจนกว่าจะมี screenshot จากตง.

## วิธีเชื่อม Drive ส่วนตัว

1. ใน Google Cloud project เปิด Google Drive API และตั้งค่า OAuth consent screen. หากอยู่ใน Testing ให้เพิ่มบัญชี Google ที่จะใช้เป็น test user.
2. สร้าง OAuth client แบบ **Desktop app** หรือ **Web application**. ใส่ `GOOGLE_DRIVE_CLIENT_ID` และ `GOOGLE_DRIVE_CLIENT_SECRET` ใน `.env.local` โดยไม่ส่งค่าในแชตหรือ commit.
3. รัน `node --env-file=.env.local scripts/connect-google-drive.mjs` บนเครื่องที่เปิดเบราว์เซอร์ได้. สคริปต์จะเปิดหน้า Google ให้ลงชื่อเข้าใช้บัญชี Drive ส่วนตัว.
4. หลังยินยอม สคริปต์จะบันทึก `GOOGLE_DRIVE_REFRESH_TOKEN` ลง `.env.local` โดยไม่พิมพ์ค่าออกมา. Restart แอป แล้วทดสอบใบสมัครจำลองหนึ่งรายการ.

หากสร้าง OAuth client แบบ Web application แล้วพบ `redirect_uri_mismatch` ให้เพิ่ม `http://127.0.0.1:8787/oauth2callback` ใน Authorized redirect URIs ของ client นั้นตรงตามตัวอักษร.

หาก OAuth consent screen แบบ External ยังอยู่ในสถานะ Testing, refresh token สำหรับ Drive scope จะหมดอายุใน 7 วันตามข้อกำหนด Google. ต้องเชื่อมใหม่ก่อนเดโมที่จัดภายหลัง.

## นัทและตง

- **นัท:** เมื่อ Drive ผ่านการทดสอบจริง ค่อยแก้รายงานจาก “ไม่เก็บ PDF” เป็น “โหมด Supabase เก็บ PDF ส่วนตัวใน Google Drive; Supabase เก็บรหัสไฟล์; กรรมการเปิดผ่าน API ที่ตรวจสิทธิ์”. ระบุว่า localStorage mode และใบสมัครเก่ายังไม่มีไฟล์. เพิ่ม Google Drive API/OAuth ใน architecture และข้อจำกัดเรื่อง retention/cleanup.
- **ตง:** ทดสอบส่ง PDF ใหม่, เปิดตัวอย่าง, เปิดแท็บใหม่, ดาวน์โหลด, logout แล้วเปิดไม่ได้, บัญชีไม่ใช่กรรมการถูกปฏิเสธ, ไฟล์เก่าแสดงข้อความว่าไม่มี PDF, Drive ล่มแล้วใบสมัครไม่ถูกบันทึก, และมือถือ. เก็บ screenshot กับ Pass/Fail หลังเชื่อม credential.
