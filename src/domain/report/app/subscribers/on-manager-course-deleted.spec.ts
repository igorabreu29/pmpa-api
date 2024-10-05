import { makeReporter } from 'test/factories/make-reporter.ts'
import { makeManager } from 'test/factories/make-manager.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { ManagerEvent } from '@/domain/boletim/enterprise/events/manager-event.ts'
import { InMemoryManagersRepository } from 'test/repositories/in-memory-managers-repository.ts'
import { InMemoryManagersCoursesRepository } from 'test/repositories/in-memory-managers-courses-repository.ts'
import { InMemoryManagersPolesRepository } from 'test/repositories/in-memory-managers-poles-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { OnManagerDeleted } from './on-manager-deleted.ts'
import { OnManagerCourseDeleted } from './on-manager-course-deleted.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeManagerCourse } from 'test/factories/make-manager-course.ts'
import { ManagerCourseDeletedEvent } from '@/domain/boletim/enterprise/events/manager-course-deleted-event.ts'

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

describe('On Manager Course Deleted', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()

    managersPolesRepository = new InMemoryManagersPolesRepository()

    managersRepository = new InMemoryManagersRepository(
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )

    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
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

    new OnManagerCourseDeleted (
      coursesRepository,
      managersRepository,
      reportersRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an manager course is deleted', async () => {
    const reporter = makeReporter()
    reportersRepository.items.push(reporter)

    const course = makeCourse()
    coursesRepository.create(course)

    const manager = makeManager()
    managersRepository.create(manager)

    const managerCourse = makeManagerCourse({
      courseId: course.id,
      managerId: manager.id
    })
    managersCoursesRepository.create(managerCourse)

    managerCourse.addDomainManagerCourseEvent(
      new ManagerCourseDeletedEvent({
        reporterId: reporter.id.toValue(),
        reporterIp: '',
        managerCourse
      })
    )
    
    managersCoursesRepository.delete(managerCourse)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  