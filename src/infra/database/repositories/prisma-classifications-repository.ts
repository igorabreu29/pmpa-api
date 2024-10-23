import type { ClassificationsRepository, FindByCourseAndStudentId, FindManyByCourseAndPoleIdRequest, FindManyByCourseIdRequest, FindManyByCourseIdResponse } from "@/domain/boletim/app/repositories/classifications-repository.ts";
import type { Classification } from "@/domain/boletim/enterprise/entities/classification.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaClassificationsMapper } from "../mappers/prisma-classifications-mapper.ts";

export class PrismaClassificationsRepository implements ClassificationsRepository {
  async findByCourseAndStudentId({ courseId, studentId }: FindByCourseAndStudentId): Promise<Classification | null> {
    const classification = await prisma.classification.findFirst({
      where: {
        courseId,
        studentId
      },

      include: {
        student: {
          select: {
            birthday: true,
            assessments: true
          }
        },
        course: {
          include: {
            coursesOnDisciplines: true,
          }
        },
      }
    })
    if (!classification) return null

    return PrismaClassificationsMapper.toDomain({
      ...classification,
      assessments: classification.student.assessments,
      courseDisciplines: classification.course.coursesOnDisciplines,
      user: {
        birthday: classification.student.birthday
      },
    })
  }

  async findManyByCourseId({ courseId, page }: FindManyByCourseIdRequest): Promise<FindManyByCourseIdResponse> {
    const PER_PAGE = 1000

    const queryPayload: {
      where: Object,
      take?: number
      skip?: number
    } = {
      where: {
        courseId,
      },

      skip: undefined,
      take: undefined
    }

    let classificationsCount: number | undefined
    let pages: number | undefined

    if (page) {
      queryPayload.take = PER_PAGE
      queryPayload.skip = (page - 1) * PER_PAGE

      classificationsCount = await prisma.classification.count({
        where: {
          courseId,
          student: {
            usersOnCourses: {
              some: {
                courseId,
                isActive: true
              }
            }
          }
        }
      })

      pages = Math.ceil(classificationsCount / PER_PAGE)
    }

    const classifications = await prisma.classification.findMany({
      ...queryPayload,

      orderBy: {
        average: 'desc'
      },  

      include: {
        student: {
          select: {
            birthday: true,
            assessments: true
          }
        },
        course: {
          include: {
            coursesOnDisciplines: true,
          }
        },
      },
    })

    return {
      classifications: classifications.map(classification => {
        return PrismaClassificationsMapper.toDomain({
          ...classification,
          assessments: classification.student.assessments,
          courseDisciplines: classification.course.coursesOnDisciplines,
          user: {
            birthday: classification.student.birthday
          },
        })
      }),
      pages,
      totalItems: classificationsCount
    }
  }

  async findManyByCourseAndPoleId({ courseId, poleId, page }: FindManyByCourseAndPoleIdRequest): Promise<FindManyByCourseIdResponse> {
    const PER_PAGE = 1000

    const queryPayload: {
      where: Object,
      take?: number
      skip?: number
    } = {
      where: {
        courseId,
        poleId
      },

      skip: undefined,
      take: undefined
    }

    let classificationsCount: number | undefined
    let pages: number | undefined

    if (page) {
      queryPayload.take = PER_PAGE
      queryPayload.skip = (page - 1) * PER_PAGE

      classificationsCount = await prisma.classification.count({
        where: {
          courseId,
          poleId
        }
      })

      pages = Math.ceil(classificationsCount / PER_PAGE)
    }

    const classifications = await prisma.classification.findMany({
      ...queryPayload,

      orderBy: {
        average: 'desc'
      }, 

      include: {
        student: {
          select: {
            birthday: true,
            assessments: true
          }
        },
        course: {
          include: {
            coursesOnDisciplines: true,
          }
        },
      },
    })

    return {
      classifications: classifications.map(classification => {
        return PrismaClassificationsMapper.toDomain({
          ...classification,
          assessments: classification.student.assessments,
          courseDisciplines: classification.course.coursesOnDisciplines,
          user: {
            birthday: classification.student.birthday
          },
        })
      }),
      pages,
      totalItems: classificationsCount
    }
  }

  async create(classification: Classification): Promise<void> {
    const row = PrismaClassificationsMapper.toPrisma(classification)

    await prisma.classification.create({
      data: row
    })
  }

  async createMany(classifications: Classification[]): Promise<void> {
    classifications.forEach(async (classification ) => {
      const row = PrismaClassificationsMapper.toPrisma(classification)

      await prisma.classification.create({
        data: row
      })
    })
  }

  async save(classification: Classification): Promise<void> {
    const row = PrismaClassificationsMapper.toPrisma(classification)

    await prisma.classification.update({
      where: {
        id: row.id,
      },

      data: row,
    })
  }

  async saveMany(classifications: Classification[]): Promise<void> {
    classifications.forEach(async (classification ) => {
      const row = PrismaClassificationsMapper.toPrisma(classification)
      await prisma.classification.update({
        where: {
          id: row.id
        },

        data: row,
      })
    })
  }
}