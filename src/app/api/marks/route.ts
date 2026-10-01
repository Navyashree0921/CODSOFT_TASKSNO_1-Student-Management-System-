import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// Teachers/admins: ?examId=… ; students: own results
export async function GET(req: Request) {
  const s = await requireRole("ADMIN", "TEACHER", "STUDENT");
  if (s instanceof Response) return s;
  if (s.role === "STUDENT") {
    const me = await prisma.student.findUnique({ where: { userId: s.id } });
    return Response.json(await prisma.mark.findMany({ where: { studentId: me?.id ?? "" }, include: { exam: { include: { subject: true } } }, orderBy: { exam: { date: "desc" } } }));
  }
  const examId = new URL(req.url).searchParams.get("examId");
  return Response.json(await prisma.mark.findMany({ where: { examId: examId ?? undefined } }));
}

export async function POST(req: Request) {
  const s = await requireRole("ADMIN", "TEACHER");
  if (s instanceof Response) return s;
  const p = z.object({ examId: z.string(), marks: z.array(z.object({ studentId: z.string(), score: z.number().min(0) })) }).safeParse(await req.json());
  if (!p.success) return Response.json({ error: "Invalid marks" }, { status: 400 });
  const exam = await prisma.exam.findUnique({ where: { id: p.data.examId } });
  if (!exam) return Response.json({ error: "Exam not found" }, { status: 404 });
  if (p.data.marks.some(m => m.score > exam.maxMarks)) return Response.json({ error: `Scores can't exceed ${exam.maxMarks}` }, { status: 400 });
  await prisma.$transaction(p.data.marks.map(m => prisma.mark.upsert({
    where: { examId_studentId: { examId: exam.id, studentId: m.studentId } },
    update: { score: m.score }, create: { examId: exam.id, studentId: m.studentId, score: m.score },
  })));
  return Response.json({ saved: p.data.marks.length });
}
