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
    perPage 
  }: { 
    poleId: string; 
    page: number; 
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
          user: {
            role: 'STUDENT'
          }
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
  }: SearchManyDetailsByPole): Promise<StudentCourseDetails[]> {
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

      skip: (page - 1) * 10,
      take: page * 10
    })

    const studentPolesMapper = studentPoles.map(studentPole => {
      return {
        ...studentPole.usersOnCourse.user,
        course: studentPole.usersOnCourse.course,
        pole: studentPole.pole
      }
    })
    
    return studentPolesMapper.map(studentCourse => {
      return PrismaStudentCourseDetailsMapper.toDomain(studentCourse)
    })
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
}