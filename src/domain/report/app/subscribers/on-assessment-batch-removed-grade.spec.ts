import { makeAssessmentBatch } from 'test/factories/make-assessments-batch.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeReporter } from 'test/factories/make-reporter.ts'
import { InMemoryAssessmentsBatchRepository } from 'test/repositories/in-memory-assessments-batch-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportBatchUseCase, SendReportBatchUseCaseRequest, SendReportBatchUseCaseResponse } from '../use-cases/send-report-batch.ts'
import { InMemoryAssessmentsRepository } from 'test/repositories/in-memory-assessments-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { OnAssessmentBatchRemovedGrade } from './on-assessment-batch-removed-grade.ts'
import { makeAssessment } from 'test/factories/make-assessment.ts'

let assessmentsRepository: InMemoryAssessmentsRepository

let reportersRepository: InMemoryReportersRepository
let coursesRepository: InMemoryCoursesRepository
let assessmentsBatchRepository: InMemoryAssessmentsBatchRepository

let reportsRepository: InMemoryReportsRepository
let sendReportBatchUseCase: SendReportBatchUseCase

let sendReportBatchExecuteSpy: MockInstance<
  [SendReportBatchUseCaseRequest],
  Promise<SendReportBatchUseCaseResponse>
>

describe('On Assessment Batch Removed Grade', () => {
  beforeEach(() => {
    assessmentsRepository = new InMemoryAssessmentsRepository()

    coursesRepository = new InMemoryCoursesRepository()
    reportersRepository = new InMemoryReportersRepository()

    reportsRepository = new InMemoryReportsRepository(reportersRepository)
    assessmentsBatchRepository = new InMemoryAssessmentsBatchRepository(
      assessmentsRepository
    )

    sendReportBatchUseCase = new SendReportBatchUseCase(
      reportsRepository
    )
    
    sendReportBatchExecuteSpy = vi.spyOn(sendReportBatchUseCase, 'execute')

    new OnAssessmentBatchRemovedGrade (
      reportersRepository,
      coursesRepository,
      sendReportBatchUseCase
    )
  })

  it ('should send a report when an assessments are removed', async () => {
    const course = makeCourse()
    const reporter = makeReporter()

    coursesRepository.create(course)
    reportersRepository.items.push(reporter)

    const assessment = makeAssessment({ avi: 10 })
    const assessmentBatch = makeAssessmentBatch({ courseId: course.id, userId: reporter.id, assessments: [assessment] })
    assessmentsBatchRepository.items.push(assessmentBatch)

    assessmentBatch.assessments[0].avi = null

    assessmentsBatchRepository.save(assessmentBatch)

    await waitFor(() => {
      expect(sendReportBatchExecuteSpy).toHaveBeenCalled()
    })
  })
})  