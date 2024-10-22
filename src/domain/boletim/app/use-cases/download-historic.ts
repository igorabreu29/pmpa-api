import { Either, left, right } from "@/core/either.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { StudentsRepository } from "../repositories/students-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts"
import { PDF } from "../files/pdf.ts"
import { CourseHistoricRepository } from "../repositories/course-historic-repository.ts"
import type { GetCourseClassificationUseCase } from "./get-course-classification.ts"
import type { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts"
import { BehaviorsRepository } from "../repositories/behaviors-repository.ts"
import { generateBehaviorAverage } from "../utils/generate-behavior-average.ts"
import { getBehaviorAverageStatus } from "../utils/get-behavior-average-status.ts"

interface DownloadHistoricUseCaseRequest {
  courseId: string
  studentId: string
}

type DownloadHistoricUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  filename: string
}>

export class DownloadHistoricUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private courseHistoricRepository: CourseHistoricRepository,
    private studentsRepository: StudentsRepository,
    private courseDisciplinesRepository: CoursesDisciplinesRepository,
    private getCourseClassification: GetCourseClassificationUseCase,
    private behaviorsRepository: BehaviorsRepository,
    private pdf: PDF
  ) {}

  async execute({
    courseId,
    studentId
  }: DownloadHistoricUseCaseRequest): Promise<DownloadHistoricUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId) 
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))
    
    const student = await this.studentsRepository.findById(studentId)
    if (!student) return left(new ResourceNotFoundError('Estudante não encontrado.'))

    const courseHistoric = await this.courseHistoricRepository.findByCourseId(course.id.toValue())
    if (!courseHistoric) return left(new ResourceNotFoundError('Histórico não pode ser acessado! O curso ainda está em andamento.'))

    const result = await this.getCourseClassification.execute({
      courseId: course.id.toValue(),
    })

    if (result.isLeft()) return left(result.value)
    const { classifications } = result.value

    const studentClassificationPosition = classifications.findIndex(item => {
      return item.studentId.equals(student.id)
    })

    const studentClassification = classifications.find(item => {
      return item.studentId.equals(student.id)
    })

    if (!studentClassification) return left(new ResourceNotFoundError('Estudante não encontrado!'))

    const courseWithDisciplines = await this.courseDisciplinesRepository.findManyByCourseIdWithDiscipliine({
      courseId: course.id.toValue()
    })

    const behaviors = await this.behaviorsRepository.findManyByStudentIdAndCourseId({ studentId, courseId })
    const behaviorMonths = behaviors.map(({
      january,
      february,
      march,
      april,
      may,
      jun,
      july,
      august,
      september,
      october,
      november,
      december,
      module
    }) => ({
      january,
      february,
      march,
      april,
      may,
      jun,
      july,
      august,
      september,
      october,
      november,
      december,
      module
    }))

    const { behaviorAverageStatus } = generateBehaviorAverage({ behaviorMonths, isPeriod: course.isPeriod, decimalPlaces: course.decimalPlaces })
    const average = behaviorAverageStatus.reduce(
      (acc, item) => acc + item.behaviorAverage, 0
    ) / behaviorAverageStatus.length

    const { behaviorAverage, status: behaviorStatus } = getBehaviorAverageStatus(average)

    const { filename } = await this.pdf.create({
      rows: {
        course,
        student,
        studentClassification: studentClassificationPosition + 1,
        grades: studentClassification,
        courseWithDisciplines,
        courseHistoric,
        behavior: {
          average: behaviorAverage,
          status: behaviorStatus
        }
      }
    })

    return right({
      filename
    })
  }
}