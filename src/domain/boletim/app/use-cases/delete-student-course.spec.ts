import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts"
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts"
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts"
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts"
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts"
import { DeleteStudentCourseUseCase } from "./delete-student-course.ts"
import { beforeEach, describe, expect, it } from "vitest"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { makeCourse } from "test/factories/make-course.ts"
import { makeStudent } from "test/factories/make-student.ts"
import { makeStudentCourse } from "test/factories/make-student-course.ts"

let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let coursesRepository: InMemoryCoursesRepository
let studentsRepository: InMemoryStudentsRepository
let studentCoursesRepository: InMemoryStudentsCoursesRepository
let sut: DeleteStudentCourseUseCase

describe('Delete Student Course Use Case', () => {
  beforeEach(() => {
    polesRepository = new InMemoryPolesRepository()
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentCoursesRepository,
      coursesRepository,
      polesRepository
    )
    coursesRepository = new InMemoryCoursesRepository()
    studentsRepository = new InMemoryStudentsRepository (
      studentCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    studentCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    sut = new DeleteStudentCourseUseCase(
      coursesRepository,
      studentsRepository,
      studentCoursesRepository
    )
  })

  it ('should receive instance of "Resource Not Found" error if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found',
      studentId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should receive instance of "Resource Not Found" error if student does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      studentId: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should receive instance of "Resource Not Found" error if student course does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      studentId: student.id.toValue()
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to delete student course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const student = makeStudent()
    studentsRepository.create(student)

    const studentCourse = makeStudentCourse({
      courseId: course.id,
      studentId: student.id
    })
    studentCoursesRepository.create(studentCourse)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      studentId: student.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(studentCoursesRepository.items).toHaveLength(0)
  })
})