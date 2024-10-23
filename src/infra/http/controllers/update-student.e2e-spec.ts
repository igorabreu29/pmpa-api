import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'
import { DomainEvents } from '@/core/events/domain-events.ts'

DomainEvents.shouldRun = false

describe('Update Student (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('PUT /students/:id', async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    const administrator = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: '$2a$08$5gtlkFxleDEe1Xsft1HeVOwjXaq7428B46rjjIW7rLFqo1Xz2oWCW',
        role: 'ADMIN'
      }
    })

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '000.000.000-00',
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'course'
      }
    })

    const newCourse = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CGS',
        imageUrl: '',
        name: 'cgs-course'
      }
    })
    
    const pole = await prisma.pole.create({
      data: {
        name: 'pole'
      }
    })

    const student = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02346',
        cpf: '12345678911',
        email: 'july@acne.com', 
        password: '$2a$08$5gtlkFxleDEe1Xsft1HeVOwjXaq7428B46rjjIW7rLFqo1Xz2oWCW',
        role: 'STUDENT',
        birthday: transformDate('01/04/2001'),

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
      }
    })

    const updateStudentResponse = await request(app.server)
      .put(`/students/${student.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'Jenny Doe',
        courseId: course.id,
        newCourseId: newCourse.id,
        poleId: pole.id
      })

    expect(updateStudentResponse.statusCode).toEqual(204)

    const studentUpdated = await prisma.user.findUnique({
      where: {
        id: student.id
      },

      select: {
        username: true,
        usersOnCourses: {
          select: {
            courseId: true,
            usersOnPoles: {
              select: {
                poleId: true
              }
            }
          }
        }
      }
    })

    expect(studentUpdated?.username).toEqual('Jenny Doe')
    expect(studentUpdated?.usersOnCourses[0].courseId).toEqual(newCourse.id)
    expect(studentUpdated?.usersOnCourses[0].usersOnPoles[0].poleId).toEqual(pole.id)
  })
})