import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import type { Course } from '@/domain/boletim/enterprise/entities/course.ts'
import type { Pole } from '@prisma/client'
import { makePrismaCourse } from 'test/factories/make-course.ts'

let course: Course
let pole: Pole

describe('Delete Course Pole (e2e)', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()

    pole = await prisma.pole.create({
      data: {
        name: 'pole-1',
        courseOnPoles: {
          create: {
            courseId: course.id.toValue()
          }
        }
      },
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('DELETE /courses/:courseId/poles/:poleId', async () => {
    const { token } = await makeAuth()

    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    const result = await request(app.server)
      .delete(`/courses/${course.id.toValue()}/poles/${pole.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

      expect(result.statusCode).toEqual(204)
  })
})