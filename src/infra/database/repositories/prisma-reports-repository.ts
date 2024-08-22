import type { FindManyProps, ReportsRepository } from "@/domain/report/app/repositories/reports-repository.ts";
import type { Report } from "@/domain/report/enterprise/entities/report.ts";
import { Report as PrismaReport } from '@prisma/client'
import { prisma } from "../lib/prisma.ts";
import { PrismaReportsMapper } from "../mappers/prisma-reports-mapper.ts";
import { convertActionToPrisma } from "@/infra/utils/convert-action-by-layer.ts";

export class PrismaReportsRepository implements ReportsRepository {
  async findByTitle({ title }: { title: string; }): Promise<Report | null> {
    const report = await prisma.report.findFirst({
      where: {
        title: title
      }
    })

    if (!report) return null

    return PrismaReportsMapper.toDomain(report)
  }

  async findMany({ action }: FindManyProps): Promise<Report[]> {
    let reports: PrismaReport[] = []

    if (!action.length) {
      reports = await prisma.report.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      })
      return reports.map(report => PrismaReportsMapper.toDomain(report))
    }

    reports = await prisma.report.findMany({
      where: {
        action: convertActionToPrisma(action)
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return reports.map(report => PrismaReportsMapper.toDomain(report))
  }
  
  async create(report: Report): Promise<void> {
    const prismaMapper = PrismaReportsMapper.toPrisma(report)
    
    await prisma.report.create({
      data: prismaMapper
    })
  }
}