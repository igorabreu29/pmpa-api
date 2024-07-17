import { makeAssessment } from 'test/factories/make-assessment.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { InMemoryAssessmentsRepository } from 'test/repositories/in-memory-assessments-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { OnAssessmentCreated } from './on-assessment-created.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { makeReporter } from 'test/factories/make-reporter.ts'
import { AssessmentEvent } from '@/domain/boletim/enterprise/events/assessment-event.ts'
import { InMemoryDisciplinesRepository } from 'test/repositories/in-memory-disciplines-repository.ts'
import { makeDiscipline } from 'test/factories/make-discipline.ts'

let studensCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let studentsRepository: InMemoryStudentsRepository
let reportersRepository: InMemoryReportersRepository
let coursesRepository: InMemoryCoursesRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let assessmentsRepository: InMemoryAssessmentsRepository

let reportsRepository: InMemoryReportsRepository
let sendReportUseCase: SendReportUseCase

let sendReportExecuteSpy: MockInstance<
  [SendReportUseCaseRequest],
  Promise<SendReportUseCaseResponse>
>

describe('On Assessment Created', () => {
  beforeEach(() => {
    studensCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    coursesRepository = new InMemoryCoursesRepository()
    studentsPolesRepository = new InMemoryStudentsPolesRepository()
    polesRepository = new InMemoryPolesRepository()

    studentsRepository = new InMemoryStudentsRepository(
      studensCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    reportersRepository = new InMemoryReportersRepository()
    disciplinesRepository = new InMemoryDisciplinesRepository()

    reportsRepository = new InMemoryReportsRepository()
    assessmentsRepository = new InMemoryAssessmentsRepository()

    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnAssessmentCreated (
      studentsRepository,
      reportersRepository,
      coursesRepository,
      disciplinesRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an assessment is created', async () => {
    const course = makeCourse()
    const discipline = makeDiscipline()
    const student = makeStudent()
    const reporter = makeReporter()

    coursesRepository.create(course)
    disciplinesRepository.create(discipline)
    studentsRepository.create(student)
    reportersRepository.items.push(reporter)

    const assessment = makeAssessment({ courseId: course.id, studentId: student.id, disciplineId: discipline.id })
    assessment.addDomainAssessmentEvent(new AssessmentEvent({ assessment, reporterId: reporter.id.toValue(), reporterIp: '' }))
    assessmentsRepository.create(assessment)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  