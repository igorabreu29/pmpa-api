import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "test/factories/make-user.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { makeUserCourse } from "test/factories/make-user-course.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { makePole } from "test/factories/make-pole.ts";
import { makeUserPole } from "test/factories/make-user-pole.ts";
import { FetchCourseStudentsUseCase } from "./fetch-course-students.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryCoursesPolesRepository } from "test/repositories/in-memory-courses-poles-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { makeStudentCourse } from "test/factories/make-student-course.ts";
import { makeStudentPole } from "test/factories/make-student-pole.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeCoursePole } from "test/factories/make-course-pole.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { FetchCourseStudentsByPole } from "./fetch-course-students-by-pole.ts";

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let studentsRepository: InMemoryStudentsRepository
let sut: FetchCourseStudentsByPole

describe(('Fetch Course Students Per Pole Use Case'), () => {
  beforeEach(() => {
    studentsPolesRepository = new InMemoryStudentsPolesRepository()
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    studentsRepository = new InMemoryStudentsRepository ()
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository (
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository,
    )
    sut = new FetchCourseStudentsByPole(studentsCoursesRepository, coursesRepository, polesRepository)
  })

  it ('should not be able to fetch course students if course does not exist', async () => {
    const result = await sut.execute({ courseId: 'not-found', poleId: 'not-exist', role: 'manager', page: 1, perPage: 0})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to fetch course students', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    for (let i = 1; i <= 3; i++) {
      const student = makeStudent({ username: `student-${i}` })
      const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
      const studentPole = makeStudentPole({ studentId: studentCourse.id, poleId: pole.id })
      studentsRepository.create(student)
      studentsCoursesRepository.create(studentCourse)
      studentsPolesRepository.create(studentPole)
    }
    
    const result = await sut.execute({ courseId: course.id.toValue(), poleId: pole.id.toValue(), role: 'manager', page: 1, perPage: 6 })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items).toHaveLength(3)
    expect(result.value).toMatchObject({
      students: [
        {
          username: 'student-1',
          courseId: course.id,
          course: course.name,
          poleId: pole.id,
          pole: pole.name
        },
        {
          username: 'student-2',
          courseId: course.id,
          course: course.name,
          poleId: pole.id,
          pole: pole.name
        },
        {
          username: 'student-3',
          courseId: course.id,
          course: course.name,
          poleId: pole.id,
          pole: pole.name
        },
      ]
    })
  })

  it ('should be able to paginated course students', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const coursePole = makeCoursePole({ courseId: course.id, poleId: pole.id })

    for (let i = 1; i <= 8; i++) {
      const student = makeStudent({ username: `student-${i}` })
      const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
      const studentPole = makeStudentPole({ studentId: studentCourse.id, poleId: pole.id })
      studentsRepository.create(student)
      studentsCoursesRepository.create(studentCourse)
      studentsPolesRepository.create(studentPole)
    }

    const result = await sut.execute({ courseId: course.id.toValue(), poleId: pole.id.toValue(), role: 'manager', page: 2, perPage: 6 })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      pages: 2,
      totalItems: 8
    })
  })
})