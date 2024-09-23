import { AssessmentEvent } from '@/domain/boletim/enterprise/events/assessment-event.ts'
import { makeAssessment } from 'test/factories/make-assessment.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeDiscipline } from 'test/factories/make-discipline.ts'
import { makeReporter } from 'test/factories/make-reporter.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { OnStudentCreated } from './on-student-created.ts'
import { StudentEvent } from '@/domain/boletim/enterprise/events/student-event.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryAdministratorsRepository } from 'test/repositories/in-memory-administrators-repository.ts'
import { OnAdministratorCreated } from './on-administrator-created.ts'
import { AdministratorEvent } from '@/domain/boletim/enterprise/events/administrator-event.ts'
import { makeAdministrator } from 'test/factories/make-administrator.ts'


let administratorsRepository: InMemoryAdministratorsRepository
let reportersRepository: InMemoryReportersRepository

let reportsRepository: InMemoryReportsRepository
let sendReportUseCase: SendReportUseCase

let sendReportExecuteSpy: MockInstance<
  [SendReportUseCaseRequest],
  Promise<SendReportUseCaseResponse>
>

describe('On Administrator Created', () => {
  beforeEach(() => {
    administratorsRepository = new InMemoryAdministratorsRepository()

    reportersRepository = new InMemoryReportersRepository()
    reportsRepository = new InMemoryReportsRepository()
    
    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnAdministratorCreated (
      reportersRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an student is created', async () => {
    const reporter = makeReporter()

    reportersRepository.items.push(reporter)

    const administrator = makeAdministrator()
    administrator.addDomainAdministratorEvent(
      new AdministratorEvent({
        reporterId: reporter.id.toValue(),
        reporterIp: '',
        administrator
      })
    )
    administratorsRepository.create(administrator)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  