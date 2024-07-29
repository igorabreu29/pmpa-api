import { describe, it, expect, beforeEach } from 'vitest'
import { ManagersCoursesRepository } from '../repositories/managers-courses-repository.ts'
import { ManagersPolesRepository } from '../repositories/managers-poles-repository.ts'
import { StudentsPolesRepository } from '../repositories/students-poles-repository.ts'
import { SearchStudentsDetailsUseCase } from './search-students-details.ts'
import { ManagersRepository } from '../repositories/managers-repository.ts'
import { CoursesRepository } from '../repositories/courses-repository.ts'
import { PolesRepository } from '../repositories/poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { InMemoryManagersRepository } from 'test/repositories/in-memory-managers-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryManagersCoursesRepository } from 'test/repositories/in-memory-managers-courses-repository.ts'
import { InMemoryManagersPolesRepository } from 'test/repositories/in-memory-managers-poles-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { makeManager } from 'test/factories/make-manager.ts'
import { makeManagerCourse } from 'test/factories/make-manager-course.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeManagerPole } from 'test/factories/make-manager-pole.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makeStudentPole } from 'test/factories/make-student-pole.ts'

let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let managersRepository: InMemoryManagersRepository
let studentsRepository: InMemoryStudentsRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository

let managersCoursesRepository: InMemoryManagersCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository

let sut: SearchStudentsDetailsUseCase

describe('Search Students Details Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    managersRepository = new InMemoryManagersRepository(
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
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
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )

    sut = new SearchStudentsDetailsUseCase(
      managersCoursesRepository,
      managersPolesRepository,
      studentsPolesRepository
    )
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

    const student = makeStudent()
    const student2 = makeStudent()
    studentsRepository.createMany([student, student2])

    const studentCourse = makeStudentCourse({ studentId: student.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student2.id, courseId: course2.id })
    studentsCoursesRepository.createMany([studentCourse, studentCourse2])

    const studentPole = makeStudentPole({ studentId: studentCourse.id, poleId: pole.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse2.id, poleId: pole2.id })
    studentsPolesRepository.createMany([studentPole, studentPole2])

    const result = await sut.execute({
      managerId: manager.id.toValue(),
      page: 1,
      query: ''
    })
    
  })
})