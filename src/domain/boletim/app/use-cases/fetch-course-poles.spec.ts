import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCoursePole } from "test/factories/make-course-pole.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makePole } from "test/factories/make-pole.ts";
import { InMemoryCoursesPolesRepository } from "test/repositories/in-memory-courses-poles-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { FetchCoursePolesUseCase } from "./fetch-course-poles.ts";

let polesRepository: InMemoryPolesRepository
let coursesRepository: InMemoryCoursesRepository
let coursesPolesRepository: InMemoryCoursesPolesRepository

let sut: FetchCoursePolesUseCase

describe('Fetch Course Poles Use Case', () => {
  beforeEach(() => {
    polesRepository = new InMemoryPolesRepository()
    coursesRepository = new InMemoryCoursesRepository()
    coursesPolesRepository = new InMemoryCoursesPolesRepository(
      polesRepository
    )

    sut = new FetchCoursePolesUseCase(
      coursesRepository,
      coursesPolesRepository
    )
  })

  it ('should not be able to fetch course poles if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to fetch course poles', async () => {
    const course = makeCourse() 
    coursesRepository.create(course)

    const pole1 = makePole()
    const pole2 = makePole()
    polesRepository.createMany([pole1, pole2])

    const coursePole1 = makeCoursePole({ courseId: course.id, poleId: pole1.id })
    const coursePole2 = makeCoursePole({ courseId: course.id, poleId: pole2.id })
    coursesPolesRepository.createMany([coursePole1, coursePole2])

    const result = await sut.execute({
      courseId: course.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      poles: [
        {
          id: pole1.id,
          name: pole1.name
        },
        {
          id: pole2.id,
          name: pole2.name
        },
      ]
    })
  })
})