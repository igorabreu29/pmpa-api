import type { Student } from '@/domain/boletim/enterprise/entities/student.ts'
import { app } from '@/infra/app.ts'
import { redisConnection } from '@/infra/redis/connection.ts'
import { makePrismaStudent } from 'test/factories/make-student.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'

let student: Student

describe('Forgot Password (e2e)', () => {
  beforeAll(async () => {
    await redisConnection.flushdb()

    student = await makePrismaStudent({ data: {} })

    await app.ready()
  })

  afterAll(async () => {
    redisConnection.disconnect()

    await app.close()
  })

  it ('POST /forgot', async () => {
    const response = await request(app.server)
      .post('/forgot')
      .send({ cpf: '000.000.000-00' })

    const { message } = response.body
      
    expect(response.statusCode).toBe(200)
    expect(message).toEqual('Um e-mail foi enviado para sua caixa de texto! Verifique-a para continuar o processo.')
  })
})