import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "test/factories/make-user.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { ChangeStudentStatusUseCase } from "./change-student-status.ts";
import { makeStudent } from "test/factories/make-student.ts";

let studentsRepository: InMemoryStudentsRepository
let sut: ChangeStudentStatusUseCase

describe('Change User Status Use Case', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository()
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