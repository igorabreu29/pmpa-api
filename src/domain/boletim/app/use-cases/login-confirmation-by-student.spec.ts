import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "test/factories/make-user.ts";
import { LoginConfirmationByStudentUseCase } from "./login-confirmation-by-student.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

let usersRepository: InMemoryUsersRepository
let sut: LoginConfirmationByStudentUseCase

const data = {
  birthday: new Date(),
  civilID: 2020,
  militaryID: 2020,
  county: 'fake-county',
  state: 'fake-state',
  email: 'fake-email',
}

describe('Login Confirmation By Student Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new LoginConfirmationByStudentUseCase(usersRepository)
  })
  
  it ('should not be able to login confirmation from user if he does not exist', async () => {
    const result = await sut.execute({ 
      ...data,
      userId: 'not-found'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to complete login confirmation', async () => {
    const user = makeUser()
    usersRepository.create(user)

    const result = await sut.execute({
      ...data,
      userId: user.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(usersRepository.items[0].loginConfirmation).toBe(true)
  })
})