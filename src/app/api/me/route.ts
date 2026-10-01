import { getSession } from "@/lib/auth";
export async function GET() {
  const s = await getSession();
  return s ? Response.json(s) : Response.json({ error: "Sign in to continue" }, { status: 401 });
}
