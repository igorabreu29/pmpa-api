import { BehaviorEvent } from '@/domain/boletim/enterprise/events/behavior-event.ts'
import { makeBehavior } from 'test/factories/make-behavior.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeReporter } from 'test/factories/make-reporter.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryBehaviorsRepository } from 'test/repositories/in-memory-behaviors-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { OnBehaviorUpdated } from './on-behavior-updated.ts'
import { BehaviorUpdatedEvent } from '@/domain/boletim/enterprise/events/behavior-updated-event.ts'

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
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studensCoursesRepository,
      coursesRepository,
      polesRepository
    )
    polesRepository = new InMemoryPolesRepository()

    studentsRepository = new InMemoryStudentsRepository(
      studensCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    reportersRepository = new InMemoryReportersRepository()

    reportsRepository = new InMemoryReportsRepository(reportersRepository)
    behaviorsRepository = new InMemoryBehaviorsRepository()

    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnBehaviorUpdated (
      studentsRepository,
      reportersRepository,
      coursesRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an behavior is updated', async () => {
    const course = makeCourse()
    const student = makeStudent()
    const reporter = makeReporter()

    coursesRepository.create(course)
    studentsRepository.create(student)
    reportersRepository.items.push(reporter)

    const behavior = makeBehavior({ courseId: course.id, studentId: student.id, january: 10 })
    let previousBehavior = behavior

    behavior.january = 5

    behavior.addDomainBehaviorEvent(new BehaviorUpdatedEvent({
      previousBehavior,
      behavior,
      reporterId: reporter.id.toValue(),
      reporterIp: ''
    }))
    behaviorsRepository.update(behavior)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  