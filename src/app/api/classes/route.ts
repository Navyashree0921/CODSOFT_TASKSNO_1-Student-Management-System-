import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
export async function GET() {
  const s = await requireRole("ADMIN", "TEACHER");
  if (s instanceof Response) return s;
  return Response.json(await prisma.class.findMany({
    orderBy: { name: "asc" },
    include: { subjects: true, students: { orderBy: { rollNo: "asc" }, select: { id: true, rollNo: true, user: { select: { name: true } } } } },
  }));
}
