import { InMemoryDisciplinesRepository } from 'test/repositories/in-memory-disciplines-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { describe, it, expect, beforeEach, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { InMemoryUsersCourseRepository } from 'test/repositories/in-memory-users-course-repository.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository.ts'
import { InMemoryUserPolesRepository } from 'test/repositories/in-memory-user-poles-repository.ts'
import { makeUser } from 'test/factories/make-user.ts'
import { OnAssessmentsBatchCreated } from './on-assessments-batch-created.ts'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository.ts'
import { makeAttachment } from 'test/factories/make-attachment.ts'
import { InMemoryAssessmentsBatchRepository } from 'test/repositories/in-memory-assessments-batch-repository.ts'
import { makeAssessmentBatch } from 'test/factories/make-assessments-batch.ts'

let usersCoursesRepository: InMemoryUsersCourseRepository
let usersPolesRepository: InMemoryUserPolesRepository
let polesRepository: InMemoryPolesRepository
let usersRepository: InMemoryUsersRepository
let attachmentsRepository: InMemoryAttachmentsRepository
let reportsRepository: InMemoryReportsRepository
let assessmentsBatchRepository: InMemoryAssessmentsBatchRepository
let sendReportUseCase: SendReportUseCase

let sendReportExecuteSpy: MockInstance<
  [SendReportUseCaseRequest],
  Promise<SendReportUseCaseResponse>
>

describe('On Assessment Created', () => {
  beforeEach(() => {
    usersCoursesRepository = new InMemoryUsersCourseRepository()
    usersPolesRepository = new InMemoryUserPolesRepository()
    polesRepository = new InMemoryPolesRepository()
    usersRepository = new InMemoryUsersRepository(
      usersCoursesRepository,
      usersPolesRepository,
      polesRepository
    )
    attachmentsRepository = new InMemoryAttachmentsRepository()
    reportsRepository = new InMemoryReportsRepository()
    assessmentsBatchRepository = new InMemoryAssessmentsBatchRepository()

    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnAssessmentsBatchCreated (
      usersRepository,
      attachmentsRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an assessment batch is created', async () => {
    const user = makeUser()
    const course = makeCourse()
    const attachment = makeAttachment({ courseId: course.id })
    
    usersRepository.create(user)
    attachmentsRepository.items.push(attachment)

    const assessmentBatch = makeAssessmentBatch({ courseId: course.id, userId: user.id, assessments: [] })
    assessmentsBatchRepository.create(assessmentBatch)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  