"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Students() {
  const [rows, setRows] = useState<any[]>([]), [classes, setClasses] = useState<any[]>([]);
  const [q, setQ] = useState(""), [role, setRole] = useState(""), [msg, setMsg] = useState("");
  const load = () => api(`/api/students?q=${encodeURIComponent(q)}`).then(setRows).catch(e => setMsg(e.message));
  useEffect(() => { load(); }, [q]);
  useEffect(() => { api("/api/me").then(m => setRole(m.role)); api("/api/classes").then(setClasses).catch(() => {}); }, []);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form)) as any;
    try { await api("/api/students", "POST", f); setMsg("Student added. Default password is password123."); form.reset(); load(); }
    catch (err: any) { setMsg(err.message); }
  }
  return (
    <div className="shell">
      <h1>Students</h1>
      <input placeholder="Search by name or roll number" value={q} onChange={e => setQ(e.target.value)} aria-label="Search students" />
      <p role="status" className="err">{msg}</p>
      {role === "ADMIN" && (
        <form className="row" onSubmit={add}>
          <input name="name" placeholder="Full name" required /><input name="email" type="email" placeholder="Email" required />
          <input name="rollNo" placeholder="Roll no." required />
          <select name="classId" required aria-label="Class">{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <input name="guardian" placeholder="Guardian" /><input name="phone" placeholder="Phone" />
          <button className="primary">Add student</button>
        </form>
      )}
      <table><thead><tr><th>Roll no.</th><th>Name</th><th>Email</th><th>Class</th></tr></thead>
        <tbody>{rows.map(s => <tr key={s.id}><td>{s.rollNo}</td><td>{s.user.name}</td><td>{s.user.email}</td><td>{s.class.name}</td></tr>)}
          {!rows.length && <tr><td colSpan={4}>No students found. Add one above or change your search.</td></tr>}</tbody></table>
    </div>
  );
}
