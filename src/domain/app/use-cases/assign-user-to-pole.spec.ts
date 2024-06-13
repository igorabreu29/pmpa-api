import { beforeEach, describe, expect, it } from "vitest";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { makeUserCourse } from "test/factories/make-user-course.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeUser } from "test/factories/make-user.ts";
import { AssignUserToPoleUseCase } from "./assign-user-to-pole.ts";
import { InMemoryUserPolesRepository } from "test/repositories/in-memory-user-poles-repository.ts";
import { makePole } from "test/factories/make-pole.ts";
import { makeUserPole } from "test/factories/make-user-pole.ts";

let userPolesRepository: InMemoryUserPolesRepository
let sut: AssignUserToPoleUseCase

describe('Assign User To Course Use Case', () => {
  beforeEach(() => {
    userPolesRepository = new InMemoryUserPolesRepository()
    sut = new AssignUserToPoleUseCase(userPolesRepository)
  })

  it ('should not be able to assign user to the course if already be present', async () => {
    const pole = makePole()
    const user = makeUser()

    const userPole = makeUserPole({ poleId: pole.id, userId: user.id })
    userPolesRepository.create(userPole)

    const result = await sut.execute({
      poleId: userPole.poleId.toValue(),
      userId: userPole.userId.toValue()
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to assign course to the course', async () => {
    const pole = makePole()
    const user = makeUser()

    const result = await sut.execute({
      poleId: pole.id.toValue(),
      userId: user.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toBeNull()
    expect(userPolesRepository.items).toHaveLength(1)
  })
})