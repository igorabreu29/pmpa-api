import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { SearchStudentPoleDetailsUseCase } from './search-student-pole-details.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { Name } from '../../enterprise/entities/value-objects/name.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makeStudentPole } from 'test/factories/make-student-pole.ts'

let studentsRepository: InMemoryStudentsRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository

let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository

let sut: SearchStudentPoleDetailsUseCase

describe('Search Student Pole Details', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository (
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository (
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )

    sut = new SearchStudentPoleDetailsUseCase (
      coursesRepository,
      polesRepository,
      studentsPolesRepository
    )
  })

  it ('should not be able to search students if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found',
      poleId: '',
      page: 1,
      query: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to search students if pole does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: 'not-found',
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
    const pole2 = makePole()
    polesRepository.createMany([pole, pole2])

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
    const studentPole3 = makeStudentPole({ studentId: studentCourse3.id, poleId: pole2.id })
    studentsPolesRepository.createMany([studentPole, studentPole2, studentPole3])

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole2.id.toValue(),
      page: 1,
      query: 'adams'
    })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items).toHaveLength(3)
    expect(result.value).toMatchObject({
      students: [
        {
          username: 'Bryan Adams'
        }
      ]
    })
  })

  it ('should be able to paginated search students', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    for (let i = 1; i <= 12; i++) {
      const studentNameOrError = Name.create(`john-${i}`)
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
      poleId: pole.id.toValue(),
      page: 2,
      query: 'john'
    })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items).toHaveLength(12)
    expect(result.value).toMatchObject({
      students: [
        {
          username: 'john-11'
        },
        {
          username: 'john-12'
        }
      ]
    })
  })
})