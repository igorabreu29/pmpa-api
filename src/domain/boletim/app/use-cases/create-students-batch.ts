import { Either, left, right } from "@/core/either.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { StudentBatch } from "../../enterprise/entities/student-batch.ts"
import { StudentCourse } from "../../enterprise/entities/student-course.ts"
import { StudentPole } from "../../enterprise/entities/student-pole.ts"
import { Student } from "../../enterprise/entities/student.ts"
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts"
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts"
import { Email } from "../../enterprise/entities/value-objects/email.ts"
import { Name } from "../../enterprise/entities/value-objects/name.ts"
import { Password } from "../../enterprise/entities/value-objects/password.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { PolesRepository } from "../repositories/poles-repository.ts"
import { StudentsBatchRepository } from "../repositories/students-batch-repository.ts"
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts"
import { StudentsPolesRepository } from "../repositories/students-poles-repository.ts"
import { StudentsRepository } from "../repositories/students-repository.ts"
import type { Role } from "../../enterprise/entities/authenticate.ts"
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts"
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts"
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts"
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts"
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts"
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts"

interface StudentCreated {
  student: Student
  studentCourse: StudentCourse
  studentPole: StudentPole
}

interface StudentType {
  username: string
  cpf: string
  email: string
  civilId?: string
  militaryId?: string
  poleName: string
  birthday: Date
}

interface CreateStudentsBatchUseCaseRequest {
  students: StudentType[],
  courseId: string
  userId: string
  userIp: string
  fileName: string
  fileLink: string

  role: Role
}

type CreateStudentsBatchUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError | ResourceAlreadyExistError, null>

export class CreateStudentsBatchUseCase {
  constructor (
    private studentsRepository: StudentsRepository,
    private coursesRepository: CoursesRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
    private polesRepository: PolesRepository,
    private studentsPolesRepository: StudentsPolesRepository,
    private studentsBatchRepository: StudentsBatchRepository,
  ) {}

  async execute({ students, courseId, userId, userIp, fileName, fileLink, role }: CreateStudentsBatchUseCaseRequest): Promise<CreateStudentsBatchUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())

    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const studentsOrError = await Promise.all(students.map(async (student) => {
      const pole = await this.polesRepository.findByName(student.poleName)
      if (!pole) return new ResourceNotFoundError('Polo não encontrado!')

      const cpfOrError = CPF.create(student.cpf)
      if (cpfOrError.isLeft()) return new InvalidCPFError((`${student.username}(${student.cpf}) - ${cpfOrError.value.message}`))
  
      const cpfTransformed = cpfOrError.value.value
      const defaultPassword = `Pmp@${cpfTransformed}`

      const nameOrError = Name.create(student.username)
      const emailOrError = Email.create(student.email)
      const passwordOrError = Password.create(defaultPassword)
      const birthdayOrError = Birthday.create(student.birthday)
  
      if (nameOrError.isLeft()) return new InvalidNameError(`${student.username}(${student.cpf}) - ${nameOrError.value.message}`)
      if (emailOrError.isLeft()) return new InvalidEmailError(`${student.username}(${student.cpf}) - ${emailOrError.value.message}`)
      if (passwordOrError.isLeft()) return new InvalidPasswordError(`${student.username}(${student.cpf}) - ${passwordOrError.value.message}`)
      if (birthdayOrError.isLeft()) return new InvalidBirthdayError(`${student.username}(${student.cpf}) - ${birthdayOrError.value.message}`)

      const studentWithCPF = await this.studentsRepository.findByCPF(cpfTransformed)
      if (studentWithCPF) {
        const studentAlreadyExistOnThisCourse = await this.studentsCoursesRepository.findByStudentIdAndCourseId({ 
          courseId: course.id.toValue(), 
          studentId: studentWithCPF.id.toValue() 
        })
        if (studentAlreadyExistOnThisCourse) return new ResourceAlreadyExistError(`${studentWithCPF.username.value}(${studentWithCPF.cpf.value}) já está presente no curso`)

        const studentCourse = StudentCourse.create({
          courseId: course.id,
          studentId: studentWithCPF.id,
        })

        const studentPole = StudentPole.create({
          poleId: pole.id,
          studentId: studentCourse.id
        })
        
        return {
          student: studentWithCPF,
          studentCourse,
          studentPole
        }
      }

      const studentWithEmail = await this.studentsRepository.findByEmail(student.email)
      if (studentWithEmail) {
        const studentAlreadyExistOnThisCourse = await this.studentsCoursesRepository.findByStudentIdAndCourseId({ courseId: course.id.toValue(), studentId: studentWithEmail.id.toValue() })
        if (studentAlreadyExistOnThisCourse) return new ResourceAlreadyExistError(`${studentWithEmail.username.value}(${studentWithEmail.cpf.value}) já está presente no curso`)

        const studentCourse = StudentCourse.create({
          courseId: course.id,
          studentId: studentWithEmail.id,
        })

        const studentPole = StudentPole.create({
          poleId: pole.id,
          studentId: studentCourse.id
        })

        return {
          student: studentWithEmail,
          studentCourse,
          studentPole
        }
      }
      
      await passwordOrError.value.hash()
      const studentOrError = Student.create({
        username: nameOrError.value, 
        cpf: cpfOrError.value,
        email: emailOrError.value,
        passwordHash: passwordOrError.value,
        civilId: student.civilId,
        militaryId: student.militaryId,
        birthday: birthdayOrError.value, 
      })
      if (studentOrError.isLeft()) return new Error(`${student.username}(${student.cpf}) - ${studentOrError.value.message}`)
      const studentCreated = studentOrError.value

      const studentCourse = StudentCourse.create({
        courseId: new UniqueEntityId(course.id.toValue()),
        studentId: studentCreated.id,
      })

      const studentPole = StudentPole.create({
        poleId: new UniqueEntityId(pole.id.toValue()),
        studentId: studentCourse.id
      })

      return {
        student: studentCreated,
        studentCourse,
        studentPole
      }
    }))

    const error = studentsOrError.find(item => item instanceof Error)
    if (error) return left(error)

    const studentsCreated = studentsOrError as StudentCreated[]
    const studentBatch = StudentBatch.create({
      courseId: course.id,
      userId: new UniqueEntityId(userId),
      userIp,
      students: studentsCreated,
      fileName,
      fileLink
    })
    await this.studentsBatchRepository.create(studentBatch)

    return right(null)
  }
}