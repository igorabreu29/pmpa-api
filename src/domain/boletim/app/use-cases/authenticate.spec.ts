import { FakeEncrypter } from "test/cryptograpy/fake-encrypter.ts";
import { FakeHasher } from "test/cryptograpy/fake-hasher.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthenticateUseCase } from "./authenticate.ts";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts";
import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts";
import { InMemoryDevelopersRepository } from "test/repositories/in-memory-developers-repository.ts";
import { InMemoryAdministratorsRepository } from "test/repositories/in-memory-administrators-repository.ts";
import { makeManager } from "test/factories/make-manager.ts";

let managersRepository: InMemoryManagersRepository
let administratorsRepository: InMemoryAdministratorsRepository
let developersRepository: InMemoryDevelopersRepository
let hasher: FakeHasher
let encrypter: FakeEncrypter
let sut: AuthenticateUseCase

describe('Authenticate Use Case', () => {
  beforeEach(() => {
    managersRepository = new InMemoryManagersRepository()
    administratorsRepository = new InMemoryAdministratorsRepository()
    developersRepository = new InMemoryDevelopersRepository()
    hasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new AuthenticateUseCase(
      managersRepository,
      administratorsRepository,
      developersRepository,
      hasher,
      encrypter
    )
  })

  it ('should not be able to authenticate user with cpf not existing', async () => {
    const result = await sut.execute({ cpf: '01234567811', password: '202020', role: 'dev' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })

  it ('should not be able to authenticate customer with password not equals', async () => {
    const manager = makeManager({ passwordHash: '202010-hasher' })
    managersRepository.items.push(manager)

    const result = await sut.execute({ cpf: manager.cpf, password: '202020', role: manager.role })
 
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
   })

   it ('should be able to authenticate user', async () => {
    const manager = makeManager({ passwordHash: '202020-hasher' })
    managersRepository.items.push(manager)
 
    const result = await sut.execute({ cpf: manager.cpf, password: '202020', role: manager.role })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
     token: expect.any(String)
    })
   })
})