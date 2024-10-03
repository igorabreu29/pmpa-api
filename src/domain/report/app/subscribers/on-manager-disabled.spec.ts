import { makeCourse } from 'test/factories/make-course.ts'
import { makeReporter } from 'test/factories/make-reporter.ts'
import { makeManager } from 'test/factories/make-manager.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { InMemoryManagersRepository } from 'test/repositories/in-memory-managers-repository.ts'
import { InMemoryManagersCoursesRepository } from 'test/repositories/in-memory-managers-courses-repository.ts'
import { InMemoryManagersPolesRepository } from 'test/repositories/in-memory-managers-poles-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { OnManagerDisabled } from './on-manager-disabled.ts'
import { ChangeManagerStatusEvent } from '@/domain/boletim/enterprise/events/change-manager-status-event.ts'
import { makeManagerCourse } from 'test/factories/make-manager-course.ts'

let managersCoursesRepository: InMemoryManagersCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let managersRepository: InMemoryManagersRepository

let reportersRepository: InMemoryReportersRepository

let reportsRepository: InMemoryReportsRepository
let sendReportUseCase: SendReportUseCase

let sendReportExecuteSpy: MockInstance<
  [SendReportUseCaseRequest],
  Promise<SendReportUseCaseResponse>
>

describe('On Manager Disabled', () => {
  beforeEach(() => {
    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    managersPolesRepository = new InMemoryManagersPolesRepository()
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()

    managersRepository = new InMemoryManagersRepository(
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )

    reportersRepository = new InMemoryReportersRepository()
    reportsRepository = new InMemoryReportsRepository(reportersRepository)
    
    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnManagerDisabled (
      reportersRepository,
      managersRepository,
      coursesRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an manager is created', async () => {
    const reporter = makeReporter()
    const manager = makeManager()
    const course = makeCourse()

    reportersRepository.items.push(reporter)
    managersRepository.create(manager)
    coursesRepository.create(course)

    const managerCourse = makeManagerCourse({ courseId: course.id, managerId: manager.id, isActive: true })
    managersCoursesRepository.create(managerCourse)

    managerCourse.addDomainManagerCourseEvent(
      new ChangeManagerStatusEvent({
        reporterId: reporter.id.toValue(),
        reporterIp: '',
        reason: 'Manager stopped going to school',
        managerCourse
      })
    )
    managerCourse.isActive = false

    managersCoursesRepository.updateStatus(managerCourse)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  