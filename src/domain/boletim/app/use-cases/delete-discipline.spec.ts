import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { DeleteDisciplineUseCase } from "./delete-discipline.ts";

let disciplinesRepository: InMemoryDisciplinesRepository
let sut: DeleteDisciplineUseCase

describe('Delete Discipline Use Case', () => {
  beforeEach(() => {
    disciplinesRepository = new InMemoryDisciplinesRepository()
    sut = new DeleteDisciplineUseCase(
      disciplinesRepository
    )
  })

  it ('should not be able to delete discipline if it does not exist', async () => {
    const result = await sut.execute({
      id: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to delete discipline', async () => {
    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const result = await sut.execute({
      id: discipline.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    expect(disciplinesRepository.items).toHaveLength(0)
  })
})