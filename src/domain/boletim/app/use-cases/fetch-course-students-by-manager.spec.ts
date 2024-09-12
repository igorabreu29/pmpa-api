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
import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts";
import { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import { InMemoryManagersPolesRepository } from "test/repositories/in-memory-managers-poles-repository.ts";
import { FetchCourseStudentsByManagerUseCase } from "./fetch-course-students-by-manager.ts";
import { makeManager } from "test/factories/make-manager.ts";
import { makeManagerCourse } from "test/factories/make-manager-course.ts";
import { makeManagerPole } from "test/factories/make-manager-pole.ts";

let managersRepository: InMemoryManagersRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let polesRepository: InMemoryPolesRepository


let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository

let coursesRepository: InMemoryCoursesRepository
let managersCoursesRepository: InMemoryManagersCoursesRepository
let studentsRepository: InMemoryStudentsRepository
let sut: FetchCourseStudentsByManagerUseCase

describe(('Fetch Course Students By Manager Use Case'), () => {
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

    managersRepository = new InMemoryManagersRepository(
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )

    managersPolesRepository = new InMemoryManagersPolesRepository()
    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )

    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )
    
    sut = new FetchCourseStudentsByManagerUseCase(coursesRepository, managersCoursesRepository, studentsPolesRepository)
  })

  it ('should not be able to fetch course students if course does not exist', async () => {
    const result = await sut.execute({ courseId: 'not-found', managerId: 'not-exist', page: 1, perPage: 0})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to fetch course students if manager does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ courseId: course.id.toValue(), managerId: 'not-exist', page: 1, perPage: 0})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to fetch course students', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const nameOrError = Name.create('John')
    const nameOrError2 = Name.create('Jonas')
    const nameOrError3 = Name.create('Levy')

    if (nameOrError.isLeft()) return
    if (nameOrError2.isLeft()) return
    if (nameOrError3.isLeft()) return

    const student1 = makeStudent({ username: nameOrError.value })
    const student2 = makeStudent({ username: nameOrError2.value })
    const manager = makeManager({ username: nameOrError3.value })
    studentsRepository.create(student1)
    studentsRepository.create(student2)
    managersRepository.create(manager)

    const studentCourse1 = makeStudentCourse({ courseId: course.id, studentId: student1.id })
    const studentCourse2 = makeStudentCourse({ courseId: course.id, studentId: student2.id })
    const managerCourse = makeManagerCourse({ courseId: course.id, managerId: manager.id })
    studentsCoursesRepository.create(studentCourse1)
    studentsCoursesRepository.create(studentCourse2)
    managersCoursesRepository.create(managerCourse)

    const studentPole1 = makeStudentPole({ studentId: studentCourse1.id, poleId: pole.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse2.id, poleId: pole.id })
    const managerPole = makeManagerPole({ managerId: managerCourse.id, poleId: pole.id })
    studentsPolesRepository.create(studentPole1)
    studentsPolesRepository.create(studentPole2)
    managersPolesRepository.create(managerPole)

    const result = await sut.execute({ courseId: course.id.toValue(), managerId: manager.id.toValue(), page: 1, perPage: 6, username: 'Jo' })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items).toHaveLength(2)
    expect(result.value).toMatchObject({
      studentPoles: [
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
    })
  })

  it ('should be able to paginated course students', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const manager = makeManager()
    managersRepository.create(manager)

    const managerCourse = makeManagerCourse({ courseId: course.id, managerId: manager.id })
    managersCoursesRepository.create(managerCourse)

    const managerPole = makeManagerPole({ managerId: managerCourse.id, poleId: pole.id })
    managersPolesRepository.create(managerPole)

    for (let i = 1; i <= 8; i++) {
      const student = makeStudent()
      const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
      const studentPole = makeStudentPole({ studentId: studentCourse.id, poleId: pole.id })
      studentsRepository.create(student)
      studentsCoursesRepository.create(studentCourse)
      studentsPolesRepository.create(studentPole)
    }

    const result = await sut.execute({ courseId: course.id.toValue(), managerId: manager.id.toValue(), page: 2, perPage: 6 })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      pages: 2,
      totalItems: 8
    })
  })
})