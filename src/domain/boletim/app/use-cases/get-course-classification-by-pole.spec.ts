import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeManagerCourse } from 'test/factories/make-manager-course.ts'
import { makeManagerPole } from 'test/factories/make-manager-pole.ts'
import { makeManager } from 'test/factories/make-manager.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makeStudentPole } from 'test/factories/make-student-pole.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts"
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts"
import { InMemoryCoursesDisciplinesRepository } from 'test/repositories/in-memory-courses-disciplines-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryManagersCoursesRepository } from 'test/repositories/in-memory-managers-courses-repository.ts'
import { InMemoryManagersPolesRepository } from 'test/repositories/in-memory-managers-poles-repository.ts'
import { InMemoryManagersRepository } from 'test/repositories/in-memory-managers-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { beforeEach, describe, expect, it } from 'vitest'
import { GetCourseClassificationByPoleUseCase } from './get-course-classification-by-pole.ts'
import { GetStudentAverageInTheCourseUseCase } from './get-student-average-in-the-course.ts'
import { makeGetStudentAverageInTheCourseUseCase } from 'test/factories/make-get-student-average-in-the-course-use-case.ts'
import { InMemoryDisciplinesRepository } from 'test/repositories/in-memory-disciplines-repository.ts'
import { InMemoryClassificationsRepository } from 'test/repositories/in-memory-classifications-repository.ts'
import { makeClassification } from 'test/factories/make-classification.ts'

let managersRepository: InMemoryManagersRepository
let managersCoursesRepository: InMemoryManagersCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository

let studentsRepository: InMemoryStudentsRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository

let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository

let assessmentsRepository: InMemoryAssessmentsRepository
let behaviorsRepository: InMemoryBehaviorsRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository

let classificationsRepository: InMemoryClassificationsRepository
let getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase

let sut: GetCourseClassificationByPoleUseCase

