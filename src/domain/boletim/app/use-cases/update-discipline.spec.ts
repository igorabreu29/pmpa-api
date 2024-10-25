import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { UpdateDisciplineUseCase } from "./update-discipline.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

let disciplinesRepository: InMemoryDisciplinesRepository
let sut: UpdateDisciplineUseCase

describe('Update Discipline Use Case', () => {
  beforeEach(() => {
    disciplinesRepository = new InMemoryDisciplinesRepository()
    sut = new UpdateDisciplineUseCase(
      disciplinesRepository
    )
  })

  it ('should not be able to update discipline if user does not have access', async () => {
    const result = await sut.execute({
      id: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to update discipline if it does not exist', async () => {
    const result = await sut.execute({
      id: 'not-found',
      role: 'dev'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to update discipline if name is invalid', async () => {
    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const result = await sut.execute({
      id: discipline.id.toValue(),
      name: '',
      role: 'dev'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidNameError)
  })

  it ('should be able to update discipline', async () => {
    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const result = await sut.execute({
      id: discipline.id.toValue(),
      name: 'discipline-1',
      role: 'dev'
    })

    expect(result.isRight()).toBe(true)
    expect(disciplinesRepository.items[0].name.value).toEqual('discipline-1')
  })
})