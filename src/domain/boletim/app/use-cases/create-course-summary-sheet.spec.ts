import { InMemoryCoursesDisciplinesRepository } from "test/repositories/in-memory-courses-disciplines-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { FakeSheeter } from "test/sheet/fake-sheeter.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeCourseDiscipline } from "test/factories/make-course-discipline.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { CreateCourseSummarySheetUseCase } from "./create-course-summary-sheet.ts";

let disciplinesRepository: InMemoryDisciplinesRepository

let coursesRepository: InMemoryCoursesRepository
let courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository
let sheeter: FakeSheeter

let sut: CreateCourseSummarySheetUseCase

describe('Get Course Summary Use Case', () => {
  beforeEach(() => {
    disciplinesRepository = new InMemoryDisciplinesRepository()

    coursesRepository = new InMemoryCoursesRepository()
    courseDisciplinesRepository = new InMemoryCoursesDisciplinesRepository(
      disciplinesRepository
    )
    sheeter = new FakeSheeter()

    sut = new CreateCourseSummarySheetUseCase(
      coursesRepository,
      courseDisciplinesRepository,
      sheeter
    )
  })
  
  it ('should not be able to get course summary', async () => {
    const result = await sut.execute({
      courseId: 'not-found'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get course summary', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    const discipline2 = makeDiscipline()
    disciplinesRepository.createMany([discipline, discipline2])

    const courseDiscipline = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline.id })
    const courseDiscipline2 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline2.id })
    courseDisciplinesRepository.createMany([courseDiscipline, courseDiscipline2])

    const result = await sut.execute({
      courseId: course.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      filename: `${course.name.value} - Ementas.xlsx`
    })
  })
})