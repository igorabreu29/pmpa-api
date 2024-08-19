import { TypeAction } from "@/domain/report/enterprise/entities/report.ts";
import { Action as PrismaAction, Role as PrismaRole } from "@prisma/client";

export function convertActionToPrisma(action: string): PrismaAction {
  if (action === 'login confirmed') return 'ADD'
  if (action === 'remove') return 'REMOVE'
  if (action === 'update') return 'UPDATE'
  return 'ADD'
}

export function convertActionToDomain(action: PrismaAction): TypeAction {
  if (action === 'ADD') return "add"
  if (action === 'REMOVE') return 'remove'
  if (action === 'UPDATE') return "update"
  return 'login confirmed'
}