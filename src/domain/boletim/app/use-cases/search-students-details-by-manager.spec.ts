import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeManagerCourse } from 'test/factories/make-manager-course.ts'
import { makeManagerPole } from 'test/factories/make-manager-pole.ts'
import { makeManager } from 'test/factories/make-manager.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makeStudentPole } from 'test/factories/make-student-pole.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryManagersCoursesRepository } from 'test/repositories/in-memory-managers-courses-repository.ts'
import { InMemoryManagersPolesRepository } from 'test/repositories/in-memory-managers-poles-repository.ts'
import { InMemoryManagersRepository } from 'test/repositories/in-memory-managers-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { beforeEach, describe, expect, it } from 'vitest'
import { Name } from '../../enterprise/entities/value-objects/name.ts'
import { SearchStudentsDetailsManagerUseCase } from './search-students-details-by-manager.ts'

let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let managersRepository: InMemoryManagersRepository
let studentsRepository: InMemoryStudentsRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository

let managersCoursesRepository: InMemoryManagersCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository

let sut: SearchStudentsDetailsManagerUseCase

describe('Search Students Details By Manager Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
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

    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    managersPolesRepository = new InMemoryManagersPolesRepository()

    managersRepository = new InMemoryManagersRepository(
      managersCoursesRepository,
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

    sut = new SearchStudentsDetailsManagerUseCase(
      // managersCoursesRepository,
      // managersPolesRepository,
      managersRepository,
      studentsPolesRepository,
    )
  })

  it ('should not be able to search students if manager does not exist', async () => {
    const result = await sut.execute({
      managerId: 'not-found',
      page: 1,
      query: ''
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to search students', async () => {
    const course = makeCourse()
    const course2 = makeCourse()
    coursesRepository.create(course)
    coursesRepository.create(course2)

    const pole = makePole()
    const pole2 = makePole()
    polesRepository.createMany([pole, pole2])

    const manager = makeManager()
    managersRepository.create(manager)

    const managerCourse = makeManagerCourse({ courseId: course.id, managerId: manager.id })
    const managerCourse2 = makeManagerCourse({ courseId: course2.id, managerId: manager.id })
    managersCoursesRepository.create(managerCourse)
    managersCoursesRepository.create(managerCourse2)

    const managerPole = makeManagerPole({ managerId: managerCourse.id, poleId: pole.id })
    const managerPole2 = makeManagerPole({ managerId: managerCourse2.id, poleId: pole2.id })
    managersPolesRepository.create(managerPole)
    managersPolesRepository.create(managerPole2)

    const nameOrError = Name.create('John Doe')
    const nameOrError2 = Name.create('Bryan Adams')
    if (nameOrError.isLeft()) return
    if (nameOrError2.isLeft()) return

    const student = makeStudent({ username: nameOrError.value })
    const student2 = makeStudent({ username: nameOrError2.value })
    studentsRepository.createMany([student, student2])

    const studentCourse = makeStudentCourse({ studentId: student.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student.id, courseId: course2.id })
    const studentCourse3 = makeStudentCourse({ studentId: student2.id, courseId: course.id })
    const studentCourse4 = makeStudentCourse({ studentId: student2.id, courseId: course2.id })
    studentsCoursesRepository.createMany([studentCourse, studentCourse2, studentCourse3, studentCourse4])

    const studentPole = makeStudentPole({ studentId: studentCourse.id, poleId: pole.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse2.id, poleId: pole2.id })
    const studentPole3 = makeStudentPole({ studentId: studentCourse3.id, poleId: pole.id })
    const studentPole4 = makeStudentPole({ studentId: studentCourse4.id, poleId: pole2.id })
    studentsPolesRepository.createMany([studentPole, studentPole2, studentPole3, studentPole4])

    const result = await sut.execute({
      managerId: manager.id.toValue(),
      page: 1,
      query: 'Doe'
    })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      students: [
        {
          studentsByPole: [
            {
              username: 'John Doe',
              pole: pole.name.value
            }
          ]
        },
        {
          studentsByPole: [
            {
              username: 'John Doe',
              pole: pole2.name.value
            }
          ],
        },
      ]
    })
  })
})