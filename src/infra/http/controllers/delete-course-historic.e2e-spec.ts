import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import bcrypt from 'bcryptjs'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makePrismaCourse } from 'test/factories/make-course.ts'
import { Course } from '@/domain/boletim/enterprise/entities/course.ts'

let course: Course

describe('Delete Course Historic (e2e)', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()

    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    await prisma.courseHistoric.create({
      data: {
        courseId: course.id.toValue(),
        classname: '',
        finishDate: endsAt,
        startDate: new Date()
      }
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('DELETE /courses/:courseId/historic', async () => {
    const { token } = await makeAuth()

    const result = await request(app.server)
      .delete(`/courses/${course.id.toValue()}/historic`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(result.statusCode).toEqual(204)
  })
})