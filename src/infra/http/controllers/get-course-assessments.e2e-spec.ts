import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { makePrismaCourse } from 'test/factories/make-course.ts'
import type { Course } from '@/domain/boletim/enterprise/entities/course.ts'
import { makePrismaStudent } from 'test/factories/make-student.ts'
import { makeAuth } from 'test/factories/make-auth.ts'
import type { Discipline } from '@prisma/client'
import { CPF } from '@/domain/boletim/enterprise/entities/value-objects/cpf.ts'
import { Email } from '@/domain/boletim/enterprise/entities/value-objects/email.ts'

let course: Course
let discipline: Discipline

describe('Get Course Assessments (e2e)', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()
    discipline = await prisma.discipline.create({
      data: {
        name: 'discipline-1'
      }
    })

    const cpfOrError = CPF.create('000.000.000-10')
    const emailOrError = Email.create('node@node.com')
    
    if (cpfOrError.isLeft()) return
    if (emailOrError.isLeft()) return

    const student = await makePrismaStudent({ data: {} })
    const student2 = await makePrismaStudent({ data: {
      cpf: cpfOrError.value,
      email: emailOrError.value
    } })

    await prisma.courseOnDiscipline.create({
      data: {
        expected: 'VF',
        hours: 30,
        module: 1,
        courseId: course.id.toValue(),
        disciplineId: discipline.id
      }
    })

    await prisma.assessment.createMany({
      data: [
        {
          courseId: course.id.toValue(),
          studentId: student.id.toValue(),
          disciplineId: discipline.id,
          vf: 10
        },
        {
          courseId: course.id.toValue(),
          studentId: student2.id.toValue(),
          disciplineId: discipline.id,
          vf: 8
        },
      ]
    })

    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('GET /courses/:courseId/disciplines/:disciplineId/assessments', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .get(`/courses/${course.id.toValue()}/disciplines/${discipline.id}/assessments`)
      .set('Authorization', `Bearer ${token}`)

    const { assessments } = response.body

    expect(response.statusCode).toEqual(200)
    expect(assessments).toMatchObject([
      {
        vf: 10
      },
      {
        vf: 8
      },
    ])
  })
})