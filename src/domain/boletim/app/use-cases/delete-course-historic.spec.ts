import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { InMemoryCourseHistoricRepository } from "test/repositories/in-memory-course-historic-repository.ts";
import { DeleteCourseHistoricUseCase } from "./delete-course-historic.ts";
import { makeCourseHistoric } from "test/factories/make-course-historic.ts";

let courseHistoricRepository: InMemoryCourseHistoricRepository
let sut: DeleteCourseHistoricUseCase

describe('Delete Course Historic Use Case', () => {
  beforeEach(() => {
    courseHistoricRepository = new InMemoryCourseHistoricRepository()
    sut = new DeleteCourseHistoricUseCase(
      courseHistoricRepository
    )
  })

  it ('should not be able to delete course historic if it does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to delete course historic', async () => {
    const courseHistoric = makeCourseHistoric()
    courseHistoricRepository.create(courseHistoric)

    const result = await sut.execute({
      courseId: courseHistoric.courseId.toValue(),
    })

    expect(result.isRight()).toBe(true)
    expect(courseHistoricRepository.items).toHaveLength(0)
  })
})