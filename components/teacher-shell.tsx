"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, BriefcaseBusiness, ChevronDown, FilePlus2, Settings, Users } from "lucide-react";
import { Logo } from "./ui";
import type { ReactNode } from "react";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/applications", label: "Applicants", icon: Users },
  { href: "/create", label: "Admissions", icon: BriefcaseBusiness },
];

export function TeacherShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <nav className="side-nav" aria-label="เมนูหลัก">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href === "/applications" && pathname.startsWith("/applications/"));
            return <Link className={active ? "active" : ""} href={href} key={href}><Icon size={18} />{label}</Link>;
          })}
        </nav>
        <div className="side-bottom">
          <Link href="#"><Settings size={18} />Settings</Link>
          <div className="user-card">
            <div className="avatar avatar-teacher">NS</div>
            <div><strong>อ. ณัฐชา</strong><span>Admission committee</span></div>
            <ChevronDown size={15} />
          </div>
        </div>
      </aside>
      <div className="page-area">
        <header className="topbar"><div /><button className="icon-button" aria-label="การแจ้งเตือน"><Bell size={19} /><span /></button></header>
        <main>{children}</main>
      </div>
    </div>
  );
}
