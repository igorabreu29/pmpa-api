import { FakeHasher } from "test/cryptograpy/fake-hasher.ts";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "test/factories/make-user.ts";
import { Role } from "@/domain/enterprise/entities/user.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { CreateAdminUseCase } from "./create-admin.ts";

let usersRepository: InMemoryUsersRepository
let hasher: FakeHasher
let sut: CreateAdminUseCase

describe('Create Admin Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    hasher = new FakeHasher()
    sut = new CreateAdminUseCase(usersRepository, hasher)
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
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create user with password', async () => {

    const data = {
      cpf: '12345678911',
      email: 'test@test.com',
      role: 'student' as Role,
      username: 'John Doe',
      password: '202020',
    }

    const result = await sut.execute(data)
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toBe(null)
    expect(usersRepository.items).toHaveLength(1)
    expect(usersRepository.items[0].password).toEqual(`${data.password}-hasher`)
  })
})