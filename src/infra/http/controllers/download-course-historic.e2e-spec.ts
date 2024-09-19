import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { Course, User } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import bcrypt from 'bcryptjs'
import { makeAuth } from "test/factories/make-auth.ts";
import request from "supertest";

let course: Course
let student: User

describe('Download Course Historic (e2e)', () => {
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

    student = await prisma.user.create({
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
          studentId: student.id
        },
      ]
    })

    await app.ready()
  })

  afterAll(async () => await app.close())

  it ('POST /courses/:courseId/download-historic', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .post(`/courses/${course.id}/download-historic`)
      .send({
        studentId: student.id
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.body.fileUrl).toBeDefined()
  })
})