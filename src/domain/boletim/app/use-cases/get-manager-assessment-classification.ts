import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import type { CoursesRepository } from "../repositories/courses-repository.ts"
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts"
import { left, right, type Either } from "@/core/either.ts"
import { Classification } from "../../enterprise/entities/classification.ts"
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts"
import { StudentClassficationByPeriod } from "../types/generate-students-classification.js"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { classificationByCourseFormula } from "../utils/generate-course-classification.ts"
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts"
import type { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts"

interface GetManagerAssessmentClassificationUseCaseRequest {
  managerId: string
  courseId: string
  page?: number
}

type GetManagerAssessmentClassificationUseCaseResponse = Either<ResourceNotFoundError, {
  classifications: Classification[]
  students: StudentCourseDetails[]
  pages?: number
  totalItems?: number
}>

export class GetManagerAssessmentClassificationUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private managerCoursesRepository: ManagersCoursesRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
  ) {}

  async execute({ courseId, managerId, page }: GetManagerAssessmentClassificationUseCaseRequest): Promise<GetManagerAssessmentClassificationUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const managerCourse = await this.managerCoursesRepository.findDetailsByManagerAndCourseId({
      courseId: course.id.toValue(),
      managerId
    })
    if (!managerCourse) return left(new ResourceNotFoundError('O gerente não está presente no curso.'))

    const { studentsCourse } = await this.studentsCoursesRepository.findManyDetailsByCourseId({ courseId, isEnabled: true })
    
    const students = studentsCourse.filter(studentCourse => {
      return studentCourse.poleId.equals(managerCourse.poleId)
    })

    const studentsWithAverageOrError = await Promise.all(students.map(async (student) => {
      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        studentId: student.studentId.toValue(),
        courseId,
        isPeriod: course.isPeriod,
        hasBehavior: false,
      })

      if (studentAverage.isLeft()) return studentAverage.value

      return {
        studentAverage: studentAverage.value.grades,
        studentBirthday: student.birthday,
        studentId: student.studentId.toValue(),
        poleId: student.poleId.toValue(),
      }
    }))

    const error = studentsWithAverageOrError.find(item => item instanceof ResourceNotFoundError)
    if (error) return left(error)

      const studentsWithAverage = studentsWithAverageOrError as StudentClassficationByPeriod[]
      const classifications = studentsWithAverage.map(item => {
        return Classification.create({
          assessments: item.studentAverage.assessments,
          assessmentsCount: item.studentAverage.assessmentsCount,
          average: Number(item.studentAverage.averageInform.geralAverage),
          behaviorsCount: item.studentAverage.averageInform.behaviorsCount,
          concept: item.studentAverage.averageInform.studentAverageStatus.concept,
          courseId: course.id,
          poleId: new UniqueEntityId(item.poleId),
          studentId: new UniqueEntityId(item.studentId),
          status: item.studentAverage.averageInform.studentAverageStatus.status,
          studentBirthday: item.studentBirthday
        })
      })

    const assessmentsClassification = classificationByCourseFormula[course.formula](classifications)

    return right({
      classifications: assessmentsClassification,
      students
    })
  }
}