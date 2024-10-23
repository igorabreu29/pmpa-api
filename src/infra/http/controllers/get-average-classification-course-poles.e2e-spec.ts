import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import bcrypt from 'bcryptjs'
import request from 'supertest'
import { makePrismaCourse } from "test/factories/make-course.ts";
import type { Course } from "@/domain/boletim/enterprise/entities/course.ts";
import { makeAuth } from "test/factories/make-auth.ts";

let course: Course

describe('Get Average Classification Course Poles (e2e)', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()

    const pole = await prisma.pole.create({
      data: {
        name: 'pole-1',
        courseOnPoles: {
          create: {
            courseId: course.id.toValue()
          }
        }
      }
    })

    const pole2 = await prisma.pole.create({
      data: {
        name: 'pole-2',
        
        courseOnPoles: {
          create: {
            courseId: course.id.toValue()
          }
        }
      }
    })

    const students = [
      {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/02/2001'),
        
        usersOnCourses: {
          create: {
            courseId: course.id.toValue(),
             usersOnPoles: {
              create: {
                poleId: pole.id
              }
             }
          }
        }
      },
      {
        username: 'Jey Doe',
        civilId: '12345',
        cpf: '00000000011',
        email: 'Jey@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/02/2001'),
        
        usersOnCourses: {
          create: {
            courseId: course.id.toValue(),
             usersOnPoles: {
              create: {
                poleId: pole.id
              }
             }
          }
        }
      },
      {
        username: 'Test',
        civilId: '12345',
        cpf: '00000000012',
        email: 'test@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/02/2000'),
        
        usersOnCourses: {
          create: {
            courseId: course.id.toValue(),
             usersOnPoles: {
              create: {
                poleId: pole2.id
              }
             }
          }
        }
      }
    ]

    const [student, student2, student3] = await Promise.all(students.map(async data => {
      const student = await prisma.user.create({ data })
      return student
    }))

    await prisma.discipline.create({
      data: {
        name: 'discipline-1',
        assessments: {
          createMany: {
            data: [
              {
                vf: 8,
                avi: 5,
                courseId: course.id.toValue(),
                studentId: student.id,
                average: 6.5,
                isRecovering: true,
                status: 'SECOND_SEASON'
              },
              {
                vf: 10, 
                avi: 7,
                courseId: course.id.toValue(),
                studentId: student2.id,
                average: 8.5,
                isRecovering: false,
                status: 'APPROVED'
              },
              {
                vf: 10, 
                avi: 7,
                courseId: course.id.toValue(),
                studentId: student3.id,
                average: 8.5,
                isRecovering: false,
                status: 'APPROVED'
              },
            ]
          }
        },
        courseOnDisciplines: {
          create: {
            courseId: course.id.toValue(),
            expected: 'VF',
            hours: 30,
            module: 1,
          }
        }
      }
    })

    await prisma.behavior.createMany({
      data: [
        {
          january: 7,
          february: 8,
          march: 7.5,
          courseId: course.id.toValue(),
          studentId: student.id,
          module: 1
        },
        {
          january: 9,
          february: 8.25,
          march: 6.35,
          courseId: course.id.toValue(),
          studentId: student2.id,
          module: 1
        },
        {
          january: 9,
          february: 8.25,
          march: 6.35,
          courseId: course.id.toValue(),
          studentId: student3.id,
          module: 1
        }
      ]
    })

    await prisma.classification.createMany({
      data: [
        {
          studentId: student.id,
          courseId: course.id.toValue(),
          assessmentsCount: 1,
          average: 7,
          concept: 'good',
          status: 'approved',
          behaviorsCount: 3,
          poleId: pole.id
        },
        {
          studentId: student2.id,
          courseId: course.id.toValue(),
          assessmentsCount: 1,
          average: 8.184,
          concept: 'good',
          status: 'approved',
          behaviorsCount: 3,
          poleId: pole.id
        },
        {
          studentId: student3.id,
          courseId: course.id.toValue(),
          assessmentsCount: 1,
          average: 8.184,
          concept: 'good',
          status: 'approved',
          behaviorsCount: 3,
          poleId: pole2.id
        },
      ]
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('GET /courses/:id/classification/average', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .get(`/courses/${course.id.toValue()}/classification/average?page=1`)
      .set('Authorization', `Bearer ${token}`)

    const { studentsAverageGroupedByPole } = response.body

    expect(studentsAverageGroupedByPole).toMatchObject([
      {
        poleAverage: {
          name: 'pole-2',
          average: 8.184
        },
      },
      {
        poleAverage: {
          name: 'pole-1',
          average: 7.592
        },
      },
    ])
  })
})