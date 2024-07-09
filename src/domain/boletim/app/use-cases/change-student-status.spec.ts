import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { ChangeStudentStatusUseCase } from "./change-student-status.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { InMemoryCoursesPolesRepository } from "test/repositories/in-memory-courses-poles-repository.ts";

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let coursesPolesRepository: InMemoryCoursesPolesRepository
let studentsRepository: InMemoryStudentsRepository
let sut: ChangeStudentStatusUseCase

describe('Change Student Status Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    coursesPolesRepository = new InMemoryCoursesPolesRepository()
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      coursesRepository
    )
    studentsPolesRepository = new InMemoryStudentsPolesRepository()
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      coursesPolesRepository,
      studentsPolesRepository,
      polesRepository
    )
    sut = new ChangeStudentStatusUseCase(studentsRepository)
  })

  it ('should not be able to change status if user not exist', async () => {
    const result = await sut.execute({ id: 'not-found', status: false })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to change student status', async () => {
  const student = makeStudent()
  studentsRepository.create(student)

  const result = await sut.execute({ id: student.id.toValue(), status: false })

  expect(result.isRight()).toBe(true)
  expect(studentsRepository.items[0].active).toBe(false)
  })
})