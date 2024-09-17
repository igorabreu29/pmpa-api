import { Password } from "@/domain/boletim/enterprise/entities/value-objects/password.ts"
import { makePrismaAdministrator } from "./make-administrator.ts"

import request from 'supertest'
import { app } from "@/infra/app.ts"
import { makePrismaDeveloper } from "./make-developer.ts"

export async function makeAuth() {
  const passwordOrError = Password.create('node-20')
  if (passwordOrError.isLeft()) throw new Error(passwordOrError.value.message)

  await makePrismaDeveloper({ passwordHash: passwordOrError.value })

  const authenticateResponse = await request(app.server)
    .post('/credentials/auth')
    .send({
      cpf: '000.000.000-01',
      password: 'node-20'
    })

  const { token }: { token: string } = authenticateResponse.body
  
  return {
    token
  }
}