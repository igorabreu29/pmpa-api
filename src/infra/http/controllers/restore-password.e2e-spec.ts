import type { Student } from '@/domain/boletim/enterprise/entities/student.ts'
import { app } from '@/infra/app.ts'
import { makePrismaStudent } from 'test/factories/make-student.ts'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'

let student: Student

describe('Restore Password (e2e)', () => {
  beforeAll(async () => {
    student = await makePrismaStudent({ data: {} })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('PATCH /restore', async () => {
    const response = await request(app.server)
      .patch(`/restore?email=${student.email.value}`)
      .send({
        newPassword: 'node-2020',
        confirmPassword: 'node-2020'
      })

    expect(response.statusCode).toBe(204)
  })
})