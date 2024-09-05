import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import bcrypt from 'bcryptjs'
import { prisma } from '@/infra/database/lib/prisma.ts'
import type { Course, User } from '@prisma/client'
import { transformDate } from '@/infra/utils/transform-date.ts'
import { makeAuth } from 'test/factories/make-auth.ts'

let course: Course
let user: User

describe('Get Course Manager (e2e)', () => {
  beforeAll(async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'CAS',
      }
    })

    const pole = await prisma.pole.create({
      data: {
        name: 'pole-1'
      }
    })

    user = await prisma.user.create({
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

    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('GET /courses/:courseId/managers/:id', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .get(`/courses/${course.id}/managers/${user.id}`)
      .set('Authorization', `Bearer ${token}`)

    const { manager } = response.body

    expect(response.statusCode).toEqual(200)
    expect(manager).toMatchObject({
      username: 'John Doe',
      course: {
        name: 'CAS'
      },
      pole: {
        name: 'pole-1'
      }
    })  
  })
})