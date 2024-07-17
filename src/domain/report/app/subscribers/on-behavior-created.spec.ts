import { makeBehavior } from 'test/factories/make-behavior.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeManagerCourse } from 'test/factories/make-manager-course.ts'
import { makeManager } from 'test/factories/make-manager.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryBehaviorsRepository } from 'test/repositories/in-memory-behaviors-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryManagersCoursesRepository } from 'test/repositories/in-memory-managers-courses-repository.ts'
import { InMemoryManagersPolesRepository } from 'test/repositories/in-memory-managers-poles-repository.ts'
import { InMemoryManagersRepository } from 'test/repositories/in-memory-managers-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { OnBehaviorCreated } from './on-behavior-created.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryAssessmentsRepository } from 'test/repositories/in-memory-assessments-repository.ts'
import { makeReporter } from 'test/factories/make-reporter.ts'
import { BehaviorEvent } from '@/domain/boletim/enterprise/events/behavior-event.ts'

let studensCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let studentsRepository: InMemoryStudentsRepository
let reportersRepository: InMemoryReportersRepository
let coursesRepository: InMemoryCoursesRepository
let behaviorsRepository: InMemoryBehaviorsRepository

let reportsRepository: InMemoryReportsRepository
let sendReportUseCase: SendReportUseCase

let sendReportExecuteSpy: MockInstance<
  [SendReportUseCaseRequest],
  Promise<SendReportUseCaseResponse>
>

describe('On Behavior Created', () => {
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

    reportsRepository = new InMemoryReportsRepository()
    behaviorsRepository = new InMemoryBehaviorsRepository()

    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnBehaviorCreated (
      studentsRepository,
      reportersRepository,
      coursesRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an behavior is created', async () => {
    const course = makeCourse()
    const student = makeStudent()
    const reporter = makeReporter()

    coursesRepository.create(course)
    studentsRepository.create(student)
    reportersRepository.items.push(reporter)

    const behavior = makeBehavior({ courseId: course.id, studentId: student.id })
    behavior.addDomainBehaviorEvent(new BehaviorEvent({
      behavior,
      reporterId: reporter.id.toValue(),
      reporterIp: ''
    }))
    behaviorsRepository.create(behavior)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  