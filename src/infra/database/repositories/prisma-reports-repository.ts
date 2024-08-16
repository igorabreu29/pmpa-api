import type { ReportsRepository } from "@/domain/report/app/repositories/reports-repository.ts";
import type { Report } from "@/domain/report/enterprise/entities/report.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaReportsMapper } from "../mappers/prisma-reports-mapper.ts";

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
  
  async create(report: Report): Promise<void> {
    const prismaMapper = PrismaReportsMapper.toPrisma(report)
    
    await prisma.report.create({
      data: prismaMapper
    })
  }
}