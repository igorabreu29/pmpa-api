
import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import type { Course, User } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import bcrypt from 'bcryptjs'
import request from 'supertest'
import { makeAuth } from "test/factories/make-auth.ts";

let course: Course

describe('Get Assessment Classification (e2e)', () => {
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

    const pole2 = await prisma.pole.create({
      data: {
        name: 'pole-2'
      }
    })

    const discipline = await prisma.discipline.create({
      data: {
        name: 'discipline-1'
      }
    })

    await prisma.courseOnPole.createMany({
      data: [
        {
          courseId: course.id,
          poleId: pole.id
        },
        {
          courseId: course.id,
          poleId: pole2.id
        },
      ]
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
                poleId: pole2.id
              }
             }
          }
        }
      },
    })

    const student4 = await prisma.user.create({
      data: {
        username: 'Test 2',
        civilId: '12345',
        cpf: '00000000013',
        email: 'test2@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/02/2000'),
        
        usersOnCourses: {
          create: {
            courseId: course.id,
             usersOnPoles: {
              create: {
                poleId: pole2.id
              }
             }
          }
        }
      },
    })

    await prisma.assessment.createMany({
      data: [
        {
          courseId: course.id,
          studentId: student.id,
          disciplineId: discipline.id,
          vf: 7,
          avi: 8
        },
        {
          courseId: course.id,
          studentId: student2.id,
          disciplineId: discipline.id,
          vf: 8,
          avi: 9
        },
        {
          courseId: course.id,
          studentId: student3.id,
          disciplineId: discipline.id,
          vf: 8.6,
          avi: 9.2
        },
        {
          courseId: course.id,
          studentId: student4.id,
          disciplineId: discipline.id,
          vf: 10,
          avi: 9.2
        },
      ]
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('GET /courses/:id/classification/assessments', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .get(`/courses/${course.id}/classification/assessments?page=1`)
      .set('Authorization', `Bearer ${token}`)

    const { assessmentAverageGroupedByPole } = response.body

    expect(assessmentAverageGroupedByPole).toMatchObject([
      {
        assessmentAverageByPole: {
          average: 9.25,
        }
      },
      {
        assessmentAverageByPole: {
          average: 8,
        }
      },
    ])
  })
})