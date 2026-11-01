import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

function field(form: FormData, name: string, maxLength: number): string | null {
  const value = form.get(name);
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= maxLength ? text : null;
}

export async function POST(request: Request) {
  let form: FormData;
  try { form = await request.formData(); }
  catch { return Response.json({ error: "อ่านใบสมัครไม่สำเร็จ" }, { status: 400 }); }

  const campaignId = field(form, "campaignId", 36);
  const firstName = field(form, "firstName", 100);
  const lastName = field(form, "lastName", 100);
  const email = field(form, "email", 320);
  const phone = field(form, "phone", 10);
  const school = field(form, "school", 200);
  const gpaxText = field(form, "gpax", 4);
  const intro = String(form.get("intro") ?? "").trim();
  const aiConsent = form.get("aiConsent") === "true";
  const privacyConsent = form.get("privacyConsent") === "true";
  const file = form.get("portfolio");
  const gpax = Number(gpaxText);

  if (!privacyConsent || !campaignId || !/^[0-9a-f-]{36}$/i.test(campaignId) || !firstName || !lastName || !school
    || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone || !/^0[0-9]{9}$/.test(phone)
    || !gpaxText || !Number.isFinite(gpax) || gpax < 0 || gpax > 4 || intro.length > 5000) {
    return Response.json({ error: "ข้อมูลใบสมัครไม่ถูกต้อง" }, { status: 400 });
  }
  if (!(file instanceof File) || file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")
    || file.size === 0 || file.size > MAX_FILE_BYTES || file.name.length > 255) {
    return Response.json({ error: "ต้องแนบ PDF ขนาดไม่เกิน 50 MB" }, { status: 400 });
  }
  if (aiConsent && file.size >= 45_000_000) {
    return Response.json({ error: "ไฟล์สำหรับวิเคราะห์ AI ต้องมีขนาดต่ำกว่า 45 MB" }, { status: 400 });
  }
  if (Buffer.from(await file.slice(0, 5).arrayBuffer()).toString("ascii") !== "%PDF-") {
    return Response.json({ error: "ไฟล์นี้ไม่ใช่ PDF ที่ถูกต้อง" }, { status: 400 });
  }

  try {
    const client = getSupabaseAdmin();
    const { data: campaign, error: campaignError } = await client.from("campaigns")
      .select("id").eq("id", campaignId).eq("is_open", true).maybeSingle();
    if (campaignError || !campaign) return Response.json({ error: "รอบรับสมัครไม่พร้อมใช้งาน" }, { status: 404 });
    const id = randomUUID();
    const submissionToken = randomBytes(32).toString("base64url");
    const submissionTokenHash = createHash("sha256").update(submissionToken).digest("hex");
    const { error } = await client.from("applications").insert({
      id, campaign_id: campaignId, full_name: `${firstName} ${lastName}`, school,
      email, phone, gpax, file_name: file.name, intro,
      privacy_consented_at: new Date().toISOString(),
      ai_consent: aiConsent, analysis_status: aiConsent ? "pending" : "not_requested",
      ai_consented_at: aiConsent ? new Date().toISOString() : null,
      submission_token_hash: submissionTokenHash,
    });
    if (error) throw error;
    return Response.json({ id, submissionToken }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "บันทึกใบสมัครไม่สำเร็จ" }, { status: 503 });
  }
}
