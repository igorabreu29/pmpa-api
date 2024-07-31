import { SearchStudentsManyDetails, StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { Student } from "@/domain/boletim/enterprise/entities/student.ts";
import { StudentDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-details.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaStudentDetailsMapper } from "../mappers/prisma-student-details-mapper.ts";
import { ManagersRepository } from "@/domain/boletim/app/repositories/managers-repository.ts";
import { Manager } from "@/domain/boletim/enterprise/entities/manager.ts";
import { PrismaManagersMapper } from "../mappers/prisma-managers-mapper.ts";
import { ManagerDetails } from "@/domain/boletim/enterprise/entities/value-objects/manager-details.ts";
import { PrismaManagerDetailsMapper } from "../mappers/prisma-manager-details-mapper.ts";

export class PrismaManagersRepository implements ManagersRepository {
  async findById(id: string): Promise<Manager | null> {
    const student = await prisma.user.findUnique({
      where: {
        id,
        isActive: true
      }
    }) 
    if (!student) return null

    return PrismaManagersMapper.toDomain(student)
  }

  async findByCPF(cpf: string): Promise<Manager | null> {
    const student = await prisma.user.findUnique({
      where: {
        cpf
      }
    }) 
    if (!student) return null

    return PrismaManagersMapper.toDomain(student)
  }

  async findByEmail(email: string): Promise<Manager | null> {
    const student = await prisma.user.findUnique({
      where: {
        email
      }
    }) 
    if (!student) return null

    return PrismaManagersMapper.toDomain(student)
  }

  async findDetailsById(id: string): Promise<ManagerDetails | null> {
    const studentDetails = await prisma.user.findUnique({
      where: {
        id
      },

      include: {
        usersOnCourses: {
          select: {
            courses: {
              select: {
                id: true,
                name: true,
                formula: true,
                imageUrl: true,
                endsAt: true,
                isActive: true,
                isPeriod: true,
                startAt: true,
              }
            }
          },
          include: {
            usersOnPoles: {
              select: {
                poles: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
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
      isActive: studentDetails.isActive,
      isLoginConfirmed: studentDetails.isLoginConfirmed,
      createdAt: studentDetails.createdAt,
      courses: studentDetails.usersOnCourses.map(item => {
        return item.courses
      }),
      poles: studentDetails.usersOnCourses.map(userOnCourse => {
        return {
          id: userOnCourse.usersOnPoles[0].poles.id,
          name: userOnCourse.usersOnPoles[0].poles.name
        }
      })
    }

    return PrismaManagerDetailsMapper.toDomain(studentDetailsMapper)
  }

  async searchManyDetails({ query, page }: SearchStudentsManyDetails): Promise<ManagerDetails[]> {
    const PER_PAGE = 10

    const managers = await prisma.user.findMany({
      where: {
        username: {
          contains: query
        },
      },
      take: page * PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      include: {
        usersOnCourses: {
          select: {
            courses: true
          },
          include: {
            usersOnPoles: {
              select: {
                poles: true
              }
            }
          }
        }
      }
    })

    const managersMapper = managers.map(student => {
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
        isActive: student.isActive,
        isLoginConfirmed: student.isLoginConfirmed,
        createdAt: student.createdAt,
        courses: student.usersOnCourses.map(item => {
          return item.courses
        }),
        poles: student.usersOnCourses.map(userOnCourse => {
          return {
            id: userOnCourse.usersOnPoles[0].poles.id,
            name: userOnCourse.usersOnPoles[0].poles.name
          }
        })
      }
    })

    return managersMapper.map(PrismaManagerDetailsMapper.toDomain)
  }

  async create(manager: Manager): Promise<void> {
    const prismaMapper = PrismaManagersMapper.toPrisma(manager)
    await prisma.user.create({ data: prismaMapper })
  }

  async createMany(managers: Manager[]): Promise<void> {
    const prismaMapper = managers.map(manager => PrismaManagersMapper.toPrisma(manager))
    await prisma.user.createMany({ data: prismaMapper })
  }

  async save(manager: Manager): Promise<void> {
    const prismaMapper = PrismaManagersMapper.toPrisma(manager)
    await prisma.user.update({
      where: {
        id: prismaMapper.id
      },
      data: prismaMapper
    })
  }

  async delete(manager: Manager): Promise<void> {
    const prismaMapper = PrismaManagersMapper.toPrisma(manager)

    await prisma.user.delete({
      where: {
        id: prismaMapper.id,
      },
    })
  }
}