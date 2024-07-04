import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryDisciplinesRepository } from 'test/repositories/in-memory-disciplines-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { describe, it, expect, beforeEach, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { InMemoryUsersCourseRepository } from 'test/repositories/in-memory-users-course-repository.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeDiscipline } from 'test/factories/make-discipline.ts'
import { makeAssessment } from 'test/factories/make-assessment.ts'
import { InMemoryAssessmentsRepository } from 'test/repositories/in-memory-assessments-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository.ts'
import { InMemoryUserPolesRepository } from 'test/repositories/in-memory-user-poles-repository.ts'
import { makeUser } from 'test/factories/make-user.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { OnAssessmentDeleted } from './on-assessment-deleted.ts'

let usersCoursesRepository: InMemoryUsersCourseRepository
let usersPolesRepository: InMemoryUserPolesRepository
let usersRepository: InMemoryUsersRepository
let polesRepository: InMemoryPolesRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let reportsRepository: InMemoryReportsRepository
let assessmentsRepository: InMemoryAssessmentsRepository
let sendReportUseCase: SendReportUseCase

let sendReportExecuteSpy: MockInstance<
  [SendReportUseCaseRequest],
  Promise<SendReportUseCaseResponse>
>

describe('On Assessment Created', () => {
  beforeEach(() => {
    usersCoursesRepository = new InMemoryUsersCourseRepository()
    usersPolesRepository = new InMemoryUserPolesRepository()
    usersRepository = new InMemoryUsersRepository(
      usersCoursesRepository,
      usersPolesRepository,
      polesRepository
    )
    polesRepository = new InMemoryPolesRepository()
    disciplinesRepository = new InMemoryDisciplinesRepository()
    reportsRepository = new InMemoryReportsRepository()
    assessmentsRepository = new InMemoryAssessmentsRepository()

    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnAssessmentDeleted (
      usersRepository,
      polesRepository,
      disciplinesRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an assessment is created', async () => {
    const course = makeCourse()
    const user = makeUser()
    const pole = makePole()
    const discipline = makeDiscipline()

    usersRepository.create(user)
    polesRepository.create(pole)
    disciplinesRepository.create(discipline)

    const assessment = makeAssessment({ courseId: course.id, disciplineId: discipline.id, studentId: user.id, poleId: pole.id })
    assessmentsRepository.create(assessment)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  