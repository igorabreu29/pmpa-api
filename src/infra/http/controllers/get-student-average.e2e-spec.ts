import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { app } from '@/infra/app.ts'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'
import { Course, User } from '@prisma/client'

let course: Course
let student: User

describe('Get Student Average (e2e)', () => {
  beforeAll(async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'CAS',
        isPeriod: false
      }
    })

    student = await prisma.user.create({
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
            courseId: course.id
          }
        }
      },
    })

    await prisma.discipline.create({
      data: {
        name: 'discipline-1',
        assessments: {
          create: {
            vf: 8,
            avi: 5,
            courseId: course.id,
            studentId: student.id,
          }
        },
        courseOnDisciplines: {
          create: {
            courseId: course.id,
            expected: 'VF',
            hours: 30,
            module: 1,
          }
        }
      }
    })

    await prisma.behavior.create({
      data: {
        january: 7,
        february: 8,
        courseId: course.id,
        studentId: student.id
      }
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('GET /courses/:id/students/:studentId/average', async () => {
    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '000.000.000-00',
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/courses/${course.id}/students/${student.id}/average?type=module`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const { grades, behaviorMonths } = response.body

    const expectedGrades = {
      averageInform: {
        geralAverage: 7,
        behaviorAverageStatus: {
          behaviorAverage: 7.5,
          status: 'approved'
        },
        behaviorsCount: 2,
        studentAverageStatus: {
          concept: 'good',
          status: 'second season'
        }
      },
      assessments: [
        {
          id: expect.any(String),
          disciplineName: 'discipline-1'
        }
      ]
    }
    
    expect(grades).toMatchObject(expectedGrades)
    expect(behaviorMonths).toMatchObject([
      {
        january: 7,
        february: 8,
      }
    ])
  })
})