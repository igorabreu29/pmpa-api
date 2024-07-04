import { Either, left, right } from "@/core/either.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";
import { Hasher } from "../cryptography/hasher.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { PolesRepository } from "../repositories/poles-repository.ts";
import { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { StudentPole } from "../../enterprise/entities/student-pole.ts";
import { StudentCourse } from "../../enterprise/entities/student-course.ts";
import { Student } from "../../enterprise/entities/student.ts";

interface CreateStudentInCourseAndPoleRequest {
  username: string
  email: string
  cpf: string
  birthday: Date
  civilID: number
  courseId: string
  poleId: string
}

type CreateStudentInCourseAndPoleResponse = Either<ResourceNotFoundError | ResourceAlreadyExistError, null>

export class CreateStudentInCourseAndPole {
  constructor (
    private studentsRepository: StudentsRepository,
    private studentsCoursesRepository: StudentsCoursesRepository, 
    private studentsPolesRepository: StudentsPolesRepository,
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private hasher: Hasher
  ) {}

  async execute({
    courseId,
    poleId,
    cpf, 
    email, 
    username,
    birthday,
    civilID
  }: CreateStudentInCourseAndPoleRequest): Promise<CreateStudentInCourseAndPoleResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const pole = await this.polesRepository.findById(poleId)
    if (!pole) return left(new ResourceNotFoundError('Pole not found.'))

    const studentWithCPF = await this.studentsRepository.findByCPF(cpf)
    if (studentWithCPF) {
      const studentAlreadyPresentInTheCourse = await this.studentsCoursesRepository.findByStudentIdAndCourseId({ studentId: studentWithCPF.id.toValue(), courseId })
      if (studentAlreadyPresentInTheCourse) return left(new ResourceAlreadyExistError('Student already present in the course'))
      
      const studentAlreadyPresentInThePole = await this.studentsPolesRepository.findByStudentIdAndPoleId({ studentId: studentWithCPF.id.toValue(), poleId })
      if (!studentAlreadyPresentInThePole) {
        const studentPole = StudentPole.create({
          studentId: studentWithCPF.id,
          poleId: pole.id
        })
        await this.studentsPolesRepository.create(studentPole)
      }

      const studentCourse = StudentCourse.create({
        studentId: studentWithCPF.id,
        courseId: course.id
      })
      await this.studentsCoursesRepository.create(studentCourse)

      return right(null)
    }

    const studentWithEmail = await this.studentsRepository.findByEmail(email)
    if (studentWithEmail) {
      const studentAlreadyPresentInTheCourse = await this.studentsCoursesRepository.findByStudentIdAndCourseId({ studentId: studentWithEmail.id.toValue(), courseId })
      if (studentAlreadyPresentInTheCourse) return left(new ResourceAlreadyExistError('Student already present in the course'))
      
      const studentAlreadyPresentInThePole = await this.studentsPolesRepository.findByStudentIdAndPoleId({ studentId: studentWithEmail.id.toValue(), poleId })
      if (!studentAlreadyPresentInThePole) {
        const studentPole = StudentPole.create({
          studentId: studentWithEmail.id,
          poleId: pole.id
        })
        await this.studentsPolesRepository.create(studentPole)
      }

      const studentCourse = StudentCourse.create({
        studentId: studentWithEmail.id,
        courseId: course.id
      })
      await this.studentsCoursesRepository.create(studentCourse)

      return right(null)
    }

    const defaultPassword = `Pmp@${cpf}`
    const passwordHash = await this.hasher.hash(defaultPassword)
    const student = Student.create({
      username, 
      cpf,
      email,
      passwordHash,
      documents: {
        civilID
      },
      birthday,
      role: 'student'
    })
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