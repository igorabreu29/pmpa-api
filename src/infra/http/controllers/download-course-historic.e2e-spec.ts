import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { Course, User } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
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
        isPeriod: false,

        coursesHistorics: {
          create: {
            classname: 'random',
            finishDate: endsAt,
            startDate: new Date(),
          }
        }
      },
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
        role: 'STUDENT',
        
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
                isRecovering: false,
                status: 'SECOND_SEASON'
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

    await prisma.classification.create({
      data: {
        courseId: course.id,
        studentId: student.id,
        poleId: pole.id,
        average: 7,
        status: 'approved',
        concept: 'good',
        behaviorsCount: 3,
        assessmentsCount: 2,
      }
    })

    await app.ready()
  })

  afterAll(async () => await app.close())

  it ('POST /historics/download', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .post(`/historics/download`)
      .send({
        courseId: course.id,
        studentId: student.id
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.body.fileUrl).toBeDefined()
  })
})