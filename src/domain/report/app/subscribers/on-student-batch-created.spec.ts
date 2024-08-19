import { makeCourse } from 'test/factories/make-course.ts'
import { makeReporter } from 'test/factories/make-reporter.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsBatchRepository } from 'test/repositories/in-memory-reports-batch-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportBatchUseCase, SendReportBatchUseCaseRequest, SendReportBatchUseCaseResponse } from '../use-cases/send-report-batch.ts'
import { InMemoryStudentsBatchRepository } from 'test/repositories/in-memory-students-batch-repository.ts'
import { makeStudentBatch } from 'test/factories/make-student-batch.ts'
import { OnStudentBatchCreated } from './on-student-batch-created.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository
let studentsRepository: InMemoryStudentsRepository

let reportersRepository: InMemoryReportersRepository
let coursesRepository: InMemoryCoursesRepository
let studentsBatchRepository: InMemoryStudentsBatchRepository

let reportsRepository: InMemoryReportsRepository
let sendReportBatchUseCase: SendReportBatchUseCase

let sendReportBatchExecuteSpy: MockInstance<
  [SendReportBatchUseCaseRequest],
  Promise<SendReportBatchUseCaseResponse>
>

describe('On Assessment Batch Created', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
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
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    reportersRepository = new InMemoryReportersRepository()

    reportsRepository = new InMemoryReportsRepository()
    studentsBatchRepository = new InMemoryStudentsBatchRepository(
      studentsRepository
    )

    sendReportBatchUseCase = new SendReportBatchUseCase(
      reportsRepository
    )
    
    sendReportBatchExecuteSpy = vi.spyOn(sendReportBatchUseCase, 'execute')

    new OnStudentBatchCreated (
      reportersRepository,
      coursesRepository,
      sendReportBatchUseCase
    )
  })

  it ('should send a report when an students are created', async () => {
    const course = makeCourse()
    const reporter = makeReporter()

    coursesRepository.create(course)
    reportersRepository.items.push(reporter)

    const studentBatch = makeStudentBatch({ courseId: course.id, userId: reporter.id })
    studentsBatchRepository.create(studentBatch)

    await waitFor(() => {
      expect(sendReportBatchExecuteSpy).toHaveBeenCalled()
    })
  })
})  