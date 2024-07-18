import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { InMemoryAdministratorsRepository } from "test/repositories/in-memory-administrators-repository.ts";
import { GetAdministratorProfileUseCase } from "./get-administrator-profile.ts";
import { makeAdministrator } from "test/factories/make-administrator.ts";

let administratorsRepository: InMemoryAdministratorsRepository
let sut: GetAdministratorProfileUseCase

describe('Get Administrator Profile Use Case', () => {
  beforeEach (() => {
    administratorsRepository = new InMemoryAdministratorsRepository()
    sut = new GetAdministratorProfileUseCase (
      administratorsRepository
    )
  })

  it ('should not be able to get administrator profile does not exist', async () => {
    const result = await sut.execute({ id: 'not-found' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get administrator profile', async () => {
    const administrator = makeAdministrator() 
    administratorsRepository.create(administrator)

    const result = await sut.execute({ id: administrator.id.toValue() })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      administrator: {
        id: administrator.id,
      }
    })
  })
})