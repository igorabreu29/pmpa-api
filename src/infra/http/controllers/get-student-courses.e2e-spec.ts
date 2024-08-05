import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import bcrypt from 'bcryptjs'
import { prisma } from '@/infra/database/lib/prisma.ts'
import type { User } from '@prisma/client'
import { transformDate } from '@/infra/utils/transform-date.ts'

let student: User

describe('Get Student Courses (e2e)', () => {
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

     student = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        isActive: true,
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

  it ('GET /students/courses', async () => {
    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: student.cpf,
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/students/courses`)
      .set('Authorization', `Bearer ${token}`)

    const { courses } = response.body

    expect(response.statusCode).toEqual(200)
    expect(courses).toMatchObject([
      {
        userId: student.id,
        course: {
          name: 'CAS',
        } 
      },
      {
        userId: student.id,
        course: {
          name: 'CGS',
        } 
      },
    ])
  })
})