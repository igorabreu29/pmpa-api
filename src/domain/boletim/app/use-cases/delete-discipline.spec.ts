import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { DeleteDisciplineUseCase } from "./delete-discipline.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

let disciplinesRepository: InMemoryDisciplinesRepository
let sut: DeleteDisciplineUseCase

describe('Delete Discipline Use Case', () => {
  beforeEach(() => {
    disciplinesRepository = new InMemoryDisciplinesRepository()
    sut = new DeleteDisciplineUseCase(
      disciplinesRepository
    )
  })

  it ('should not be able to delete discipline if user does not have', async () => {
    const result = await sut.execute({
      id: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to delete discipline if it does not exist', async () => {
    const result = await sut.execute({
      id: 'not-found',
      role: 'dev'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to delete discipline', async () => {
    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const result = await sut.execute({
      id: discipline.id.toValue(),
      role: 'dev'
    })

    expect(result.isRight()).toBe(true)
    expect(disciplinesRepository.items).toHaveLength(0)
  })
})