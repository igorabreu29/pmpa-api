import { InMemoryReportsBatchRepository } from 'test/repositories/in-memory-reports-batch-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { beforeEach, describe, expect, it } from 'vitest'
import { SendReportBatchUseCase } from './send-report-batch.ts'
import { SendReportUseCase } from './send-report.ts'

let reportsBatchRepository: InMemoryReportsBatchRepository
let sut: SendReportBatchUseCase

describe('Send Report Batch Use Case', () => {
  beforeEach(() => {
    reportsBatchRepository = new InMemoryReportsBatchRepository()
    sut = new SendReportBatchUseCase (
      reportsBatchRepository
    )
  })

  it ('should be able to send a report', async () => {
    const result = await sut.execute({
     title: 'Notes',
     content: 'new notes added in CFP - 2022', 
     ip: '127.0.0.1',
     userId: 'random-requester-id',
     fileLink: 'http://localhost:3333',
     fileName: 'Assessment Batch'
    })

    expect(result.isRight()).toBe(true)
    expect(reportsBatchRepository.items[0]).toEqual(
      result.value?.reportBatch
    )
  })
})  