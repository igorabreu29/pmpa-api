import { left, right, type Either } from "@/core/either.ts"
import type { AuthenticatesRepository } from "../repositories/authenticates-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import type { Mailer } from "../mail/mailer.ts"

interface ForgotPasswordUseCaseRequest {
  cpf: string
}

type ForgotPasswordUseCaseResponse = Either<ResourceNotFoundError, {
  message: string
}>

export class ForgotPasswordUseCase {
  constructor(
    private authenticatesRepository: AuthenticatesRepository,
    private mailer: Mailer
  ) {} 

  async execute({ cpf }: ForgotPasswordUseCaseRequest): Promise<ForgotPasswordUseCaseResponse> {
    const user = await this.authenticatesRepository.findByCPF({ cpf })
    if (!user) return left(new ResourceNotFoundError('User not found.'))

    await this.mailer.sendMail({ from: 'pmpa@dgec.com', to: user.email.value })

    return right({
      message: 'An email was sent. Verify your checkbox.'
    })
  }
}