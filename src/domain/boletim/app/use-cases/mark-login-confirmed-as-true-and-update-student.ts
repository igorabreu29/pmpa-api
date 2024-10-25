import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";

interface MarkLoginConfirmedAsTrueAndUpdateStudentRequest {
  id: string
  fatherName?: string
  motherName: string
  militaryId?: string
  state?: string
  county?: string
  studentIp: string
}

type MarkLoginConfirmedAsTrueAndUpdateStudentResponse = Either<ResourceNotFoundError, null>

export class MarkLoginConfirmedAsTrueAndUpdateStudent {
  constructor (
    private studentsRepository: StudentsRepository
  ) {}

  async execute({
    id,
    fatherName,
    motherName,
    militaryId,
    state,
    county,
    studentIp
  }: MarkLoginConfirmedAsTrueAndUpdateStudentRequest): Promise<MarkLoginConfirmedAsTrueAndUpdateStudentResponse> {
    const student = await this.studentsRepository.findById(id)
    if (!student) return left(new ResourceNotFoundError('Estudante não encontrado.'))

    student.parent = {
      fatherName: fatherName || student.parent?.fatherName,
      motherName
    }
    student.militaryId = militaryId || student.militaryId
    student.state = state ?? student.state
    student.county = county ?? student.county
    student.ip = studentIp ?? student.ip
    
    student.isLoginConfirmed = true
    await this.studentsRepository.updateLoginConfirmed(student)

    return right(null)
  }
}