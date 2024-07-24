import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { Student } from "@/domain/boletim/enterprise/entities/student.ts";
import { StudentDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-details.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaStudentsMapper } from "../mappers/prisma-students-mapper.ts";
import { PrismaStudentDetailsMapper } from "../mappers/prisma-student-details-mapper.ts";

export class PrismaStudentsRepository implements StudentsRepository {
  async findById(id: string): Promise<Student | null> {
    const student = await prisma.user.findUnique({
      where: {
        id
      }
    }) 
    if (!student) return null

    return PrismaStudentsMapper.toDomain(student)
  }

  async findByCPF(cpf: string): Promise<Student | null> {
    const student = await prisma.user.findUnique({
      where: {
        cpf
      }
    }) 
    if (!student) return null

    return PrismaStudentsMapper.toDomain(student)
  }

  async findByEmail(email: string): Promise<Student | null> {
    const student = await prisma.user.findUnique({
      where: {
        email
      }
    }) 
    if (!student) return null

    return PrismaStudentsMapper.toDomain(student)
  }

  async findDetailsById(id: string): Promise<StudentDetails | null> {
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
      civilID: studentDetails.civilId,
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

    return PrismaStudentDetailsMapper.toDomain(studentDetailsMapper)
  }

  async create(student: Student): Promise<void> {
    const prismaMapper = PrismaStudentsMapper.toPrisma(student)
    await prisma.user.create({ data: prismaMapper })
  }

  async createMany(students: Student[]): Promise<void> {
    const prismaMapper = students.map(student => PrismaStudentsMapper.toPrisma(student))
    await prisma.user.createMany({ data: prismaMapper })
  }

  async save(student: Student): Promise<void> {
    const prismaMapper = PrismaStudentsMapper.toPrisma(student)
    await prisma.user.update({
      where: {
        id: prismaMapper.id
      },
      data: prismaMapper
    })
  }

  async delete(student: Student): Promise<void> {
    const prismaMapper = PrismaStudentsMapper.toPrisma(student)
    await prisma.user.delete({
      where: {
        id: prismaMapper.id
      }
    })
  }
}