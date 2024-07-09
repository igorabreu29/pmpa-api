import { FakeEncrypter } from "test/cryptograpy/fake-encrypter.ts";
import { FakeHasher } from "test/cryptograpy/fake-hasher.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts";
import { InMemoryDevelopersRepository } from "test/repositories/in-memory-developers-repository.ts";
import { DevelopersAuthenticateUseCase } from "./developers-authenticatet.ts";
import { makeDeveloper } from "test/factories/make-developer.ts";

let developersRepository: InMemoryDevelopersRepository
let hasher: FakeHasher
let encrypter: FakeEncrypter
let sut: DevelopersAuthenticateUseCase

describe('Developers Authenticate Use Case', () => {
  beforeEach(() => {
    developersRepository = new InMemoryDevelopersRepository()
    hasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new DevelopersAuthenticateUseCase(developersRepository, hasher, encrypter)
  })

  it ('should not be able to authenticate developer with cpf not existing', async () => {
    const result = await sut.execute({ cpf: '01234567811', password: '202020' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })

  it ('should not be able to authenticate developer with password not equals', async () => {
    const developer = makeDeveloper({ passwordHash: '202010-hasher' })
    developersRepository.items.push(developer)

    const result = await sut.execute({ cpf: developer.cpf, password: '202020' })
 
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
   })

   it ('should be able to authenticate developer', async () => {
    const developer = makeDeveloper({ passwordHash: '202020-hasher' })
    developersRepository.items.push(developer)
 
    const result = await sut.execute({ cpf: developer.cpf, password: '202020' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
     token: expect.any(String)
    })
  })
})