import { Course } from "@/domain/boletim/enterprise/entities/course.ts";
import { app } from "@/infra/app.ts";
import { makePrismaAdministrator } from "test/factories/make-administrator.ts";
import { makePrismaCourse } from "test/factories/make-course.ts";
import { makePrismaManagerCourse } from "test/factories/make-manager-course.ts";
import { makePrismaManager } from "test/factories/make-manager.ts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import request from 'supertest';
import { Password } from "@/domain/boletim/enterprise/entities/value-objects/password.ts";
import { Manager } from "@/domain/boletim/enterprise/entities/manager.ts";

let course: Course
let manager: Manager

describe('Disable Manager (e2e)', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()
    manager = await makePrismaManager({ data: {} })
    
    await makePrismaManagerCourse({
      courseId: course.id,
      managerId: manager.id,
      isActive: true,
    })

    await app.ready()
  })

  afterAll(async () => await app.close())

  it ('PATCH /courses/:courseId/managers/:managerId/active-status', async () => {
    const passwordOrError = Password.create('node-20')
    if (passwordOrError.isLeft()) throw new Error(passwordOrError.value.message)

    await makePrismaAdministrator({ passwordHash: passwordOrError.value })

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '000.000.000-02',
        password: 'node-20'
      })

    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .patch(`/courses/${course.id.toValue()}/managers/${manager.id.toValue()}/disable-status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        reason: 'Faltou todas as aulas'
      })

    expect(response.statusCode).toEqual(204)
  })
})