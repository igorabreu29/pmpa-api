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
import { DomainEvents } from "@/core/events/domain-events.ts";

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

  async findDetailsByCourseAndStudentId({ 
    courseId, 
    studentId 
  }: { 
    courseId: string; 
    studentId: string; 
  }): Promise<StudentCourseDetails | null> {
    const studentCourse = await prisma.userOnCourse.findUnique({
      where: {
        userId_courseId: {
          courseId,
          userId: studentId,
        },
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
    })
    if (!studentCourse) return null

    const poleExist = studentCourse.usersOnPoles.find(item => item.userOnCourseId === studentCourse.id)
    if (!poleExist) throw new Error('Polo não encontrado!')

    const studentCourseMapper = {
      ...studentCourse.user,
      course: studentCourse.course,
      pole: poleExist.pole,
      userOnCourse: studentCourse
    }

    return PrismaStudentCourseDetailsMapper.toDomain(studentCourseMapper)
  }

  async findManyByStudentIdWithCourse({ 
    studentId, 
    page, 
    perPage 
  }: { 
    studentId: string
    page?: number
    perPage?: number
  }): Promise<{ 
    studentCourses: StudentWithCourse[]
    pages?: number
    totalItems?: number
  }> {
    if (page && perPage) {
      const studentCourses = await prisma.userOnCourse.findMany({
        where: {
          userId: studentId
        },
  
        skip: (page - 1) * perPage,
        take: perPage, 
  
        orderBy: {
          createdAt: 'desc',
        },
  
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

    const studentCourses = await prisma.userOnCourse.findMany({
      where: {
        userId: studentId
      },

      orderBy: {
        createdAt: 'desc',
      },

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

    return {
      studentCourses: studentCoursesMapper.map(studentCourse => PrismaStudentWithCourseMapper.toDomain(studentCourse)),
    }
  }

  async findManyByCourseIdWithPole({ courseId }: { courseId: string; }): Promise<StudentWithPole[]> {
    const studentCourses = await prisma.userOnCourse.findMany({
      where: {
        courseId,
        isActive: true,
        user: {
          role: 'STUDENT'
        }
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
    cpf,
    isEnabled,
    username,
    perPage 
  }: { 
    courseId: string; 
    page?: number; 
    cpf?: string
    isEnabled?: boolean
    username?: string
    perPage?: number; 
  }): Promise<{ 
    studentsCourse: StudentCourseDetails[]; 
    pages?: number; 
    totalItems?: number; 
  }> {
    const filterPayload: Record<string, object> = {
      where: {
        courseId,
        user: {
          role: 'STUDENT',
          username: {
            contains: username,
            mode: 'insensitive'
          },
          cpf: {
            contains: cpf
          },
        },
      }
    }

    if (isEnabled !== undefined) {
      filterPayload.where = {
        ...filterPayload.where,
        isActive: isEnabled
      }
    }

    const studentsCourse = await prisma.userOnCourse.findMany({
      where: filterPayload.where,

      include: {
        user: {
          select: {
            id: true,
            username: true,
            cpf: true,
            email: true,
            civilId: true,
            birthday: true,
            avatarUrl: true,
            password: true,
            createdAt: true,
            isLoginConfirmed: true,
            role: true,
            isActive: true,
            profile: {
              select: {
                userId: true,
                fatherName: true,
                motherName: true,
                county: true,
                militaryId: true,
                state: true
              }
            },
          }
        },
        course: true,
        usersOnPoles: {
          include: {
            pole: true
          }
        }
      },

      skip: page && perPage ? (page - 1) * perPage : undefined,
      take: perPage
    })

    const studentsCourseMapper = studentsCourse.map(studentCourse => {
      const poleExist = studentCourse.usersOnPoles.find(item => item.userOnCourseId === studentCourse.id)
      if (!poleExist) throw new Error('Polo não encontrado!')

      return {
        ...studentCourse.user,
        profile: studentCourse.user.profile ?? undefined,
        course: studentCourse.course,
        pole: poleExist.pole,
        userOnCourse: studentCourse
      }
    })

    const studentsCourseCount = await prisma.userOnCourse.count({
      where: filterPayload.where
    })
    const pages = perPage && Math.ceil(studentsCourseCount / perPage)

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
      take: PER_PAGE,

      orderBy: {
        user: {
          username: 'asc'
        }
      }
    })

    const studentsCourseMapper = studentCourses.map(studentCourse => {
      const poleExist = studentCourse.usersOnPoles.find(item => item.userOnCourseId === studentCourse.id)
      if (!poleExist) throw new Error('Polo não encontrado!')

      return {
        ...studentCourse.user,
        course: studentCourse.course,
        pole: poleExist.pole,
        userOnCourse: studentCourse
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

    DomainEvents.dispatchEventsForAggregate(studentCourse.id)
  }

  async delete(studentCourse: StudentCourse): Promise<void> {
    const prismaMapper = PrismaStudentCourseMapper.toPrisma(studentCourse)
    await prisma.userOnCourse.delete({
      where: {
        id: prismaMapper.id,
      }
    })

    DomainEvents.dispatchEventsForAggregate(studentCourse.id)
  }
}