
import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import type { Course, User } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import bcrypt from 'bcryptjs'
import request from 'supertest'
import { makeAuth } from "test/factories/make-auth.ts";

let course: Course

describe('Create Behavior Classification Sheet (e2e)', () => {
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

    await prisma.behavior.createMany({
      data: [
        {
          courseId: course.id,
          studentId: student.id,
          january: 7,
          february: 8,
          module: 1
        },
        {
          courseId: course.id,
          studentId: student2.id,
          january: 8,
          february: 9,
          module: 1
        },
        {
          courseId: course.id,
          studentId: student3.id,
          january: 8.6,
          february: 9.2,
          module: 1
        },
        {
          courseId: course.id,
          studentId: student4.id,
          january: 10,
          february: 9.2,
          module: 1
        },
      ]
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('POST /courses/:id/classification/behaviors/sheet', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .post(`/courses/${course.id}/classification/behaviors/sheet`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const { fileUrl } = response.body

    expect(fileUrl).toContain(`${course.name}`)
  })
})