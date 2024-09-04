import { app } from "@/infra/app.ts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import request from 'supertest';
import { makePrismaCourse } from "test/factories/make-course.ts";
import { Course } from "@/domain/boletim/enterprise/entities/course.ts";
import { makeAuth } from "test/factories/make-auth.ts";

let course: Course

describe('Update Course', () => {
  beforeAll(async () => {
    course = await makePrismaCourse()

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('UPDATE /courses/:id', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .put(`/courses/${course.id.toValue()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        formula: 'CGS',
        name: 'CGS - 2022'
      })

    expect(response.statusCode).toEqual(204)
  })
})