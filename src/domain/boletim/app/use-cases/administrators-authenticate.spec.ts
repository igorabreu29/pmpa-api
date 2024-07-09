import { beforeEach, describe, expect, it } from "vitest";
import { FakeEncrypter } from "test/cryptograpy/fake-encrypter.ts";
import { FakeHasher } from "test/cryptograpy/fake-hasher.ts";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts";
import { AdministratorsAuthenticateUseCase } from "./administrators-authenticate.ts";
import { InMemoryAdministratorsRepository } from "test/repositories/in-memory-administrators-repository.ts";
import { makeAdministrator } from "test/factories/make-administrator.ts";

let administratorsRepository: InMemoryAdministratorsRepository
let hasher: FakeHasher
let encrypter: FakeEncrypter
let sut: AdministratorsAuthenticateUseCase

describe('Administrators Authenticate Use Case', () => {
  beforeEach(() => {
    administratorsRepository = new InMemoryAdministratorsRepository()
    hasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new AdministratorsAuthenticateUseCase(administratorsRepository, hasher, encrypter)
  })

  it ('should not be able to authenticate administrator with cpf not existing', async () => {
    const result = await sut.execute({ cpf: '01234567811', password: '202020' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })

  it ('should not be able to authenticate administrator with password not equals', async () => {
    const administrator = makeAdministrator({ passwordHash: '202010-hasher' })
    administratorsRepository.items.push(administrator)

    const result = await sut.execute({ cpf: administrator.cpf, password: '202020' })
 
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
   })

   it ('should be able to authenticate administrator', async () => {
    const administrator = makeAdministrator({ passwordHash: '202020-hasher' })
    administratorsRepository.items.push(administrator)
 
    const result = await sut.execute({ cpf: administrator.cpf, password: '202020' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
     token: expect.any(String)
    })
  })
})