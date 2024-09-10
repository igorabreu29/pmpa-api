import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import bcrypt from 'bcryptjs'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { makePrismaCourse } from 'test/factories/make-course.ts'
import type { Course } from '@/domain/boletim/enterprise/entities/course.ts'
import { makePrismaStudent } from 'test/factories/make-student.ts'
import { makeAuth } from 'test/factories/make-auth.ts'

let course: Course

describe('Get Course Behaviors (e2e)', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()
    const student = await makePrismaStudent({ data: {} })

    await prisma.behavior.createMany({
      data: [
        {
          courseId: course.id.toValue(),
          studentId: student.id.toValue(),
          january: 10
        },
        {
          courseId: course.id.toValue(),
          studentId: student.id.toValue(),
          january: 8
        },
      ]
    })

    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('GET /courses/:id/behaviors', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .get(`/courses/${course.id.toValue()}/behaviors`)
      .set('Authorization', `Bearer ${token}`)

    const { behaviors } = response.body

    expect(response.statusCode).toEqual(200)
    expect(behaviors).toMatchObject([
      {
        january: 10
      },
      {
        january: 8
      },
    ])
  })
})