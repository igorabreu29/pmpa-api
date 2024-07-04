import { Either, left, right } from "@/core/either.ts";
import { UsersRepository } from "../repositories/users-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

interface UpdateUserUseCaserRequest {
  id: string
  username?: string 
  password?: string
  email?: string
  motherName?: string
  fatherName?: string
  civilID?: number
  militaryID?: number
  birthday?: Date
}

type UpdateUserUseCaserResponse = Either<ResourceNotFoundError, null>

export class UpdateUserUseCase {
  constructor (
    private usersRepository: UsersRepository
  ) {}

  async execute({
    id,
    username,
    password,
    email,
    motherName,
    fatherName,
    civilID,
    militaryID,
    birthday
  }: UpdateUserUseCaserRequest): Promise<UpdateUserUseCaserResponse> {
    const user = await this.usersRepository.findById(id)
    if (!user) return left(new ResourceNotFoundError('It is not possible update a user not existing.'))
    
    user.username = username || user.username
    user.email = email || user.email
    user.parent = {
      fatherName: fatherName || user.parent?.fatherName,
      motherName: motherName || user.parent?.motherName
    },
    user.password = password ?? user.password,
    user.documents = {
      civilID: civilID ?? user.documents?.civilID,
      militaryID: militaryID ?? user.documents?.militaryID,
    }
    user.birthday = birthday ? new Date(birthday) : user.birthday

    await this.usersRepository.update(user)

    return right(null)
  }
}