import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import bcrypt from 'bcryptjs';
import request from 'supertest';
import { makePrismaCourse } from "test/factories/make-course.ts";
import { Course } from "@/domain/boletim/enterprise/entities/course.ts";
import { makeAuth } from "test/factories/make-auth.ts";
import { Pole } from "@prisma/client";

let course: Course
let pole: Pole

describe('Create Sub Classification By Pole Sheet (e2e)', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()

    pole = await prisma.pole.create({
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

  it ('POST /courses/:id/poles/:poleId/classification/sheet/sub', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .post(`/courses/${course.id.toValue()}/poles/${pole.id}/classification/sheet?hasBehavior=true&disciplineModule=2`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const { fileUrl } = response.body
    expect(fileUrl).toContain(`${course.name.value}`)
  })
})