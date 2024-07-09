import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ChangeManagerStatusUseCase } from "./change-manager-status.ts";
import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts";
import { makeManager } from "test/factories/make-manager.ts";

let managersRepository: InMemoryManagersRepository
let sut: ChangeManagerStatusUseCase

describe('Change Manager Status Use Case', () => {
  beforeEach(() => {
    managersRepository = new InMemoryManagersRepository()
    sut = new ChangeManagerStatusUseCase(managersRepository)
  })

  it ('should not be able to change status if user not exist', async () => {
    const result = await sut.execute({ id: 'not-found', status: false })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to change student status', async () => {
    const manager = makeManager()
    managersRepository.create(manager)

    const result = await sut.execute({ id: manager.id.toValue(), status: false })

    expect(result.isRight()).toBe(true)
    expect(managersRepository.items[0].active).toBe(false)
  })
})