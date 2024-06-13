import { FakeHasher } from "test/cryptograpy/fake-hasher.ts";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "test/factories/make-user.ts";
import { CreateUserUseCase } from "./create-user.ts";
import { Role } from "@/domain/enterprise/entities/user.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makePole } from "test/factories/make-pole.ts";
import { makeCourse } from "test/factories/make-course.ts";

let usersRepository: InMemoryUsersRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let hasher: FakeHasher
let sut: CreateUserUseCase

describe('Create User Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    hasher = new FakeHasher()
    sut = new CreateUserUseCase(usersRepository, coursesRepository, polesRepository, hasher)
  })
  
  it ('should not be able to create user with cpf already existing', async () => {
    const user = makeUser()
    usersRepository.create(user)

    const result = await sut.execute({ 
      cpf: user.cpf, 
      password: user.password, 
      email: user.email, 
      role: user.role, 
      username: user.username,
      courseId: '',
      poleId: ''
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should not be able to create user with email already existing', async () => {
    const user = makeUser()
    usersRepository.create(user)

    const result = await sut.execute({ 
      cpf: '2020202200', 
      password: user.password, 
      email: user.email, 
      role: user.role, 
      username: user.username,
      courseId: '',
      poleId: ''
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should not be able to create user if course does not exist', async () => {
    const user = makeUser()
    usersRepository.create(user)

    const result = await sut.execute({ 
      cpf: '2020202200', 
      password: '2002020', 
      email: 'test@example.com', 
      role: 'student', 
      username: user.username,
      courseId: 'course-not-found',
      poleId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(result.value?.message).toEqual('Course not found.')
  })

  it ('should not be able to create user if pole does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const user = makeUser()
    usersRepository.create(user)

    const result = await sut.execute({ 
      cpf: '2020202200', 
      password: '2002020', 
      email: 'test@example.com', 
      role: 'student', 
      username: user.username,
      courseId: course.id.toValue(),
      poleId: 'pole-not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(result.value?.message).toEqual('Pole not found.')
  })

  it ('should be able to create user with default password', async () => {
    const course = makeCourse()
    coursesRepository.create(course)
    const pole = makePole()
    polesRepository.items.push(pole)

    const data = {
      cpf: '12345678911',
      email: 'test@test.com',
      role: 'student' as Role,
      username: 'John Doe',
      courseId: course.id.toValue(),
      poleId: pole.id.toValue()
    }

    const result = await sut.execute(data)
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toBe(null)
    expect(usersRepository.items).toHaveLength(1)
    expect(usersRepository.items[0].password).toEqual(`Pmp@${data.cpf}-hasher`)
  })

  it ('should be able to create user with password', async () => {
    const course = makeCourse()
    coursesRepository.create(course)
    const pole = makePole()
    polesRepository.items.push(pole)

    const data = {
      cpf: '12345678911',
      email: 'test@test.com',
      role: 'student' as Role,
      username: 'John Doe',
      password: '202020',
      courseId: course.id.toValue(),
      poleId: pole.id.toValue()
    }

    const result = await sut.execute(data)
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toBe(null)
    expect(usersRepository.items).toHaveLength(1)
    expect(usersRepository.items[0].password).toEqual(`${data.password}-hasher`)
  })
})