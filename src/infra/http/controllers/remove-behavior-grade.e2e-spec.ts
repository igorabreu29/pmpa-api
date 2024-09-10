import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'

import bcrypt from 'bcryptjs'
import { makeAuth } from 'test/factories/make-auth.ts'
import type { Behavior } from '@prisma/client'

let behavior: Behavior

describe('Remove Behavior Grade (e2e)', () => {
  beforeAll(async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    const course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'CAS',
      }
    })

    const data = {
      username: 'Jony',
      cpf: '000.111.000-11',
      password: await bcrypt.hash('node-20', 8),
      email: 'igor29nahan@gmail.com',
      birthday: transformDate('29/01/2006'),
      civilId: '00000',
    }

    const student = await prisma.user.create({
      data
    })

    behavior = await prisma.behavior.create({
      data: {
        courseId: course.id,
        studentId: student.id,
        january: 7
      }
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('PATCH /behaviors/:id/remove', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .patch(`/behaviors/${behavior.id}/remove`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        january: -1
      })

    expect(response.statusCode).toEqual(204)
  })
}) 