import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import bcrypt from 'bcryptjs'
import { prisma } from '@/infra/database/lib/prisma.ts'
import type { Course } from '@prisma/client'

let course: Course

describe('Get Course Disciplines (e2e)', () => {
  beforeAll(async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'CAS',
        coursesOnDisciplines: {
          create: {
            module: 1,
            expected: 'VF',
            hours: 30,
            discipline: {
              create: {
                name: 'discipline-1'
              }
            }
          }
        }
      }
    })

    const discipline = await prisma.discipline.create({
      data: {
        name: 'discipline-2'
      }
    })

    await prisma.courseOnDiscipline.create({
      data: {
        courseId: course.id,
        disciplineId: discipline.id,
        expected: 'VF',
        hours: 28,
        module: 1,
      }
    })

    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('GET /courses/:id/disciplines', async () => {
    const administrator = await prisma.user.create({
      data: {
        username: 'Jey Doe',
        civilId: '02345',
        cpf: '00000000001',
        email: 'jey@acne.com', 
        password: await bcrypt.hash('node-21', 8),
        role: 'ADMIN'
      }
    })
    
    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '000.000.000-01',
        password: 'node-21'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/courses/${course.id}/disciplines`)
      .set('Authorization', `Bearer ${token}`)

    const { disciplines } = response.body

    expect(response.statusCode).toEqual(200)
    expect(disciplines).toMatchObject([
      {
        name: 'discipline-1'
      },
      {
        name: 'discipline-2'
      },
    ])
  })
})