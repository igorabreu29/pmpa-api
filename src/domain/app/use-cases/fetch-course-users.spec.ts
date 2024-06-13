import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "test/factories/make-user.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { FetchCourseUsersUseCase } from "./fetch-course-users.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

let usersRepository: InMemoryUsersRepository
let sut: FetchCourseUsersUseCase

describe(('Fetch Course Users Use Case'), () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new FetchCourseUsersUseCase(usersRepository)
  })

  it ('should be able to fetch course users', async () => {
    const course = makeCourse({ name: 'Node.js' }, new UniqueEntityId('course-1'))

    usersRepository.create(makeUser({ courses: [makeCourse({ name: 'React.js' })], role: 'manager' }))

    for (let i = 1; i <= 3; i++) {
      const user = makeUser({ courses: [course], role: 'student' })
      usersRepository.create(user)
    }
    
    const result = await sut.execute({ courseId: 'course-1', page: 1 })
    
    expect(result.isRight()).toBe(true)
    expect(result.value?.users).toHaveLength(3)
  })

  it ('should be able to paginated user courses', async () => {
    const course = makeCourse({ name: 'Node.js' }, new UniqueEntityId('course-1'))

    for (let i = 1; i <= 12; i++) {
      const user = makeUser({ courses: [course], role: 'student' })
      usersRepository.create(user)
    }

    const result = await sut.execute({ courseId: 'course-1', page: 2 })
    expect(result.isRight()).toBe(true)
    expect(result.value?.users).toHaveLength(2)
    expect(result.value?.pages).toEqual(2)
    expect(result.value?.totalUsers).toEqual(12)
  })
})