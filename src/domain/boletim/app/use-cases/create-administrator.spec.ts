import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { CreateAdminUseCase } from "./create-administrator.ts";
import { InMemoryAdministratorsRepository } from "test/repositories/in-memory-administrators-repository.ts";
import { makeAdministrator } from "test/factories/make-administrator.ts";

import bcryptjs from 'bcryptjs'
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

let administratorsRepository: InMemoryAdministratorsRepository
let sut: CreateAdminUseCase

describe('Create Admin Use Case', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    administratorsRepository = new InMemoryAdministratorsRepository()
    sut = new CreateAdminUseCase(administratorsRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it ('should not be able to create administrator if access is not dev', async () => {
    vi.setSystemTime('2022-1-2')

    const administrator = makeAdministrator()
    administratorsRepository.create(administrator)

    const result = await sut.execute({ 
      cpf: '000.000.000-00', 
      password: administrator.passwordHash.value, 
      email: administrator.email.value, 
      username: administrator.username.value,
      birthday: new Date('2002'),
      civilId: 20202,
      userId: '',
      userIp: '',
      role: 'admin'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
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
      civilId: 20202,
      userId: '',
      userIp: '',
      role: 'dev'
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
      civilId: 20202,
      userId: '',
      userIp: '',
      role: 'dev'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create administrator', async () => {
    const data = {
      cpf: '000.000.000-00',
      email: 'test@test.com',
      username: 'John Doe',
      password: '202020',
      birthday: new Date('2002'),
      civilId: 20202,
      userId: '',
      userIp: '',
      role: 'dev' as Role
    }

    const spyOn = vi.spyOn(bcryptjs, 'hash').mockImplementation((password: string) => {
      return `${data.password}-hashed`
    })

    const result = await sut.execute(data)
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toBe(null)
    expect(administratorsRepository.items).toHaveLength(1)
    expect(administratorsRepository.items[0].passwordHash.value).toEqual(`${data.password}-hashed`)
    expect(spyOn).toHaveBeenCalledOnce()
  })
})