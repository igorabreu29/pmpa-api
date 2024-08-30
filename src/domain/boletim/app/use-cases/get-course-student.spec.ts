import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { makePole } from "test/factories/make-pole.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { makeStudentCourse } from "test/factories/make-student-course.ts";
import { makeStudentPole } from "test/factories/make-student-pole.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { GetCourseStudentUseCase } from "./get-course-student.ts";

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let studentsRepository: InMemoryStudentsRepository
let sut: GetCourseStudentUseCase

describe(('Get Course Student Use Case'), () => {
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

    sut = new GetCourseStudentUseCase(coursesRepository, studentsCoursesRepository)
  })

  it ('should not be able to get course students if course does not exist', async () => {
    const result = await sut.execute({ courseId: 'not-found', id: ''})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to get course students if student is not present in the course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ courseId: course.id.toValue(), id: 'not-found'})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get course student', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const student = makeStudent()
    studentsRepository.create(student)
    
    const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
    const studentPole = makeStudentPole({ poleId: pole.id, studentId: studentCourse.id })
    studentsCoursesRepository.create(studentCourse)
    studentsPolesRepository.create(studentPole)

    const result = await sut.execute({ courseId: course.id.toValue(), id: student.id.toValue() })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      student: {
        studentId: student.id,
        username: student.username.value,
        course: course.name.value,
        courseId: course.id,
        pole: pole.name.value,
        poleId: pole.id,
      }
    })
  })
})