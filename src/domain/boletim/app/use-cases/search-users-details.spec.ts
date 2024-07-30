import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeAdministrator } from 'test/factories/make-administrator.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeManagerCourse } from 'test/factories/make-manager-course.ts'
import { makeManagerPole } from 'test/factories/make-manager-pole.ts'
import { makeManager } from 'test/factories/make-manager.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makeStudentPole } from 'test/factories/make-student-pole.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryAdministratorsRepository } from 'test/repositories/in-memory-administrators-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryManagersCoursesRepository } from 'test/repositories/in-memory-managers-courses-repository.ts'
import { InMemoryManagersPolesRepository } from 'test/repositories/in-memory-managers-poles-repository.ts'
import { InMemoryManagersRepository } from 'test/repositories/in-memory-managers-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { beforeEach, describe, expect, it } from 'vitest'
import { SearchStudentsAndManagersDetailsManagerUseCase } from './search-students-and-managers-details-by-administrator.ts'
import { InMemoryDevelopersRepository } from 'test/repositories/in-memory-developers-repository.ts'
import { SearchUsersDetailsUseCase } from './search-users-details.ts'
import { makeDeveloper } from 'test/factories/make-developer.ts'

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let managersCoursesRepository: InMemoryManagersCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository

let developersRepository: InMemoryDevelopersRepository
let administratorsRepository: InMemoryAdministratorsRepository
let studentsRepository: InMemoryStudentsRepository
let managersRepository: InMemoryManagersRepository

let sut: SearchUsersDetailsUseCase

describe('Search Students And Managers Details By Administrator', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
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
    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    managersPolesRepository = new InMemoryManagersPolesRepository()

    developersRepository = new InMemoryDevelopersRepository()
    administratorsRepository = new InMemoryAdministratorsRepository()
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    managersRepository = new InMemoryManagersRepository(
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )

    sut = new SearchUsersDetailsUseCase(
      developersRepository,
      administratorsRepository,
      managersRepository,
      studentsRepository,
    )
  })

  it ('should not be able to search users if developer does not exist', async () => {
    const result = await sut.execute({
      developerId: 'not-found',
      query: '',
      page: 1,
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to search users', async () => {
    const course = makeCourse()
    coursesRepository.create(course)
    
    const pole = makePole()
    polesRepository.create(pole)

    const developer = makeDeveloper()
    developersRepository.create(developer)

    const administrator = makeAdministrator()
    administratorsRepository.create(administrator)

    const student = makeStudent()
    const studentCourse = makeStudentCourse({ studentId: student.id, courseId: course.id })
    const studentPole = makeStudentPole({ studentId: studentCourse.id, poleId: pole.id })
    studentsRepository.create(student)
    studentsCoursesRepository.create(studentCourse)
    studentsPolesRepository.create(studentPole)

    const manager = makeManager()
    const managerCourse = makeManagerCourse({ managerId: manager.id, courseId: course.id })
    const managerPole = makeManagerPole({ managerId: managerCourse.id, poleId: pole.id })
    managersRepository.create(manager)
    managersCoursesRepository.create(managerCourse)
    managersPolesRepository.create(managerPole)

    const result = await sut.execute({
      developerId: developer.id.toValue(),
      query: '',
      page: 1,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      students: [
        {
          studentId: student.id,
          username: student.username.value,
        }
      ],
      
      managers: [
        {
          managerId: manager.id,
          username: manager.username.value
        }
      ],
      
      administrators: [
        {
          id: administrator.id,
          username: administrator.username
        }
      ]
    })
  })
})