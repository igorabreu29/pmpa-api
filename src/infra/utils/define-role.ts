import { Role } from "@/domain/boletim/enterprise/entities/authenticate.ts";
import { Role as PrismaRole } from "@prisma/client";

export function defineRoleAccessToPrisma(role: PrismaRole): Role {
  if (role === 'DEV') return 'dev'
  if (role === 'ADMIN') return 'admin'
  if (role === 'MANAGER') return 'manager'
  return 'student'
}

export function defineRoleAccessToDomain(role: Role): PrismaRole {
  if (role === 'dev') return "DEV"
  if (role === 'admin') return 'ADMIN'
  if (role === 'manager') return "MANAGER"
  return 'STUDENT'
}