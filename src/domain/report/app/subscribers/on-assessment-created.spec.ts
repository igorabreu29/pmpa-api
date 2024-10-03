import { makeAssessment } from 'test/factories/make-assessment.ts'
import { makeReporter } from 'test/factories/make-reporter.ts'
import { InMemoryAssessmentsRepository } from 'test/repositories/in-memory-assessments-repository.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { OnAssessmentCreated } from './on-assessment-created.ts'
import { AssessmentEvent } from '@/domain/boletim/enterprise/events/assessment-event.ts'

let reportersRepository: InMemoryReportersRepository
let assessmentsRepository: InMemoryAssessmentsRepository

let reportsRepository: InMemoryReportsRepository
let sendReportUseCase: SendReportUseCase

let sendReportExecuteSpy: MockInstance<
  [SendReportUseCaseRequest],
  Promise<SendReportUseCaseResponse>
>

describe('On Assessment Created', () => {
  beforeEach(() => {
    reportersRepository = new InMemoryReportersRepository()

    reportsRepository = new InMemoryReportsRepository(reportersRepository)
    assessmentsRepository = new InMemoryAssessmentsRepository()

    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnAssessmentCreated (
      reportersRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an assessment is created', async () => {
    const reporter = makeReporter()
    reportersRepository.items.push(reporter)

    const assessment = makeAssessment()
    assessment.addDomainAssessmentEvent(new AssessmentEvent({ assessment, reporterId: reporter.id.toValue(), reporterIp: '', courseName: '', disciplineName: '', studentName: "" }))
    assessmentsRepository.create(assessment)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  