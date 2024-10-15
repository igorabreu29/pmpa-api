import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import type { Course, User } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import bcrypt from 'bcryptjs'
import request from 'supertest'

let course: Course

describe('Get Classification (e2e)', () => {
  beforeAll(async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'CAS',
        isPeriod: false
      }
    })

    const pole = await prisma.pole.create({
      data: {
        name: 'pole-1'
      }
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
                vf: 8,
                avi: 5,
                courseId: course.id,
                studentId: student.id,
                average: 6.5,
                isRecovering: true,
                status: 'SECOND_SEASON'
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

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('GET /courses/:id/classification', async () => {
    const developer = await prisma.user.create(({
      data: {
        username: 'Jonas Doe',
        civilId: '02345',
        cpf: '00000000001',
        email: 'jonas@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        birthday: transformDate('02/01/2006'),
        role: 'DEV'
      }
    }))

    const authenticateResponse = await request(app.server)
    .post('/credentials/auth')
    .send({
      cpf: '000.000.000-01',
      password: 'node-20'
    })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/courses/${course.id}/classification?page=1&hasBehavior=true`)
      .set('Authorization', `Bearer ${token}`)

    const { studentsWithAverage } = response.body

    expect(studentsWithAverage).toMatchObject([
      {
        studentAverage: {
          averageInform: {
            geralAverage: 8.184,
            studentAverageStatus: { status: 'approved' }
          }
        },
      },
      {
        studentAverage: {
          averageInform: {
            geralAverage: 8.184,
            studentAverageStatus: { status: 'approved' }
          }
        },
      },
      {
        studentAverage: {
          averageInform: {
            geralAverage: 7,
            studentAverageStatus: { status: 'second season' }
          }
        },
      }
    ])
  })
})