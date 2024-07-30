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
    const studentsPole = await prisma.userCourseOnPole.findMany({
      where: {
        poleId
      },
      
      include: {
        poles: true,
        usersOnCourses: {
          include: {
            users: true
          }
        }
      },

      skip: (page - 1) * perPage,
      take: page - 1
    })

    const studentsPoleCount = await prisma.userCourseOnPole.count({
      where: {
        poleId
      }
    })
    const pages = Math.ceil(studentsPoleCount / perPage)

    const studentsPoleMapper = studentsPole.map(studentPole => {
      return {
        ...studentPole.usersOnCourses.users,
        pole: studentPole.poles
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
        usersOnCourses: {
          users: {
            username: {
              contains: query
            }
          }
        }
      },

      include: {
        usersOnCourses: {
          select: {
            courses: true,
            users: true
          }
        },
        poles: true
      },

      skip: (page - 1) * 10,
      take: page * 10
    })

    const studentPolesMapper = studentPoles.map(studentPole => {
      return {
        ...studentPole.usersOnCourses.users,
        course: studentPole.usersOnCourses.courses,
        pole: studentPole.poles
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