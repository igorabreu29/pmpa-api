import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts";
import { UpdateBehaviorUseCaseUseCase } from "./update-behavior.ts";
import { makeBehavior } from "test/factories/make-behavior.ts";

let behaviorsRepository: InMemoryBehaviorsRepository
let sut: UpdateBehaviorUseCaseUseCase

describe(('Delete Assessment Use Case'), () => {
  beforeEach(() => {
    behaviorsRepository = new InMemoryBehaviorsRepository()
    sut = new UpdateBehaviorUseCaseUseCase(behaviorsRepository)
  })

  it ('should not be able to update behavior not existing', async () => {
    const result = await sut.execute({
      id: 'not-found',
      userId: '',
      userIp: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to create behavior', async () => {
    const behavior = makeBehavior({ january: 10, february: 5 })
    behaviorsRepository.create(behavior)

    const result = await sut.execute({
      id: behavior.id.toValue(),
      userId: 'user-1',
      userIp: '127.0.0.1'
    })

    expect(result.isRight()).toBe(true)
    expect(behaviorsRepository.items[0]).toMatchObject({
      january: 10,
      february: 5
    })
  })
})