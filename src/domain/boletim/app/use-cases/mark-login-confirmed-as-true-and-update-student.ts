import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";

interface MarkLoginConfirmedAsTrueAndUpdateStudentRequest {
  studentCPF: string
  fatherName?: string
  motherName: string
  militaryId: number
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
    studentCPF,
    fatherName,
    motherName,
    militaryId,
    state,
    county,
    studentIp
  }: MarkLoginConfirmedAsTrueAndUpdateStudentRequest): Promise<MarkLoginConfirmedAsTrueAndUpdateStudentResponse> {
    const student = await this.studentsRepository.findByCPF(studentCPF)
    if (!student) return left(new ResourceNotFoundError('Student not found.'))

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