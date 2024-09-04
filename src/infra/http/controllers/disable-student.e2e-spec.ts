import { Course } from "@/domain/boletim/enterprise/entities/course.ts";
import { app } from "@/infra/app.ts";
import { makePrismaAdministrator } from "test/factories/make-administrator.ts";
import { makePrismaCourse } from "test/factories/make-course.ts";
import { makePrismaStudentCourse } from "test/factories/make-student-course.ts";
import { makePrismaStudent } from "test/factories/make-student.ts";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import request from 'supertest'
import { Password } from "@/domain/boletim/enterprise/entities/value-objects/password.ts";
import { Student } from "@/domain/boletim/enterprise/entities/student.ts";
import { StudentCourse } from "@/domain/boletim/enterprise/entities/student-course.ts";

let course: Course
let student: Student

describe('Disable Student (e2e)', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()
    student = await makePrismaStudent({ data: {} })
    
    await makePrismaStudentCourse({
      courseId: course.id,
      studentId: student.id,
      isActive: true,
    })

    await app.ready()
  })

  afterAll(async () => await app.close())

  it ('PATCH /courses/:courseId/students/:studentId/active-status', async () => {
    const passwordOrError = Password.create('node-20')
    if (passwordOrError.isLeft()) throw new Error(passwordOrError.value.message)

    await makePrismaAdministrator({ passwordHash: passwordOrError.value })

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '000.000.000-01',
        password: 'node-20'
      })

    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .patch(`/courses/${course.id.toValue()}/students/${student.id.toValue()}/disable-status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        reason: 'Faltou todas as aulas'
      })

    expect(response.statusCode).toEqual(204)
  })
})