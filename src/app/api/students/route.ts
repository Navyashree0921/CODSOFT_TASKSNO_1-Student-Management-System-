import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  const s = await requireRole("ADMIN", "TEACHER");
  if (s instanceof Response) return s;
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const students = await prisma.student.findMany({
    where: q ? { OR: [{ rollNo: { contains: q, mode: "insensitive" } }, { user: { name: { contains: q, mode: "insensitive" } } }] } : {},
    include: { user: { select: { name: true, email: true } }, class: true },
    orderBy: { rollNo: "asc" },
  });
  return Response.json(students);
}

const createSchema = z.object({
  name: z.string().min(2), email: z.string().email(), rollNo: z.string().min(1),
  classId: z.string(), guardian: z.string().optional(), phone: z.string().optional(),
});

export async function POST(req: Request) {
  const s = await requireRole("ADMIN");
  if (s instanceof Response) return s;
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const { name, email, rollNo, classId, guardian, phone } = parsed.data;
  try {
    const user = await prisma.user.create({
      data: {
        name, email, role: "STUDENT", password: await bcrypt.hash("password123", 10),
        student: { create: { rollNo, classId, guardian, phone } },
      },
      include: { student: true },
    });
    return Response.json(user.student, { status: 201 });
  } catch {
    return Response.json({ error: "A student with this email or roll number already exists" }, { status: 409 });
  }
}
