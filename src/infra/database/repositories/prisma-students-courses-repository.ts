import { SearchManyDetails, StudentsCoursesRepository } from "@/domain/boletim/app/repositories/students-courses-repository.ts";
import { StudentCourse } from "@/domain/boletim/enterprise/entities/student-course.ts";
import { StudentCourseWithCourse } from "@/domain/boletim/enterprise/entities/value-objects/student-course-with-course.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaStudentCourseMapper } from "../mappers/prisma-student-course-mapper.ts";
import { PrismaStudentCourseWithCourseMapper } from "../mappers/student-course-with-course-mapper.ts";
import { PrismaStudentCourseDetailsMapper } from "../mappers/prisma-student-with-course-and-pole.ts";
import { StudentCourseDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-course-details.ts";
import { StudentWithPole } from "@/domain/boletim/enterprise/entities/value-objects/student-with-pole.ts";
import { PrismaStudentWithPoleMapper } from "../mappers/student-with-pole-mapper.ts";
import { StudentWithCourse } from "@/domain/boletim/enterprise/entities/value-objects/student-with-course.ts";
import { PrismaStudentWithCourseMapper } from "../mappers/prisma-student-with-course-mapper.ts";

export class PrismaStudentsCoursesRepository implements StudentsCoursesRepository {
  async findByStudentIdAndCourseId({ studentId, courseId }: { studentId: string; courseId: string; }): Promise<StudentCourse | null> {
    const studentCourse = await prisma.userOnCourse.findFirst({
      where: {
        userId: studentId,
        courseId
      }
    })
    if (!studentCourse) return null

    return PrismaStudentCourseMapper.toDomain(studentCourse)
  }

  async findManyByStudentIdWithCourse({ 
    studentId, 
    page, 
    perPage 
  }: { 
    studentId: string
    page: number
    perPage: number
  }): Promise<{ 
    studentCourses: StudentWithCourse[]
    pages: number
    totalItems: number
  }> {
    const studentCourses = await prisma.userOnCourse.findMany({
      where: {
        userId: studentId
      },

      skip: (page - 1) * perPage,
      take: page * perPage,

      include: {
        course: true,
        user: true,
      }
    })

    const studentCoursesMapper = studentCourses.map(studentCourses => {
      return {
        ...studentCourses.user,
        course: studentCourses.course
      }
    })

    const studentCoursesCount = await prisma.userOnCourse.count({
      where: {
        userId: studentId,
      },
    })
    const pages = Math.ceil(studentCoursesCount / perPage)

    return {
      studentCourses: studentCoursesMapper.map(studentCourse => PrismaStudentWithCourseMapper.toDomain(studentCourse)),
      pages,
      totalItems: studentCoursesCount
    }
  }

  async findManyByCourseIdWithPole({ courseId }: { courseId: string; }): Promise<StudentWithPole[]> {
    const studentCourses = await prisma.userOnCourse.findMany({
      where: {
        courseId,
        isActive: true
      },
      
      include: {
        user: true,
        usersOnPoles: {
          select: {
            pole: true
          }
        }
      }
    })

    const studentsCourseMapper = studentCourses.map(studentCourse => {
      return {
        ...studentCourse.user,
        pole: studentCourse.usersOnPoles[0].pole
      }
    })

    return studentsCourseMapper.map(studentCourse => {
      return PrismaStudentWithPoleMapper.toDomain(studentCourse)
    })
  }

  async findManyDetailsByCourseId({ 
    courseId, 
    page, 
    perPage 
  }: { 
    courseId: string; 
    page: number; 
    perPage: number; 
  }): Promise<{ 
    studentsCourse: StudentCourseDetails[]; 
    pages: number; 
    totalItems: number; 
  }> {
    const studentsCourse = await prisma.userOnCourse.findMany({
      where: {
        courseId,
        isActive: true
      },

      include: {
        user: true,
        course: true,
        usersOnPoles: {
          include: {
            pole: true
          }
        }
      },

      skip: (page - 1) * perPage,
      take: page * perPage
    })

    const studentsCourseMapper = studentsCourse.map(studentCourse => {
      const poleExist = studentCourse.usersOnPoles.find(item => item.userOnCourseId === studentCourse.id)
      if (!poleExist) throw new Error('Pole not found.')

      return {
        ...studentCourse.user,
        course: studentCourse.course,
        pole: poleExist.pole
      }
    })

    const studentsCourseCount = await prisma.userOnCourse.count({
      where: {
        courseId,
      },
    })
    const pages = Math.ceil(studentsCourseCount / perPage)

    return {
      studentsCourse: studentsCourseMapper.map(studentCourse => PrismaStudentCourseDetailsMapper.toDomain(studentCourse)),
      pages,
      totalItems: studentsCourseCount
    }
  }

  async searchManyDetailsByCourseId({ 
    courseId, 
    query, 
    page 
  }: SearchManyDetails): Promise<{
    studentCoursesDetails: StudentCourseDetails[]
    pages: number
    totalItems: number
  }> {
    const PER_PAGE = 10

    const studentCourses = await prisma.userOnCourse.findMany({
      where: {
        courseId,
        user: {
          username: {
            contains: query
          }
        }
      },

      include: {
        user: true,
        course: true,
        usersOnPoles: {
          include: {
            pole: true
          }
        }
      },

      skip: (page - 1) * PER_PAGE,
      take: page * PER_PAGE
    })

    const studentsCourseMapper = studentCourses.map(studentCourse => {
      const poleExist = studentCourse.usersOnPoles.find(item => item.userOnCourseId === studentCourse.id)
      if (!poleExist) throw new Error('Pole not found.')

      return {
        ...studentCourse.user,
        course: studentCourse.course,
        pole: poleExist.pole
      }
    })

    const studentCoursesCount = await prisma.userOnCourse.count({
      where: {
        courseId,
        user: {
          username: {
            contains: query
          },
          role: 'STUDENT'
        }
      },
    })

    const pages = Math.ceil(studentCoursesCount / PER_PAGE)
    
    return {
      studentCoursesDetails: studentsCourseMapper.map(studentCourse => {
        return PrismaStudentCourseDetailsMapper.toDomain(studentCourse)
      }),
      pages,
      totalItems: studentCoursesCount
    }
  }

  async create(studentCourse: StudentCourse): Promise<void> {
    const prismaMapper = PrismaStudentCourseMapper.toPrisma(studentCourse)
    await prisma.userOnCourse.create({
      data: prismaMapper
    })
  }

  async createMany(studentsCourses: StudentCourse[]): Promise<void> {
    const prismaMapper = studentsCourses.map(studentCourse => PrismaStudentCourseMapper.toPrisma(studentCourse))
    await prisma.userOnCourse.createMany({
      data: prismaMapper
    })
  }

  async save(studentCourse: StudentCourse): Promise<void> {
    const prismaMapper = PrismaStudentCourseMapper.toPrisma(studentCourse)
    await prisma.userOnCourse.update({
      where: {
        id: prismaMapper.id,
      },
      data: prismaMapper
    })
  }

  async updateStatus(studentCourse: StudentCourse): Promise<void> {
    const prismaMapper = PrismaStudentCourseMapper.toPrisma(studentCourse)
    await prisma.userOnCourse.update({
      where: {
        id: prismaMapper.id
      },
      data: {
        isActive: prismaMapper.isActive
      }
    })
  }

  async delete(studentCourse: StudentCourse): Promise<void> {
    const prismaMapper = PrismaStudentCourseMapper.toPrisma(studentCourse)
    await prisma.userOnCourse.delete({
      where: {
        id: prismaMapper.id,
      }
    })
  }
}