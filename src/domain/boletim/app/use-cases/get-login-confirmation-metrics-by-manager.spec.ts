import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { makePole } from "test/factories/make-pole.ts";
import { makeStudentPole } from "test/factories/make-student-pole.ts";
import { makeStudentCourse } from "test/factories/make-student-course.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts";
import { InMemoryManagersPolesRepository } from "test/repositories/in-memory-managers-poles-repository.ts";
import { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import { GetLoginConfirmationMetricsByManager } from "./get-login-confirmation-metrics-by-manager.ts";
import { makeManager } from "test/factories/make-manager.ts";
import { makeManagerCourse } from "test/factories/make-manager-course.ts";
import { makeManagerPole } from "test/factories/make-manager-pole.ts";

let studentsRepository: InMemoryStudentsRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let polesRepository: InMemoryPolesRepository
let managersRepository: InMemoryManagersRepository
let managersPolesRepository: InMemoryManagersPolesRepository

let coursesRepository: InMemoryCoursesRepository
let managersCoursesRepository: InMemoryManagersCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository

let sut: GetLoginConfirmationMetricsByManager

describe('Fetch Login Confirmation Metrics By Manager', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
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
    polesRepository = new InMemoryPolesRepository()
    managersRepository = new InMemoryManagersRepository(
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    managersPolesRepository = new InMemoryManagersPolesRepository()

    coursesRepository = new InMemoryCoursesRepository()
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

    sut = new GetLoginConfirmationMetricsByManager(
      coursesRepository,
      managersCoursesRepository,
      studentsPolesRepository
    )
  })

  it ('should not be able to fetch login confirmation metrics if the course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found',
      managerId: ''
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to fetch login confirmation metrics by manager', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const manager = makeManager()
    managersRepository.create(manager)

    const managerCourse = makeManagerCourse({ managerId: manager.id, courseId: course.id })
    managersCoursesRepository.create(managerCourse)

    const managerPole = makeManagerPole({ managerId: managerCourse.id, poleId: pole.id })
    managersPolesRepository.create(managerPole)
    
    const student1 = makeStudent()
    const student2 = makeStudent()
    const student3 = makeStudent({ isLoginConfirmed: true })
    studentsRepository.createMany([student1, student2, student3])

    const studentCourse1 = makeStudentCourse({ studentId: student1.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student2.id, courseId: course.id })
    const studentCourse3 = makeStudentCourse({ studentId: student3.id, courseId: course.id })
    studentsCoursesRepository.createMany([studentCourse1, studentCourse2, studentCourse3])

    const studentPole = makeStudentPole({ studentId: studentCourse1.id, poleId: pole.id }) 
    const studentPole2 = makeStudentPole({ studentId: studentCourse2.id, poleId: pole.id })
    const studentPole3 = makeStudentPole({ studentId: studentCourse3.id, poleId: pole.id })
    studentsPolesRepository.createMany([studentPole, studentPole2, studentPole3])  

    const result = await sut.execute({ courseId: course.id.toValue(), managerId: manager.id.toValue() })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      studentsMetricsByPole: {
        poleId: pole.id,
        pole: pole.name.value,
        metrics: {
          totalConfirmedSize: 1,
          totalNotConfirmedSize: 2
        }
      },
    })
  })
})