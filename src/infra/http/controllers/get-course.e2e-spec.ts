import { app } from "@/infra/app.ts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import request from 'supertest';
import { makePrismaCourse } from "test/factories/make-course.ts";
import { Course } from "@/domain/boletim/enterprise/entities/course.ts";
import { makeAuth } from "test/factories/make-auth.ts";

let courseCreated: Course

describe('Get Course', () => {
  beforeAll(async () => {
    courseCreated = await makePrismaCourse()

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /courses/:id', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .get(`/courses/${courseCreated.id.toValue()}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const { course } = response.body
    
    expect(course).toMatchObject({
      name: courseCreated.name.value
    })
  })
})