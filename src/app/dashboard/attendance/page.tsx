"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const OPTIONS = ["PRESENT", "LATE", "ABSENT"] as const;

export default function Attendance() {
  const [classes, setClasses] = useState<any[]>([]), [cid, setCid] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<Record<string, string>>({}), [msg, setMsg] = useState("");
  useEffect(() => { api("/api/classes").then(c => { setClasses(c); setCid(c[0]?.id ?? ""); }); }, []);
  const cls = classes.find(c => c.id === cid);

  async function save() {
    const records = (cls?.students ?? []).map((s: any) => ({ studentId: s.id, status: status[s.id] ?? "PRESENT" }));
    try { const r = await api("/api/attendance", "POST", { date, records }); setMsg(`Saved attendance for ${r.saved} students.`); }
    catch (e: any) { setMsg(e.message); }
  }
  return (
    <div className="shell">
      <h1>Attendance</h1>
      <div className="row">
        <select value={cid} onChange={e => { setCid(e.target.value); setStatus({}); }} aria-label="Class">{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} aria-label="Date" />
      </div>
      <table><thead><tr><th>Roll no.</th><th>Name</th><th>Status</th></tr></thead>
        <tbody>{(cls?.students ?? []).map((s: any) => (
          <tr key={s.id}><td>{s.rollNo}</td><td>{s.user.name}</td>
            <td>{OPTIONS.map(o => <label key={o} style={{ marginRight: 12 }}>
              <input type="radio" name={s.id} checked={(status[s.id] ?? "PRESENT") === o} onChange={() => setStatus({ ...status, [s.id]: o })} /> {o.toLowerCase()}</label>)}</td></tr>))}
          {!cls?.students.length && <tr><td colSpan={3}>This class has no students yet.</td></tr>}</tbody></table>
      <p><button className="primary" style={{ width: "auto", padding: "10px 20px" }} onClick={save}>Save attendance</button></p>
      <p role="status">{msg}</p>
    </div>
  );
}
