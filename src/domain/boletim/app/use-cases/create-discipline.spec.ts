import { beforeEach, describe, expect, it } from "vitest";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { CreateDisciplineUseCase } from "./create-discipline.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

let disciplinesRepository: InMemoryDisciplinesRepository
let sut: CreateDisciplineUseCase

describe('Create Discpline Use Case', () => {
  beforeEach(() => {
    disciplinesRepository = new InMemoryDisciplinesRepository()
    sut = new CreateDisciplineUseCase(disciplinesRepository)
  })

  it ('should not be able to update discipline if user does not have access', async () => {
    const result = await sut.execute({
      role: 'manager',
      name: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
  
  it ('should not be able to create discipline with name already existing', async () => {
    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)
    
    const result = await sut.execute({ name: discipline.name.value, role: 'dev' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create discipline', async () => {
    const result = await sut.execute({ name: 'Protocols', role: 'dev' })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toBe(null)
    expect(disciplinesRepository.items).toHaveLength(1)
  })
})