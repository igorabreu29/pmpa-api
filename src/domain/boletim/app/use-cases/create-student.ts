import { Either, left, right } from "@/core/either.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { PolesRepository } from "../repositories/poles-repository.ts";
import { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { StudentPole } from "../../enterprise/entities/student-pole.ts";
import { StudentCourse } from "../../enterprise/entities/student-course.ts";
import { Student } from "../../enterprise/entities/student.ts";
import { Email } from "../../enterprise/entities/value-objects/email.ts";
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts";
import { Password } from "../../enterprise/entities/value-objects/password.ts";
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";

interface CreateStudentUseCaseRequest {
  username: string
  email: string
  cpf: string
  birthday: Date
  civilID: number
  courseId: string
  poleId: string
}

type CreateStudentUseCaseResponse = Either<
    | ResourceNotFoundError 
    | ResourceAlreadyExistError
    | InvalidEmailError
    | InvalidCPFError
    | InvalidPasswordError
    | InvalidNameError
    | InvalidBirthdayError,
    null
  >

export class CreateStudentUseCase {
  constructor (
    private studentsRepository: StudentsRepository,
    private studentsCoursesRepository: StudentsCoursesRepository, 
    private studentsPolesRepository: StudentsPolesRepository,
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository
  ) {}

  async execute({
    courseId,
    poleId,
    cpf, 
    email, 
    username,
    birthday,
    civilID
  }: CreateStudentUseCaseRequest): Promise<CreateStudentUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const pole = await this.polesRepository.findById(poleId)
    if (!pole) return left(new ResourceNotFoundError('Pole not found.'))

    const defaultPassword = `Pmp@${cpf}`

    const nameOrError = Name.create(username)
    const emailOrError = Email.create(email)
    const cpfOrError = CPF.create(cpf)
    const passwordOrError = Password.create(defaultPassword)
    const birthdayOrError = Birthday.create(birthday)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (cpfOrError.isLeft()) return left(cpfOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)
    if (birthdayOrError.isLeft()) return left(birthdayOrError.value)

    await passwordOrError.value.hash()
    const studentOrError = Student.create({
      username: nameOrError.value, 
      cpf: cpfOrError.value,
      email: emailOrError.value,
      passwordHash: passwordOrError.value,
      civilId: civilID,
      birthday: birthdayOrError.value,
      role: 'student'
    })
    if (studentOrError.isLeft()) return left(studentOrError.value)

    const student = studentOrError.value

    const studentWithCPF = await this.studentsRepository.findByCPF(student.cpf.value)
    if (studentWithCPF) {
      const studentAlreadyPresentInTheCourse = await this.studentsCoursesRepository.findByStudentIdAndCourseId({ studentId: studentWithCPF.id.toValue(), courseId })
      if (studentAlreadyPresentInTheCourse) return left(new ResourceAlreadyExistError('Student already present in the course'))

      const studentCourse = StudentCourse.create({
        studentId: studentWithCPF.id,
        courseId: course.id
      })
      await this.studentsCoursesRepository.create(studentCourse)
      
      const studentAlreadyPresentAtPole = await this.studentsPolesRepository.findByStudentId({ studentId: studentCourse.id.toValue() })
      if (studentAlreadyPresentAtPole) return left(new ResourceAlreadyExistError('Student already present at a pole'))

      const studentPole = StudentPole.create({
        studentId: studentWithCPF.id,
        poleId: studentCourse.id
      })
      await this.studentsPolesRepository.create(studentPole)

      return right(null)
    }

    const studentWithEmail = await this.studentsRepository.findByEmail(student.email.value)
    if (studentWithEmail) {
      const studentAlreadyPresentInTheCourse = await this.studentsCoursesRepository.findByStudentIdAndCourseId({ studentId: studentWithEmail.id.toValue(), courseId })
      if (studentAlreadyPresentInTheCourse) return left(new ResourceAlreadyExistError('Student already present in the course'))

      const studentCourse = StudentCourse.create({
        studentId: studentWithEmail.id,
        courseId: course.id
      })
      await this.studentsCoursesRepository.create(studentCourse)
      
      const studentAlreadyPresentAtPole = await this.studentsPolesRepository.findByStudentId({ studentId: studentCourse.id.toValue() })
      if (studentAlreadyPresentAtPole) return left(new ResourceAlreadyExistError('Student already present at a pole'))
      
      const studentPole = StudentPole.create({
        studentId: studentWithEmail.id,
        poleId: pole.id
      })
      await this.studentsPolesRepository.create(studentPole)

      return right(null)
    }

    await this.studentsRepository.create(student)
    
    const studentCourse = StudentCourse.create({
      studentId: student.id,
      courseId: course.id
    })
    await this.studentsCoursesRepository.create(studentCourse)

    const studentPole = StudentPole.create({
      studentId: student.id,
      poleId: pole.id
    })
    await this.studentsPolesRepository.create(studentPole)
  
    return right(null)
  }
}