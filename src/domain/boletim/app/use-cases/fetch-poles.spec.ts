import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { FetchPolesUseCase } from "./fetch-poles.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makePole } from "test/factories/make-pole.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";

let polesRepository: InMemoryPolesRepository
let sut: FetchPolesUseCase

describe('Fetch Poles Use Case', () => {
  beforeEach(() => {
    polesRepository = new InMemoryPolesRepository()
    sut = new FetchPolesUseCase(polesRepository)
  })

  it ('should be able to fetch poles', async () => {
    const nameOrError = Name.create('pole-1')
    if (nameOrError.isLeft()) return
    
    const nameOrError2 = Name.create('pole-2')
    if (nameOrError2.isLeft()) return

    const pole = makePole({
      name: nameOrError.value
    })
    polesRepository.create(pole)

    const pole2 = makePole({
      name: nameOrError2.value
    })
    polesRepository.create(pole2)

    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    expect(result.value?.poles).toMatchObject([
      {
        id: pole.id,
        name: pole.name
      },
      {
        id: pole2.id,
        name: {
          value: pole2.name.value
        }
      }
    ])
  })
})