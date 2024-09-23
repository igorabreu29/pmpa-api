import { makeReporter } from 'test/factories/make-reporter.ts'
import { makeAdministrator } from 'test/factories/make-administrator.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { InMemoryAdministratorsRepository } from 'test/repositories/in-memory-administrators-repository.ts'
import { OnAdministratorActivated } from './on-administrator-activated.ts'
import { ChangeAdministratorStatusEvent } from '@/domain/boletim/enterprise/events/change-administrator-status.ts'

let administratorsRepository: InMemoryAdministratorsRepository

let reportersRepository: InMemoryReportersRepository

let reportsRepository: InMemoryReportsRepository
let sendReportUseCase: SendReportUseCase

let sendReportExecuteSpy: MockInstance<
  [SendReportUseCaseRequest],
  Promise<SendReportUseCaseResponse>
>

describe('On Administrator Activated', () => {
  beforeEach(() => {
    administratorsRepository = new InMemoryAdministratorsRepository()

    reportersRepository = new InMemoryReportersRepository()
    reportsRepository = new InMemoryReportsRepository()
    
    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnAdministratorActivated (
      reportersRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an administrator is activated', async () => {
    const reporter = makeReporter()
    const administrator = makeAdministrator()

    reportersRepository.items.push(reporter)
    administratorsRepository.create(administrator)

    administrator.addDomainAdministratorEvent(
      new ChangeAdministratorStatusEvent({
        reporterId: reporter.id.toValue(),
        reporterIp: '',
        reason: '',
        administrator,
      })
    )
    administrator.isActive = true

    administratorsRepository.save(administrator)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  