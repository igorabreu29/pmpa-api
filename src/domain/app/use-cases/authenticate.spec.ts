import { FakeEncrypter } from "test/cryptograpy/fake-encrypter.ts";
import { FakeHasher } from "test/cryptograpy/fake-hasher.ts";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthenticateUseCase } from "./authenticate.ts";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts";
import { makeUser } from "test/factories/make-user.ts";

let usersRepository: InMemoryUsersRepository
let hasher: FakeHasher
let encrypter: FakeEncrypter
let sut: AuthenticateUseCase

describe('Authenticate Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    hasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new AuthenticateUseCase(usersRepository, hasher, encrypter)
  })

  it ('should not be able to authenticate user with cpf not existing', async () => {
    const result = await sut.execute({ cpf: '01234567811', password: '202020' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })

  it ('should not be able to authenticate customer with password not equals', async () => {
    const user = makeUser({ password: '202010-hasher' })
    usersRepository.items.push(user)

    const result = await sut.execute({ cpf: user.cpf, password: '202020' })
 
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
   })

   it ('should be able to receive "{ redirect: true }" if the user has the student role and does not have login confirmation', async () => {
    const user = makeUser({ password: '202020-hasher', role: 'student', loginConfirmation: false })
    usersRepository.items.push(user)

    const result = await sut.execute({ cpf: user.cpf, password: '202020' })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      redirect: true
    })
   })
 
   it ('should be able to authenticate user', async () => {
    const user = makeUser({ password: '202020-hasher', role: 'student', loginConfirmation: true })
    usersRepository.items.push(user)
 
    const result = await sut.execute({ cpf: user.cpf, password: '202020' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
     token: expect.any(String)
    })
   })
})