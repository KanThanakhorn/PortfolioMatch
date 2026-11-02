export type CriterionReview = {
  criterion: string;
  rating: "ชัดเจน" | "บางส่วน" | "ไม่พบหลักฐาน";
  evidence: string;
  page: string;
};

export type PortfolioAnalysis = {
  score: number;
  summary: string;
  criteria: CriterionReview[];
  strengths: string[];
  gaps: string[];
  uncertainty: string;
};

export type AnalysisStatus = "not_requested" | "pending" | "complete" | "error";
