import { ManagerEvent } from '@/domain/boletim/enterprise/events/manager-event.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeManager } from 'test/factories/make-manager.ts'
import { makeReporter } from 'test/factories/make-reporter.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryManagersCoursesRepository } from 'test/repositories/in-memory-managers-courses-repository.ts'
import { InMemoryManagersPolesRepository } from 'test/repositories/in-memory-managers-poles-repository.ts'
import { InMemoryManagersRepository } from 'test/repositories/in-memory-managers-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { OnManagerUpdated } from './on-manager-updated.ts'

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

describe('On Manager Updated', () => {
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
    reportsRepository = new InMemoryReportsRepository()
    
    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnManagerUpdated (
      reportersRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an manager is updated', async () => {
    const reporter = makeReporter()
    const course = makeCourse()

    reportersRepository.items.push(reporter)
    coursesRepository.create(course)

    const manager = makeManager()
    manager.addDomainManagerEvent(
      new ManagerEvent({
        reporterId: reporter.id.toValue(),
        reporterIp: '',
        courseId: course.id.toValue(),
        manager
      })
    )
    manager.county = 'random'

    managersRepository.save(manager)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  