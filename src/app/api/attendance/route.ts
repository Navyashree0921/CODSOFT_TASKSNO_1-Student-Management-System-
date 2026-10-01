import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const schema = z.object({
  date: z.string(), // YYYY-MM-DD
  records: z.array(z.object({ studentId: z.string(), status: z.enum(["PRESENT", "ABSENT", "LATE"]) })),
});

// Teachers mark a whole class at once; re-submitting the same day updates it.
export async function POST(req: Request) {
  const s = await requireRole("ADMIN", "TEACHER");
  if (s instanceof Response) return s;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid attendance data" }, { status: 400 });
  const date = new Date(parsed.data.date);
  await prisma.$transaction(parsed.data.records.map((r) =>
    prisma.attendance.upsert({
      where: { studentId_date: { studentId: r.studentId, date } },
      update: { status: r.status },
      create: { studentId: r.studentId, date, status: r.status },
    })));
  return Response.json({ saved: parsed.data.records.length });
}

export async function GET(req: Request) {
  const s = await requireRole("ADMIN", "TEACHER", "STUDENT");
  if (s instanceof Response) return s;
  const studentId = new URL(req.url).searchParams.get("studentId");
  const own = s.role === "STUDENT" ? await prisma.student.findUnique({ where: { userId: s.id } }) : null;
  const rows = await prisma.attendance.findMany({
    where: { studentId: own?.id ?? studentId ?? undefined },
    orderBy: { date: "desc" }, take: 90,
  });
  return Response.json(rows);
}
