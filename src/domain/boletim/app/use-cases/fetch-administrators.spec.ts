import { makeAdministrator } from "test/factories/make-administrator.ts";
import { InMemoryAdministratorsRepository } from "test/repositories/in-memory-administrators-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { FetchAdministratorsUseCase } from "./fetch-administrators.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts";

let administratorsRepository: InMemoryAdministratorsRepository
let sut: FetchAdministratorsUseCase

describe('Fetch Administrators', () => {
  beforeEach(() => {
    administratorsRepository = new InMemoryAdministratorsRepository()
    sut = new FetchAdministratorsUseCase(administratorsRepository)
  })

  it ('should be able to fetch administrators', async () => {
    const administrator = makeAdministrator()
    const administrator2 = makeAdministrator()

    administratorsRepository.create(administrator)
    administratorsRepository.create(administrator2)

    const result = await sut.execute({
      page: 1
    })

    expect(result.value?.administrators).toMatchObject([
      {
        id: administrator.id,
      },
      {
        id: administrator2.id,
      }
    ])
  })

  it ('should be able to fetch administrator with cpf filter', async () => {
    const cpfOrError = CPF.create('000.000.000-01')
    if (cpfOrError.isLeft()) return

    const administrator = makeAdministrator({ cpf: cpfOrError.value })
    const administrator2 = makeAdministrator()

    administratorsRepository.create(administrator)
    administratorsRepository.create(administrator2)

    const result = await sut.execute({
      page: 1,
      cpf: '01'
    })

    expect(result.value?.administrators).toMatchObject([
      {
        id: administrator.id,
      },
    ])
  })

  it ('should be able to fetch administrator with username filter', async () => {
    const nameOrError = Name.create('Random')
    if (nameOrError.isLeft()) return

    const administrator = makeAdministrator({ username: nameOrError.value })
    const administrator2 = makeAdministrator()

    administratorsRepository.create(administrator)
    administratorsRepository.create(administrator2)

    const result = await sut.execute({
      page: 1,
      username: 'random'
    })

    expect(result.value?.administrators).toMatchObject([
      {
        id: administrator.id,
      },
    ])
  })

  it ('should be able to paginated administrators', async () => {
    for (let i = 1; i <= 12; i++) {
      const nameOrError = Name.create(`john-${i}`)
      if (nameOrError.isLeft()) return

      const administrator = makeAdministrator({ username: nameOrError.value })
      administratorsRepository.create(administrator)
    }

    const result = await sut.execute({
      page: 2
    })

    expect(result.value?.administrators).toHaveLength(2)
    expect(result.value?.administrators).toMatchObject([
      {
        username: {
          value: 'john-11'
        },
      },
      {
        username: {
          value: 'john-12'
        },
      }
    ])
    expect(result.value).toMatchObject({
      pages: 2,
      totalItems: 12
    })
  })
})