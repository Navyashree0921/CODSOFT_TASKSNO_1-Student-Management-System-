import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type Session = { id: string; role: "ADMIN" | "TEACHER" | "STUDENT"; name: string };
const key = () => new TextEncoder().encode(process.env.JWT_SECRET!);

export const signToken = (s: Session) =>
  new SignJWT(s).setProtectedHeader({ alg: "HS256" }).setExpirationTime("8h").sign(key());

export async function verifyToken(token?: string): Promise<Session | null> {
  if (!token) return null;
  try { return (await jwtVerify(token, key())).payload as unknown as Session; } catch { return null; }
}

export const getSession = () => verifyToken(cookies().get("token")?.value);

/** Use inside route handlers: returns session or a 401/403 Response. */
export async function requireRole(...roles: Session["role"][]) {
  const s = await getSession();
  if (!s) return Response.json({ error: "Sign in to continue" }, { status: 401 });
  if (!roles.includes(s.role)) return Response.json({ error: "You don't have access to this" }, { status: 403 });
  return s;
}
