import { FakeHasher } from "test/cryptograpy/fake-hasher.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { makeAdministrator } from "test/factories/make-administrator.ts";
import { InMemoryDevelopersRepository } from "test/repositories/in-memory-developers-repository.ts";
import { CreateDeveloperUseCase } from "./create-developer.ts";
import { makeDeveloper } from "test/factories/make-developer.ts";

let developersRepository: InMemoryDevelopersRepository
let hasher: FakeHasher
let sut: CreateDeveloperUseCase

describe('Create Developer Use Case', () => {
  beforeEach(() => {
    developersRepository = new InMemoryDevelopersRepository()
    hasher = new FakeHasher()
    sut = new CreateDeveloperUseCase(developersRepository, hasher)
  })
  
  it ('should not be able to create developer with cpf already existing', async () => {
    const developer = makeDeveloper()
    developersRepository.create(developer)

    const result = await sut.execute({ 
      cpf: developer.cpf, 
      password: developer.passwordHash, 
      email: developer.email, 
      username: developer.username,
      birthday: new Date('2022'),
      civilID: 20202
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should not be able to create developer with email already existing', async () => {
    const developer = makeDeveloper()
    developersRepository.create(developer)

    const result = await sut.execute({ 
      cpf: '2020202200', 
      password: developer.passwordHash, 
      email: developer.email, 
      username: developer.username,
      birthday: new Date('2022'),
      civilID: 20202
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create developer with password', async () => {
    const data = {
      cpf: '12345678911',
      email: 'test@test.com',
      username: 'John Doe',
      password: '202020',
      birthday: new Date('2022'),
      civilID: 20202
    }

    const result = await sut.execute(data)
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toBe(null)
    expect(developersRepository.items).toHaveLength(1)
    expect(developersRepository.items[0].passwordHash).toEqual(`${data.password}-hasher`)
  })
})