import { makeReporter } from 'test/factories/make-reporter.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
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
    reportsRepository = new InMemoryReportsRepository(reportersRepository)
    
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