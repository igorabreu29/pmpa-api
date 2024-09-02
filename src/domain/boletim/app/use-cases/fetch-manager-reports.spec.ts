import { InMemoryReportsRepository } from "test/repositories/in-memory-reports-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { makeReport } from "test/factories/make-report.ts";
import { FetchManagerReportsUseCase } from "./fetch-manager-reports.ts";

let reportsRepository: InMemoryReportsRepository
let sut: FetchManagerReportsUseCase

describe('Fetch Reports By Manager Use Case', () => {
  beforeEach(() => {
    reportsRepository = new InMemoryReportsRepository()
    sut = new FetchManagerReportsUseCase(
      reportsRepository
    )
  })

  it ('should be able to fetch reports by manager', async () => {
    const courseId = 'course-1'
    const managerId = 'manager-1'

    const report = makeReport({ title: 'Create', reporterId: managerId, courseId })
    reportsRepository.create(report)
  
    const report2 = makeReport({ title: 'Delete', reporterId: managerId, courseId })
    reportsRepository.create(report2)

    const report3 = makeReport({ title: 'Edit', courseId })
    reportsRepository.create(report3)

    const result = await sut.execute({ action: '', page: 1, courseId, managerId })
    
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

  it ('should be able to fetch reports by manager with filter action', async () => {
    const courseId = 'course-1'
    const managerId = 'manager-1'

    const report = makeReport({ title: 'Create', courseId, reporterId: managerId })
    reportsRepository.create(report)
  
    const report2 = makeReport({ title: 'Delete', action: 'remove', courseId })
    reportsRepository.create(report2)

    const result = await sut.execute({ action: 'add', page: 1, courseId, managerId })
    
    expect(result.value?.reports).toMatchObject([
      {
        id: report.id,
        title: report.title
      }
    ])
  })

  it ('should be able to paginated reports', async () => {
    const courseId = 'course-1'
    const managerId = 'manager-1'

    for (let i = 1; i <= 12; i++) {
      const report = makeReport({ title: `title-${i}`, courseId, reporterId: managerId })
      reportsRepository.create(report)
    }

    const result = await sut.execute({ action: 'add', page: 2, courseId, managerId })
    
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