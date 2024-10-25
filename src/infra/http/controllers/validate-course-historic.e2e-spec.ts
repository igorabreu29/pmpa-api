import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { Course, User, type CourseHistoric } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import bcrypt from 'bcryptjs'
import { makeAuth } from "test/factories/make-auth.ts";
import request from "supertest";

let course: Course
let courseHistoric: CourseHistoric
let student: User

describe('Validate Course Historic (e2e)', () => {
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
      },
    })

    courseHistoric = await prisma.courseHistoric.create({
      data: {
        courseId: course.id,
        classname: 'random',
        finishDate: endsAt,
        startDate: new Date()
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
                average: 6.5,
                isRecovering: true,
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

    await app.ready()
  })

  afterAll(async () => await app.close())

  it ('GET /historics/:id/validate', async () => {
    const { token } = await makeAuth()

    const hash = await bcrypt.hash(`${course.name} - PMPA`, 8)

    const response = await request(app.server)
      .get(`/historics/${courseHistoric.id}/validate?hash=${hash}`)
      .send()
      .set('Authorization', `Bearer ${token}`)
    
    const { message } = response.body

    expect(response.statusCode).toBe(200)
    expect(message).toEqual('Histórico do curso é válido!')
  })
})