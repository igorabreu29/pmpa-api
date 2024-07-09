import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ChangeManagerStatusUseCase } from "./change-manager-status.ts";
import { makeManager } from "test/factories/make-manager.ts";
import { InMemoryAdministratorsRepository } from "test/repositories/in-memory-administrators-repository.ts";
import { ChangeAdministratorStatusUseCase } from "./change-administrator-status.ts";
import { makeAdministrator } from "test/factories/make-administrator.ts";

let administratorsRepository: InMemoryAdministratorsRepository
let sut: ChangeAdministratorStatusUseCase

describe('Change Administrator Status Use Case', () => {
  beforeEach(() => {
    administratorsRepository = new InMemoryAdministratorsRepository()
    sut = new ChangeAdministratorStatusUseCase(administratorsRepository)
  })

  it ('should not be able to change status if user not exist', async () => {
    const result = await sut.execute({ id: 'not-found', status: false })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to change student status', async () => {
    const administrator = makeAdministrator()
    administratorsRepository.create(administrator)

    const result = await sut.execute({ id: administrator.id.toValue(), status: false })

    expect(result.isRight()).toBe(true)
    expect(administratorsRepository.items[0].active).toBe(false)
  })
})