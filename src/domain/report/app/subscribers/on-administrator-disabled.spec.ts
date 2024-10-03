import { makeReporter } from 'test/factories/make-reporter.ts'
import { makeAdministrator } from 'test/factories/make-administrator.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { InMemoryAdministratorsRepository } from 'test/repositories/in-memory-administrators-repository.ts'
import { ChangeAdministratorStatusEvent } from '@/domain/boletim/enterprise/events/change-administrator-status.ts'
import { OnAdministratorDisabled } from './on-administrator-disabled.ts'

let administratorsRepository: InMemoryAdministratorsRepository

let reportersRepository: InMemoryReportersRepository

let reportsRepository: InMemoryReportsRepository
let sendReportUseCase: SendReportUseCase

let sendReportExecuteSpy: MockInstance<
  [SendReportUseCaseRequest],
  Promise<SendReportUseCaseResponse>
>

describe('On Administrator Disabled', () => {
  beforeEach(() => {
    administratorsRepository = new InMemoryAdministratorsRepository()

    reportersRepository = new InMemoryReportersRepository()
    reportsRepository = new InMemoryReportsRepository(reportersRepository)
    
    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnAdministratorDisabled (
      reportersRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an administrator is disabled', async () => {
    const reporter = makeReporter()
    const administrator = makeAdministrator({ isActive: true })

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
    administrator.isActive = false

    administratorsRepository.save(administrator)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  