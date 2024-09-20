import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import type { Course } from '@/domain/boletim/enterprise/entities/course.ts'
import type { Discipline } from '@prisma/client'
import { makePrismaCourse } from 'test/factories/make-course.ts'

let course: Course
let discipline: Discipline

describe('Delete Course Discipline (e2e)', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()

    discipline = await prisma.discipline.create({
      data: {
        name: 'discipline-1',
        courseOnDisciplines: {
          create: {
            expected: 'VF',
            hours: 30,
            module: 1,
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

  it ('DELETE /courses/:courseId/disciplines/:disciplineId', async () => {
    const { token } = await makeAuth()

    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    const result = await request(app.server)
      .delete(`/courses/${course.id.toValue()}/disciplines/${discipline.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

      expect(result.statusCode).toEqual(204)
  })
})