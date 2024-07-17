import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { SendReportUseCase } from './send-report.ts'

let reportsRepository: InMemoryReportsRepository
let sut: SendReportUseCase

describe('Send Report Use Case', () => {
  beforeEach(() => {
    reportsRepository = new InMemoryReportsRepository()
    sut = new SendReportUseCase(
      reportsRepository
    )
  })

  it ('should be able to send a report', async () => {
    const result = await sut.execute({
     title: 'Notes',
     content: 'new notes added in CFP - 2022', 
     ip: '',
     userId: ''
    })

    expect(result.isRight()).toBe(true)
    expect(reportsRepository.items[0]).toEqual(
      result.value?.report
    )
  })
})  