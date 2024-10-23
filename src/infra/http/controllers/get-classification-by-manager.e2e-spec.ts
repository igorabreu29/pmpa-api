import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import type { Course, Pole, User } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import bcrypt from 'bcryptjs'
import request from 'supertest'

let course: Course
let manager: User

describe('Get Classification By Manager (e2e)', () => {
  beforeAll(async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CHO',
        imageUrl: '',
        name: 'CHO',
        isPeriod: false
      }
    })

    const pole = await prisma.pole.create({
      data: {
        name: 'pole-1'
      }
    })

    manager = await prisma.user.create({
      data: {
        username: 'Manager Test',
        civilId: '02345',
        cpf: '00000000001',
        email: 'managertest@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        birthday: transformDate('01/02/1999'),
        role: 'MANAGER',
        
        usersOnCourses: {
          create: {
            courseId: course.id,
             usersOnPoles: {
              create: {
                poleId: pole.id
              }
            }
          }
        }
      },
    })

    const student = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/02/2001'),
        
        usersOnCourses: {
          create: {
            courseId: course.id,
             usersOnPoles: {
              create: {
                poleId: pole.id
              }
             }
          }
        }
      },
    })

    const student2 = await prisma.user.create({
      data: {
        username: 'Jey Doe',
        civilId: '12345',
        cpf: '00000000011',
        email: 'Jey@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/02/2001'),
        
        usersOnCourses: {
          create: {
            courseId: course.id,
             usersOnPoles: {
              create: {
                poleId: pole.id
              }
             }
          }
        }
      },
    })

    const student3 = await prisma.user.create({
      data: {
        username: 'Test',
        civilId: '12345',
        cpf: '00000000012',
        email: 'test@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/02/2000'),
        
        usersOnCourses: {
          create: {
            courseId: course.id,
             usersOnPoles: {
              create: {
                poleId: pole.id
              }
             }
          }
        }
      },
    })

    await prisma.discipline.create({
      data: {
        name: 'discipline-1',
        assessments: {
          createMany: {
            data: [
              {
                vf: 10,
                avi: 9.5,
                courseId: course.id,
                studentId: student.id,
                average: 9.75,
                isRecovering: false,
                status: 'APPROVED',
              },
              {
                vf: 10, 
                avi: 7,
                courseId: course.id,
                studentId: student2.id,
                average: 8.5,
                isRecovering: false,
                status: 'APPROVED'
              },
              {
                vf: 10, 
                avi: 7,
                courseId: course.id,
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
            courseId: course.id,
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
          courseId: course.id,
          studentId: student.id,
          module: 1
        },
        {
          january: 9,
          february: 8.25,
          march: 6.35,
          courseId: course.id,
          studentId: student2.id,
          module: 1
        },
        {
          january: 9,
          february: 8.25,
          march: 6.35,
          courseId: course.id,
          studentId: student3.id,
          module: 1
        }
      ]
    })

    await prisma.classification.createMany({
      data: [
        {
          studentId: student.id,
          courseId: course.id,
          assessmentsCount: 1,
          average: 8.5,
          concept: 'good',
          status: 'approved',
          behaviorsCount: 3,
          poleId: pole.id
        },
        {
          studentId: student2.id,
          courseId: course.id,
          assessmentsCount: 1,
          average: 8.184,
          concept: 'good',
          status: 'approved',
          behaviorsCount: 3,
          poleId: pole.id
        },
        {
          studentId: student3.id,
          courseId: course.id,
          assessmentsCount: 1,
          average: 8.184,
          concept: 'good',
          status: 'approved',
          behaviorsCount: 3,
          poleId: pole.id
        },
      ]
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('GET /courses/:id/manager/classification', async () => {
    const authenticateResponse = await request(app.server)
    .post('/credentials/auth')
    .send({
      cpf: '000.000.000-01',
      password: 'node-20'
    })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/courses/${course.id}/manager/classification?page=1`)
      .set('Authorization', `Bearer ${token}`)

    const { classifications } = response.body

    expect(classifications).toMatchObject([
      {
        average: 8.5
      },
      {
        average: 8.184
      },
      {
        average: 8.184
      }
    ])
  })
})