describe('Get Classfication Course By Pole Use Case', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    coursesRepository = new InMemoryCoursesRepository ()
    polesRepository = new InMemoryPolesRepository()

    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )

    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
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
    managersPolesRepository = new InMemoryManagersPolesRepository()
    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )

    assessmentsRepository = new InMemoryAssessmentsRepository()
    behaviorsRepository = new InMemoryBehaviorsRepository()
    disciplinesRepository = new InMemoryDisciplinesRepository()
    courseDisciplinesRepository = new InMemoryCoursesDisciplinesRepository(
      disciplinesRepository,
      assessmentsRepository
    )
    getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase({
      assessmentsRepository,
      behaviorsRepository,
      disciplinesRepository,
      courseDisciplinesRepository
    })

    classificationsRepository = new InMemoryClassificationsRepository()

    sut = new GetCourseClassificationByPoleUseCase (
      coursesRepository,
      polesRepository,
      managersCoursesRepository,
      studentsCoursesRepository,
      classificationsRepository
    )
  })

  it ('should not be able to get classification if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-exist',
      page: 1,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to get classification if pole does not exist', async () => {
    const result = await sut.execute({
      courseId: '',
      page: 1,
      managerId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get course classification by pole', async () => {
    const course = makeCourse({ isPeriod: true }, new UniqueEntityId('course-1'))
    coursesRepository.create(course)

    const pole1 = makePole({}, new UniqueEntityId('pole-1'))
    const pole2 = makePole()
    polesRepository.createMany([pole1, pole2])

    const student1 = makeStudent({}, new UniqueEntityId('student-1'))
    const student2 = makeStudent({}, new UniqueEntityId('student-2'))
    studentsRepository.create(student1)
    studentsRepository.create(student2)

    const studentCourse1 = makeStudentCourse({ studentId: student1.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student2.id, courseId: course.id })
    studentsCoursesRepository.create(studentCourse1)
    studentsCoursesRepository.create(studentCourse2)

    const studentPole1 = makeStudentPole({ studentId: studentCourse1.id, poleId: pole1.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse2.id, poleId: pole2.id })
    studentsPolesRepository.create(studentPole1)
    studentsPolesRepository.create(studentPole2)

    const classification = makeClassification({
      courseId: course.id,
      studentId: student1.id,
      assessments: [
        {
          module: 1,
          average: 7,
          vf: 7,
          avi: null,
          avii: null,
          courseId: course.id.toValue(),
          disciplineId: '',
          id: '',
          isRecovering: false,
          status: 'approved',
        },
        {
          module: 2,
          average: 9,
          vf: 9,
          avi: null,
          avii: null,
          courseId: course.id.toValue(),
          disciplineId: '',
          id: '',
          isRecovering: false,
          status: 'approved',
        },
        {
          module: 3,
          average: 8.5,
          vf: 8.5,
          avi: null,
          avii: null,
          courseId: course.id.toValue(),
          disciplineId: '',
          id: '',
          isRecovering: false,
          status: 'approved',
        }
      ],
      average: 6.771,
      behavior: [
        {
          behaviorAverage: 6.542,
          status: 'approved',
          behaviorsCount: 1
        },
      ],
      assessmentsCount: 3,
      concept: 'regular',
      status: 'approved'
    })
    classificationsRepository.createMany([classification])

    const result = await sut.execute({
      courseId: 'course-1',
      page: 1,
      poleId: pole1.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      classifications: [classification]
    })
  })

  it ('should be able to get course classification by manager', async () => {
    const course = makeCourse({ isPeriod: true }, new UniqueEntityId('course-1'))
    coursesRepository.create(course)

    const pole1 = makePole({}, new UniqueEntityId('pole-1'))
    const pole2 = makePole()
    polesRepository.createMany([pole1, pole2])

    const student1 = makeStudent({}, new UniqueEntityId('student-1'))
    const student2 = makeStudent({}, new UniqueEntityId('student-2'))
    studentsRepository.create(student1)
    studentsRepository.create(student2)

    const studentCourse1 = makeStudentCourse({ studentId: student1.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student2.id, courseId: course.id })
    studentsCoursesRepository.create(studentCourse1)
    studentsCoursesRepository.create(studentCourse2)

    const studentPole1 = makeStudentPole({ studentId: studentCourse1.id, poleId: pole1.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse2.id, poleId: pole2.id })
    studentsPolesRepository.create(studentPole1)
    studentsPolesRepository.create(studentPole2)

    const manager = makeManager()
    managersRepository.create(manager)

    const managerCourse = makeManagerCourse({ managerId: manager.id, courseId: course.id })
    managersCoursesRepository.create(managerCourse)

    const managerPole = makeManagerPole({ managerId: managerCourse.id, poleId: pole1.id })
    managersPolesRepository.create(managerPole)

    const classification = makeClassification({
      courseId: course.id,
      studentId: student1.id,
      assessments: [
        {
          module: 1,
          average: 7,
          vf: 7,
          avi: null,
          avii: null,
          courseId: course.id.toValue(),
          disciplineId: '',
          id: '',
          isRecovering: false,
          status: 'approved',
        },
        {
          module: 2,
          average: 9,
          vf: 9,
          avi: null,
          avii: null,
          courseId: course.id.toValue(),
          disciplineId: '',
          id: '',
          isRecovering: false,
          status: 'approved',
        },
        {
          module: 3,
          average: 8.5,
          vf: 8.5,
          avi: null,
          avii: null,
          courseId: course.id.toValue(),
          disciplineId: '',
          id: '',
          isRecovering: false,
          status: 'approved',
        }
      ],
      average: 6.771,
      behavior: [
        {
          behaviorAverage: 6.542,
          status: 'approved',
          behaviorsCount: 1
        },
      ],
      assessmentsCount: 3,
      concept: 'regular',
      status: 'approved'
    })
    classificationsRepository.createMany([classification])

    const result = await sut.execute({
      courseId: 'course-1',
      page: 1,
      managerId: manager.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      classifications: [classification]
    })
  })
})