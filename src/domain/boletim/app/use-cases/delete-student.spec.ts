import { NotAllowedError } from '@/core/errors/use-case/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { beforeEach, describe, expect, it } from 'vitest'
import { makeStudent } from 'test/factories/make-student.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'
import { makeStudentPole } from 'test/factories/make-student-pole.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { DeleteStudentUseCase } from './delete-student.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let coursesRepository: InMemoryCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let studentsRepository: InMemoryStudentsRepository
let sut: DeleteStudentUseCase

describe('Delete Student Use Case', () => { 
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
      coursesRepository,
      polesRepository
    )
    polesRepository = new InMemoryPolesRepository()

    studentsRepository = new InMemoryStudentsRepository (
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    sut = new DeleteStudentUseCase (
      studentsRepository
    )
  })

  it ('should not be able to delete a student if access is student', async () => {
    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({ id: student.id.toValue(), role: 'student', userId: '', userIp: '' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to delete a student that does not exist', async () => {
    const result = await sut.execute({ id: 'not-found', role: '', userId: '', userIp: ''})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to delete a student', async () => {
    const student1 = makeStudent()
    studentsRepository.create(student1)

    const student2 = makeStudent()
    studentsRepository.create(student2)

    const studentCourse1 = makeStudentCourse({
      courseId: new UniqueEntityId('course-1'),
      studentId: student1.id
    })
    studentsCoursesRepository.create(studentCourse1)
    
    const studentCourse2 = makeStudentCourse({
      courseId: new UniqueEntityId('course-2'),
      studentId: student1.id
    })
    studentsCoursesRepository.create(studentCourse2)

    const studentCourse3 = makeStudentCourse({
      courseId: new UniqueEntityId('course-2'),
      studentId: student2.id
    })
    studentsCoursesRepository.create(studentCourse3)

    const studentPole1 = makeStudentPole({
      poleId: new UniqueEntityId('course-1'),
      studentId: studentCourse1.id
    })
    studentsPolesRepository.create(studentPole1)
    
    const studentPole2 = makeStudentPole({
      poleId: new UniqueEntityId('course-2'),
      studentId: studentCourse2.id
    })
    studentsPolesRepository.create(studentPole2)

    const result = await sut.execute({ id: student1.id.toValue(), role: 'admin', userId: '', userIp: '' })

    expect(result.isRight()).toBe(true)
    expect(studentsCoursesRepository.items).toHaveLength(1)
    expect(studentsPolesRepository.items).toHaveLength(0)
    expect(studentsRepository.items).toHaveLength(1)
  })
})