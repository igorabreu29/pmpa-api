import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts";
import { DeleteBehaviorUseCaseUseCase } from "./delete-behavior.ts";
import { makeBehavior } from "test/factories/make-behavior.ts";

let behaviorsRepository: InMemoryBehaviorsRepository
let sut: DeleteBehaviorUseCaseUseCase

describe(('Delete Behavior Use Case'), () => {
  beforeEach(() => {
    behaviorsRepository = new InMemoryBehaviorsRepository()
    sut = new DeleteBehaviorUseCaseUseCase(behaviorsRepository)
  })

  it ('should not be able to delete assessment not existing', async () => {
    const result = await sut.execute({
      id: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to create assessment', async () => {
    const behavior = makeBehavior()
    behaviorsRepository.create(behavior)

    const result = await sut.execute({
      id: behavior.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(behaviorsRepository.items).toHaveLength(0)
  })
})