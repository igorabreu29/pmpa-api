import type { Status } from "@/domain/boletim/enterprise/entities/assessment.ts";
import { Status as PrismaStatus } from "@prisma/client";

export function convertStatusToPrisma(status: Status): PrismaStatus {
  if (status === 'disapproved') return 'DISAPPROVED'
  if (status === 'approved second season') return 'APPROVED_SECOND_SEASON'
  if (status === 'second season') return 'SECOND_SEASON'

  return 'APPROVED'
}

export function convertStatusToDomain(status: PrismaStatus): Status {
  if (status === 'DISAPPROVED') return 'disapproved'
  if (status === 'APPROVED_SECOND_SEASON') return 'approved second season'
  if (status === 'SECOND_SEASON') return 'second season'
  
  return 'approved'
}