import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";

interface LoginConfirmationByStudentUseCaseRequest {
  studentId: string
  birthday: Date
  email: string
  fatherName?: string
  motherName?: string
  civilID: number
  militaryID: number
  state: string
  county: string
}

type LoginConfirmationByStudentUseCaseResponse = Either<ResourceNotFoundError, null>

export class LoginConfirmationByStudentUseCase {
  constructor (
    private studentsRepository: StudentsRepository
  ) {}

  async execute({
    studentId,
    birthday,
    email,
    fatherName,
    motherName,
    civilID,
    militaryID,
    state,
    county
  }: LoginConfirmationByStudentUseCaseRequest): Promise<LoginConfirmationByStudentUseCaseResponse> {
    const student = await this.studentsRepository.findById(studentId)
    if (!student) return left(new ResourceNotFoundError('Student not found.'))

      student.email = email || student.email
      student.parent = {
        fatherName: fatherName || student.parent?.fatherName,
        motherName: motherName || student.parent?.motherName
      }
      student.documents = {
        civilID: civilID || student.documents?.civilID,
        militaryID: militaryID || student.documents?.militaryID
      }
      student.birthday = birthday ? new Date(birthday) : student.birthday
      student.state = state ?? student.state
      student.county = county ?? student.county
      
      student.loginConfirmation = true
      
      await this.studentsRepository.save(student)

      return right(null)
  }
}