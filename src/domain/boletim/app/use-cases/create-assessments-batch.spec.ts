import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { InMemoryUserPolesRepository } from "test/repositories/in-memory-user-poles-repository.ts";
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { makeUser } from "test/factories/make-user.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { makeUserPole } from "test/factories/make-user-pole.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";
import { CreateAssessmentsBatchUseCase } from "./create-assessments-batch.ts";
import { InMemoryUsersCourseRepository } from "test/repositories/in-memory-users-course-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { InMemoryAssessmentsBatchRepository } from "test/repositories/in-memory-assessments-batch-repository.ts";

let usersRepository: InMemoryUsersRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let userPolesRepository: InMemoryUserPolesRepository
let usersCoursesRepository: InMemoryUsersCourseRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let assessmentsRepository: InMemoryAssessmentsRepository
let assessmentsBatchRepository: InMemoryAssessmentsBatchRepository
let sut: CreateAssessmentsBatchUseCase

describe('Create Students Lot Use Case', () => {
  beforeEach(() => {
    usersCoursesRepository = new InMemoryUsersCourseRepository()
    userPolesRepository = new InMemoryUserPolesRepository()
    polesRepository = new InMemoryPolesRepository()

    usersRepository = new InMemoryUsersRepository(
      usersCoursesRepository,
      userPolesRepository,
      polesRepository
    )
    coursesRepository = new InMemoryCoursesRepository(
      usersCoursesRepository
    )

    disciplinesRepository = new InMemoryDisciplinesRepository()
    assessmentsRepository = new InMemoryAssessmentsRepository()
    assessmentsBatchRepository = new InMemoryAssessmentsBatchRepository()
    sut = new CreateAssessmentsBatchUseCase(
      usersRepository, 
      coursesRepository, 
      userPolesRepository, 
      disciplinesRepository, 
      assessmentsRepository,
      assessmentsBatchRepository
    )
  })

  it ('should not be able to create assessments in lot if course not exist', async () => {
    const result = await sut.execute({ studentAssessments: [], courseId: 'not-found', userIP: '' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create assessments in lot if user not exist.', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const studentAssessments = [
      {
        cpf: 'not-exist',
        disciplineId: 'random',
        avi: null,
        avii: null,
        vf: 0,
        vfe: null,
      },
      {
        cpf: 'not-exist',
        disciplineId: 'random',
        avi: null,
        avii: null,
        vf: 0,
        vfe: null,
      },
      {
        cpf: 'not-exist',
        disciplineId: 'random',
        avi: null,
        avii: null,
        vf: 0,
        vfe: null,
      },
    ]

    const result = await sut.execute({ studentAssessments, courseId: course.id.toValue(), userIP: '' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toMatchObject([
      new ResourceNotFoundError('Course not found.'),
      new ResourceNotFoundError('User not found.'),
      new ResourceNotFoundError('Discipline not found.'),
      new ResourceAlreadyExistError('Note already released to the student')
    ])
  })  

  it ('should not be able to create assessments in lot if discipline not exist', async () => {
      const course = makeCourse()
      coursesRepository.create(course)

      const user1 = makeUser({ cpf: '12345' })
      const user2 = makeUser({ cpf: '56789' })
      const user3 = makeUser({ cpf: '91011' })
      usersRepository.createMany([user1, user2, user3])

      const studentAssessments = [
        {
          cpf: user1.cpf,
          disciplineId: 'random',
          avi: null,
          avii: null,
          vf: 0,
          vfe: null,
        },
        {
          cpf: user2.cpf,
          disciplineId: 'random',
          avi: null,
          avii: null,
          vf: 0,
          vfe: null,
        },
        {
          cpf: user3.cpf,
          disciplineId: 'random',
          avi: null,
          avii: null,
          vf: 0,
          vfe: null,
        },
      ]

      const result = await sut.execute({ courseId: course.id.toValue(), studentAssessments, userIP: '' })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toMatchObject([
        new ResourceNotFoundError('Course not found.'),
        new ResourceNotFoundError('User not found.'),
        new ResourceNotFoundError('Discipline not found.'),
        new ResourceAlreadyExistError('Note already released to the student')
      ])
  })

  it ('should not be able to create assessments in lot if discipline not exist', async () => {
      const course = makeCourse()
      coursesRepository.create(course)

      const user1 = makeUser({ cpf: '12345' })
      const user2 = makeUser({ cpf: '56789' })
      const user3 = makeUser({ cpf: '91011' })
      usersRepository.createMany([user1, user2, user3])

      const discipline = makeDiscipline()

      const studentAssessments = [
        {
          cpf: user1.cpf,
          disciplineId: discipline.id.toValue(),
          avi: null,
          avii: null,
          vf: 0,
          vfe: null,
        },
        {
          cpf: user2.cpf,
          disciplineId: discipline.id.toValue(),
          avi: null,
          avii: null,
          vf: 0,
          vfe: null,
        },
        {
          cpf: user3.cpf,
          disciplineId: discipline.id.toValue(),
          avi: null,
          avii: null,
          vf: 0,
          vfe: null,
        },
      ]

      const result = await sut.execute({ courseId: course.id.toValue(), studentAssessments, userIP: '' })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toMatchObject([
        new ResourceNotFoundError('Course not found.'),
        new ResourceNotFoundError('User not found.'),
        new ResourceNotFoundError('Discipline not found.'),
        new ResourceAlreadyExistError('Note already released to the student')
      ])
  })

  it ('should not be able to create assessments in lot if pole not exist', async () => {
      const course = makeCourse()
      coursesRepository.create(course)

      const user1 = makeUser({ cpf: '12345' })
      const user2 = makeUser({ cpf: '56789' })
      const user3 = makeUser({ cpf: '91011' })
      usersRepository.createMany([user1, user2, user3])

      const discipline = makeDiscipline()
      disciplinesRepository.create(discipline)

      const studentAssessments = [
        {
          cpf: user1.cpf,
          disciplineId: discipline.id.toValue(),
          avi: null,
          avii: null,
          vf: 0,
          vfe: null,
        },
        {
          cpf: user1.cpf,
          disciplineId: discipline.id.toValue(),
          avi: null,
          avii: null,
          vf: 0,
          vfe: null,
        },
        {
          cpf: user3.cpf,
          disciplineId: discipline.id.toValue(),
          avi: null,
          avii: null,
          vf: 0,
          vfe: null,
        },
      ]

      const result = await sut.execute({ courseId: course.id.toValue(), studentAssessments, userIP: '' })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toMatchObject([
        new ResourceNotFoundError('Course not found.'),
        new ResourceNotFoundError('User not found.'),
        new ResourceNotFoundError('Discipline not found.'),
        new ResourceAlreadyExistError('Note already released to the student')
      ])
  })

  it ('should not be able to create assessments in lot if the user already has the assessment', async () => {
      const course = makeCourse()
      coursesRepository.create(course)

      const user1 = makeUser({ cpf: '12345' })
      const user2 = makeUser({ cpf: '56789' })
      const user3 = makeUser({ cpf: '91011' })
      usersRepository.createMany([user1, user2, user3])

      const userPole1 = makeUserPole({ userId: user1.id })
      userPolesRepository.create(userPole1)
      const userPole2 = makeUserPole({ userId: user2.id })
      userPolesRepository.create(userPole2)
      const userPole3 = makeUserPole({ userId: user3.id })
      userPolesRepository.create(userPole3)

      const discipline = makeDiscipline()
      disciplinesRepository.create(discipline)

      const assessment1 = makeAssessment({
        courseId: course.id,
        studentId: user1.id
      })
      assessmentsRepository.create(assessment1)

      const assessment2 = makeAssessment({
        courseId: course.id,
        studentId: user2.id
      })
      assessmentsRepository.create(assessment2)

      const assessment3 = makeAssessment({
        courseId: course.id,
        studentId: user3.id
      })
      assessmentsRepository.create(assessment3)

      const studentAssessments = [
        {
          cpf: user1.cpf,
          disciplineId: discipline.id.toValue(),
          avi: null,
          avii: null,
          vf: 0,
          vfe: null,
        },
        {
          cpf: user2.cpf,
          disciplineId: discipline.id.toValue(),
          avi: null,
          avii: null,
          vf: 0,
          vfe: null,
        },
        {
          cpf: user3.cpf,
          disciplineId: discipline.id.toValue(),
          avi: null,
          avii: null,
          vf: 0,
          vfe: null,
        },
      ]

      const result = await sut.execute({ courseId: course.id.toValue(), studentAssessments, userIP: '' })
      
      expect(result.isLeft()).toBe(true)
      expect(result.value).toMatchObject([
        new ResourceNotFoundError('Course not found.'),
        new ResourceNotFoundError('User not found.'),
        new ResourceNotFoundError('Discipline not found.'),
        new ResourceAlreadyExistError('Note already released to the student')
      ])
  })

  it ('should be able to create assessments in lot', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const user1 = makeUser({ cpf: '12345' })
    const user2 = makeUser({ cpf: '56789' })
    const user3 = makeUser({ cpf: '91011' })
    usersRepository.createMany([user1, user2, user3])

    const userPole1 = makeUserPole({ userId: user1.id })
    userPolesRepository.create(userPole1)
    const userPole2 = makeUserPole({ userId: user2.id })
    userPolesRepository.create(userPole2)
    const userPole3 = makeUserPole({ userId: user3.id })
    userPolesRepository.create(userPole3)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const studentAssessments = [
      {
        cpf: user1.cpf,
        disciplineId: discipline.id.toValue(),
        avi: 10,
        avii: 7,
        vf: 7,
        vfe: null,
      },
      {
        cpf: user2.cpf,
        disciplineId: discipline.id.toValue(),
        avi: 8,
        avii: 7,
        vf: 7,
        vfe: null,
      },
      {
        cpf: user3.cpf,
        disciplineId: discipline.id.toValue(),
        avi: 9,
        avii: 8,
        vf: 6,
        vfe: null,
      },
    ]
    
    const result = await sut.execute({ courseId: course.id.toValue(), studentAssessments, userIP: '' })

    expect(result.isRight()).toBe(true)
    expect(assessmentsBatchRepository.items).toHaveLength(1)
    expect(assessmentsBatchRepository.items[0].assessments).toHaveLength(3)
  })
})