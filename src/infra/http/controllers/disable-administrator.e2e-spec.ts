import { app } from "@/infra/app.ts";
import { makePrismaAdministrator } from "test/factories/make-administrator.ts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import request from 'supertest';
import type { Administrator } from "@/domain/boletim/enterprise/entities/administrator.ts";
import { makeAuth } from "test/factories/make-auth.ts";

let administrator: Administrator

describe('Disable Administrator (e2e)', () => {
  beforeAll(async () => {
    administrator = await makePrismaAdministrator({ isActive: false })
    
    await app.ready()
  })

  afterAll(async () => await app.close())

  it ('PATCH /administrators/:administratorId/disable-status', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .patch(`/administrators/${administrator.id.toValue()}/disable-status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        reason: 'random-message'
      })

    expect(response.statusCode).toEqual(204)
  })
})