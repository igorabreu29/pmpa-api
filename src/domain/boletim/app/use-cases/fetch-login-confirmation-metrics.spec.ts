import { InMemoryCoursesPolesRepository } from "test/repositories/in-memory-courses-poles-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { FetchLoginConfirmationMetrics } from "./fetch-login-confirmation-metrics.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { makePole } from "test/factories/make-pole.ts";
import { makeCoursePole } from "test/factories/make-course-pole.ts";
import { makeStudentPole } from "test/factories/make-student-pole.ts";
import { makeStudentCourse } from "test/factories/make-student-course.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

let studentsRepository: InMemoryStudentsRepository
let coursesRepository: InMemoryCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let coursesPolesRepository: InMemoryCoursesPolesRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository

let sut: FetchLoginConfirmationMetrics

describe('Fetch Login Confirmation Metrics', () => {
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
      polesRepository
    )
    polesRepository = new InMemoryPolesRepository()

    coursesPolesRepository = new InMemoryCoursesPolesRepository(
      polesRepository
    )
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    sut = new FetchLoginConfirmationMetrics(
      coursesRepository,
      coursesPolesRepository,
      studentsCoursesRepository
    )
  })

  it ('should not be able to fetch login confirmation metrics if the course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to fetch login confirmation metrics', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole1 = makePole()
    const pole2 = makePole()
    polesRepository.createMany([pole1, pole2])

    const coursePole1 = makeCoursePole({ courseId: course.id, poleId: pole1.id })
    const coursePole2 = makeCoursePole({ courseId: course.id, poleId: pole2.id })
    coursesPolesRepository.createMany([coursePole1, coursePole2])

    const student1 = makeStudent()
    const student2 = makeStudent()
    const student3 = makeStudent({ isLoginConfirmed: true })
    studentsRepository.createMany([student1, student2, student3])

    const studentCourse1 = makeStudentCourse({ studentId: student1.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student2.id, courseId: course.id })
    const studentCourse3 = makeStudentCourse({ studentId: student3.id, courseId: course.id })
    studentsCoursesRepository.createMany([studentCourse1, studentCourse2, studentCourse3])

    const studentPole1 = makeStudentPole({ studentId: studentCourse1.id, poleId: pole1.id }) 
    const studentPole2 = makeStudentPole({ studentId: studentCourse2.id, poleId: pole2.id })
    const studentPole3 = makeStudentPole({ studentId: studentCourse3.id, poleId: pole2.id })
    studentsPolesRepository.createMany([studentPole1, studentPole2, studentPole3])  

    const result = await sut.execute({ courseId: course.id.toValue() })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      studentsMetricsByPole: [
        {
          poleId: pole1.id,
          pole: pole1.name.value,
          metrics: {
            totalConfirmedSize: 0,
            totalNotConfirmedSize: 1
          }
        },
        {
          poleId: pole2.id,
          pole: pole2.name.value,
          metrics: {
            totalConfirmedSize: 1,
            totalNotConfirmedSize: 1
          }
        },
      ]
    })
  })
})