import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'

describe('Authenticate (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('POST /credentials/auth', async () => {
    const data = {
      cpf: '05399970210',
      password: 'node-20'
    }

    const result = await request(app.server)
      .post('/credentials/auth')
      .send(data)
      .expect(201)

    const { token } = result.body

    expect(token).toEqual(expect.any(String))
  })
})