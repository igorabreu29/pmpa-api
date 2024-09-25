import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import bcrypt from 'bcryptjs';
import request from 'supertest';
import { makePrismaCourse } from "test/factories/make-course.ts";
import { Course } from "@/domain/boletim/enterprise/entities/course.ts";
import { makeAuth } from "test/factories/make-auth.ts";

let course: Course

describe('Create Sub Classification Sheet (e2e)', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()

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
        birthday: transformDate('2001/02/01'),
        
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
            courseId: course.id.toValue(),
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
            courseId: course.id.toValue(),
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
                courseId: course.id.toValue(),
                studentId: student.id,
              },
              {
                vf: 10, 
                avi: 7,
                courseId: course.id.toValue(),
                studentId: student2.id
              },
              {
                vf: 10, 
                avi: 7,
                courseId: course.id.toValue(),
                studentId: student3.id
              },
            ]
          }
        },
        courseOnDisciplines: {
          create: {
            courseId: course.id.toValue(),
            expected: 'VF',
            hours: 30,
            module: 3,
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
          studentId: student.id
        },
        {
          january: 9,
          february: 8.25,
          march: 6.35,
          courseId: course.id.toValue(),
          studentId: student2.id
        },
        {
          january: 9,
          february: 8.25,
          march: 6.35,
          courseId: course.id.toValue(),
          studentId: student3.id
        }
      ]
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('POST /courses/:id/classification/sheet/sub', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .post(`/courses/${course.id.toValue()}/classification/sheet/sub?hasBehavior=true&disciplineModule=3`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const { fileUrl } = response.body
    expect(fileUrl).toContain(`${course.name.value}`)
  })
})