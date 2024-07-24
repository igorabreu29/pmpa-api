import { makeBehaviorBatch } from 'test/factories/make-behavior-batch.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeReporter } from 'test/factories/make-reporter.ts'
import { InMemoryBehaviorsBatchRepository } from 'test/repositories/in-memory-behaviors-batch-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsBatchRepository } from 'test/repositories/in-memory-reports-batch-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportBatchUseCase, SendReportBatchUseCaseRequest, SendReportBatchUseCaseResponse } from '../use-cases/send-report-batch.ts'
import { OnBehaviorBatchCreated } from './on-behavior-batch-created.ts'

let reportersRepository: InMemoryReportersRepository
let coursesRepository: InMemoryCoursesRepository
let behaviorsBatchRepository: InMemoryBehaviorsBatchRepository

let reportsBatchRepository: InMemoryReportsBatchRepository
let sendReportBatchUseCase: SendReportBatchUseCase

let sendReportBatchExecuteSpy: MockInstance<
  [SendReportBatchUseCaseRequest],
  Promise<SendReportBatchUseCaseResponse>
>

describe('On Behavior Batch Created', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    reportersRepository = new InMemoryReportersRepository()

    reportsBatchRepository = new InMemoryReportsBatchRepository()
    behaviorsBatchRepository = new InMemoryBehaviorsBatchRepository()

    sendReportBatchUseCase = new SendReportBatchUseCase(
      reportsBatchRepository
    )
    
    sendReportBatchExecuteSpy = vi.spyOn(sendReportBatchUseCase, 'execute')

    new OnBehaviorBatchCreated (
      reportersRepository,
      coursesRepository,
      sendReportBatchUseCase
    )
  })

  it ('should send a report when an behavior batch is created', async () => {
    const course = makeCourse()
    const reporter = makeReporter()

    coursesRepository.create(course)
    reportersRepository.items.push(reporter)

    const behaviorBatch = makeBehaviorBatch({ courseId: course.id, userId: reporter.id })
    behaviorsBatchRepository.create(behaviorBatch)

    await waitFor(() => {
      expect(sendReportBatchExecuteSpy).toHaveBeenCalled()
    })
  })
})  