import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import type { Course, Pole, User } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import bcrypt from 'bcryptjs'
import request from 'supertest'

let course: Course
let manager: User

describe('Get Sub Classification By Manager (e2e)', () => {
  beforeAll(async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CFO',
        imageUrl: '',
        name: 'CHO',
        isPeriod: true
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
        birthday: transformDate('2001/02/01'),
        
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
        birthday: transformDate('2001/02/01'),
        
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
        birthday: transformDate('2000/02/01'),
        
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
              },
              {
                vf: 10, 
                avi: 7,
                courseId: course.id,
                studentId: student2.id
              },
              {
                vf: 10, 
                avi: 7,
                courseId: course.id,
                studentId: student3.id
              },
            ]
          }
        },
        courseOnDisciplines: {
          create: {
            courseId: course.id,
            expected: 'VF',
            hours: 30,
            module: 2,
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
          studentId: student.id
        },
        {
          january: 9,
          february: 8.25,
          march: 6.35,
          courseId: course.id,
          studentId: student2.id
        },
        {
          january: 9,
          february: 8.25,
          march: 6.35,
          courseId: course.id,
          studentId: student3.id
        }
      ]
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('GET /courses/:id/manager/classification/sub', async () => {
    const authenticateResponse = await request(app.server)
    .post('/credentials/auth')
    .send({
      cpf: '000.000.000-01',
      password: 'node-20'
    })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/courses/${course.id}/manager/classification/sub?hasBehavior=tru&disciplineModule=2`)
      .set('Authorization', `Bearer ${token}`)

    const { studentsWithAverage } = response.body

    expect(response.statusCode).toEqual(200)
    expect(studentsWithAverage).toMatchObject([
      {
        studentAverage: {
          averageInform: {
            geralAverage: 9.75,
            studentAverageStatus: { status: 'approved' }
          }
        },
      },
      {
        studentAverage: {
          averageInform: {
            geralAverage: 8.5,
            studentAverageStatus: { status: 'approved' }
          }
        },
      },
      {
        studentAverage: {
          averageInform: {
            geralAverage: 8.5,
            studentAverageStatus: { status: 'approved' }
          }
        },
      }
    ])
  })
})