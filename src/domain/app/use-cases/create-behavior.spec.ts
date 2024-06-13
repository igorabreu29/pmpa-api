import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { CreateBehaviorUseCase } from "./create-behavior.ts";
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts";
import { makeBehavior } from "test/factories/make-behavior.ts";
import { generateBehaviorAverage } from "../utils/generate-behavior-average.ts";

let behaviorsRepository: InMemoryBehaviorsRepository
let sut: CreateBehaviorUseCase

describe(('Create Behavior Use Case'), () => {
  beforeEach(() => {
    behaviorsRepository = new InMemoryBehaviorsRepository()
    sut = new CreateBehaviorUseCase(behaviorsRepository)
  })

  it ('should not be able to create behavior if already be added', async () => {
    const behavior = makeBehavior()
    behaviorsRepository.create(behavior)

    const result = await sut.execute({
      studentId: behavior.studentId.toValue(),
      courseId: behavior.courseId.toValue(),
      poleId: '',
      currentYear: behavior.currentYear
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to create behavior', async () => {
    const result = await sut.execute({
      studentId: 'user-1',
      courseId: 'course-1',
      poleId: 'pole-1',
      currentYear: new Date().getFullYear()
    })

    expect(result.isRight()).toBe(true)
    expect(behaviorsRepository.items).toHaveLength(1)
  })
})