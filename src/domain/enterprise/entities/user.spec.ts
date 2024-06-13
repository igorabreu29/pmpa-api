import { makeUser } from "test/factories/make-user.ts"
import { describe, expect, it } from "vitest"
import { User } from "./user.ts"

describe('User Entity', () => {
  it ('should be able to receive a id after create user', () => {
    const user = makeUser()

    expect(user.id).toBeTruthy()
  })

  it ('should be able to receive params initialiazed after create user', () => {
    const user = makeUser()

    expect(user.createdAt).toBeTruthy()
    expect(user.avatarUrl).toBeNull()
    expect(user.loginConfirmation).toBe(false)
  })

  it ('should be able to change active property value', () => {
    const user = makeUser({ active: false })
    user.active = true
    
    expect(user.active).toBe(true)
  })

  it ('should be able to receive user', () => {
    const user = makeUser()

    expect(user).toBeInstanceOf(User)
    expect(user).toMatchObject({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl,
      cpf: user.cpf,
    })
  })
})