import { FakeHasher } from "test/cryptograpy/fake-hasher.ts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { CreateAdminUseCase } from "./create-administrator.ts";
import { InMemoryAdministratorsRepository } from "test/repositories/in-memory-administrators-repository.ts";
import { makeAdministrator } from "test/factories/make-administrator.ts";

let administratorsRepository: InMemoryAdministratorsRepository
let hasher: FakeHasher
let sut: CreateAdminUseCase

describe('Create Admin Use Case', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    administratorsRepository = new InMemoryAdministratorsRepository()
    hasher = new FakeHasher()
    sut = new CreateAdminUseCase(administratorsRepository, hasher)
  })

  afterEach(() => {
    vi.useRealTimers()
  })
  
  it ('should not be able to create administrator with cpf already existing', async () => {
    vi.setSystemTime('2022-1-2')

    const administrator = makeAdministrator()
    administratorsRepository.create(administrator)

    const result = await sut.execute({ 
      cpf: '000.000.000-00', 
      password: administrator.passwordHash.value, 
      email: administrator.email.value, 
      username: administrator.username.value,
      birthday: new Date('2002'),
      civilID: 20202
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should not be able to create administrator with email already existing', async () => {
    vi.setSystemTime('2022-1-2')

    const administrator = makeAdministrator()
    administratorsRepository.create(administrator)

    const result = await sut.execute({ 
      cpf: '111.000.111-00', 
      password: administrator.passwordHash.value, 
      email: administrator.email.value, 
      username: administrator.username.value,
      birthday: new Date('2002'),
      civilID: 20202
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create administrator with password', async () => {
    const data = {
      cpf: '000.000.000-00',
      email: 'test@test.com',
      username: 'John Doe',
      password: '202020',
      birthday: new Date('2002'),
      civilID: 20202
    }

    const result = await sut.execute(data)
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toBe(null)
    expect(administratorsRepository.items).toHaveLength(1)
    expect(administratorsRepository.items[0].passwordHash.value).toEqual(`${data.password}-hasher`)
  })
})