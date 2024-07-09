import { describe, it, beforeEach, expect } from 'vitest'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { CreateStudentInCourseAndPole } from './create-student-in-course-and-pole.ts'
import { FakeHasher } from 'test/cryptograpy/fake-hasher.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { ResourceAlreadyExistError } from '@/core/errors/use-case/resource-already-exist-error.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'

let studentsRepository: InMemoryStudentsRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let hasher: FakeHasher
let sut: CreateStudentInCourseAndPole

describe('Create Student In Course And Pole', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository()
    studentsPolesRepository = new InMemoryStudentsPolesRepository()
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    hasher = new FakeHasher()
    sut = new CreateStudentInCourseAndPole(
      studentsRepository,
      studentsCoursesRepository,
      studentsPolesRepository,
      coursesRepository,
      polesRepository,
      hasher
    )
  })

  it ('should not be able to create student if course not found', async () => {
    const result = await sut.execute({
      courseId: '',
      poleId: '',
      cpf: '',
      email: '',
      username: '',
      birthday: new Date(),
      civilID: 0
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create student if pole not found', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: '',
      cpf: '',
      email: '',
      username: '',
      birthday: new Date(),
      civilID: 0
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create student in course if student with same cpf already be present in course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const student = makeStudent()
    studentsRepository.create(student)

    const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
    studentsCoursesRepository.create(studentCourse)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      cpf: student.cpf,
      email: '',
      username: '',
      birthday: new Date(),
      civilID: 0
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should not be able to create student in course if student with same email already be present in course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const student = makeStudent()
    studentsRepository.create(student)

    const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
    studentsCoursesRepository.create(studentCourse)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      cpf: '',
      email: student.email,
      username: '',
      birthday: new Date(),
      civilID: 0
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create student with same cpf in course and pole', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const student = makeStudent({ birthday: new Date() })
    studentsRepository.create(student)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      cpf: student.cpf,
      email: student.email,
      username: student.username,
      birthday: student.birthday,
      civilID: 0
    })

    expect(result.isRight()).toBe(true)
    expect(studentsCoursesRepository.items).toHaveLength(1)
    expect(studentsPolesRepository.items).toHaveLength(1)
  })

  it ('should be able to create student with same email in course and pole', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const student = makeStudent({ birthday: new Date() })
    studentsRepository.create(student)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      cpf: '222.222.222-10',
      email: student.email,
      username: student.username,
      birthday: student.birthday,
      civilID: 0
    })

    expect(result.isRight()).toBe(true)
    expect(studentsCoursesRepository.items).toHaveLength(1)
    expect(studentsPolesRepository.items).toHaveLength(1)
  })

  it ('should be able to create student in course and pole', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      cpf: '222.222.222-10',
      email: 'john@example.com',
      username: 'John Doe',
      birthday: new Date('2022'),
      civilID: 44444
    })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items).toHaveLength(1)
    expect(studentsCoursesRepository.items).toHaveLength(1)
    expect(studentsPolesRepository.items).toHaveLength(1)
  })
})