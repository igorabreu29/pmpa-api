import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { FetchCoursesUseCase } from "./fetch-courses.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeUser } from "test/factories/make-user.ts";

let coursesRepository: InMemoryCoursesRepository
let sut: FetchCoursesUseCase

describe('Fetch Courses Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    sut = new FetchCoursesUseCase(coursesRepository)
  })

  it ('should be able to fetch all courses if user role is admin', async () => {
    const user = makeUser()

    for (let i = 0; i < 3; i++) {
      const course = makeCourse({ name: `course-${i}`, users: [user] })
      coursesRepository.create(course)
    }
    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    expect(result.value?.courses).toMatchObject(
      [
        {
          name: 'course-0'
        },
        {
          name: 'course-1'
        },
        {
          name: 'course-2'
        },
      ]
    )
  })

  it ('should be able to fetch all courses how admin', async () => {
    const user = makeUser()

    for (let i = 0; i < 3; i++) {
      const course = makeCourse({ name: `course-${i}`, users: [user] })
      coursesRepository.create(course)
    }
    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    expect(result.value?.courses).toMatchObject(
      [
        {
          name: 'course-0'
        },
        {
          name: 'course-1'
        },
        {
          name: 'course-2'
        },
      ]
    )
  })
})