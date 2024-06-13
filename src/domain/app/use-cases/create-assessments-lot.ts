import { Either, left, right } from "@/core/either.ts"
import { UsersRepository } from "../repositories/users-repository.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { DisciplinesRepository } from "../repositories/disiciplines-repository.ts"
import { Assessment } from "@/domain/enterprise/entities/assessment.ts"
import { UserPolesRepository } from "../repositories/user-poles-repository.ts"
import { AssessmentsRepository } from "../repositories/assessments-repository.ts"

interface Error {
  name: string
  message: string
}

interface StudentAssessment {
  cpf: string
  disciplineName: string
  avi?: number
  avii?: number
  vf: number
  vfe?: number | null
}

interface CreateAssessmentsLotUseCaseRequest {
  studentAssessments: StudentAssessment[],
  courseName: string
}

type CreateAssessmentsLotUseCaseResponse = Either<ResourceNotFoundError | Error[], null>

export class CreateAssessmentsLotUseCase {
  constructor (
    private usersRepository: UsersRepository,
    private coursesRepository: CoursesRepository,
    private userPolesRepository: UserPolesRepository,
    private disciplinesRepository: DisciplinesRepository,
    private assessmentsRepository: AssessmentsRepository,
  ) {}

  async execute({ studentAssessments, courseName }: CreateAssessmentsLotUseCaseRequest): Promise<CreateAssessmentsLotUseCaseResponse> {
    const course = await this.coursesRepository.findByName(courseName)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const errors: Error[] = []

    await Promise.all(studentAssessments.map(async (studentAssessment) => {
      const user = await this.usersRepository.findByCPF(studentAssessment.cpf)
      if (!user) {
        const error = new ResourceNotFoundError('User not found.')
        return errors.push({ name: error.name, message: error.message })
      }

      const discipline = await this.disciplinesRepository.findByName(studentAssessment.disciplineName)
      if (!discipline) {
        const error = new ResourceNotFoundError('Discipline not found.')
        return errors.push({ name: error.name, message: error.message })
      }

      const userPole = await this.userPolesRepository.findByUserId({ userId: user.id.toValue() })
      if (!userPole) {
        const error = new ResourceNotFoundError('Pole not found.')
        return errors.push({ name: error.name, message: error.message })
      }

      const assessmentAlreadyExistToStudent = await this.assessmentsRepository.findByStudentIdAndCourseId({ studentId: user.id.toValue(), studentCourseId: course.id.toValue() })
      if (assessmentAlreadyExistToStudent) {
        const error = new ResourceAlreadyExistError('Note already released to the student')
        return errors.push({ name: error.name, message: error.message })
      }

      const assessment = Assessment.create({
        courseId: course.id,
        disciplineId: discipline.id,
        poleId: userPole.poleId,
        studentId: user.id,
        avi: studentAssessment.avi,
        avii: studentAssessment.avii,
        vf: studentAssessment.vf,
        vfe: studentAssessment.vfe
      })
      await this.assessmentsRepository.create(assessment)
    }))

    if (errors.length) return left([
      new ResourceNotFoundError('Course not found.'),
      new ResourceNotFoundError('User not found.'),
      new ResourceNotFoundError('Discipline not found.'),
      new ResourceAlreadyExistError('Note already released to the student')
    ])

    return right(null)
  }
}