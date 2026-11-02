import { downloadDriveFile } from "@/lib/google-drive";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "ไม่พบใบสมัคร" }, { status: 404 });

  const token = request.headers.get("authorization")?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return Response.json({ error: "กรุณาเข้าสู่ระบบกรรมการ" }, { status: 401 });

  try {
    const admin = getSupabaseAdmin();
    const { data: user, error: authError } = await admin.auth.getUser(token);
    if (authError || !user.user) return Response.json({ error: "กรุณาเข้าสู่ระบบกรรมการ" }, { status: 401 });

    const { data: member, error: memberError } = await admin.from("teacher_members")
      .select("user_id").eq("user_id", user.user.id).maybeSingle();
    if (memberError) throw memberError;
    if (!member) return Response.json({ error: "บัญชีนี้ไม่มีสิทธิ์ดู Portfolio" }, { status: 403 });

    const { data: application, error: applicationError } = await admin.from("applications")
      .select("drive_file_id,file_name").eq("id", id).maybeSingle();
    if (applicationError) throw applicationError;
    if (!application?.drive_file_id) return Response.json({ error: "ใบสมัครนี้ไม่มี PDF ที่เก็บไว้" }, { status: 404 });

    const file = await downloadDriveFile(application.drive_file_id);
    if (!file.ok || !file.body) return Response.json({ error: "เปิด PDF จาก Google Drive ไม่สำเร็จ" }, { status: 502 });
    return new Response(file.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(application.file_name)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        Vary: "Authorization",
      },
    });
  } catch {
    return Response.json({ error: "เปิด PDF ไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 503 });
  }
}
