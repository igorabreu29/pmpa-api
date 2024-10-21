import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makeStudentPole } from 'test/factories/make-student-pole.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { beforeEach, describe, expect, it } from 'vitest'
import { GetCourseClassificationUseCase } from './get-course-classification.ts'
import { InMemoryClassificationsRepository } from 'test/repositories/in-memory-classifications-repository.ts'
import { makeClassification } from 'test/factories/make-classification.ts'
import { makeDiscipline } from 'test/factories/make-discipline.ts'
import type { DisciplinesRepository } from '../repositories/disciplines-repository.ts'
import { InMemoryDisciplinesRepository } from 'test/repositories/in-memory-disciplines-repository.ts'

let studentsRepository: InMemoryStudentsRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository
let disciplinesRepository: InMemoryDisciplinesRepository

let coursesRepository: InMemoryCoursesRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let classificationsRepository: InMemoryClassificationsRepository

let sut: GetCourseClassificationUseCase

describe('Get Classfication Course Use Case', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
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
    
    coursesRepository = new InMemoryCoursesRepository ()
    polesRepository = new InMemoryPolesRepository()
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    disciplinesRepository = new InMemoryDisciplinesRepository()

    classificationsRepository = new InMemoryClassificationsRepository()

    sut = new GetCourseClassificationUseCase(
      coursesRepository,
      studentsCoursesRepository,
      classificationsRepository,
    )
  })

  it ('should not be able to get classification if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-exist',
      page: 1
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get course classification', async () => {
    const course = makeCourse({ formula: 'CFP' })
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const pole = makeCourse()
    polesRepository.create(pole)

    const student = makeStudent()
    const student2 = makeStudent()
    studentsRepository.createMany([student, student2])

    const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
    const studentCourse2 = makeStudentCourse({ courseId: course.id, studentId: student2.id })
    studentsCoursesRepository.createMany([studentCourse, studentCourse2])

    const studentPole = makeStudentPole({ poleId: pole.id, studentId: studentCourse.id })
    const studentPole2 = makeStudentPole({ poleId: pole.id, studentId: studentCourse2.id })
    studentsPolesRepository.createMany([studentPole, studentPole2])

    const classification = makeClassification({ 
        courseId: course.id, 
        studentId: student.id, 
        average: 10, 
        assessmentsCount: 1, 
        assessments: [
          {
            vf: 10,
            average: 10,
            courseId: course.id.toValue(),
            module: 1,
            isRecovering: false,
            avi: null,
            avii: null,
            disciplineId: discipline.id.toValue(),
            id: '',
            status: 'approved'
          },
      ],
      status: 'approved',
      studentBirthday: new Date('2021-02-10')
    })
    const classification2 = makeClassification({ 
        courseId: course.id, 
        studentId: student2.id, 
        average: 8, 
        assessmentsCount: 1, 
        assessments: [
          {
            vf: 8,
            average: 8,
            courseId: course.id.toValue(),
            module: 1,
            isRecovering: false,
            avi: null,
            avii: null,
            disciplineId: discipline.id.toValue(),
            id: '',
            status: 'approved'
          },
      ],
      status: 'approved',
      studentBirthday: new Date('2022-02-10')
    })
    classificationsRepository.createMany([classification, classification2])

    const result = await sut.execute({
      courseId: course.id.toValue(),
      page: 1
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      classifications: [
        {
          assessments: [
            {
              vf: 10
            }
          ]
        },
        {
          assessments: [
            {
              vf: 8
            }
          ]
        }
      ]
    })
  })
})