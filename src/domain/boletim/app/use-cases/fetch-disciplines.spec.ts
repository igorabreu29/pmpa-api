import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { FetchDisciplinesUseCase } from "./fetch-disciplines.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";

let disciplinesRepository: InMemoryDisciplinesRepository
let sut: FetchDisciplinesUseCase

describe('Fetch Disciplines Use Case', () => {
  beforeEach(() => {
    disciplinesRepository = new InMemoryDisciplinesRepository()
    sut = new FetchDisciplinesUseCase(disciplinesRepository)
  })

  it ('should be able to fetch disciplines', async () => {
    const nameOrError = Name.create('discipline-1')
    if (nameOrError.isLeft()) return
    
    const nameOrError2 = Name.create('discipline-2')
    if (nameOrError2.isLeft()) return

    const discipline = makeDiscipline({
      name: nameOrError.value
    })
    disciplinesRepository.create(discipline)

    const discipline2 = makeDiscipline({
      name: nameOrError2.value
    })
    disciplinesRepository.create(discipline2)

    const result = await sut.execute({
      page: 1
    })


    expect(result.isRight()).toBe(true)
    expect(result.value?.disciplines).toMatchObject([
      {
        id: discipline.id,
        name: discipline.name
      },
      {
        id: discipline2.id,
        name: {
          value: discipline2.name.value
        }
      }
    ])
  })
})