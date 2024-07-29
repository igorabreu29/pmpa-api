import { StudentsCoursesRepository } from "@/domain/boletim/app/repositories/students-courses-repository.ts";
import { StudentCourse } from "@/domain/boletim/enterprise/entities/student-course.ts";
import { StudentCourseWithCourse } from "@/domain/boletim/enterprise/entities/value-objects/student-course-with-course.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaStudentCourseMapper } from "../mappers/prisma-student-course-mapper.ts";
import { PrismaStudentCourseWithCourseMapper } from "../mappers/student-course-with-course-mapper.ts";
import { StudentCourseDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-with-course-and-pole.ts";
import { PrismaStudentCourseDetailsMapper } from "../mappers/prisma-student-with-course-and-pole.ts";

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
    studentCourses: StudentCourseWithCourse[]
    pages: number
    totalItems: number
  }> {
    const studentCourses = await prisma.userOnCourse.findMany({
      where: {
        userId: studentId,
      },

      include: {
        courses: true
      },

      skip: (page - 1) * perPage,
      take: page * perPage
    })

    const studentCoursesMapper = studentCourses.map(studentCourse => ({
      ...studentCourse,
      course: studentCourse.courses
    }))

    const studentCoursesCount = await prisma.userOnCourse.count({
      where: {
        userId: studentId,
      }
    })
    const pages = Math.ceil(studentCoursesCount / perPage)

    return {
      studentCourses: studentCoursesMapper.map(studentCourse => PrismaStudentCourseWithCourseMapper.toDomain(studentCourse)),
      pages,
      totalItems: studentCoursesCount       
    }
  }

  async findManyByCourseIdWithCourse({ 
    courseId, 
    page, 
    perPage 
  }: { 
    courseId: string; 
    page: number; 
    perPage: number; 
  }): Promise<{
     studentsCourse: StudentCourseWithCourse[]; 
     pages: number; 
     totalItems: number; 
    }> {
      const studentsCourse = await prisma.userOnCourse.findMany({
        where: {
          courseId,
        },
  
        include: {
          courses: true
        },
  
        skip: (page - 1) * perPage,
        take: page * perPage
      })
  
      const studentsCourseMapper = studentsCourse.map(studentCourse => ({
        ...studentCourse,
        course: studentCourse.courses
      }))
  
      const studentsCourseCount = await prisma.userOnCourse.count({
        where: {
          courseId,
        }
      })
      const pages = Math.ceil(studentsCourseCount / perPage)
  
      return {
        studentsCourse: studentsCourseMapper.map(studentCourse => PrismaStudentCourseWithCourseMapper.toDomain(studentCourse)),
        pages,
        totalItems: studentsCourseCount       
      }
  }

  async findManyByCourseIdWithCourseAndPole({ 
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
        courseId
      },

      include: {
        users: true,
        courses: true,
        usersOnPoles: {
          include: {
            poles: true
          }
        }
      }
    })

    const studentsCourseMapper = studentsCourse.map(studentCourse => {
      const pole = studentCourse.usersOnPoles.find(item => item.userOnCourseId === studentCourse.id)
      if (!pole) throw new Error('Pole not found.')

      return {
        ...studentCourse.users,
        course: studentCourse.courses,
        pole: pole.poles
      }
    })

    const studentsCourseCount = await prisma.userOnCourse.count({
      where: {
        courseId,
      }
    })
    const pages = Math.ceil(studentsCourseCount / perPage)

    return {
      studentsCourse: studentsCourseMapper.map(studentCourse => PrismaStudentCourseDetailsMapper.toDomain(studentCourse)),
      pages,
      totalItems: studentsCourseCount
    }
  }

  async findManyByCourseIdAndPoleIdWithCourseAndPole({ 
    courseId, 
    poleId, 
    page, 
    perPage 
  }: { 
    courseId: string; 
    poleId: string; 
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
        usersOnPoles: {
          some: {
            poleId
          }
        }
      },

      include: {
        users: true,
        courses: true,
        usersOnPoles: {
          include: {
            poles: true
          }
        }
      }
    })

    const studentsCourseMapper = studentsCourse.map(studentCourse => {
      const pole = studentCourse.usersOnPoles.find(item => item.userOnCourseId === studentCourse.id)
      if (!pole) throw new Error('Pole not found.')

      return {
        ...studentCourse.users,
        course: studentCourse.courses,
        pole: pole.poles
      }
    })

    const studentsCourseCount = await prisma.userOnCourse.count({
      where: {
        courseId,
      }
    })
    const pages = Math.ceil(studentsCourseCount / perPage)

    return {
      studentsCourse: studentsCourseMapper.map(studentCourse => PrismaStudentCourseDetailsMapper.toDomain(studentCourse)),
      pages,
      totalItems: studentsCourseCount
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

  async delete(studentCourse: StudentCourse): Promise<void> {
    const prismaMapper = PrismaStudentCourseMapper.toPrisma(studentCourse)
    await prisma.userOnCourse.delete({
      where: {
        id: prismaMapper.id,
      }
    })
  }
}