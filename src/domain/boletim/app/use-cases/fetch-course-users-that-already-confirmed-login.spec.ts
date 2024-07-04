import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "test/factories/make-user.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { FetchCourseUsersThatAlreadyConfirmedLoginUseCase } from "./fetch-course-users-that-already-confirmed-login.ts";
import { InMemoryUsersCourseRepository } from "test/repositories/in-memory-users-course-repository.ts";
import { makeUserCourse } from "test/factories/make-user-course.ts";

let usersCoursesRepository: InMemoryUsersCourseRepository
let usersRepository: InMemoryUsersRepository
let sut: FetchCourseUsersThatAlreadyConfirmedLoginUseCase

describe(('Fetch Course Users That Already Confirmed Login Use Case'), () => {
  beforeEach(() => {
    usersCoursesRepository = new InMemoryUsersCourseRepository()
    usersRepository = new InMemoryUsersRepository(
      usersCoursesRepository
    )
    sut = new FetchCourseUsersThatAlreadyConfirmedLoginUseCase(usersRepository)
  })

  it ('should be able to fetch course users', async () => {

    const user1 = makeUser({ username: 'user-1', loginConfirmation: false })
    const user2 = makeUser({ username: 'user-2', loginConfirmation: true })
    const user3 = makeUser({ username: 'user-3', loginConfirmation: true })
    usersRepository.createMany([user1, user2, user3])

    const userCourse1 = makeUserCourse({ courseId: new UniqueEntityId('course-1'), userId: user1.id })
    const userCourse2 = makeUserCourse({ courseId: new UniqueEntityId('course-1'), userId: user2.id })
    const userCourse3 = makeUserCourse({ courseId: new UniqueEntityId('course-1'), userId: user3.id })
    usersCoursesRepository.create(userCourse1)
    usersCoursesRepository.create(userCourse2)
    usersCoursesRepository.create(userCourse3)

    const result = await sut.execute({ courseId: 'course-1' })
    
    expect(result.isRight()).toBe(true)
    expect(result.value?.users).toHaveLength(2)
    expect(result.value?.users).toMatchObject([
      {
        username: 'user-2'
      },
      {
        username: 'user-3'
      },
    ])
  })
})