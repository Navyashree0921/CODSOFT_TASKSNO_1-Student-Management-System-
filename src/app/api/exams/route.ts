import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const s = await requireRole("ADMIN", "TEACHER");
  if (s instanceof Response) return s;
  return Response.json(await prisma.exam.findMany({ orderBy: { date: "desc" }, include: { subject: { include: { class: true } } } }));
}

export async function POST(req: Request) {
  const s = await requireRole("ADMIN", "TEACHER");
  if (s instanceof Response) return s;
  const p = z.object({ title: z.string().min(2), date: z.string(), maxMarks: z.number().int().positive(), subjectId: z.string() }).safeParse(await req.json());
  if (!p.success) return Response.json({ error: "Fill in title, date, subject and maximum marks" }, { status: 400 });
  return Response.json(await prisma.exam.create({ data: { ...p.data, date: new Date(p.data.date) } }), { status: 201 });
}
