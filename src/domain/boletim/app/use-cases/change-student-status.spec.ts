import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { ChangeStudentStatusUseCase } from "./change-student-status.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeStudentCourse } from "test/factories/make-student-course.ts";

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let studentsRepository: InMemoryStudentsRepository
let sut: ChangeStudentStatusUseCase

describe('Change Student Status Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
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
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    sut = new ChangeStudentStatusUseCase(
      studentsRepository,
      coursesRepository,
      studentsCoursesRepository
    )
  })

  it ('should not be able to change student status if access is student', async () => {
    const result = await sut.execute({ id: 'not-found', courseId: '', status: false, role: 'student' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to change status if course does not exist', async () => {
    const result = await sut.execute({ id: '', courseId: 'not-found', status: false, role: 'manager' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to change status if student does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ id: 'not-found', courseId: course.id.toValue(), status: false, role: 'manager' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to change student status', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const student = makeStudent()
    studentsRepository.create(student)

    const studentCourse = makeStudentCourse({
      studentId: student.id,
      courseId: course.id,
    })
    studentsCoursesRepository.create(studentCourse)

    const result = await sut.execute({ id: student.id.toValue(), courseId: course.id.toValue(), status: false, role: 'manager' })

    expect(result.isRight()).toBe(true)
    expect(studentsCoursesRepository.items[0].isActive).toBe(false)
  })
})