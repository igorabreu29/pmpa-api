import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { CreateStudentsLotUseCase } from "./create-students-lot.ts";
import { makeUser } from "test/factories/make-user.ts";
import { FakeHasher } from "test/cryptograpy/fake-hasher.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makePole } from "test/factories/make-pole.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { User } from "@/domain/enterprise/entities/user.ts";

let usersRepository: InMemoryUsersRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let hasher: FakeHasher
let sut: CreateStudentsLotUseCase

describe('Create Students Lot Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    hasher = new FakeHasher()
    sut = new CreateStudentsLotUseCase(usersRepository, coursesRepository, polesRepository, hasher)
  })

  it ('should not be able to create students in lot if course not exist', async () => {
    const result = await sut.execute({ students: [], courseName: 'not-found' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create students in lot if pole not exist.', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const students = [
      {
        username: 'John Doe',
        cpf: '012345678911',
        email: 'john@example.com',
        civilID: 12345,
        poleName: 'not-found'
      },
      {
        username: 'Jonas Doe',
        cpf: '012345678912',
        email: 'jonas@example.com',
        civilID: 12345,
        poleName: 'not-found'
      },
      {
        username: 'Jelly Doe',
        cpf: '012345678913',
        email: 'jelly@example.com',
        civilID: 12345,
        poleName: 'not-found'
      },
    ]

    const result = await sut.execute({ students, courseName: course.name })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toMatchObject([
      new ResourceNotFoundError('Pole not found.'),
      new ResourceAlreadyExistError('User already present on this course.')
    ])
  })  

  it ('should not be able to create students in lot if user already be present on the plaftorm and course', async () => {
      const course = makeCourse()
      coursesRepository.create(course)

      const pole1 = makePole()
      polesRepository.items.push(pole1)

      const pole2 = makePole()
      polesRepository.items.push(pole2)

      const students = [
        {
          username: 'John Doe',
          cpf: '012345678911',
          email: 'john@example.com',
          civilID: 12345,
          poleName: pole1.name
        },
        {
          username: 'Jonas Doe',
          cpf: '012345678912',
          email: 'jonas@example.com',
          civilID: 12345,
          poleName: pole2.name
        },
        {
          username: 'Jelly Doe',
          cpf: '012345678913',
          email: 'jelly@example.com',
          civilID: 12345,
          poleName: pole2.name
        },
      ]

      const users = students.map(student => {
        return User.create({ 
          active: true, 
          courses: [course], 
          cpf: student.cpf, 
          email: student.email,
          password: '',
          poles: [],
          role: 'student',
          username: student.username
        })
      })
      usersRepository.createMany(users)

      const result = await sut.execute({ courseName: course.name, students })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toMatchObject([
        new ResourceNotFoundError('Pole not found.'),
        new ResourceAlreadyExistError('User already present on this course.')
      ])
  })

  it ('should be able to create students in lot', async () => {
    const course = makeCourse()
    coursesRepository.create(course)
    const pole = makePole()
    polesRepository.items.push(pole)

    const students = [
      {
        username: 'John Doe',
        cpf: '012345678911',
        email: 'john@example.com',
        civilID: 12345,
        poleName: pole.name
      },
      {
        username: 'Jonas Doe',
        cpf: '012345678912',
        email: 'jonas@example.com',
        civilID: 12345,
        poleName: pole.name
      },
      {
        username: 'Jelly Doe',
        cpf: '012345678913',
        email: 'jelly@example.com',
        civilID: 12345,
        poleName: pole.name
      },
    ]
    
    const result = await sut.execute({ courseName: course.name, students: students })

    expect(result.isRight()).toBe(true)
    expect(usersRepository.items).toHaveLength(3)
  })
})