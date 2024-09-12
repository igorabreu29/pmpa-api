import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'

import bcrypt from 'bcryptjs'
import { makePrismaCourse } from 'test/factories/make-course.ts'
import { makeAuth } from 'test/factories/make-auth.ts'
import { Course } from '@/domain/boletim/enterprise/entities/course.ts'

let course: Course

describe('Remove Behaviors Grade Batch (e2e)', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()

    const students = [
      {
        username: 'Igor',
        cpf: '00000000000',
        password: await bcrypt.hash('node-20', 8),
        email: 'igor29nahan@gmail.com',
        birthday: transformDate('29/01/2006'),
        civilId: '00000',
      },
      {
        username: 'John',
        cpf: '00000001111',
        password: await bcrypt.hash('node-21', 8),
        email: 'john@gmail.com',
        birthday: transformDate('29/01/2006'),
        civilId: '00000',
      },
    ]

    const [student, student2] = await Promise.all(students.map(async (data) => {
      const student = await prisma.user.create({
         data: data
      })

      return student
    }))

    await prisma.behavior.createMany({
      data: [
        {
          courseId: course.id.toValue(),
          studentId: student.id,
          january: 7,
          february: 7,
          currentYear: 2023

        },
        {
          courseId: course.id.toValue(),
          studentId: student2.id,
          january: 10,
          february: 8,
          currentYear: 2023
        }
      ]
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('PUT /behaviors/batch/remove', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .put(`/behaviors/batch/remove?courseId=${course.id.toValue()}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('excel', 'test/upload/behaviors.xlsx')

    expect(response.statusCode).toEqual(204)

    const behaviors = await prisma.behavior.findMany()
    expect(behaviors).toMatchObject([
      {
        january: null,
      },
      {
        january: null,
      },
    ])
  })
}) 