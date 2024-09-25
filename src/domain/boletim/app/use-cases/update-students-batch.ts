import { Either, left, right } from "@/core/either.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import type { Role } from "../../enterprise/entities/authenticate.ts"
import { StudentBatch } from "../../enterprise/entities/student-batch.ts"
import { StudentCourse } from "../../enterprise/entities/student-course.ts"
import { StudentPole } from "../../enterprise/entities/student-pole.ts"
import { Student } from "../../enterprise/entities/student.ts"
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts"
import { Email } from "../../enterprise/entities/value-objects/email.ts"
import { Name } from "../../enterprise/entities/value-objects/name.ts"
import { Password } from "../../enterprise/entities/value-objects/password.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { PolesRepository } from "../repositories/poles-repository.ts"
import { StudentsBatchRepository } from "../repositories/students-batch-repository.ts"
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts"
import { StudentsPolesRepository } from "../repositories/students-poles-repository.ts"
import { StudentsRepository } from "../repositories/students-repository.ts"
import { formatCPF } from "@/core/utils/formatCPF.ts"
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts"

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
  civilId?: string
  militaryId?: string
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
    if (!currentCourse) return left(new ResourceNotFoundError('Curso não existente.'))

    const studentsOrError = await Promise.all(students.map(async (student) => {
      const course = await this.coursesRepository.findByName(student.courseName)
      if (!course) return new ResourceNotFoundError('Curso não existente.')

      const pole = await this.polesRepository.findByName(student.poleName)
      if (!pole) return new ResourceNotFoundError('Pólo não encontrado!')

      const formattedCPF = CPF.format(student.cpf)

      const studentExist = await this.studentsRepository.findByCPF(formattedCPF)
      if (!studentExist) return new ResourceNotFoundError('Estudante não encontrado.')

      let studentCourse = await this.studentCoursesRepository.findByStudentIdAndCourseId({
        studentId: studentExist.id.toValue(),
        courseId: currentCourse.id.toValue()
      })
      if (!studentCourse) return new ResourceAlreadyExistError('Student is not present on this course.')
        
      if (!studentCourse.courseId.equals(course.id)) {
        const newStudentCourse = StudentCourse.create({
          courseId: course.id,
          studentId: studentExist.id,
        })
  
        const studentPole = StudentPole.create({
          poleId: pole.id,
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
        poleId: pole.id.toValue(),
        studentId: studentCourse.id.toValue()
      })
      if (!studentPole) {
        const currentStudentPole = await this.studentPolesRepository.findByStudentId({
          studentId: studentCourse.id.toValue()
        })
        if (!currentStudentPole) return new ResourceNotFoundError('Student pólo não encontrado!')

        const newStudentPole = StudentPole.create({
          poleId: pole.id,
          studentId: studentCourse.id
        })
  
        await Promise.all([
          this.studentPolesRepository.delete(currentStudentPole),
          this.studentPolesRepository.create(newStudentPole)
        ])
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
      studentExist.civilId = student.civilId ?? studentExist.civilId
      studentExist.militaryId = student.militaryId ?? studentExist.militaryId
      
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
      courseId: studentsCreated[0].studentCourse.courseId,
      userId: new UniqueEntityId(userId),
      userIp,
      students: studentsCreated,
      fileName,
      fileLink
    })
    await this.studentsBatchRepository.save(studentBatch)

    return right(null)
  }
}