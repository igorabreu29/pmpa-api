import { beforeEach, describe, expect, it } from "vitest";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { CreateDisciplineUseCase } from "./create-discipline.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";

let disciplinesRepository: InMemoryDisciplinesRepository
let sut: CreateDisciplineUseCase

describe('Create Discpline Use Case', () => {
  beforeEach(() => {
    disciplinesRepository = new InMemoryDisciplinesRepository()
    sut = new CreateDisciplineUseCase(disciplinesRepository)
  })
  
  it ('should not be able to create discipline with name already existing', async () => {
    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const result = await sut.execute({ name: discipline.name })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create discipline', async () => {
    const result = await sut.execute({ name: 'Protocols' })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toBe(null)
    expect(disciplinesRepository.items).toHaveLength(1)
  })
})