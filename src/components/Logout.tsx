"use client";
export default function Logout() {
  return <button className="link" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/login"; }}>Sign out</button>;
}
