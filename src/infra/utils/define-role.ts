import { Role } from "@/domain/boletim/enterprise/entities/authenticate.ts";
import { Role as PrismaRole } from "@prisma/client";

export function defineRoleAccess(role: PrismaRole): Role {
  if (role === 'DEV') return 'dev'
  if (role === 'ADMIN') return 'admin'
  if (role === 'MANAGER') return 'manager'
  return 'student'
}