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
      },

      select: {
        id: true,
        username: true,
        cpf: true,
        email: true,
        civilId: true,
        birthday: true,
        isActive: true,
        avatarUrl: true,
        password: true,
        createdAt: true,
        isLoginConfirmed: true,
        role: true,
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
    }) 
    if (!student) return null

    return PrismaStudentsMapper.toDomain({
      ...student,
      profile: student.profile ?? undefined
    })
  }

  async findByCPF(cpf: string): Promise<Student | null> {
    const student = await prisma.user.findUnique({
      where: {
        cpf,
        role: 'STUDENT'
      },

      select: {
        id: true,
        username: true,
        cpf: true,
        isActive: true,
        email: true,
        civilId: true,
        birthday: true,
        avatarUrl: true,
        password: true,
        createdAt: true,
        isLoginConfirmed: true,
        role: true,
      }
    }) 
    if (!student) return null

    return PrismaStudentsMapper.toDomain(student)
  }

  async findByEmail(email: string): Promise<Student | null> {
    const student = await prisma.user.findUnique({
      where: {
        email,
      },

      select: {
        id: true,
        username: true,
        cpf: true,
        email: true,
        civilId: true,
        birthday: true,
        avatarUrl: true,
        password: true,
        isActive: true,
        createdAt: true,
        isLoginConfirmed: true,
        role: true,
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

      select: {
        id: true,
        username: true,
        cpf: true,
        email: true,
        civilId: true,
        birthday: true,
        avatarUrl: true,
        password: true,
        isActive: true,
        role: true,
        createdAt: true,
        isLoginConfirmed: true,
        profile: {
          select: {
            fatherName: true,
            motherName: true,
            county: true,
            militaryId: true,
            state: true
          }
        },
        usersOnCourses: {
          include: {
            course: true,
            usersOnPoles: {
              include: {
                pole: true
              }
            }
          }
        },
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
      isActive: studentDetails.isActive,
      birthday: studentDetails.birthday,
      militaryId: studentDetails.profile?.militaryId,
      state: studentDetails.profile?.state,
      county: studentDetails.profile?.county,
      motherName: studentDetails.profile?.motherName,
      fatherName: studentDetails.profile?.fatherName,
      assignedAt: studentDetails.createdAt,
      role: studentDetails.role,
      isLoginConfirmed: studentDetails.isLoginConfirmed,
      createdAt: studentDetails.createdAt,
      studentCourses: studentDetails.usersOnCourses.map(userOnCourse => ({
        id: userOnCourse.id,
        courseId: userOnCourse.courseId,
        userId: userOnCourse.userId,
      })),
      studentPoles: studentDetails.usersOnCourses.map(userOnCourse => {
        return {
          id: userOnCourse.usersOnPoles[0].id,
          poleId: userOnCourse.usersOnPoles[0].poleId,
          userOnCourseId: userOnCourse.usersOnPoles[0].userOnCourseId,
        }
      }),
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
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      
      include: {
        usersOnCourses: {
          include: {
            course: true,
            usersOnPoles: {
              include: {
                pole: true
              }
            }
          }
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
        isActive: student.isActive,
        assignedAt: student.createdAt,
        role: student.role,
        isLoginConfirmed: student.isLoginConfirmed,
        createdAt: student.createdAt,
        studentCourses: student.usersOnCourses.map(userOnCourse => ({
          id: userOnCourse.id,
          courseId: userOnCourse.courseId,
          userId: userOnCourse.userId,
        })),
        studentPoles: student.usersOnCourses.map(userOnCourse => {
          return {
            id: userOnCourse.usersOnPoles[0].id,
            poleId: userOnCourse.usersOnPoles[0].poleId,
            userOnCourseId: userOnCourse.usersOnPoles[0].userOnCourseId,
          }
        }),
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
    await prisma.user.create({ data: {
      ...prismaMapper,
      profile: {
        create: {
          militaryId: prismaMapper.profile?.militaryId ? String(prismaMapper.profile.militaryId) : undefined
        }
      }
    } })

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
      data: {
        ...prismaMapper,
        profile: {
          upsert: {
            create: {
              fatherName: student.parent?.fatherName,
              motherName: student.parent?.motherName,
              county: student.county,
              militaryId: student.militaryId,
              state: student.state
            },
            update: {
              fatherName: student.parent?.fatherName,
              motherName: student.parent?.motherName,
              county: student.county,
              militaryId: student.militaryId,
              state: student.state
            }
          }
        }
      }
    })

    DomainEvents.dispatchEventsForAggregate(student.id)
  }

  async updateLoginConfirmed(student: Student): Promise<void> {
    await prisma.user.update({
      where: {
        id: student.id.toValue()
      },

      data: {
        isLoginConfirmed: new Date(),

        profile: {
          upsert: {
            create: {
              fatherName: student.parent?.fatherName,
              motherName: student.parent?.motherName,
              county: student.county,
              militaryId: student.militaryId,
              state: student.state
            },
            update: {
              fatherName: student.parent?.fatherName,
              motherName: student.parent?.motherName,
              county: student.county,
              militaryId: student.militaryId,
              state: student.state
            }
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
          upsert: {
            create: {
              fatherName: student.parent?.fatherName,
              motherName: student.parent?.motherName,
              county: student.county,
              militaryId: student.militaryId,
              state: student.state
            },
            
            update: {
              fatherName: student.parent?.fatherName,
              motherName: student.parent?.motherName,
              county: student.county,
              militaryId: student.militaryId,
              state: student.state
            }
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