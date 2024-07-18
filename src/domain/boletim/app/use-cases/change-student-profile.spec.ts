import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ChangeStudentProfileUseCase } from "./change-student-profile.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let coursesRepository: InMemoryCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let studentsRepository: InMemoryStudentsRepository
let sut: ChangeStudentProfileUseCase

describe('Change Student Profile Use Case', () => {
  beforeEach (() => {
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    coursesRepository = new InMemoryCoursesRepository()
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      polesRepository
    )
    polesRepository = new InMemoryPolesRepository()

    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    
    sut = new ChangeStudentProfileUseCase(
      studentsRepository
    )
  })

  it ('should not be able to change student profile does not exist', async () => {
    const result = await sut.execute({
      id: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to change student profile', async () => {
    const nameOrError = Name.create('John Doe')
    if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

    const student = makeStudent({ username: nameOrError.value })
    studentsRepository.create(student)

    expect(studentsRepository.items[0].username.value).toEqual('John Doe')

    const result = await sut.execute({
      id: student.id.toValue(),
      username: 'Josh Ned'
    })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items[0].username.value).toEqual('Josh Ned')
  })
})