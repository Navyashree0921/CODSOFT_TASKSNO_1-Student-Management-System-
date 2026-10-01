"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Fees() {
  const [role, setRole] = useState(""), [fees, setFees] = useState<any[]>([]), [students, setStudents] = useState<any[]>([]), [msg, setMsg] = useState("");
  const load = () => api("/api/fees").then(setFees);
  useEffect(() => { load(); api("/api/me").then(m => { setRole(m.role); if (m.role === "ADMIN") api("/api/students").then(setStudents); }); }, []);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as any;
    try { await api("/api/fees", "POST", { ...f, amount: Number(f.amount) }); setMsg("Fee added."); load(); } catch (err: any) { setMsg(err.message); }
  }
  const pay = async (id: string) => { await api("/api/fees", "PATCH", { id }); load(); };
  const overdue = (f: any) => f.status !== "PAID" && new Date(f.dueDate) < new Date();

  return (
    <div className="shell">
      <h1>Fees</h1>
      {role === "ADMIN" && <form className="row" onSubmit={add}>
        <select name="studentId" required aria-label="Student">{students.map(s => <option key={s.id} value={s.id}>{s.rollNo} — {s.user.name}</option>)}</select>
        <input name="title" placeholder="Fee item" required /><input name="amount" type="number" min={1} step="0.01" placeholder="Amount (₹)" required />
        <input name="dueDate" type="date" required /><button className="primary">Add fee</button>
      </form>}
      <p role="status" className="err">{msg}</p>
      <table><thead><tr>{role === "ADMIN" && <th>Student</th>}<th>Item</th><th>Amount</th><th>Due</th><th>Status</th>{role === "ADMIN" && <th></th>}</tr></thead>
        <tbody>{fees.map(f => <tr key={f.id}>
          {role === "ADMIN" && <td>{f.student.user.name}</td>}
          <td>{f.title}</td><td>₹{Number(f.amount).toLocaleString("en-IN")}</td><td>{new Date(f.dueDate).toDateString()}</td>
          <td style={{ color: f.status === "PAID" ? "var(--mint)" : overdue(f) ? "var(--red)" : "var(--amber)" }}>{f.status === "PAID" ? "Paid" : overdue(f) ? "Overdue" : "Pending"}</td>
          {role === "ADMIN" && <td>{f.status !== "PAID" && <button className="link" onClick={() => pay(f.id)}>Mark paid</button>}</td>}
        </tr>)}{!fees.length && <tr><td colSpan={6}>No fees recorded.</td></tr>}</tbody></table>
    </div>
  );
}
