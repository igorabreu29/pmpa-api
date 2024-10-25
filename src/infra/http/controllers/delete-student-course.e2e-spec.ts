import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makePrismaCourse } from 'test/factories/make-course.ts'
import { DomainEvents } from '@/core/events/domain-events.ts'

DomainEvents.shouldRun = false

describe('Delete Student Course (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('DELETE /courses/:courseId/students/:id', async () => {
    const { token } = await makeAuth()

    const data = {
      username: 'Jony',
      cpf: '00011100011',
      password: 'node-20',
      email: 'igor29nahan@gmail.com',
      birthday: '29/01/2006',
      civilId: '20234',
    }

    const course = await makePrismaCourse()
    const pole = await prisma.pole.create({
      data: {
        name: 'pole-1'
      }
    })

    const student = await prisma.user.create({
      data: {
        ...data,
        birthday: transformDate(data.birthday),

        usersOnCourses: {
          create: {
            courseId: course.id.toValue(),
            usersOnPoles: {
              create: {
                poleId: pole.id
              }
            }
          }
        }
      }
    })

    const response = await request(app.server)
      .delete(`/courses/${course.id.toValue()}/students/${student.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(204)
  })
})