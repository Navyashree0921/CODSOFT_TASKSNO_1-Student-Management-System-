import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash("password123", 10);
  await db.user.upsert({ where: { email: "admin@edu.test" }, update: {}, create: { email: "admin@edu.test", name: "Admin", role: "ADMIN", password: pw } });
  const cls = await db.class.upsert({ where: { name: "Grade 10-A" }, update: {}, create: { name: "Grade 10-A" } });
  const t = await db.user.upsert({ where: { email: "teacher@edu.test" }, update: {}, create: { email: "teacher@edu.test", name: "Meera Rao", role: "TEACHER", password: pw, teacher: { create: {} } } });
  const s = await db.user.upsert({ where: { email: "student@edu.test" }, update: {}, create: { email: "student@edu.test", name: "Arjun Nair", role: "STUDENT", password: pw, student: { create: { rollNo: "10A-001", classId: cls.id } } }, include: { student: true } });
  const teacher = await db.teacher.findUnique({ where: { userId: t.id } });
  await db.subject.create({ data: { name: "Mathematics", classId: cls.id, teacherId: teacher!.id } });
  const student = await db.student.findUnique({ where: { userId: s.id } });
  await db.fee.create({ data: { studentId: student!.id, title: "Term 1 tuition", amount: 12500, dueDate: new Date(Date.now() + 864e5 * 14) } });
  console.log("Seeded. Login: admin@edu.test / teacher@edu.test / student@edu.test — password123");
}
main().finally(() => db.$disconnect());
