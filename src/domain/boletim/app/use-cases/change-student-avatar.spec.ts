import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ChangeStudentAvatarUseCase } from "./change-student-avatar.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import type { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import type { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import type { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";

let studentCoursesRepository: InMemoryStudentsCoursesRepository
let studentPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository

let studentsRepository: InMemoryStudentsRepository
let sut: ChangeStudentAvatarUseCase

describe('Create Attachment Use Case', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository(
      studentCoursesRepository,
      coursesRepository,
      studentPolesRepository,
      polesRepository
    )
    sut = new ChangeStudentAvatarUseCase (
      studentsRepository
    )
  })

  it ('should not be able to change avatar if student does not exist', async () => {
    const fileLink = 'http://localhost:3333/faker.jpeg'

    const result = await sut.execute({
      id: 'not-found',
      fileLink,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to change avatar', async () => {
    const student = makeStudent({
      avatarUrl: 'http://localhost:3333/fake.jpeg'
    })
    studentsRepository.create(student)

    const fileLink = 'http://localhost:3333/faker.jpeg'

    const result = await sut.execute({
      id: student.id.toValue(),
      fileLink,
    })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items[0].avatarUrl).toEqual(fileLink)
  })
})