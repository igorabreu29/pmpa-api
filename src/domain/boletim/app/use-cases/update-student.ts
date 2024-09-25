import { left, right, type Either } from "@/core/either.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import type { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import type { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import type { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import type { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import type { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { formatCPF } from "@/core/utils/formatCPF.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { StudentCourse } from "../../enterprise/entities/student-course.ts";
import { StudentPole } from "../../enterprise/entities/student-pole.ts";
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts";
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts";
import { Email } from "../../enterprise/entities/value-objects/email.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { Password } from "../../enterprise/entities/value-objects/password.ts";
import { StudentEvent } from "../../enterprise/events/student-event.ts";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";
import type { StudentsRepository } from "../repositories/students-repository.ts";

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
  civilId?: string
  militaryId?: string
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
    if (!student) return left(new ResourceNotFoundError('Estudante não encontrado.'))

    let studentCourse = await this.studentCoursesRepository.findByStudentIdAndCourseId({
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
        studentId: newStudentCourse.id
      })

      await Promise.all([
        this.studentCoursesRepository.delete(studentCourse),
        this.studentCoursesRepository.create(newStudentCourse),
      ])
      await this.studentPolesRepository.create(studentPole)

      studentCourse = newStudentCourse
    }

    const studentPole = await this.studentPolesRepository.findByStudentIdAndPoleId({
      poleId,
      studentId: studentCourse.id.toValue()
    })
    if (!studentPole) {
      const currentStudentPole = await this.studentPolesRepository.findByStudentId({
        studentId: studentCourse.id.toValue()
      })
      if (!currentStudentPole) return left(new ResourceNotFoundError('Student pólo não encontrado!'))

      const newStudentPole = StudentPole.create({
        poleId: new UniqueEntityId(poleId),
        studentId: studentCourse.id
      })

      await Promise.all([
        this.studentPolesRepository.delete(currentStudentPole),
        this.studentPolesRepository.create(newStudentPole)
      ])
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
      
    if (password) {
      const isEqualsPassword = await student.passwordHash.compare(password)
      if (!isEqualsPassword) await passwordOrError.value.hash()
    }
  
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

    student.addDomainStudentEvent(
      new StudentEvent({
        reporterId: userId,
        reporterIp: userIp,
        courseId: studentCourse.courseId.toValue(),
        student
      })
    )

    await this.studentsRepository.save(student)

    return right(null)
  }
}