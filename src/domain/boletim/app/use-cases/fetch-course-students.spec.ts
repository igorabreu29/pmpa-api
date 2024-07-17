import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { makePole } from "test/factories/make-pole.ts";
import { FetchCourseStudentsUseCase } from "./fetch-course-students.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { makeStudentCourse } from "test/factories/make-student-course.ts";
import { makeStudentPole } from "test/factories/make-student-pole.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let studentsRepository: InMemoryStudentsRepository
let sut: FetchCourseStudentsUseCase

describe(('Fetch Course Students Use Case'), () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    
    coursesRepository = new InMemoryCoursesRepository()
    studentsPolesRepository = new InMemoryStudentsPolesRepository()
    polesRepository = new InMemoryPolesRepository()
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository (
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    sut = new FetchCourseStudentsUseCase(coursesRepository, studentsCoursesRepository)
  })

  it ('should not be able to fetch course students if course does not exist', async () => {
    const result = await sut.execute({ courseId: 'not-found', page: 1, perPage: 0})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to fetch course users', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole1 = makePole()
    const pole2 = makePole()
    const pole3 = makePole()
    polesRepository.createMany([pole1, pole2, pole3])

    const student1 = makeStudent()
    const student2 = makeStudent()
    const student3 = makeStudent()
    studentsRepository.create(student1)
    studentsRepository.create(student2)
    studentsRepository.create(student3)
    
    const studentCourse1 = makeStudentCourse({ courseId: course.id, studentId: student1.id })
    const studentCourse2 = makeStudentCourse({ courseId: course.id, studentId: student2.id })
    const studentCourse3 = makeStudentCourse({ courseId: course.id, studentId: student3.id })

    studentsCoursesRepository.create(studentCourse1)
    studentsCoursesRepository.create(studentCourse2)
    studentsCoursesRepository.create(studentCourse3)

    const studentPole1 = makeStudentPole({ poleId: pole1.id, studentId: studentCourse1.id })
    const studentPole2 = makeStudentPole({ poleId: pole2.id, studentId: studentCourse2.id })
    const studentPole3 = makeStudentPole({ poleId: pole3.id, studentId: studentCourse3.id })

    studentsPolesRepository.create(studentPole1)
    studentsPolesRepository.create(studentPole2)
    studentsPolesRepository.create(studentPole3)

    const result = await sut.execute({ courseId: course.id.toValue(), page: 1, perPage: 6 })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items).toHaveLength(3)
    expect(result.value).toMatchObject({
      students: [
        {
          username: student1.username.value,
          courseId: course.id,
          course: course.name.value,
          poleId: pole1.id,
          pole: pole1.name.value
        },
        {
          username: student2.username.value,
          courseId: course.id,
          course: course.name.value,
          poleId: pole2.id,
          pole: pole2.name.value
        },
        {
          username: student3.username.value,
          courseId: course.id,
          course: course.name.value,
          poleId: pole3.id,
          pole: pole3.name.value
        },
      ]
    })
  })

  it ('should be able to paginated course students', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    for (let i = 1; i <= 8; i++) {
      const student = makeStudent()
      const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
      const studentPole = makeStudentPole({ studentId: studentCourse.id, poleId: pole.id })
      studentsRepository.create(student)
      studentsCoursesRepository.create(studentCourse)
      studentsPolesRepository.create(studentPole)
    }

    const result = await sut.execute({ courseId: course.id.toValue(), page: 2, perPage: 6 })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      pages: 2,
      totalItems: 8
    })
  })
})