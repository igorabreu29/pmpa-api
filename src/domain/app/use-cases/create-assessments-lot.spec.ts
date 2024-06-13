import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { InMemoryUserPolesRepository } from "test/repositories/in-memory-user-poles-repository.ts";
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { CreateAssessmentsLotUseCase } from "./create-assessments-lot.ts";
import { makeUser } from "test/factories/make-user.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { makeUserPole } from "test/factories/make-user-pole.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";

let usersRepository: InMemoryUsersRepository
let coursesRepository: InMemoryCoursesRepository
let userPolesRepository: InMemoryUserPolesRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let assessmentsRepository: InMemoryAssessmentsRepository
let sut: CreateAssessmentsLotUseCase

describe('Create Students Lot Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    coursesRepository = new InMemoryCoursesRepository()
    userPolesRepository = new InMemoryUserPolesRepository()
    disciplinesRepository = new InMemoryDisciplinesRepository()
    assessmentsRepository = new InMemoryAssessmentsRepository()
    sut = new CreateAssessmentsLotUseCase(
      usersRepository, 
      coursesRepository, 
      userPolesRepository, 
      disciplinesRepository, 
      assessmentsRepository
    )
  })

  it ('should not be able to create assessments in lot if course not exist', async () => {
    const result = await sut.execute({ studentAssessments: [], courseName: 'not-found' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create assessments in lot if user not exist.', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const studentAssessments = [
      {
        cpf: 'not-exist',
        disciplineName: 'random',
        avi: null,
        avii: null,
        vf: null,
        vfe: null,
      },
      {
        cpf: 'not-exist',
        disciplineName: 'random',
        avi: null,
        avii: null,
        vf: null,
        vfe: null,
      },
      {
        cpf: 'not-exist',
        disciplineName: 'random',
        avi: null,
        avii: null,
        vf: null,
        vfe: null,
      },
    ]

    const result = await sut.execute({ studentAssessments, courseName: course.name })

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
          disciplineName: 'random',
          avi: null,
          avii: null,
          vf: null,
          vfe: null,
        },
        {
          cpf: user2.cpf,
          disciplineName: 'random',
          avi: null,
          avii: null,
          vf: null,
          vfe: null,
        },
        {
          cpf: user3.cpf,
          disciplineName: 'random',
          avi: null,
          avii: null,
          vf: null,
          vfe: null,
        },
      ]

      const result = await sut.execute({ courseName: course.name, studentAssessments })

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
          disciplineName: discipline.name,
          avi: null,
          avii: null,
          vf: null,
          vfe: null,
        },
        {
          cpf: user2.cpf,
          disciplineName: discipline.name,
          avi: null,
          avii: null,
          vf: null,
          vfe: null,
        },
        {
          cpf: user3.cpf,
          disciplineName: discipline.name,
          avi: null,
          avii: null,
          vf: null,
          vfe: null,
        },
      ]

      const result = await sut.execute({ courseName: course.name, studentAssessments })

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
          disciplineName: discipline.name,
          avi: null,
          avii: null,
          vf: null,
          vfe: null,
        },
        {
          cpf: user1.cpf,
          disciplineName: discipline.name,
          avi: null,
          avii: null,
          vf: null,
          vfe: null,
        },
        {
          cpf: user3.cpf,
          disciplineName: discipline.name,
          avi: null,
          avii: null,
          vf: null,
          vfe: null,
        },
      ]

      const result = await sut.execute({ courseName: course.name, studentAssessments })

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
          disciplineName: discipline.name,
          avi: null,
          avii: null,
          vf: null,
          vfe: null,
        },
        {
          cpf: user2.cpf,
          disciplineName: discipline.name,
          avi: null,
          avii: null,
          vf: null,
          vfe: null,
        },
        {
          cpf: user3.cpf,
          disciplineName: discipline.name,
          avi: null,
          avii: null,
          vf: null,
          vfe: null,
        },
      ]

      const result = await sut.execute({ courseName: course.name, studentAssessments })
      
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
        disciplineName: discipline.name,
        avi: 10,
        avii: 7,
        vf: null,
        vfe: null,
      },
      {
        cpf: user2.cpf,
        disciplineName: discipline.name,
        avi: 8,
        avii: 7,
        vf: null,
        vfe: null,
      },
      {
        cpf: user3.cpf,
        disciplineName: discipline.name,
        avi: 9,
        avii: 8,
        vf: null,
        vfe: null,
      },
    ]
    
    const result = await sut.execute({ courseName: course.name, studentAssessments })

    expect(result.isRight()).toBe(true)
    expect(assessmentsRepository.items).toHaveLength(3)
  })
})