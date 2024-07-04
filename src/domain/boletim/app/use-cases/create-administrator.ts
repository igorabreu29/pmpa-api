import { Either, left, right } from "@/core/either.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { AdministratorsRepository } from "../repositories/administrators-repository.ts"
import { Administrator } from "../../enterprise/entities/administrator.ts"

interface CreateAdminUseCaseRequest {
  username: string
  email: string
  cpf: string
  password: string
  civilID: number
  birthday: Date
}

type CreateAdminUseCaseResponse = Either<ResourceAlreadyExistError, null>

export class CreateAdminUseCase {
  constructor (
    private administratorsRepository: AdministratorsRepository,
    private hasher: Hasher
  ) {}

  async execute({ username, email, password, cpf, birthday, civilID }: CreateAdminUseCaseRequest): Promise<CreateAdminUseCaseResponse> {
    const administratorAlreadyExistWithCPF = await this.administratorsRepository.findByCPF(cpf)
    if (administratorAlreadyExistWithCPF) return left(new ResourceAlreadyExistError('Administrator already exist.'))

    const userAlreadyExistWithEmail = await this.administratorsRepository.findByEmail(email)
    if (userAlreadyExistWithEmail) return left(new ResourceAlreadyExistError('Administrator already exist.'))

    const passwordHash = await this.hasher.hash(password)

    const administrator = Administrator.create({
      username, 
      email,
      passwordHash,
      role: 'admin',
      cpf,
      birthday,
      civilID
    })
    await this.administratorsRepository.create(administrator)

    return right(null)
  }
}