import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { GetStudentProfileUseCase } from "./get-student-profile.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { makeStudentCourse } from "test/factories/make-student-course.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makePole } from "test/factories/make-pole.ts";
import { makeStudentPole } from "test/factories/make-student-pole.ts";

let studentsRepository: InMemoryStudentsRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let sut: GetStudentProfileUseCase

describe('Get Student Profile Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )

    studentsCoursesRepository = new InMemoryStudentsCoursesRepository (
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    sut = new GetStudentProfileUseCase(
      studentsRepository
    )
  })

  it ('should not be able to get student profile does not exist.', async () => {
    const result = await sut.execute({
      id: 'student-not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get student profile', async () => {
    const student = makeStudent()
    studentsRepository.create(student)
    
    const course = makeCourse()
    coursesRepository.create(course)

    const studentCourse = makeStudentCourse({ studentId: student.id, courseId: course.id })
    studentsCoursesRepository.create(studentCourse)

    const pole = makePole()
    polesRepository.create(pole)

    const studentPole = makeStudentPole({ studentId: studentCourse.id, poleId: pole.id })
    studentsPolesRepository.create(studentPole)

    const result = await sut.execute({
      id: student.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      student: {
        studentId: student.id,
        username: student.username.value,
        email: student.email.value,
        poles: [
          {
            studentPoleId: studentPole.id,
            pole: {
              id: pole.id
            }
          }
        ],
        courses: [
          {
            studentCourseId: studentCourse.id,
            course: {
              id: course.id
            }
          }
        ]
      }
    })
  })
})