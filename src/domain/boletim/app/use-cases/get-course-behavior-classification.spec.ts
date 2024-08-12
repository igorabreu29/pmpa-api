import { InMemoryBehaviorsRepository } from 'test/repositories/in-memory-behaviors-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { GetCourseBehaviorClassification } from './get-course-behavior-classification.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makeStudentPole } from 'test/factories/make-student-pole.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { makeBehavior } from 'test/factories/make-behavior.ts'

let studentsRepository: InMemoryStudentsRepository
let coursesRepository: InMemoryCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let behaviorsRepository: InMemoryBehaviorsRepository
let sut: GetCourseBehaviorClassification

describe('Get Course Behavior Classification', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    coursesRepository = new InMemoryCoursesRepository ()
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )
    polesRepository = new InMemoryPolesRepository()

    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    behaviorsRepository = new InMemoryBehaviorsRepository()

    sut = new GetCourseBehaviorClassification(
      coursesRepository,
      studentsCoursesRepository,
      behaviorsRepository
    )
  })

  it ('should not be able to get behavior classification if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-exist',
      page: 1
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get behavior classification with module formula', async () => {
    const course = makeCourse({ formula: 'CAS' }, new UniqueEntityId('course-1'))
    coursesRepository.create(course)

    const pole1 = makePole()
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

    const behavior = makeBehavior({
      january: 4,
      february: 3,
      march: 2,
      april: 8,
      studentId: student1.id,
      courseId: course.id
    })
    const behavior2 = makeBehavior({
      january: 7,
      february: 9,
      march: 6,
      april: 8,
      studentId: student2.id,
      courseId: course.id
    })
    behaviorsRepository.create(behavior)
    behaviorsRepository.create(behavior2)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      page: 1
    })

    expect(result.value).toMatchObject({
      studentsWithBehaviorAverage: [
        {
          behaviorAverage: {
            behaviorAverageStatus: {
              behaviorAverage: 7.5,
              status: 'approved'
            },
            behaviorsCount: 4
          }
        },
        {
          behaviorAverage: {
            behaviorAverageStatus: {
              behaviorAverage: 4.25,
              status: 'disapproved'
            },
            behaviorsCount: 4
          }
        },
      ]
    })
  })
})