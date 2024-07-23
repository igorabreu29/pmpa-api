import { FakeEncrypter } from "test/cryptography/fake-encrypter.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts";
import { InMemoryAuthenticatesRepository } from "test/repositories/in-memory-authenticates-repository.ts";
import { AuthenticateUseCase } from "./authenticate.ts";
import { makeAuthenticate } from "test/factories/make-authenticate.ts";

let authenticatesRepository: InMemoryAuthenticatesRepository
let encrypter: FakeEncrypter
let sut: AuthenticateUseCase

describe('Authenticate Use Case', () => {
  beforeEach(() => {
    authenticatesRepository = new InMemoryAuthenticatesRepository()
    encrypter = new FakeEncrypter()
    sut = new AuthenticateUseCase(authenticatesRepository, encrypter)
  })

  it ('should not be able to authenticate with cpf not existing', async () => {
    const result = await sut.execute({ cpf: '01234567811', password: '202020' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })

  it ('should not be able to authenticate with password not equals', async () => {
    const authenticate = makeAuthenticate()
    authenticatesRepository.items.push(authenticate)

    const result = await sut.execute({ cpf: authenticate.cpf.value, password: 'test1' })
 
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
   })

   it ('should be able to receive "{ redirect: true }" if the role to be student and his does not confirmated login', async () => {
    const authenticate = makeAuthenticate()
    authenticatesRepository.items.push(authenticate)

    await authenticate.passwordHash.hash()
    const result = await sut.execute({ cpf: authenticate.cpf.value, password: 'test-2020' })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      redirect: true
    })
   })
 
   it ('should be able to authenticate', async () => {
    const authenticate = makeAuthenticate({ isLoginConfirmed: true, role: 'manager' })
    authenticatesRepository.items.push(authenticate)
    
    await authenticate.passwordHash.hash()
    const result = await sut.execute({ cpf: authenticate.cpf.value, password: 'test-2020' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      token: expect.any(String)
    })
   })
})