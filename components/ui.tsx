import Link from "next/link";
import { CheckCircle2, CircleHelp, Sparkles } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="logo" href="/dashboard" aria-label="Portwise dashboard">
      <span className="logo-mark"><Sparkles size={18} strokeWidth={2.4} /></span>
      {compact ? null : <span>portwise</span>}
    </Link>
  );
}

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button ${className}`} {...props} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function StatusBadge({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "amber" | "red" | "blue" | "gray" }) {
  return <span className={`status status-${tone}`}><span className="status-dot" />{children}</span>;
}

export function AiLabel({ confidence }: { confidence?: number }) {
  return (
    <div className="ai-label">
      <Sparkles size={15} />
      <span>AI presentation</span>
      {confidence ? <span className="confidence"><CircleHelp size={13} /> {confidence}% accuracy</span> : null}
    </div>
  );
}

export function MiniProgress({ value, tone = "purple" }: { value: number; tone?: "purple" | "green" | "amber" | "red" }) {
  return <div className="mini-progress"><span className={`fill ${tone}`} style={{ width: `${value}%` }} /></div>;
}

export function Toast({ children }: { children: ReactNode }) {
  return <div className="toast"><CheckCircle2 size={18} />{children}</div>;
}
