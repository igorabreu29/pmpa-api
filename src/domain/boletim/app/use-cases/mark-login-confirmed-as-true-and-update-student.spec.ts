import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { MarkLoginConfirmedAsTrueAndUpdateStudent } from "./mark-login-confirmed-as-true-and-update-student.ts";

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let coursesRepository: InMemoryCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let studentsRepository: InMemoryStudentsRepository
let sut: MarkLoginConfirmedAsTrueAndUpdateStudent

const data = {
  militaryID: 2020,
  county: 'fake-county',
  state: 'fake-state',
  email: 'fake-email',
  motherName: 'fake-mother',
  studentIp: 'fake-ip'
}

describe('Login Confirmation By Student Use Case', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository (
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    sut = new MarkLoginConfirmedAsTrueAndUpdateStudent(studentsRepository)
  })
  
  it ('should not be able to confirm login student does not exist', async () => {
    const result = await sut.execute({ 
      ...data,
      studentCPF: 'not-found',
      
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to complete login confirmation', async () => {
    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({
      ...data,
      studentCPF: student.cpf.value
    })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items[0].isLoginConfirmed).toBe(true)
  })
})