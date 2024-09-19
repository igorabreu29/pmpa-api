import { Either, left, right } from "@/core/either.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { StudentsRepository } from "../repositories/students-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts"
import { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts"
import { PDF } from "../files/pdf.ts"
import { CourseHistoricRepository } from "../repositories/course-historic-repository.ts"

interface DownloadHistoricUseCaseRequest {
  courseId: string
  studentId: string
}

type DownloadHistoricUseCaseResponse = Either<ResourceNotFoundError, {
  filename: string
}>

export class DownloadHistoricUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private courseHistoricRepository: CourseHistoricRepository,
    private studentsRepository: StudentsRepository,
    private courseDisciplinesRepository: CoursesDisciplinesRepository,
    private getStudentAverage: GetStudentAverageInTheCourseUseCase,
    private pdf: PDF
  ) {}

  async execute({
    courseId,
    studentId
  }: DownloadHistoricUseCaseRequest): Promise<DownloadHistoricUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId) 
    if (!course) return left(new ResourceNotFoundError('Course not found.'))
    
    const student = await this.studentsRepository.findById(studentId)
    if (!student) return left(new ResourceNotFoundError('Student not found.'))

    const courseHistoric = await this.courseHistoricRepository.findByCourseId(course.id.toValue())
    if (!courseHistoric) return left(new ResourceNotFoundError('Couse historic not found.'))

    const result = await this.getStudentAverage.execute({
      courseId: course.id.toValue(),
      studentId: student.id.toValue(),
      isPeriod: course.isPeriod
    })

    if (result.isLeft()) return left(result.value)
    const { grades } = result.value

    const courseWithDisciplines = await this.courseDisciplinesRepository.findManyByCourseIdWithDiscipliine({
      courseId: course.id.toValue()
    })

    const { filename } = await this.pdf.create({
      rows: {
        course,
        student,
        grades,
        courseWithDisciplines,
        courseHistoric
      }
    })

    return right({
      filename
    })
  }
}