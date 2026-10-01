import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Enter a valid email and password" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.password)))
    return Response.json({ error: "Email or password is incorrect" }, { status: 401 });
  const token = await signToken({ id: user.id, role: user.role, name: user.name });
  const res = Response.json({ role: user.role });
  res.headers.set("Set-Cookie", `token=${token}; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax`);
  return res;
}
