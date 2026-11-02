import { initialData, type Applicant, type Campaign, type DemoData } from "./demo-data";
import { getSupabaseBrowser } from "./supabase";

type CampaignRow = {
  id: string; title: string; faculty: string; year: string; deadline: string;
  requirement: string; open_date: string | null; question: string; slug: string;
};

type ApplicationRow = {
  id: string; full_name: string; school: string; email: string; phone: string;
  gpax: number; file_name: string; drive_file_id: string | null; intro: string; status: Applicant["status"];
  score: number | null; analysis: Applicant["analysis"] | null;
  analysis_status: Applicant["analysisStatus"]; analysis_error: string | null;
  campaigns: { title: string; faculty: string; requirement: string } | { title: string; faculty: string; requirement: string }[] | null;
};

function toCampaign(row: CampaignRow): Campaign {
  return { title: row.title, faculty: row.faculty, year: row.year,
    deadline: row.deadline, requirement: row.requirement };
}

export async function loadDatabaseData(): Promise<DemoData> {
  const client = getSupabaseBrowser();
  if (!client) throw new Error("Supabase is not configured");
  const [campaigns, applications] = await Promise.all([
    client.from("campaigns").select("id,slug,title,faculty,year,deadline,requirement,open_date,question").order("created_at", { ascending: false }).limit(1),
    client.from("applications").select("id,full_name,school,email,phone,gpax,file_name,drive_file_id,intro,status,score,analysis,analysis_status,analysis_error,campaigns(title,faculty,requirement)").order("created_at", { ascending: false }),
  ]);
  if (campaigns.error || applications.error) throw new Error("โหลดข้อมูล Supabase ไม่สำเร็จ");
  const latest = (campaigns.data?.[0] ?? null) as CampaignRow | null;
  const rows = (applications.data ?? []) as unknown as ApplicationRow[];
  return {
    campaign: latest ? toCampaign(latest) : initialData.campaign,
    applicants: rows.map(row => {
      const campaign = Array.isArray(row.campaigns) ? row.campaigns[0] : row.campaigns;
      return {
      id: row.id, name: row.full_name, school: row.school, email: row.email,
      phone: row.phone, gpax: String(row.gpax), fileName: row.file_name,
      hasStoredPdf: Boolean(row.drive_file_id),
      intro: row.intro, status: row.status, score: row.score,
      analysis: row.analysis ?? undefined, analysisStatus: row.analysis_status,
      analysisError: row.analysis_error ?? undefined,
      campaignTitle: campaign?.title,
      campaignFaculty: campaign?.faculty,
      campaignRequirement: campaign?.requirement,
    }; }),
  };
}

export async function createDatabaseCampaign(campaign: Campaign, openDate: string, question: string) {
  const client = getSupabaseBrowser();
  if (!client) throw new Error("Supabase is not configured");
  const { data: user, error: userError } = await client.auth.getUser();
  if (userError || !user.user) throw new Error("กรุณาเข้าสู่ระบบกรรมการ");
  const slug = `round-${crypto.randomUUID()}`;
  const { data, error } = await client.from("campaigns").insert({
    slug, title: campaign.title, faculty: campaign.faculty, year: campaign.year,
    deadline: campaign.deadline, requirement: campaign.requirement,
    open_date: openDate || null, question, created_by: user.user.id,
  }).select("slug").single();
  if (error || !data) throw new Error("บันทึกรอบรับสมัครใน Supabase ไม่สำเร็จ");
  window.dispatchEvent(new Event("portfoliomatch-db-change"));
  return String(data.slug);
}

export async function decideDatabaseApplication(id: string, status: "Approved" | "Rejected") {
  const client = getSupabaseBrowser();
  if (!client) throw new Error("Supabase is not configured");
  const { data, error } = await client.from("applications").update({ status }).eq("id", id).select("id").single();
  if (error || !data) throw new Error("บันทึกผลพิจารณาไม่สำเร็จ");
  window.dispatchEvent(new Event("portfoliomatch-db-change"));
}
