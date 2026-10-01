import Link from "next/link";
import { getSession } from "@/lib/auth";
import Logout from "@/components/Logout";

const links = [
  { href: "/dashboard", label: "Overview", roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { href: "/dashboard/students", label: "Students", roles: ["ADMIN", "TEACHER"] },
  { href: "/dashboard/attendance", label: "Attendance", roles: ["ADMIN", "TEACHER"] },
  { href: "/dashboard/exams", label: "Exams", roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { href: "/dashboard/fees", label: "Fees", roles: ["ADMIN", "STUDENT"] },
];

export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  return (
    <>
      <nav className="nav" aria-label="Main">
        <strong>EduManage</strong>
        {links.filter(l => s && l.roles.includes(s.role)).map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        <span style={{ marginLeft: "auto" }}><Logout /></span>
      </nav>
      {children}
    </>
  );
}
