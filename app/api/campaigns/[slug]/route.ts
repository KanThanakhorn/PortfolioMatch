import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{8,80}$/.test(slug)) return Response.json({ error: "ไม่พบรอบรับสมัคร" }, { status: 404 });
  try {
    const { data, error } = await getSupabaseAdmin().from("campaigns")
      .select("id,title,faculty,year,deadline,requirement,open_date,question")
      .eq("slug", slug).eq("is_open", true).maybeSingle();
    if (error) throw error;
    if (!data) return Response.json({ error: "ไม่พบรอบรับสมัคร" }, { status: 404 });
    return Response.json({ campaign: data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "โหลดรอบรับสมัครไม่สำเร็จ" }, { status: 503 });
  }
}
