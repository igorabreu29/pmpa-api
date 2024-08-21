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
import { FetchCourseStudentsByPole } from "./fetch-course-students-by-pole.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let studentsRepository: InMemoryStudentsRepository
let sut: FetchCourseStudentsByPole

describe(('Fetch Course Students By Pole Use Case'), () => {
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
      polesRepository,
    )
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )
    
    sut = new FetchCourseStudentsByPole(coursesRepository, polesRepository, studentsPolesRepository)
  })

  it ('should not be able to fetch course students if course does not exist', async () => {
    const result = await sut.execute({ courseId: 'not-found', poleId: 'not-exist', page: 1, perPage: 0})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to fetch course students if pole does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ courseId: course.id.toValue(), poleId: 'not-exist', page: 1, perPage: 0})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to fetch course students', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const pole2 = makePole()
    polesRepository.create(pole2)

    const nameOrError = Name.create('John')
    const nameOrError2 = Name.create('Jonas')
    const nameOrError3 = Name.create('Levy')

    if (nameOrError.isLeft()) return
    if (nameOrError2.isLeft()) return
    if (nameOrError3.isLeft()) return

    const student1 = makeStudent({ username: nameOrError.value })
    const student2 = makeStudent({ username: nameOrError2.value })
    const student3 = makeStudent({ username: nameOrError3.value })
    studentsRepository.create(student1)
    studentsRepository.create(student2)
    studentsRepository.create(student3)

    const studentCourse1 = makeStudentCourse({ courseId: course.id, studentId: student1.id })
    const studentCourse2 = makeStudentCourse({ courseId: course.id, studentId: student2.id })
    const studentCourse3 = makeStudentCourse({ courseId: course.id, studentId: student3.id })
    studentsCoursesRepository.create(studentCourse1)
    studentsCoursesRepository.create(studentCourse2)
    studentsCoursesRepository.create(studentCourse3)

    const studentPole1 = makeStudentPole({ studentId: studentCourse1.id, poleId: pole.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse2.id, poleId: pole.id })
    const studentPole3 = makeStudentPole({ studentId: studentCourse3.id, poleId: pole2.id })
    studentsPolesRepository.create(studentPole1)
    studentsPolesRepository.create(studentPole2)
    studentsPolesRepository.create(studentPole3)

    const result = await sut.execute({ courseId: course.id.toValue(), poleId: pole.id.toValue(), page: 1, perPage: 6, username: 'Jo' })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items).toHaveLength(3)
    expect(result.value).toMatchObject({
      students: {
        courseId: course.id,
        course: course.name,
        studentsPole: [
          {
            username: student1.username.value,
            poleId: pole.id,
            pole: pole.name.value
          },
          {
            username: student2.username.value,
            poleId: pole.id,
            pole: pole.name.value
          },
        ]
      }
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

    const result = await sut.execute({ courseId: course.id.toValue(), poleId: pole.id.toValue(), page: 2, perPage: 6 })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      pages: 2,
      totalItems: 8
    })
  })
})