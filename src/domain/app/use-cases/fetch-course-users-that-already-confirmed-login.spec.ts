import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "test/factories/make-user.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { FetchCourseUsersThatAlreadyConfirmedLoginUseCase } from "./fetch-course-users-that-already-confirmed-login.ts";

let usersRepository: InMemoryUsersRepository
let sut: FetchCourseUsersThatAlreadyConfirmedLoginUseCase

describe(('Fetch Course Users That Already Confirmed Login Use Case'), () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new FetchCourseUsersThatAlreadyConfirmedLoginUseCase(usersRepository)
  })

  it ('should be able to fetch course users', async () => {
    const course = makeCourse({ name: 'Node.js' }, new UniqueEntityId('course-1'))

    const user1 = makeUser({ username: 'user-1', loginConfirmation: false, courses: [course] })
    const user2 = makeUser({ username: 'user-2', loginConfirmation: true, courses: [course] })
    const user3 = makeUser({ username: 'user-3', loginConfirmation: true, courses: [course] })
    usersRepository.createMany([user1, user2, user3])

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