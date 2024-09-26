import { InMemoryReportsRepository } from "test/repositories/in-memory-reports-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { FetchReportsUseCase } from "./fetch-reports.ts";
import { makeReport } from "test/factories/make-report.ts";
import { InMemoryReportersRepository } from "test/repositories/in-memory-reporters-repository.ts";
import { makeReporter } from "test/factories/make-reporter.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";

let reportersRepository: InMemoryReportersRepository

let reportsRepository: InMemoryReportsRepository
let sut: FetchReportsUseCase

describe('Fetch Reports Use Case', () => {
  beforeEach(() => {
    reportersRepository = new InMemoryReportersRepository()

    reportsRepository = new InMemoryReportsRepository(
      reportersRepository
    )
    sut = new FetchReportsUseCase(
      reportsRepository
    )
  })

  it ('should be able to fetch reports', async () => {
    const reporter = makeReporter()
    reportersRepository.items.push(reporter)

    const report = makeReport({ title: 'Create', reporterId: reporter.id.toValue() })
    reportsRepository.create(report)
  
    const report2 = makeReport({ title: 'Delete', reporterId: reporter.id.toValue() })
    reportsRepository.create(report2)

    const result = await sut.execute({ action: '', page: 1, role: reporter.role })
    
    expect(result.value?.reports).toMatchObject([
      {
        id: report.id,
        title: report.title
      },
      {
        id: report2.id,
        title: report2.title
      }
    ])
  })

  it ('should be able to fetch reports by action', async () => {
    const reporter = makeReporter()
    reportersRepository.items.push(reporter)

    const report = makeReport({ title: 'Create', reporterId: reporter.id.toValue() })
    reportsRepository.create(report)
  
    const report2 = makeReport({ title: 'Delete', action: 'remove', reporterId: reporter.id.toValue() })
    reportsRepository.create(report2)

    const result = await sut.execute({ action: 'add', page: 1, role: reporter.role })

    expect(result.value?.reports).toMatchObject([
      {
        id: report.id,
        title: report.title
      }
    ])
  })

  it ('should be able to fetch reports by username', async () => {
    const nameOrError = Name.create('Random')
    if (nameOrError.isLeft()) return

    const reporter = makeReporter({ username: nameOrError.value })
    reportersRepository.items.push(reporter)

    const reporter2 = makeReporter()
    reportersRepository.items.push(reporter2)

    const report = makeReport({ title: 'Create', reporterId: reporter.id.toValue() })
    reportsRepository.create(report)
  
    const report2 = makeReport({ title: 'Delete', reporterId: reporter2.id.toValue() })
    reportsRepository.create(report2)

    const result = await sut.execute({ action: 'add', page: 1, role: reporter.role, username: 'random' })

    expect(result.value?.reports).toMatchObject([
      {
        id: report.id,
        title: report.title
      }
    ])
  })

  it ('should be able to paginated reports', async () => {
    const reporter = makeReporter()
    reportersRepository.items.push(reporter)

    for (let i = 1; i <= 12; i++) {
      const report = makeReport({ title: `title-${i}`, reporterId: reporter.id.toValue() })
      reportsRepository.create(report)
    }

    const result = await sut.execute({ action: 'add', page: 2, role: reporter.role })
    
    expect(result.value?.reports).toMatchObject([
      {
        title: 'title-11'
      },
      {
        title: 'title-12'
      },
    ])
  })
})