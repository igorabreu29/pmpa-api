import { beforeEach, describe, expect, it } from "vitest";
import { LoginConfirmationByStudentUseCase } from "./login-confirmation-by-student.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { makeStudent } from "test/factories/make-student.ts";

let studentsRepository: InMemoryStudentsRepository
let sut: LoginConfirmationByStudentUseCase

const data = {
  birthday: new Date(),
  civilID: 2020,
  militaryID: 2020,
  county: 'fake-county',
  state: 'fake-state',
  email: 'fake-email',
}

describe('Login Confirmation By Student Use Case', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository()
    sut = new LoginConfirmationByStudentUseCase(studentsRepository)
  })
  
  it ('should not be able to login confirmation from user if he does not exist', async () => {
    const result = await sut.execute({ 
      ...data,
      studentId: 'not-found'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to complete login confirmation', async () => {
    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({
      ...data,
      studentId: student.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items[0].loginConfirmation).toBe(true)
  })
})