import { InMemoryReportsBatchRepository } from 'test/repositories/in-memory-reports-batch-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { beforeEach, describe, expect, it } from 'vitest'
import { SendReportBatchUseCase } from './send-report-batch.ts'

let reportsRepository: InMemoryReportsRepository
let sut: SendReportBatchUseCase

describe('Send Report Batch Use Case', () => {
  beforeEach(() => {
    reportsRepository = new InMemoryReportsRepository()
    sut = new SendReportBatchUseCase (
      reportsRepository
    )
  })

  it ('should be able to send a report', async () => {
    const result = await sut.execute({
     title: 'Notes',
     content: 'new notes added in CFP - 2022', 
     reporterIp: '127.0.0.1',
     reporterId: 'random-requester-id',
     fileLink: 'http://localhost:3333',
     fileName: 'Assessment Batch',
     action: 'add'
    })

    expect(result.isRight()).toBe(true)
    expect(reportsRepository.items[0]).toEqual(
      result.value?.report
    )
  })
})  