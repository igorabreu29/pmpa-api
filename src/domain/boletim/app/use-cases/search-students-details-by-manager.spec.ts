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
import { InMemorySearchsRepository } from 'test/repositories/in-memory-searchs-repository.ts'
import { makeSearch } from 'test/factories/make-search.ts'

let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let managersCoursesRepository: InMemoryManagersCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository

let managersRepository: InMemoryManagersRepository
let searchsRepository: InMemorySearchsRepository

let sut: SearchStudentsDetailsManagerUseCase

describe('Search Students Details By Manager Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()

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
    searchsRepository = new InMemorySearchsRepository()

    sut = new SearchStudentsDetailsManagerUseCase(
      managersRepository,
      searchsRepository
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

    const student = makeSearch({ username: nameOrError.value, role: 'student', courses: [course, course2], poles: [pole, pole2] })
    const student2 = makeSearch({ username: nameOrError2.value, role: 'student', courses: [course], poles: [pole] })
    searchsRepository.items.push(student)
    searchsRepository.items.push(student2)

    const result = await sut.execute({
      managerId: manager.id.toValue(),
      page: 1,
      query: 'Doe'
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      students: [
        {
          id: student.id,
          username: student.username
        }
      ]
    })
  })
})