import { InMemoryReportsRepository } from "test/repositories/in-memory-reports-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { FetchReportsUseCase } from "./fetch-reports.ts";
import { makeReport } from "test/factories/make-report.ts";

let reportsRepository: InMemoryReportsRepository
let sut: FetchReportsUseCase

describe('Fetch Reports Use Case', () => {
  beforeEach(() => {
    reportsRepository = new InMemoryReportsRepository()
    sut = new FetchReportsUseCase(
      reportsRepository
    )
  })

  it ('should be able to fetch reports', async () => {
    const report = makeReport({ title: 'Create' })
    reportsRepository.create(report)
  
    const report2 = makeReport({ title: 'Delete' })
    reportsRepository.create(report2)

    const result = await sut.execute({ action: '' })
    
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
    const report = makeReport({ title: 'Create' })
    reportsRepository.create(report)
  
    const report2 = makeReport({ title: 'Delete', action: 'remove' })
    reportsRepository.create(report2)

    const result = await sut.execute({ action: 'add' })
    
    expect(result.value?.reports).toMatchObject([
      {
        id: report.id,
        title: report.title
      }
    ])
  })
})