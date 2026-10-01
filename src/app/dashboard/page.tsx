import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const s = await getSession();
  if (!s) redirect("/login");

  return (
    <div className="shell">
      <header className="top">
        <h1>{s.role === "ADMIN" ? "Administration" : s.role === "TEACHER" ? "Teaching" : "My records"}</h1>
        <span>{s.name}</span>
      </header>
      {s.role === "ADMIN" && <Admin />}
      {s.role === "TEACHER" && <Teacher />}
      {s.role === "STUDENT" && <StudentView userId={s.id} />}
    </div>
  );
}

async function Admin() {
  const [students, teachers, pending, recent] = await Promise.all([
    prisma.student.count(), prisma.teacher.count(),
    prisma.fee.aggregate({ where: { status: { not: "PAID" } }, _sum: { amount: true } }),
    prisma.student.findMany({ take: 8, orderBy: { id: "desc" }, include: { user: true, class: true } }),
  ]);
  return (<>
    <section className="stats">
      <div className="stat"><b>{students}</b>Students enrolled</div>
      <div className="stat ok"><b>{teachers}</b>Teachers</div>
      <div className="stat warn"><b>₹{Number(pending._sum.amount ?? 0).toLocaleString("en-IN")}</b>Fees outstanding</div>
    </section>
    <h2>Recently added students</h2>
    <table><thead><tr><th>Roll no.</th><th>Name</th><th>Class</th></tr></thead>
      <tbody>{recent.map(s => <tr key={s.id}><td>{s.rollNo}</td><td>{s.user.name}</td><td>{s.class.name}</td></tr>)}</tbody></table>
  </>);
}

async function Teacher() {
  const classes = await prisma.class.findMany({ include: { _count: { select: { students: true } }, subjects: true } });
  return (<>
    <h2>Your classes</h2>
    <table><thead><tr><th>Class</th><th>Students</th><th>Subjects</th></tr></thead>
      <tbody>{classes.map(c => <tr key={c.id}><td>{c.name}</td><td>{c._count.students}</td><td>{c.subjects.map(x => x.name).join(", ")}</td></tr>)}</tbody></table>
  </>);
}

async function StudentView({ userId }: { userId: string }) {
  const st = await prisma.student.findUnique({
    where: { userId }, include: { attendance: true, marks: { include: { exam: true } }, fees: true },
  });
  if (!st) return <p>No student record is linked to this account. Ask an administrator.</p>;
  const present = st.attendance.filter(a => a.status !== "ABSENT").length;
  const pct = st.attendance.length ? Math.round((present / st.attendance.length) * 100) : null;
  const due = st.fees.filter(f => f.status !== "PAID");
  return (<>
    <section className="stats">
      <div className="stat ok"><b>{pct === null ? "–" : pct + "%"}</b>Attendance</div>
      <div className="stat"><b>{st.marks.length}</b>Exam results</div>
      <div className="stat warn"><b>{due.length}</b>Fees due</div>
    </section>
    <h2>Fees</h2>
    <table><thead><tr><th>Item</th><th>Amount</th><th>Due</th><th>Status</th></tr></thead>
      <tbody>{st.fees.map(f => <tr key={f.id}><td>{f.title}</td><td>₹{Number(f.amount).toLocaleString("en-IN")}</td><td>{f.dueDate.toDateString()}</td><td>{f.status}</td></tr>)}</tbody></table>
  </>);
}
