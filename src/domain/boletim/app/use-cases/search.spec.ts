import { beforeEach, describe, expect, it } from 'vitest'
import { InMemorySearchsRepository } from 'test/repositories/in-memory-searchs-repository.ts'
import { Name } from '../../enterprise/entities/value-objects/name.ts'
import { makeSearch } from 'test/factories/make-search.ts'
import { SearchUseCase } from './search.ts'

let searchsRepository: InMemorySearchsRepository
let sut: SearchUseCase

describe('Administrator Survey', () => {
  beforeEach(() => {
    searchsRepository = new InMemorySearchsRepository()

    sut = new SearchUseCase(
      searchsRepository,
    )
  })

  it ('should be able to administrator survey', async () => {
    const studentNameOrError = Name.create('John Doe')
    if (studentNameOrError.isLeft()) return

    const managerNameOrError = Name.create('Jonas Doe')
    if (managerNameOrError.isLeft()) return

    const adminNameOrError = Name.create('Adams')
    if (adminNameOrError.isLeft()) return

    const student = makeSearch({ username: studentNameOrError.value, role: 'student' })
    const manager = makeSearch({ username: managerNameOrError.value, role: 'manager' })
    const administrator = makeSearch({ username: adminNameOrError.value, role: 'admin' })

    searchsRepository.items.push(student)
    searchsRepository.items.push(manager)
    searchsRepository.items.push(administrator)

    const result = await sut.execute({
      query: '',
      page: 1,
      role: 'admin'
    })

    expect(result.isRight()).toBe(true)
    expect(result.value?.searchs).toMatchObject([
      {
        id: administrator.id,
        username: administrator.username,
      },
      {
        id: student.id,
        username: student.username,
      },
      {
        id: manager.id,
        username: manager.username,
      }
    ])
  })
})