import { SearchManyDetailsByPole, StudentsPolesRepository } from "@/domain/boletim/app/repositories/students-poles-repository.ts";
import { StudentPole } from "@/domain/boletim/enterprise/entities/student-pole.ts";
import { StudentWithPole } from "@/domain/boletim/enterprise/entities/value-objects/student-with-pole.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaStudentPoleMapper } from "../mappers/prisma-student-pole-mapper.ts";
import { PrismaStudentWithPoleMapper } from "../mappers/student-with-pole-mapper.ts";
import { StudentCourseDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-course-details.ts";
import { PrismaStudentCourseDetailsMapper } from "../mappers/prisma-student-with-course-and-pole.ts";

export class PrismaStudentsPolesRepository implements StudentsPolesRepository {
  async findByStudentId({ studentId }: { studentId: string; }): Promise<StudentPole | null> {
    const studentPole = await prisma.userCourseOnPole.findFirst({
      where: {
        userOnCourseId: studentId
      }
    })
    if (!studentPole) return null

    return PrismaStudentPoleMapper.toDomain(studentPole)
  }

  async findByStudentIdAndPoleId({ studentId, poleId }: { studentId: string; poleId: string; }): Promise<StudentPole | null> {
    const studentPole = await prisma.userCourseOnPole.findFirst({
      where: {
        userOnCourseId: studentId,
        poleId
      }
    })
    if (!studentPole) return null

    return PrismaStudentPoleMapper.toDomain(studentPole)
  }

  async findLoginConfirmationMetricsByPoleId({ poleId }: { poleId: string; }): Promise<{ totalConfirmedSize: number; totalNotConfirmedSize: number; }> {
    const studentLoginConfirmed = await prisma.userCourseOnPole.findMany({
      where: {
        poleId,
        usersOnCourse: {
          user: {
            role: 'STUDENT'
          }
        },
      },

      include: {
        pole: true,
        usersOnCourse: {
          select: {
            user: true
          }
        }
      }
    })

    const totalConfirmedSize = studentLoginConfirmed.filter(studentPole => {
      return studentPole.usersOnCourse.user.isLoginConfirmed
    }).length

    const totalNotConfirmedSize = studentLoginConfirmed.filter(studentPole => {
      return !studentPole.usersOnCourse.user.isLoginConfirmed
    }).length

    return {
      totalConfirmedSize, 
      totalNotConfirmedSize
    }
  }

  async findManyByPoleId({ 
    poleId, 
    page, 
    cpf,
    username,
    isEnabled = true,
    perPage 
  }: { 
    poleId: string; 
    page: number; 
    cpf?: string,
    username?: string,
    isEnabled?: boolean,
    perPage: number; 
  }): Promise<{ 
    studentsPole: StudentWithPole[]; 
    pages: number; 
    totalItems: number; 
  }> {
    const studentPoles = await prisma.userCourseOnPole.findMany({
      where: {
        poleId,
        usersOnCourse: {
          isActive: isEnabled ? true : false,
          user: {
            role: 'STUDENT',
            cpf: {
              contains: cpf
            },
            username: {
              contains: username
            },
          },
        }
      },
      
      include: {
        pole: true,
        usersOnCourse: {
          include: {
            user: true
          }
        }
      },

      skip: (page - 1) * perPage,
      take: page * perPage
    })

    const studentsPoleCount = await prisma.userCourseOnPole.count({
      where: {
        poleId,
        usersOnCourse: {
          user: {
            role: 'STUDENT'
          }
        }
      }
    })
    const pages = Math.ceil(studentsPoleCount / perPage)

    const studentsPoleMapper = studentPoles.map(studentPole => {
      return {
        ...studentPole.usersOnCourse.user,
        pole: studentPole.pole,
      }
    })

    return {
      studentsPole: studentsPoleMapper.map(studentPole => PrismaStudentWithPoleMapper.toDomain(studentPole)),
      pages,
      totalItems: studentsPoleCount
    }
  }

  async searchManyDetailsByPoleId({ 
    poleId, 
    query, 
    page 
  }: SearchManyDetailsByPole): Promise<{
    studentCoursesDetails: StudentCourseDetails[]
    pages: number
    totalItems: number
  }> {
    const PER_PAGE = 10

    const studentPoles = await prisma.userCourseOnPole.findMany({
      where: {
        poleId,
        usersOnCourse: {
          user: {
            username: {
              contains: query
            },
            role: 'STUDENT'
          }
        }
      },

      include: {
        usersOnCourse: {
          select: {
            course: true,
            user: true
          }
        },
        pole: true
      },

      orderBy: {
        usersOnCourse: {
          user: {
            username: 'asc'
          }
        }
      },

      skip: (page - 1) * PER_PAGE,
      take: page * PER_PAGE
    })

    const studentPolesMapper = studentPoles.map(studentPole => {
      return {
        ...studentPole.usersOnCourse.user,
        course: studentPole.usersOnCourse.course,
        pole: studentPole.pole
      }
    })

    const studentPolesCount = await prisma.userCourseOnPole.count({
      where: {
        poleId,
        usersOnCourse: {
          user: {
            username: {
              contains: query
            },
            role: 'STUDENT'
          }
        }
      },
    })

    const pages = Math.ceil(studentPolesCount / PER_PAGE)
    
    return {
      studentCoursesDetails: studentPolesMapper.map(studentCourse => {
        return PrismaStudentCourseDetailsMapper.toDomain(studentCourse)
      }),
      pages,
      totalItems: studentPolesCount
    }
  }

  async create(studentPole: StudentPole): Promise<void> {
    const prismaMapper = PrismaStudentPoleMapper.toPrisma(studentPole)
    await prisma.userCourseOnPole.create({
      data: prismaMapper
    })
  }

  async createMany(studentsPoles: StudentPole[]): Promise<void> {
    const prismaMapper = studentsPoles.map(studentPole => PrismaStudentPoleMapper.toPrisma(studentPole))
    await prisma.userCourseOnPole.createMany({
      data: prismaMapper
    })
  }

  async delete(studentPole: StudentPole): Promise<void> {
    const prismaMapper = PrismaStudentPoleMapper.toPrisma(studentPole)
    await prisma.userCourseOnPole.delete({
      where: {
        id: prismaMapper.id,
      }
    })
  }
}