import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { InMemoryDevelopersRepository } from "test/repositories/in-memory-developers-repository.ts";
import { CreateDeveloperUseCase } from "./create-developer.ts";
import { makeDeveloper } from "test/factories/make-developer.ts";

import bcryptjs from 'bcryptjs'
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";

let developersRepository: InMemoryDevelopersRepository
let sut: CreateDeveloperUseCase

describe('Create Developer Use Case', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    developersRepository = new InMemoryDevelopersRepository()
    sut = new CreateDeveloperUseCase(developersRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it ('should not be able to create developer if access is not dev', async () => {
    const result = await sut.execute({ 
      cpf: '000.000.000-00', 
      password: '', 
      email: '', 
      username: '',
      civilId: 20202,
      role: 'admin',
      birthday: new Date()
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
  
  it ('should not be able to create developer with cpf already existing', async () => {
    vi.setSystemTime('2022-1-2')

    const developer = makeDeveloper()
    developersRepository.create(developer)

    const result = await sut.execute({ 
      cpf: '000.000.000-00', 
      password: developer.passwordHash.value, 
      email: developer.email.value, 
      username: developer.username.value,
      civilId: 20202,
      role: 'dev',
      birthday: new Date('2002')
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should not be able to create developer with email already existing', async () => {
    const developer = makeDeveloper()
    developersRepository.create(developer)

    const result = await sut.execute({ 
      cpf: '000.000.000-00', 
      password: developer.passwordHash.value, 
      email: developer.email.value, 
      username: developer.username.value,
      civilId: 20202,
      role: 'dev',
      birthday: new Date('2002')
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create developer', async () => {
    const data = {
      cpf: '000.000.000-00',
      email: 'test@test.com',
      username: 'John Doe',
      password: '202020',
      civilId: 20202,
      birthday: new Date('2002'),
      role: 'dev' as Role
    }

    const spyOn = vi.spyOn(bcryptjs, 'hash').mockImplementation((password: string) => {
      return `${data.password}-hashed`
    })

    const result = await sut.execute(data)
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toBe(null)
    expect(developersRepository.items).toHaveLength(1)
    expect(developersRepository.items[0].passwordHash.value).toEqual(`${data.password}-hashed`)
    expect(spyOn).toHaveBeenCalledOnce()
  })
})