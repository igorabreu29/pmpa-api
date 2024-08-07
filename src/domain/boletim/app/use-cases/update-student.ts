import { left, right, type Either } from "@/core/either.ts";
import type { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts";
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts";
import { Email } from "../../enterprise/entities/value-objects/email.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { Password } from "../../enterprise/entities/value-objects/password.ts";
import type { StudentsRepository } from "../repositories/students-repository.ts";
import type { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import type { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import type { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import type { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { formatCPF } from "@/core/utils/formatCPF.ts";
import { StudentEvent } from "../../enterprise/events/student-event.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";
import { StudentCourse } from "../../enterprise/entities/student-course.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { StudentPole } from "../../enterprise/entities/student-pole.ts";

interface UpdateStudentUseCaseRequest {
  id: string
  courseId: string
  newCourseId: string
  poleId: string

  role: Role
  username?: string
  email?: string
  cpf?: string
  password?: string
  civilId?: number
  militaryId?: number
  motherName?: string
  fatherName?: string
  birthday?: Date
  state?: string
  county?: string

  userId: string
  userIp: string
}

type UpdateStudentUseCaseResponse = Either<
  | ResourceNotFoundError
  | NotAllowedError
  | InvalidNameError
  | InvalidEmailError
  | InvalidPasswordError
  | InvalidBirthdayError
  | InvalidBirthdayError
  | InvalidCPFError, null>

export class UpdateStudentUseCase {
  constructor (
    private studentsRepository: StudentsRepository,
    private studentCoursesRepository: StudentsCoursesRepository,
    private studentPolesRepository: StudentsPolesRepository
  ) {}

  async execute({
    id,
    courseId,
    newCourseId,
    poleId,
    role,
    username,
    email,
    cpf,
    password,
    civilId,
    militaryId,
    motherName,
    fatherName,
    birthday,
    state,
    county,
    userId,
    userIp
  }: UpdateStudentUseCaseRequest): Promise<UpdateStudentUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())

    const student = await this.studentsRepository.findById(id)
    if (!student) return left(new ResourceNotFoundError('Student not found.'))

    const studentCourse = await this.studentCoursesRepository.findByStudentIdAndCourseId({
      courseId,
      studentId: student.id.toValue()
    })
    if (!studentCourse) return left(new ResourceNotFoundError('Student is not present on this course.'))

    if (studentCourse.courseId.toValue() !== newCourseId) {
      const newStudentCourse = StudentCourse.create({
        courseId: new UniqueEntityId(newCourseId),
        studentId: student.id,
      })

      const studentPole = StudentPole.create({
        poleId: new UniqueEntityId(poleId),
        studentId: studentCourse.id
      })

      await Promise.all([
        this.studentCoursesRepository.delete(studentCourse),
        this.studentCoursesRepository.create(newStudentCourse),
        this.studentPolesRepository.create(studentPole)
      ])
    }

    const studentPole = await this.studentPolesRepository.findByStudentIdAndPoleId({
      poleId,
      studentId: studentCourse.id.toValue()
    })
    if (!studentPole) {
      const newStudentPole = StudentPole.create({
        poleId: new UniqueEntityId(poleId),
        studentId: studentCourse.id
      })

      await this.studentPolesRepository.create(newStudentPole)
    }

    const cpfFormatted = formatCPF(student.cpf.value)
    
    const nameOrError = Name.create(username ?? student.username.value)
    const emailOrError = Email.create(email ?? student.email.value)
    const passwordOrError = Password.create(password ?? student.passwordHash.value)
    const birthdayOrError = Birthday.create(birthday ?? student.birthday.value)
    const cpfOrError = CPF.create(cpf ?? cpfFormatted)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)
    if (birthdayOrError.isLeft()) return left(birthdayOrError.value)
    if (cpfOrError.isLeft()) return left(cpfOrError.value)
  
    student.username = nameOrError.value
    student.email = emailOrError.value
    student.passwordHash = passwordOrError.value
    student.birthday = birthdayOrError.value
    student.cpf = cpfOrError.value
    student.civilId = civilId ?? student.civilId
    student.militaryId = militaryId ?? student.militaryId
    student.parent = {
      motherName: motherName ?? student.parent?.motherName,
      fatherName: fatherName ?? student.parent?.fatherName
    }
    student.state = state ?? student.state
    student.county = county ?? student.county

    await this.studentsRepository.save(student)

    student.addDomainStudentEvent(
      new StudentEvent({
        reporterId: userId,
        reporterIp: userIp,
        student
      })
    )

    return right(null)
  }
}