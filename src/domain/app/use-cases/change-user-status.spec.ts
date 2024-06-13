import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "test/factories/make-user.ts";
import { ChangeUserStatus } from "./change-user-status.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

let usersRepository: InMemoryUsersRepository
let sut: ChangeUserStatus

describe('Change User Status Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new ChangeUserStatus(usersRepository)
  })

  it ('should not be able to change status if user not exist', async () => {
    const result = await sut.execute({ requesterRole: 'admin', id: 'not-found', value: false })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to change user status without permission', async () => {
    const user = makeUser()
    usersRepository.create(user)

    const result = await sut.execute({ requesterRole: 'student', id: user.id.toValue(), value: false })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

   it ('should be able to change user status', async () => {
    const user = makeUser()
    usersRepository.create(user)
 
    const result = await sut.execute({ id: user.id.toValue(), requesterRole: 'manager', value: false })

    expect(result.isRight()).toBe(true)
    expect(usersRepository.items[0].active).toBe(false)
   })
})