import { Either, left, right } from "@/core/either.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { StudentsRepository } from "../repositories/students-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts"
import { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts"
import { PDF } from "../files/pdf.ts"
import { CourseHistoricRepository } from "../repositories/course-historic-repository.ts"
import type { GetCourseClassificationUseCase } from "./get-course-classification.ts"
import type { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts"

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
    const { studentsWithAverage } = result.value

    const studentData = studentsWithAverage.find(item => item.studentName === student.username.value)
    const studentClassification = studentsWithAverage.findIndex(item => {
      return item.studentName === student.username.value
    })

    if (!studentData) return left(new ResourceNotFoundError('Estudante não encontrado.'))

    const courseWithDisciplines = await this.courseDisciplinesRepository.findManyByCourseIdWithDiscipliine({
      courseId: course.id.toValue()
    })

    const { filename } = await this.pdf.create({
      rows: {
        course,
        student,
        studentClassification: studentClassification + 1,
        grades: studentData,
        courseWithDisciplines,
        courseHistoric
      }
    })

    return right({
      filename
    })
  }
}