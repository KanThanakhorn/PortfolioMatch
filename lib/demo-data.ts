export type Applicant = {
  id: string; name: string; school: string; email: string; phone: string;
  gpax: string; fileName: string; intro: string; score: number | null;
  status: "Review" | "Approved" | "Rejected";
};

export type Campaign = { title: string; faculty: string; year: string; deadline: string; requirement: string };
export type DemoData = { campaign: Campaign; applicants: Applicant[] };

export const initialData: DemoData = {
  campaign: {
    title: "รอบ Portfolio – สาขาออกแบบนิเทศศิลป์ 2569",
    faculty: "คณะศิลปกรรมศาสตร์ · ออกแบบนิเทศศิลป์",
    year: "2569", deadline: "30 พฤศจิกายน 2569",
    requirement: "Design Thinking, Visual communication, Digital tools และ Social impact",
  },
  applicants: [
    { id: "pimchanok", name: "พิมชนก ชัยวัฒนา", school: "โรงเรียนสาธิต มศว", email: "pimchanok.c@email.com", phone: "0812345678", gpax: "3.82", fileName: "pimchanok_portfolio.pdf", intro: "ผลงานออกแบบเพื่อชุมชน", score: 92, status: "Review" },
    { id: "thanawat", name: "ธนวัฒน์ ศรีสุข", school: "โรงเรียนเตรียมอุดมศึกษา", email: "thanawat@example.com", phone: "0812345679", gpax: "3.70", fileName: "thanawat_portfolio.pdf", intro: "งานออกแบบสื่อดิจิทัล", score: 86, status: "Review" },
    { id: "kulthida", name: "กุลธิดา วงศ์ดี", school: "โรงเรียนหาดใหญ่วิทยาลัย", email: "kulthida@example.com", phone: "0812345680", gpax: "3.64", fileName: "kulthida_portfolio.pdf", intro: "งานสื่อสารด้วยภาพ", score: 74, status: "Review" },
    { id: "naphat", name: "ณภัทร สุวรรณ", school: "โรงเรียนกรุงเทพคริสเตียน", email: "naphat@example.com", phone: "0812345681", gpax: "3.25", fileName: "naphat_portfolio.pdf", intro: "งานออกแบบผลิตภัณฑ์", score: 61, status: "Review" },
  ],
};

const key = "portwise-demo-v1";
export function readData(): DemoData {
  if (typeof window === "undefined") return initialData;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoData;
      if (parsed.campaign && Array.isArray(parsed.applicants)) return parsed;
    }
  } catch { /* Fall back to demo fixtures if storage is unavailable. */ }
  return initialData;
}
export function writeData(data: DemoData) {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event("portwise-demo-change"));
}
