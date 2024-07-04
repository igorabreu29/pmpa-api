import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "test/factories/make-user.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { InMemoryUsersCourseRepository } from "test/repositories/in-memory-users-course-repository.ts";
import { makeUserCourse } from "test/factories/make-user-course.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { makePole } from "test/factories/make-pole.ts";
import { InMemoryUserPolesRepository } from "test/repositories/in-memory-user-poles-repository.ts";
import { makeUserPole } from "test/factories/make-user-pole.ts";
import { FetchCourseStudentsUseCase } from "./fetch-course-students.ts";

let usersCoursesRepository: InMemoryUsersCourseRepository
let usersPolesRepository: InMemoryUserPolesRepository
let polesRepository: InMemoryPolesRepository
let usersRepository: InMemoryUsersRepository
let sut: FetchCourseStudentsUseCase

describe(('Fetch Course Users Use Case'), () => {
  beforeEach(() => {
    usersCoursesRepository = new InMemoryUsersCourseRepository()
    usersPolesRepository = new InMemoryUserPolesRepository()
    polesRepository = new InMemoryPolesRepository()
    usersRepository = new InMemoryUsersRepository(
      usersCoursesRepository,
      usersPolesRepository,
      polesRepository
    )
    sut = new FetchCourseStudentsUseCase(usersRepository)
  })

  it ('should be able to fetch course users', async () => {
    for (let i = 1; i <= 3; i++) {
      const user = makeUser({ role: 'student' })
      const userCourse = makeUserCourse({ courseId: new UniqueEntityId('course-1'), userId: user.id })
      usersRepository.create(user)
      usersCoursesRepository.create(userCourse)
    }
    
    const result = await sut.execute({ courseId: 'course-1', page: 1, perPage: 6 })
    
    expect(result.isRight()).toBe(true)
    expect(result.value?.users).toHaveLength(3)
  })

  it ('should be able to fetch course users with role manager and receive pole name', async () => {
    const pole = makePole({ name: 'node.js' })
    polesRepository.items.push(pole)

    for (let i = 1; i <= 3; i++) {
      const user = makeUser({ role: 'student', username: `john-${i}` })
      const userCourse = makeUserCourse({ courseId: new UniqueEntityId('course-1'), userId: user.id })
      const userPole = makeUserPole({ poleId: pole.id, userId: user.id })
      usersRepository.create(user)
      usersCoursesRepository.create(userCourse)
      usersPolesRepository.create(userPole)
    }

    const result = await sut.execute({ courseId: 'course-1', page: 1, perPage: 6, poleId: pole.id.toValue(), role: 'manager' })

    expect(result.isRight()).toBe(true)
    expect(result.value?.users).toMatchObject([
      {
        username: 'john-1',
      },
      {
        username: 'john-2',
      },
      {
        username: 'john-3',
      },
    ])
  })

  it ('should be able to paginated user courses', async () => {
    for (let i = 1; i <= 8; i++) {
      const user = makeUser({ role: 'student' })
      const userCourse = makeUserCourse({ courseId: new UniqueEntityId('course-1'), userId: user.id })
      usersRepository.create(user)
      usersCoursesRepository.create(userCourse)
    }

    const result = await sut.execute({ courseId: 'course-1', page: 2, perPage: 6 })
    
    expect(result.isRight()).toBe(true)
    expect(result.value?.users).toHaveLength(2)
    expect(result.value?.pages).toEqual(2)
    expect(result.value?.totalItems).toEqual(8)
  })
})