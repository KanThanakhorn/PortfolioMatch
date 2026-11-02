"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, BriefcaseBusiness, ChevronDown, FilePlus2, Settings, Users } from "lucide-react";
import { Logo } from "./ui";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { databaseMode, getSupabaseBrowser } from "@/lib/supabase";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/applications", label: "Applicants", icon: Users },
  { href: "/create", label: "Admissions", icon: BriefcaseBusiness },
];

export function TeacherShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [authState, setAuthState] = useState<"loading" | "signed_out" | "teacher">("loading");
  const [email, setEmail] = useState("");
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!databaseMode) return;
    const client = getSupabaseBrowser();
    if (!client) return;
    let active = true;
    const check = async () => {
      const { data: user } = await client.auth.getUser();
      if (!active) return;
      if (!user.user) { setAuthState("signed_out"); setEmail(""); return; }
      const { data: member } = await client.from("teacher_members").select("user_id").eq("user_id", user.user.id).maybeSingle();
      if (!active) return;
      setEmail(user.user.email ?? "");
      setAuthState(member ? "teacher" : "signed_out");
      if (!member) setAuthError("บัญชีนี้ยังไม่ได้รับสิทธิ์กรรมการ");
    };
    void check();
    const { data: subscription } = client.auth.onAuthStateChange(() => { window.setTimeout(() => { void check(); }, 0); });
    return () => { active = false; subscription.subscription.unsubscribe(); };
  }, []);
  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = getSupabaseBrowser();
    if (!client) return;
    setBusy(true); setAuthError("");
    const form = new FormData(event.currentTarget);
    const { error } = await client.auth.signInWithPassword({
      email: String(form.get("email") ?? ""), password: String(form.get("password") ?? ""),
    });
    if (error) setAuthError("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน");
    setBusy(false);
  };
  if (databaseMode && authState !== "teacher") {
    return <div className="teacher-login"><div className="teacher-login-card"><Logo />
      {authState === "loading" ? <p role="status">กำลังตรวจสอบสิทธิ์กรรมการ...</p> : <>
        <h1>เข้าสู่ระบบกรรมการ</h1><p>ใช้บัญชี Supabase ที่ได้รับสิทธิ์ตรวจใบสมัคร</p>
        <form onSubmit={signIn}><label className="field"><span>อีเมล</span><input name="email" type="email" autoComplete="username" required /></label>
          <label className="field"><span>รหัสผ่าน</span><input name="password" type="password" autoComplete="current-password" required /></label>
          {authError && <p role="alert" className="field-error">{authError}</p>}
          <button className="button primary" type="submit" disabled={busy} aria-busy={busy}>{busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</button>
        </form></>}
    </div></div>;
  }
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
            <div><strong>{databaseMode ? email : "อ. ณัฐชา"}</strong><span>Admission committee</span></div>
            {databaseMode ? <button type="button" className="sign-out-button" onClick={() => { setAuthState("signed_out"); setEmail(""); void getSupabaseBrowser()?.auth.signOut(); }}>ออก</button> : <ChevronDown size={15} />}
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
