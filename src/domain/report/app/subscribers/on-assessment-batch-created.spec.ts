import { makeAssessmentBatch } from 'test/factories/make-assessments-batch.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeReporter } from 'test/factories/make-reporter.ts'
import { InMemoryAssessmentsBatchRepository } from 'test/repositories/in-memory-assessments-batch-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsBatchRepository } from 'test/repositories/in-memory-reports-batch-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportBatchUseCase, SendReportBatchUseCaseRequest, SendReportBatchUseCaseResponse } from '../use-cases/send-report-batch.ts'
import { OnAssessmentBatchCreated } from './on-assessment-batch-created.ts'

let reportersRepository: InMemoryReportersRepository
let coursesRepository: InMemoryCoursesRepository
let assessmentsBatchRepository: InMemoryAssessmentsBatchRepository

let reportsBatchRepository: InMemoryReportsBatchRepository
let sendReportBatchUseCase: SendReportBatchUseCase

let sendReportBatchExecuteSpy: MockInstance<
  [SendReportBatchUseCaseRequest],
  Promise<SendReportBatchUseCaseResponse>
>

describe('On Assessment Batch Created', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    reportersRepository = new InMemoryReportersRepository()

    reportsBatchRepository = new InMemoryReportsBatchRepository()
    assessmentsBatchRepository = new InMemoryAssessmentsBatchRepository()

    sendReportBatchUseCase = new SendReportBatchUseCase(
      reportsBatchRepository
    )
    
    sendReportBatchExecuteSpy = vi.spyOn(sendReportBatchUseCase, 'execute')

    new OnAssessmentBatchCreated (
      reportersRepository,
      coursesRepository,
      sendReportBatchUseCase
    )
  })

  it ('should send a report when an assessment batch is created', async () => {
    const course = makeCourse()
    const reporter = makeReporter()

    coursesRepository.create(course)
    reportersRepository.items.push(reporter)

    const assessmentBatch = makeAssessmentBatch({ courseId: course.id, userId: reporter.id })
    assessmentsBatchRepository.create(assessmentBatch)

    await waitFor(() => {
      expect(sendReportBatchExecuteSpy).toHaveBeenCalled()
    })
  })
})  