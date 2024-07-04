import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "test/factories/make-user.ts";
import { FakeHasher } from "test/cryptograpy/fake-hasher.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makePole } from "test/factories/make-pole.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { User } from "@/domain/boletim/enterprise/entities/user.ts";
import { InMemoryUsersCourseRepository } from "test/repositories/in-memory-users-course-repository.ts";
import { makeUserCourse } from "test/factories/make-user-course.ts";
import { CreateStudentsBatchUseCase } from "./create-students-batch.ts";
import { InMemoryUserPolesRepository } from "test/repositories/in-memory-user-poles-repository.ts";
import { makeUserPole } from "test/factories/make-user-pole.ts";

let usersCoursesRepository: InMemoryUsersCourseRepository
let userPolesRepository: InMemoryUserPolesRepository
let polesRepository: InMemoryPolesRepository
let usersRepository: InMemoryUsersRepository
let coursesRepository: InMemoryCoursesRepository
let hasher: FakeHasher
let sut: CreateStudentsBatchUseCase

describe('Create Students Lot Use Case', () => {
  beforeEach(() => {
    usersCoursesRepository = new InMemoryUsersCourseRepository()
    userPolesRepository = new InMemoryUserPolesRepository()
    polesRepository = new InMemoryPolesRepository()
    usersRepository = new InMemoryUsersRepository(
      usersCoursesRepository,
      userPolesRepository,
      polesRepository,
    )
    coursesRepository = new InMemoryCoursesRepository(
      usersCoursesRepository
    )
    hasher = new FakeHasher()
    sut = new CreateStudentsBatchUseCase(usersRepository, coursesRepository, polesRepository, usersCoursesRepository, userPolesRepository, hasher)
  })

  it ('should not be able create students batch if course does not exist', async () => {
    const result = await sut.execute({ courseId: 'invalid', poleId: '', students: [] })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able create students batch if pole does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ courseId: course.id.toValue(), poleId: 'invalid', students: [] })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able create students batch if pole does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ courseId: course.id.toValue(), poleId: 'invalid', students: [] })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able create students batch if pole does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ courseId: course.id.toValue(), poleId: 'invalid', students: [] })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able create students batch if student already be in the course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.items.push(pole)

    const student1 = makeUser({ role: 'student', cpf: '12345678900', username: 'jey', email: 'jey.com', documents: { civilID: 123456 } })
    usersRepository.create(student1)

    const student2 = makeUser({ role: 'student', cpf: '12345678911', username: 'john', email: 'john.com', documents: { civilID: 123457 } })
    usersRepository.create(student2)

    const userCourse = makeUserCourse({ courseId: course.id, userId: student1.id })
    usersCoursesRepository.create(userCourse)

    const students = [
      {
        username: student1.username,
        cpf: student1.cpf,
        email: student1.email,
        civilID: Number(student1.documents?.civilID),
        courseId: course.id.toValue(),
        poleId: pole.id.toValue()
      },
      {
        username: student2.username,
        cpf: student2.cpf,
        email: student2.email,
        civilID: Number(student2.documents?.civilID),
        courseId: course.id.toValue(),
        poleId: pole.id.toValue()
      },
    ]

    const result = await sut.execute({ courseId: course.id.toValue(), poleId: pole.id.toValue(), students })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toMatchObject([new ResourceAlreadyExistError('User already be present on this course or pole')])
  })

  it ('should be able to create students batch', async () => {
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
        courseId: course.id.toValue(),
        poleId: pole.id.toValue()
      },
      {
        username: 'Jonas Doe',
        cpf: '012345678912',
        email: 'jonas@example.com',
        civilID: 12345,
        courseId: course.id.toValue(),
        poleId: pole.id.toValue()
      },
      {
        username: 'Jelly Doe',
        cpf: '012345678913',
        email: 'jelly@example.com',
        civilID: 12345,
        courseId: course.id.toValue(),
        poleId: pole.id.toValue()
      },
    ]
    
    const result = await sut.execute({ students, courseId: course.id.toValue(), poleId: pole.id.toValue() })

    expect(result.isRight()).toBe(true)
    expect(usersRepository.items).toHaveLength(3)
    expect(usersCoursesRepository.items).toHaveLength(3)
    expect(userPolesRepository.items).toHaveLength(3)
  })
})