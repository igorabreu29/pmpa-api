import { Course } from "@/domain/boletim/enterprise/entities/course.ts";
import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { makeAuth } from "test/factories/make-auth.ts";
import { makePrismaCourse } from "test/factories/make-course.ts";
import { makePrismaStudent } from "test/factories/make-student.ts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import request from 'supertest'

let course: Course

describe('Create Students Information Sheet (e2e)', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()
    const pole = await prisma.pole.create({
      data: {
        name: 'pole-1'
      }
    })
    
    const student = await makePrismaStudent({
      data: {},
      courseId: course.id.toValue(),
      poleId: pole.id
    })

    await prisma.discipline.create({
      data: {
        name: 'discipline-1',
        courseOnDisciplines: {
          create: {
            courseId: course.id.toValue(),
            expected: 'VF',
            hours: 30,
            module: 1
          }
        },

        assessments: {
          create: {
            courseId: course.id.toValue(),
            studentId: student.id.toValue(),
            vf: 7,
            average: 7,
            isRecovering: false,
            status: 'APPROVED'
          }
        }
      }
    })

    await prisma.discipline.create({
      data: {
        name: 'discipline-2',
        courseOnDisciplines: {
          create: {
            courseId: course.id.toValue(),
            expected: 'VF',
            hours: 30,
            module: 1
          }
        },

        assessments: {
          create: {
            courseId: course.id.toValue(),
            studentId: student.id.toValue(),
            vf: 10,
            average: 10,
            isRecovering: false,
            status: 'APPROVED'
          }
        }
      }
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('POST /students/sheet', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .post(`/students/sheet`)
      .send({
        courseId: course.id.toValue()
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
  })
})