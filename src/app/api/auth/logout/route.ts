export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.set("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0");
  return res;
}
