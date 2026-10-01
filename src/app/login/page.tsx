"use client";
import { useState } from "react";

export default function Login() {
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: f.get("email"), password: f.get("password") }),
    });
    if (res.ok) window.location.href = "/dashboard";
    else setError((await res.json()).error);
  }
  return (
    <main className="login">
      <h1>EduManage</h1>
      <p>Sign in to your school account.</p>
      <form onSubmit={submit}>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" required minLength={6} /></label>
        <p className="err" role="alert">{error}</p>
        <button className="primary">Sign in</button>
      </form>
    </main>
  );
}
