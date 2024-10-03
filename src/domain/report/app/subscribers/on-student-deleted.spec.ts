import { makeReporter } from 'test/factories/make-reporter.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { StudentEvent } from '@/domain/boletim/enterprise/events/student-event.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { OnStudentDeleted } from './on-student-deleted.ts'

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let studentsRepository: InMemoryStudentsRepository

let reportersRepository: InMemoryReportersRepository

let reportsRepository: InMemoryReportsRepository
let sendReportUseCase: SendReportUseCase

let sendReportExecuteSpy: MockInstance<
  [SendReportUseCaseRequest],
  Promise<SendReportUseCaseResponse>
>

describe('On Student Deleted', () => {
  beforeEach(() => {
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()

    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    reportersRepository = new InMemoryReportersRepository()
    reportsRepository = new InMemoryReportsRepository(
      reportersRepository
    )
    
    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnStudentDeleted (
      reportersRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an student is deleted', async () => {
    const reporter = makeReporter()
    reportersRepository.items.push(reporter)

    const student = makeStudent()
    student.addDomainStudentEvent(
      new StudentEvent({
        reporterId: reporter.id.toValue(),
        reporterIp: '',
        student
      })
    )
    studentsRepository.delete(student)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  