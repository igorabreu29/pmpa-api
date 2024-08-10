import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { SearchStudentCourseDetailsUseCase } from './search-student-course-details.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeStudentPole } from 'test/factories/make-student-pole.ts'
import { Name } from '../../enterprise/entities/value-objects/name.ts'

let studentsRepository: InMemoryStudentsRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let coursesRepository: InMemoryCoursesRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let sut: SearchStudentCourseDetailsUseCase

describe('Search Student Courses Details Use Case', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )
    polesRepository = new InMemoryPolesRepository()

    coursesRepository = new InMemoryCoursesRepository()
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    sut = new SearchStudentCourseDetailsUseCase(
      coursesRepository,
      studentsCoursesRepository
    )
  })

  it ('should not be able to search students if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found',
      page: 1,
      query: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to search students', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const studentNameOrError = Name.create('John Doe')
    const studentNameOrError2 = Name.create('Jony Doe')
    const studentNameOrError3 = Name.create('Bryan Adams')

    if (studentNameOrError.isLeft()) return
    if (studentNameOrError2.isLeft()) return
    if (studentNameOrError3.isLeft()) return

    const student = makeStudent({ username: studentNameOrError.value })
    const student2 = makeStudent({ username: studentNameOrError2.value })
    const student3 = makeStudent({ username: studentNameOrError3.value })
    studentsRepository.createMany([student, student2, student3])

    const studentCourse = makeStudentCourse({ studentId: student.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student2.id, courseId: course.id })
    const studentCourse3 = makeStudentCourse({ studentId: student3.id, courseId: course.id })
    studentsCoursesRepository.createMany([studentCourse, studentCourse2, studentCourse3])

    const studentPole = makeStudentPole({ studentId: studentCourse.id, poleId: pole.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse2.id, poleId: pole.id })
    const studentPole3 = makeStudentPole({ studentId: studentCourse3.id, poleId: pole.id })
    studentsPolesRepository.createMany([studentPole, studentPole2, studentPole3])

    const result = await sut.execute({
      courseId: course.id.toValue(),
      page: 1,
      query: 'doe'
    })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items).toHaveLength(3)
    expect(result.value).toMatchObject({
      students: [
        {
          username: 'John Doe'
        },
        {
          username: 'Jony Doe'
        }
      ]
    })
  })

  it ('should be able to paginated search students', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const letters = [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'
    ]

    for (let i = 0; i < 12; i++) {
      const studentNameOrError = Name.create(`john-${letters[i]}`)
      if (studentNameOrError.isLeft()) return

      const student = makeStudent({ username: studentNameOrError.value })
      studentsRepository.create(student)
  
      const studentCourse = makeStudentCourse({ studentId: student.id, courseId: course.id })
      studentsCoursesRepository.create(studentCourse)
  
      const studentPole = makeStudentPole({ studentId: studentCourse.id, poleId: pole.id })
      studentsPolesRepository.create(studentPole)
    }

    const result = await sut.execute({
      courseId: course.id.toValue(),
      page: 2,
      query: 'john'
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      pages: 2,
      totalItems: 12,
      students: [
        {
          username: 'john-k'
        },
        {
          username: 'john-l'
        }
      ]
    })
  })
})