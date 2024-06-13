import { beforeEach, describe, expect, it } from "vitest";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { AssignUserToCourseUseCase } from "./assign-user-to-course.ts";
import { InMemoryUsersCourseRepository } from "test/repositories/in-memory-users-course-repository.ts";
import { makeUserCourse } from "test/factories/make-user-course.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeUser } from "test/factories/make-user.ts";

let usersCourseRepository: InMemoryUsersCourseRepository
let sut: AssignUserToCourseUseCase

describe('Assign User To Course Use Case', () => {
  beforeEach(() => {
    usersCourseRepository = new InMemoryUsersCourseRepository()
    sut = new AssignUserToCourseUseCase(usersCourseRepository)
  })

  it ('should not be able to assign user to the course if already be present', async () => {
    const course = makeCourse()
    const user = makeUser()

    const userCourse = makeUserCourse({ courseId: course.id, userId: user.id })
    usersCourseRepository.create(userCourse)

    const result = await sut.execute({
      courseId: userCourse.courseId.toValue(),
      userId: userCourse.userId.toValue()
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to assign course to the course', async () => {
    const course = makeCourse()
    const user = makeUser()

    const result = await sut.execute({
      courseId: course.id.toValue(),
      userId: user.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toBeNull()
    expect(usersCourseRepository.items).toHaveLength(1)
  })
})