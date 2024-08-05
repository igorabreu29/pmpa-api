import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { FetchCoursesUseCase } from "./fetch-courses.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makeCourse } from "test/factories/make-course.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";

let coursesRepository: InMemoryCoursesRepository
let sut: FetchCoursesUseCase

describe('Fetch Courses Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    sut = new FetchCoursesUseCase(coursesRepository)
  })

  it ('should be able to fetch courses', async () => {
    const nameOrError = Name.create('course-1')
    if (nameOrError.isLeft()) return
    
    const nameOrError2 = Name.create('course-2')
    if (nameOrError2.isLeft()) return

    const course = makeCourse({
      name: nameOrError.value
    })
    coursesRepository.create(course)

    const course2 = makeCourse({
      name: nameOrError2.value
    })
    coursesRepository.create(course2)

    const result = await sut.execute({
      page: 1
    })


    expect(result.isRight()).toBe(true)
    expect(result.value?.courses).toMatchObject([
      {
        id: course.id,
        name: course.name
      },
      {
        id: course2.id,
        name: {
          value: course2.name.value
        }
      }
    ])
  })
})