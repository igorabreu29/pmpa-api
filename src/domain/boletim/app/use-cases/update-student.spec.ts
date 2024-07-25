import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateStudentUseCase } from './update-student.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { NotAllowedError } from '@/core/errors/use-case/not-allowed-error.ts'
import { Name } from '../../enterprise/entities/value-objects/name.ts'

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let coursesRepository: InMemoryCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let studentsRepository: InMemoryStudentsRepository
let sut: UpdateStudentUseCase

describe('Update Student Use Case', () => { 
  beforeEach(() => {
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
    sut = new UpdateStudentUseCase (
      studentsRepository
    )
  })

  it ('should not be able to update a student that does not exist', async () => {
    const result = await sut.execute({ id: 'not-found', role: '', username: '', userId: '', userIp: '' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to update a student if role to be student', async () => {
    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({ id: student.id.toValue(), role: 'student', username: '', userId: '', userIp: '' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should be able to update a student', async () => {
    const nameOrError = Name.create('John Doe')
    if (nameOrError.isLeft()) return
    
    const student = makeStudent({ username: nameOrError.value, civilId: 1234567 })
    studentsRepository.create(student)

    const result = await sut.execute({ id: student.id.toValue(), role: 'manager', username: 'Josh Ned', civilId: 2345678, userId: '', userIp: '' })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items[0].username.value).toEqual('Josh Ned')
    expect(studentsRepository.items[0].civilId).toEqual(2345678)
  })
})