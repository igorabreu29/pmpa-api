import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { CreatePoleUseCase } from "./create-pole.ts";
import { makePole } from "test/factories/make-pole.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";

let polesRepository: InMemoryPolesRepository
let sut: CreatePoleUseCase

describe(('Create Pole Use Case'), () => {
  beforeEach(() => {
    polesRepository = new InMemoryPolesRepository()
    sut = new CreatePoleUseCase(polesRepository)
  })

  it ('should not be able to create pole already existing', async () => {
    const pole = makePole()
    polesRepository.items.push(pole)

    const result = await sut.execute({ name: pole.name.value })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create pole', async () => {
    const result = await sut.execute({ name: 'new-pole' })

    expect(result.isRight()).toBe(true)
    expect(polesRepository.items[0].id).toBeTruthy()
  })
})