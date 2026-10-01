import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const s = await requireRole("ADMIN", "STUDENT");
  if (s instanceof Response) return s;
  const own = s.role === "STUDENT" ? await prisma.student.findUnique({ where: { userId: s.id } }) : null;
  const fees = await prisma.fee.findMany({
    where: own ? { studentId: own.id } : {},
    include: { student: { include: { user: { select: { name: true } } } } },
    orderBy: { dueDate: "asc" },
  });
  return Response.json(fees);
}

export async function POST(req: Request) {
  const s = await requireRole("ADMIN");
  if (s instanceof Response) return s;
  const parsed = z.object({ studentId: z.string(), title: z.string(), amount: z.number().positive(), dueDate: z.string() }).safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid fee data" }, { status: 400 });
  const fee = await prisma.fee.create({ data: { ...parsed.data, dueDate: new Date(parsed.data.dueDate) } });
  return Response.json(fee, { status: 201 });
}

// Mark a fee as paid
export async function PATCH(req: Request) {
  const s = await requireRole("ADMIN");
  if (s instanceof Response) return s;
  const { id } = await req.json();
  const fee = await prisma.fee.update({ where: { id }, data: { status: "PAID", paidOn: new Date() } });
  return Response.json(fee);
}
