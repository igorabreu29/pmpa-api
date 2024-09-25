import { InMemoryAuthenticatesRepository } from "test/repositories/in-memory-authenticates-repository.ts";
import { ForgotPasswordUseCase } from "./forgot-password.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { FakeMailer } from "test/mail/fake-mailer.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeAuthenticate } from "test/factories/make-authenticate.ts";

let authenticatesRepository: InMemoryAuthenticatesRepository
let mailer: FakeMailer
let sut: ForgotPasswordUseCase

describe('Forgot Password Use Case', () => {
  beforeEach(() => {
    authenticatesRepository = new InMemoryAuthenticatesRepository()
    mailer = new FakeMailer()

    sut = new ForgotPasswordUseCase(
      authenticatesRepository,
      mailer
    )
  })

  it ('should receive instance of "ResourceNotFoundError" if user does not exist', async () => {
    const result = await sut.execute({
      cpf: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should receive "An email was sent. Verify your checkbox." if user exist', async () => {
    const authenticate = makeAuthenticate()
    authenticatesRepository.items.push(authenticate)

    const result = await sut.execute({
      cpf: authenticate.cpf.value
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      message: 'An email was sent. Verify your checkbox.'
    })
  })
})