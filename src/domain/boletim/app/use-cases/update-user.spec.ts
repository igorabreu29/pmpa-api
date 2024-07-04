import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeUser } from "test/factories/make-user.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makePole } from "test/factories/make-pole.ts";
import { InMemoryUsersCourseRepository } from "test/repositories/in-memory-users-course-repository.ts";
import { InMemoryUserPolesRepository } from "test/repositories/in-memory-user-poles-repository.ts";
import { UpdateUserUseCase } from "./update-user.ts";

let usersCoursesRepository: InMemoryUsersCourseRepository
let usersPolesRepository: InMemoryUserPolesRepository
let polesRepository: InMemoryPolesRepository
let usersRepository: InMemoryUsersRepository
let sut: UpdateUserUseCase

describe(('Update User Use Case'), () => {
  beforeEach(() => {
    usersCoursesRepository = new InMemoryUsersCourseRepository()
    usersPolesRepository = new InMemoryUserPolesRepository()
    polesRepository = new InMemoryPolesRepository()
    usersRepository = new InMemoryUsersRepository(
      usersCoursesRepository,
      usersPolesRepository,
      polesRepository
    )
    sut = new UpdateUserUseCase(usersRepository)
  })

  it ('should not be able to update user if he does not exist', async () => {
    const result = await sut.execute({ id: 'not-found' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to update user', async () => {
    const user = makeUser({ email: 'john@doe.com' })
    usersRepository.create(user)

    const result = await sut.execute({ 
      id: user.id.toValue(), 
      email: 'joao@doe.com'
    })

    expect(result.isRight()).toBe(true)
    expect(usersRepository.items[0].email).toEqual('joao@doe.com')
  })
})