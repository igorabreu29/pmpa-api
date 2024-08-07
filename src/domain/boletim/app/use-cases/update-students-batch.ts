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

interface StudentCreated {
  student: Student
  studentCourse: StudentCourse
  studentPole: StudentPole
}

interface StudentType {
  cpf: string

  courseName: string
  poleName: string
  username?: string
  email?: string
  password?: string
  civilId?: number
  birthday?: Date
}

interface UpdateStudentsBatchUseCaseRequest {
  students: StudentType[]
  courseId: string
  userId: string
  userIp: string
  fileName: string
  fileLink: string

  role: Role
}

type UpdateStudentsBatchUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError | ResourceAlreadyExistError, null>

export class UpdateStudentsBatchUseCase {
  constructor (
    private studentsRepository: StudentsRepository,
    private coursesRepository: CoursesRepository,
    private studentCoursesRepository: StudentsCoursesRepository,
    private polesRepository: PolesRepository,
    private studentPolesRepository: StudentsPolesRepository,
    private studentsBatchRepository: StudentsBatchRepository,
  ) {}

  async execute({ students, courseId, userId, userIp, fileName, fileLink, role }: UpdateStudentsBatchUseCaseRequest): Promise<UpdateStudentsBatchUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())
    
    const currentCourse = await this.coursesRepository.findById(courseId)
    if (!currentCourse) return left(new ResourceNotFoundError('Course not found.'))

    const studentsOrError = await Promise.all(students.map(async (student) => {
      const course = await this.coursesRepository.findByName(student.courseName)
      if (!course) return left(new ResourceNotFoundError('Student not found.'))

      const pole = await this.polesRepository.findByName(student.poleName)
      if (!pole) return new ResourceNotFoundError('Pole not found.')

      const studentExist = await this.studentsRepository.findByCPF(student.cpf)
      if (!studentExist) return left(new ResourceNotFoundError('Student not found.'))

      const studentCourse = await this.studentCoursesRepository.findByStudentIdAndCourseId({
        studentId: studentExist.id.toValue(),
        courseId: currentCourse.id.toValue()
      })
      if (!studentCourse) return left(new ResourceAlreadyExistError('Student is not present on this course.'))

      if (!studentCourse.courseId.equals(course.id)) {
        const newStudentCourse = StudentCourse.create({
          courseId: course.id,
          studentId: studentExist.id,
        })
  
        const studentPole = StudentPole.create({
          poleId: pole.id,
          studentId: studentCourse.id
        })
        
        await Promise.all([
          this.studentCoursesRepository.delete(studentCourse),
          this.studentCoursesRepository.create(newStudentCourse),
          this.studentPolesRepository.create(studentPole)
        ])
      }

      const studentPole = await this.studentPolesRepository.findByStudentIdAndPoleId({
        poleId: pole.id.toValue(),
        studentId: studentCourse.id.toValue()
      })
      if (!studentPole) {
        const newStudentPole = StudentPole.create({
          poleId: pole.id,
          studentId: studentCourse.id
        })
  
        await this.studentPolesRepository.create(newStudentPole)
      }

      const nameOrError = Name.create(student.username ?? studentExist.username.value)
      const emailOrError = Email.create(student.email ?? studentExist.email.value)
      const passwordOrError = Password.create(student.password ?? studentExist.passwordHash.value)
      const birthdayOrError = Birthday.create(student.birthday ?? studentExist.birthday.value)
  
      if (nameOrError.isLeft()) return nameOrError.value
      if (emailOrError.isLeft()) return emailOrError.value
      if (passwordOrError.isLeft()) return passwordOrError.value
      if (birthdayOrError.isLeft()) return birthdayOrError.value

      await passwordOrError.value.hash()
      studentExist.username = nameOrError.value
      studentExist.email = emailOrError.value
      studentExist.passwordHash = passwordOrError.value
      studentExist.birthday = birthdayOrError.value
      
      return {
        student: studentExist,
        studentCourse,
        studentPole,
      }
    }))

    const error = studentsOrError.find(item => item instanceof Error)
    if (error) return left(error)

    const studentsCreated = studentsOrError as StudentCreated[]
    const studentBatch = StudentBatch.create({
      courseId: currentCourse.id,
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