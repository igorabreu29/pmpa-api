import type { FindManyByCourseAndReporterProps, FindManyProps, ReportsRepository } from "@/domain/report/app/repositories/reports-repository.ts";
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

  async findMany({ action, page, role, username }: FindManyProps): Promise<{
    reports: Report[]
    pages?: number
    totalItems?: number
  }> {
      const PER_PAGE = 10

      const queryPayload: {
        where: Object,
        take?: number
        skip?: number
      } = {
        where: {
          reporter: {
            username: {
              contains: username,
              mode: 'insensitive'
            }
        }
      },

      take: undefined,
      skip: undefined
    }

    const queryCountPayload: {
      where: Object,
    } = {
      where: {
        reporter: {
          username: {
            contains: username,
            mode: 'insensitive'
          }
        }
      },
    }

    let reportsCount: number | undefined
    let pages: number | undefined

    if (action) {
      queryPayload.where = {
        ...queryPayload.where,
        action: convertActionToPrisma(action)
      }

      queryCountPayload.where = {
        ...queryCountPayload.where,
        action: convertActionToPrisma(action)
      }
    }

    if (page) {
      queryPayload.take = PER_PAGE
      queryPayload.skip = (page - 1) * PER_PAGE
      
      reportsCount = await prisma.report.count({
        where: {
          reporter: {
            username: {
              contains: username,
              mode: 'insensitive'
            }
          }
        },
      })

      pages = Math.ceil(reportsCount / PER_PAGE)
    }

    if (role === 'admin') {
      queryPayload.where = {
        reporter: {
          username: {
            contains: username,
            mode: 'insensitive'
          },

          NOT: {
            OR: [
              {
                role: 'DEV',
              },
            ]
          }
        }
      }
    }

    const reports = await prisma.report.findMany({
      ...queryPayload,
      orderBy: {
        createdAt: 'desc'
      },
    })

    return {
      reports: reports.map(report => PrismaReportsMapper.toDomain(report)),
      pages,
      totalItems: reportsCount
    }
  }

  async findManyByCourseAndReporterId({ 
    courseId, 
    reporterId, 
    action, 
    page 
  }: FindManyByCourseAndReporterProps): Promise<{ 
    reports: Report[]
    pages: number
    totalItems: number 
  }> {
    const PER_PAGE = 10

    let reports: PrismaReport[] = []

    if (!action) {
      reports = await prisma.report.findMany({
        where: {
          courseId,
          reporterId
        },

        orderBy: {
          createdAt: 'desc'
        },
        
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE
      })
      
      const reportsCount = await prisma.report.count({
        where: {
          courseId,
          reporterId
        },
      })
      const pages = Math.ceil(reportsCount / PER_PAGE)

      return {
        reports: reports.map(report => PrismaReportsMapper.toDomain(report)),
        pages,
        totalItems: reportsCount
      }
    }

    reports = await prisma.report.findMany({
      where: {
        action: convertActionToPrisma(action),
        courseId,
        reporterId
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE
    })

    const reportsCount = await prisma.report.count({
      where: {
        action: convertActionToPrisma(action),
        courseId,
        reporterId
      },
    })
    const pages = Math.ceil(reportsCount / PER_PAGE)

    return {
      reports: reports.map(report => PrismaReportsMapper.toDomain(report)),
      pages,
      totalItems: reportsCount
    }
  }
  
  async create(report: Report): Promise<void> {
    const prismaMapper = PrismaReportsMapper.toPrisma(report)
    
    await prisma.report.create({
      data: prismaMapper
    })
  }
}