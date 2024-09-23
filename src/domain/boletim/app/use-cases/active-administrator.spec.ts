import { InMemoryAdministratorsRepository } from "test/repositories/in-memory-administrators-repository.ts";
import { ActiveAdministratorUseCase } from "./active-administrator.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeAdministrator } from "test/factories/make-administrator.ts";

let administratorsRepository: InMemoryAdministratorsRepository
let sut: ActiveAdministratorUseCase

describe('Active Administrator Use Case', () => {
  beforeEach(() => {
    administratorsRepository = new InMemoryAdministratorsRepository()
    sut = new ActiveAdministratorUseCase(administratorsRepository)
  })

  it ('should not be able to active administrator if access is not dev', async () => {
    const result = await sut.execute({ 
      id: 'not-found', 
      reason: '', 
      userId: '', 
      userIp: '', 
      role: 'admin' 
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to active administrator if it does not exist', async () => {
    const result = await sut.execute({ 
      id: 'not-found', 
      reason: '', 
      userId: '', 
      userIp: '', 
      role: 'dev' 
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to active administrator', async () => {
    const administrator = makeAdministrator({ isActive: false })
    administratorsRepository.create(administrator)

    const result = await sut.execute({ 
      id: administrator.id.toValue(), 
      reason: '', 
      userId: '', 
      userIp: '', 
      role: 'dev' 
    })
    
    expect(result.isRight()).toBe(true)
    expect(administratorsRepository.items[0].isActive).toBe(true)
  })
})