import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import bcrypt from 'bcryptjs'
import { prisma } from '@/infra/database/lib/prisma.ts'
import type { User } from '@prisma/client'
import { transformDate } from '@/infra/utils/transform-date.ts'

let manager: User

describe('Get Manager Courses (e2e)', () => {
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

    const course2 = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CGS',
        imageUrl: '',
        name: 'CGS',
      }
    })

     manager = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/02/2001'),
        
        usersOnCourses: {
          createMany: {
            data: [
              {
                courseId: course.id
              },
              {
                courseId: course2.id
              }
            ]
          }
        }
      },
    })

    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('GET /managers/courses', async () => {
    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: manager.cpf,
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/managers/courses`)
      .set('Authorization', `Bearer ${token}`)

    const { courses } = response.body

    expect(response.statusCode).toEqual(200)
    expect(courses).toMatchObject([
      {
        id: manager.id,
        course: {
          name: 'CAS',
        } 
      },
      {
        id: manager.id,
        course: {
          name: 'CGS',
        } 
      },
    ])
  })
})