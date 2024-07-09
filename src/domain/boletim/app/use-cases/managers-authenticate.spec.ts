import { FakeEncrypter } from "test/cryptograpy/fake-encrypter.ts";
import { FakeHasher } from "test/cryptograpy/fake-hasher.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts";
import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts";
import { ManagersAuthenticateUseCase } from "./managers-authenticate.ts";
import { makeManager } from "test/factories/make-manager.ts";

let managersRepository: InMemoryManagersRepository
let hasher: FakeHasher
let encrypter: FakeEncrypter
let sut: ManagersAuthenticateUseCase

describe('Managers Authenticate Use Case', () => {
  beforeEach(() => {
    managersRepository = new InMemoryManagersRepository()
    hasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new ManagersAuthenticateUseCase(managersRepository, hasher, encrypter)
  })

  it ('should not be able to authenticate manager with cpf not existing', async () => {
    const result = await sut.execute({ cpf: '01234567811', password: '202020' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })

  it ('should not be able to authenticate manager with password not equals', async () => {
    const manager = makeManager({ passwordHash: '202010-hasher' })
    managersRepository.items.push(manager)

    const result = await sut.execute({ cpf: manager.cpf, password: '202020' })
 
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
   })

   it ('should be able to authenticate manager', async () => {
    const manager = makeManager({ passwordHash: '202020-hasher' })
    managersRepository.items.push(manager)
 
    const result = await sut.execute({ cpf: manager.cpf, password: '202020' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
     token: expect.any(String)
    })
  })
})