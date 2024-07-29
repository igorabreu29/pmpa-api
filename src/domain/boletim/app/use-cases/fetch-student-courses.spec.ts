import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { FetchStudentCoursesUseCase } from './fetch-student-courses.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makeStudent } from 'test/factories/make-student.ts'

let studentsRepository: InMemoryStudentsRepository
let coursesRepository: InMemoryCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let sut: FetchStudentCoursesUseCase

describe('Fetch Student Courses Use Case', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
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
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository (
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    sut = new FetchStudentCoursesUseCase(
      studentsRepository,
      studentsCoursesRepository
    )
  })

  it ('should not be able to fetch student courses if course does not exist.', async () => {
    const result = await sut.execute({
      studentId: 'not-found',
      page: 1,
      perPage: 0
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to fetch student courses', async () => {
    const student = makeStudent()
    studentsRepository.create(student)

    const course1 = makeCourse()
    const course2 = makeCourse()
    coursesRepository.create(course1)
    coursesRepository.create(course2)

    const studentCourse1 = makeStudentCourse({ studentId: student.id, courseId: course1.id })
    const studentCourse2 = makeStudentCourse({ studentId: student.id, courseId: course2.id })
    studentsCoursesRepository.create(studentCourse1)
    studentsCoursesRepository.create(studentCourse2)

    const result = await sut.execute({
      studentId: student.id.toValue(),
      page: 1,
      perPage: 6
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      courses: [
        {
          studentId: student.id,
          courseId: course1.id,
          course: course1.name.value,
        },
        {
          studentId: student.id,
          courseId: course2.id,
          course: course2.name.value,
        },
      ]
    })
  })

  it ('should be able to paginated student courses', async () => {
    const student = makeStudent()
    studentsRepository.create(student)

    for (let i = 1; i <= 8; i++) {
      const course = makeCourse()
      const studentCourse = makeStudentCourse({ studentId: student.id, courseId: course.id })
      coursesRepository.create(course)
      studentsCoursesRepository.create(studentCourse)
    }

    const result = await sut.execute({ studentId: student.id.toValue(), page: 2, perPage: 6 })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      pages: 2,
      totalItems: 8
    })
  })
})