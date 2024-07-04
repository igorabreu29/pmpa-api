import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { describe, it, expect, beforeEach, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { InMemoryUsersCourseRepository } from 'test/repositories/in-memory-users-course-repository.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository.ts'
import { InMemoryUserPolesRepository } from 'test/repositories/in-memory-user-poles-repository.ts'
import { makeUser } from 'test/factories/make-user.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { OnBehaviorCreated } from './on-behavior-created.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { makeBehavior } from 'test/factories/make-behavior.ts'
import { InMemoryBehaviorsRepository } from 'test/repositories/in-memory-behaviors-repository.ts'

let usersCoursesRepository: InMemoryUsersCourseRepository
let usersPolesRepository: InMemoryUserPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let usersRepository: InMemoryUsersRepository
let behaviorsRepository: InMemoryBehaviorsRepository
let reportsRepository: InMemoryReportsRepository
let sendReportUseCase: SendReportUseCase

let sendReportExecuteSpy: MockInstance<
  [SendReportUseCaseRequest],
  Promise<SendReportUseCaseResponse>
>

describe('On Behavior Created', () => {
  beforeEach(() => {
    usersCoursesRepository = new InMemoryUsersCourseRepository()
    usersPolesRepository = new InMemoryUserPolesRepository()
    coursesRepository = new InMemoryCoursesRepository(
      usersCoursesRepository
    )
    usersRepository = new InMemoryUsersRepository(
      usersCoursesRepository,
      usersPolesRepository,
      polesRepository
    )
    polesRepository = new InMemoryPolesRepository()
    behaviorsRepository = new InMemoryBehaviorsRepository()
    reportsRepository = new InMemoryReportsRepository()

    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnBehaviorCreated (
      polesRepository,
      usersRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an behavior is created', async () => {
    const course = makeCourse()
    const user = makeUser()
    const pole = makePole()

    coursesRepository.create(course)
    polesRepository.create(pole)
    usersRepository.create(user)

    const behavior = makeBehavior({ courseId: course.id, studentId: user.id, poleId: pole.id })
    behaviorsRepository.create(behavior)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  