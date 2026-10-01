"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Exams() {
  const [role, setRole] = useState("");
  useEffect(() => { api("/api/me").then(m => setRole(m.role)); }, []);
  return <div className="shell"><h1>Exams</h1>{role === "STUDENT" ? <Results /> : role ? <Manage /> : null}</div>;
}

function Results() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api("/api/marks").then(setRows); }, []);
  return (
    <table><thead><tr><th>Exam</th><th>Subject</th><th>Score</th><th>Percent</th></tr></thead>
      <tbody>{rows.map(m => <tr key={m.id}><td>{m.exam.title}</td><td>{m.exam.subject.name}</td><td>{m.score} / {m.exam.maxMarks}</td><td>{Math.round(m.score / m.exam.maxMarks * 100)}%</td></tr>)}
        {!rows.length && <tr><td colSpan={4}>No results published yet.</td></tr>}</tbody></table>
  );
}

function Manage() {
  const [exams, setExams] = useState<any[]>([]), [classes, setClasses] = useState<any[]>([]);
  const [sel, setSel] = useState(""), [scores, setScores] = useState<Record<string, string>>({}), [msg, setMsg] = useState("");
  const loadExams = () => api("/api/exams").then(setExams);
  useEffect(() => { loadExams(); api("/api/classes").then(setClasses); }, []);
  const subjects = classes.flatMap(c => c.subjects.map((s: any) => ({ ...s, className: c.name })));
  const exam = exams.find(e => e.id === sel);
  const students = classes.find(c => c.id === exam?.subject.classId)?.students ?? [];

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as any;
    try { await api("/api/exams", "POST", { ...f, maxMarks: Number(f.maxMarks) }); setMsg("Exam created."); loadExams(); } catch (err: any) { setMsg(err.message); }
  }
  async function pick(id: string) {
    setSel(id); setMsg("");
    if (!id) return;
    const marks = await api(`/api/marks?examId=${id}`);
    setScores(Object.fromEntries(marks.map((m: any) => [m.studentId, String(m.score)])));
  }
  async function save() {
    const marks = students.filter((s: any) => scores[s.id] !== undefined && scores[s.id] !== "").map((s: any) => ({ studentId: s.id, score: Number(scores[s.id]) }));
    try { const r = await api("/api/marks", "POST", { examId: sel, marks }); setMsg(`Saved ${r.saved} scores.`); } catch (e: any) { setMsg(e.message); }
  }
  return (<>
    <form className="row" onSubmit={create}>
      <input name="title" placeholder="Exam title" required /><input name="date" type="date" required />
      <select name="subjectId" required aria-label="Subject">{subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.className})</option>)}</select>
      <input name="maxMarks" type="number" defaultValue={100} min={1} aria-label="Maximum marks" />
      <button className="primary">Create exam</button>
    </form>
    <p role="status" className="err">{msg}</p>
    <select value={sel} onChange={e => pick(e.target.value)} aria-label="Exam to grade">
      <option value="">Choose an exam to enter scores</option>
      {exams.map(e => <option key={e.id} value={e.id}>{e.title} — {e.subject.name}, {e.subject.class.name}</option>)}
    </select>
    {exam && <>
      <table><thead><tr><th>Roll no.</th><th>Name</th><th>Score (max {exam.maxMarks})</th></tr></thead>
        <tbody>{students.map((s: any) => <tr key={s.id}><td>{s.rollNo}</td><td>{s.user.name}</td>
          <td><input type="number" min={0} max={exam.maxMarks} value={scores[s.id] ?? ""} onChange={e => setScores({ ...scores, [s.id]: e.target.value })} /></td></tr>)}</tbody></table>
      <p><button className="primary" style={{ width: "auto", padding: "10px 20px" }} onClick={save}>Save scores</button></p>
    </>}
  </>);
}
