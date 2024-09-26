import { TypeAction } from "@/domain/report/enterprise/entities/report.ts";
import { Action as PrismaAction, Role as PrismaRole } from "@prisma/client";

export function convertActionToPrisma(action: TypeAction): PrismaAction {
  if (action === 'login confirmed') return 'LOGIN_CONFIRMED'
  if (action === 'status') return 'STATUS'
  if (action === 'remove') return 'REMOVE'
  if (action === 'update') return 'UPDATE'
  return 'ADD'
}

export function convertActionToDomain(action: PrismaAction): TypeAction {
  if (action === 'STATUS') return "status"
  if (action === 'REMOVE') return 'remove'
  if (action === 'UPDATE') return "update"
  if (action === 'LOGIN_CONFIRMED') return 'login confirmed'
  return 'add'
}