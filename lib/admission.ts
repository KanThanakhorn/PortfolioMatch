export type Admission = {
  title: string;
  year: string;
  program: string;
  openDate: string;
  deadline: string;
  requirements: string;
  question: string;
};

export const defaultAdmission: Admission = {
  title: "รอบ Portfolio – สาขาออกแบบนิเทศศิลป์ 2569",
  year: "2569",
  program: "คณะศิลปกรรมศาสตร์ · ออกแบบนิเทศศิลป์",
  openDate: "",
  deadline: "",
  requirements: "มองหานักเรียนที่มีพื้นฐานด้านการออกแบบและแสดงให้เห็นถึงกระบวนการ Design Thinking ตั้งแต่การค้นคว้า วิเคราะห์ปัญหา ไปจนถึงการทดลองและพัฒนาผลงาน\n\nควรสื่อสารด้วยภาพได้ดี ใช้เครื่องมือดิจิทัล เช่น Figma หรือ Adobe Creative Cloud และสนใจนำการออกแบบไปแก้ปัญหาให้สังคมหรือชุมชน",
  question: "",
};

export function buildApplicationUrl(origin: string, admission: Admission) {
  const url = new URL("/apply/ux-ai-2026", origin);
  for (const [key, value] of Object.entries(admission)) {
    if (value.trim()) url.searchParams.set(key, value.trim());
  }
  return url.toString();
}

export function formatAdmissionDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const month = Number(match[2]);
  if (month < 1 || month > 12) return value;
  return `${Number(match[3])} ${months[month - 1]} ${Number(match[1]) + 543}`;
}

export function admissionFromSearch(search: string): Admission {
  const params = new URLSearchParams(search);
  return {
    title: params.get("title")?.trim() || defaultAdmission.title,
    year: params.get("year")?.trim() || defaultAdmission.year,
    program: params.get("program")?.trim() || defaultAdmission.program,
    openDate: params.get("openDate")?.trim() || defaultAdmission.openDate,
    deadline: params.get("deadline")?.trim() || defaultAdmission.deadline,
    requirements: params.get("requirements")?.trim() || defaultAdmission.requirements,
    question: params.get("question")?.trim() || defaultAdmission.question,
  };
}
