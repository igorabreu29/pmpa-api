import { InMemoryCourseHistoricRepository } from "test/repositories/in-memory-course-historic-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { CreateHistoricUseCase } from "./create-historic.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

let courseHistoricRepository: InMemoryCourseHistoricRepository
let coursesRepository: InMemoryCoursesRepository
let sut: CreateHistoricUseCase

describe(('Create Historic Use Case'), () => {
  beforeEach(() => {
    courseHistoricRepository = new InMemoryCourseHistoricRepository()
    coursesRepository = new InMemoryCoursesRepository()
    sut = new CreateHistoricUseCase(courseHistoricRepository, coursesRepository)
  })

  it ('should not be able to create historic if the course not exist', async () => {
    const result = await sut.execute({ courseId: 'not-found', className: '', finishDate: new Date(), startDate: new Date() })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create historic if the course not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ courseId: course.id.toValue(), className: '', finishDate: new Date(2023), startDate: new Date() })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should be able to create historic', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ courseId: course.id.toValue(), className: '', startDate: new Date(), finishDate: new Date(2025, 2, 2) })

    expect(result.isRight()).toBe(true)
    expect(courseHistoricRepository.items[0].id).toBeTruthy()
  })
})