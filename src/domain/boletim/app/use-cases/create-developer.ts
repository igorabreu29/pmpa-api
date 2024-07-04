import { Either, left, right } from "@/core/either.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { DevelopersRepository } from "../repositories/developers-repository.ts"
import { Developer } from "../../enterprise/entities/developer.ts"

interface CreateDeveloperUseCaseRequest {
  username: string
  email: string
  cpf: string
  password: string
  civilID: number
  birthday: Date
}

type CreateDeveloperUseCaseResponse = Either<ResourceAlreadyExistError, null>

export class CreateDeveloperUseCase {
  constructor (
    private developersRepository: DevelopersRepository,
    private hasher: Hasher
  ) {}

  async execute({ username, email, password, cpf, birthday, civilID }: CreateDeveloperUseCaseRequest): Promise<CreateDeveloperUseCaseResponse> {
    const administratorAlreadyExistWithCPF = await this.developersRepository.findByCPF(cpf)
    if (administratorAlreadyExistWithCPF) return left(new ResourceAlreadyExistError('Administrator already exist.'))

    const userAlreadyExistWithEmail = await this.developersRepository.findByEmail(email)
    if (userAlreadyExistWithEmail) return left(new ResourceAlreadyExistError('Administrator already exist.'))

    const passwordHash = await this.hasher.hash(password)

    const developer = Developer.create({
      username, 
      email,
      passwordHash,
      cpf,
    })
    await this.developersRepository.create(developer)

    return right(null)
  }
}