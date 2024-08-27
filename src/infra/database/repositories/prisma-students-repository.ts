import { SearchStudentsManyDetails, StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { Student } from "@/domain/boletim/enterprise/entities/student.ts";
import { StudentDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-details.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaStudentsMapper } from "../mappers/prisma-students-mapper.ts";
import { PrismaStudentDetailsMapper } from "../mappers/prisma-student-details-mapper.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";

export class PrismaStudentsRepository implements StudentsRepository {
  async findById(id: string): Promise<Student | null> {
    const student = await prisma.user.findUnique({
      where: {
        id,
        role: 'STUDENT',
      }
    }) 
    if (!student) return null

    return PrismaStudentsMapper.toDomain(student)
  }

  async findByCPF(cpf: string): Promise<Student | null> {
    const student = await prisma.user.findUnique({
      where: {
        cpf,
      }
    }) 
    if (!student) return null

    return PrismaStudentsMapper.toDomain(student)
  }

  async findByEmail(email: string): Promise<Student | null> {
    const student = await prisma.user.findUnique({
      where: {
        email,
      }
    }) 
    if (!student) return null

    return PrismaStudentsMapper.toDomain(student)
  }

  async findDetailsById(id: string): Promise<StudentDetails | null> {
    const studentDetails = await prisma.user.findUnique({
      where: {
        id,
        role: 'STUDENT'
      },

      include: {
        usersOnCourses: {
          select: {
            course: true,
            usersOnPoles: {
              select: {
                pole: true
              }
            }
          },
        }
      }
    })

    if (!studentDetails) return null

    const studentDetailsMapper = {
      id: studentDetails.id,
      username: studentDetails.username,
      email: studentDetails.email,
      password: studentDetails.password,
      cpf: studentDetails.cpf,
      civilId: studentDetails.civilId,
      avatarUrl: studentDetails.avatarUrl,
      birthday: studentDetails.birthday,
      assignedAt: studentDetails.createdAt,
      role: studentDetails.role,
      isLoginConfirmed: studentDetails.isLoginConfirmed,
      createdAt: studentDetails.createdAt,
      courses: studentDetails.usersOnCourses.map(item => {
        return item.course
      }),
      poles: studentDetails.usersOnCourses.map(userOnCourse => {
        return {
          id: userOnCourse.usersOnPoles[0].pole.id,
          name: userOnCourse.usersOnPoles[0].pole.name
        }
      })
    }

    return PrismaStudentDetailsMapper.toDomain(studentDetailsMapper)
  }

  async searchManyDetails({ query, page }: SearchStudentsManyDetails): Promise<StudentDetails[]> {
    const PER_PAGE = 10

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        username: {
          contains: query,
        },
      },
      take: page * PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      include: {
        usersOnCourses: {
          select: {
            course: true,
            usersOnPoles: {
              select: {
                pole: true
              }
            }
          },
        }
      }
    })

    const studentsMapper = students.map(student => {
      return {
        id: student.id,
        username: student.username,
        email: student.email,
        password: student.password,
        cpf: student.cpf,
        civilId: student.civilId,
        avatarUrl: student.avatarUrl,
        birthday: student.birthday,
        assignedAt: student.createdAt,
        role: student.role,
        isLoginConfirmed: student.isLoginConfirmed,
        createdAt: student.createdAt,
        courses: student.usersOnCourses.map(item => {
          return item.course
        }),
        poles: student.usersOnCourses.map(userOnCourse => {
          return {
            id: userOnCourse.usersOnPoles[0].pole.id,
            name: userOnCourse.usersOnPoles[0].pole.name
          }
        })
      }
    })

    return studentsMapper.map(PrismaStudentDetailsMapper.toDomain)
  }

  async create(student: Student): Promise<void> {
    const prismaMapper = PrismaStudentsMapper.toPrisma(student)
    await prisma.user.create({ data: prismaMapper })

    DomainEvents.dispatchEventsForAggregate(student.id)
  }

  async createMany(students: Student[]): Promise<void> {
    const prismaMapper = students.map(student => PrismaStudentsMapper.toPrisma(student))
    await prisma.user.createMany({ data: prismaMapper })
  }

  async save(student: Student): Promise<void> {
    const prismaMapper = PrismaStudentsMapper.toPrisma(student)
    await prisma.user.update({
      where: {
        id: prismaMapper.id,
        role: 'STUDENT'
      },
      data: prismaMapper
    })
  }

  async updateLoginConfirmed(student: Student): Promise<void> {
    await prisma.user.update({
      where: {
        id: student.id.toValue()
      },

      data: {
        isLoginConfirmed: new Date(),

        profile: {
          create: {
            fatherName: student.parent?.fatherName,
            motherName: student.parent?.motherName,
            county: student.county,
            militaryId: student.militaryId,
            state: student.state
          }
        }
      }
    })

    DomainEvents.dispatchEventsForAggregate(student.id)
  }

  async updateProfile(student: Student): Promise<void> {
    const prismaMapper = PrismaStudentsMapper.toPrisma(student)
    await prisma.user.update({
      where: {
        id: prismaMapper.id
      },
      data: {
        ...prismaMapper,
        profile: {
          update: {
            fatherName: student.parent?.fatherName,
            motherName: student.parent?.motherName
          }
        }
      }
    })
  }

  async delete(student: Student): Promise<void> {
    const prismaMapper = PrismaStudentsMapper.toPrisma(student)

    await prisma.user.delete({
      where: {
        id: prismaMapper.id,
      },
    })

    DomainEvents.dispatchEventsForAggregate(student.id)
  }
}