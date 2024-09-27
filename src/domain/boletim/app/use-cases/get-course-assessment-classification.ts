import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import type { CoursesRepository } from "../repositories/courses-repository.ts"
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts"
import { left, right, type Either } from "@/core/either.ts"
import type { AssessmentsRepository } from "../repositories/assessments-repository.ts"
import { generateAssessmentAverage } from "../utils/generate-assessment-average.ts"
import type { CoursesPoleRepository } from "../repositories/courses-poles-repository.ts"
import { getGeralStudentAverageStatus } from "../utils/get-geral-student-average-status.ts"
import { ranksStudentsByAveragePole, type PoleAverageClassification, type StudentWithAssessmentAverage } from "../utils/classification/ranks-students-by-average-pole.ts"

interface GetCourseAssessmentClassificationUseCaseRequest {
  courseId: string
  page?: number
}

type GetCourseAssessmentClassificationUseCaseResponse = Either<ResourceNotFoundError, {
  assessmentAverageGroupedByPole: PoleAverageClassification[]
  pages?: number
  totalItems?: number
}>

export class GetCourseAssessmentClassificationUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private coursesPolesRepository: CoursesPoleRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
    private assessmentsRepository: AssessmentsRepository
  ) {}

  async execute({ courseId, page }: GetCourseAssessmentClassificationUseCaseRequest): Promise<GetCourseAssessmentClassificationUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const coursePoles = await this.coursesPolesRepository.findManyByCourseId({ courseId: course.id.toValue() })

    const { studentsCourse: students, pages, totalItems } = await this.studentsCoursesRepository.findManyDetailsByCourseId({ courseId, page, perPage: 30 })

    const studentsWithAssessmentAverage = await Promise.all(students.map(async student => {
      const assessments = await this.assessmentsRepository.findManyByStudentIdAndCourseId({
        courseId: course.id.toValue(),
        studentId: student.studentId.toValue()
      })

      const assessmentsAverage = assessments.map(assessment => {
        return generateAssessmentAverage({ 
          vf: !assessment.vf ? -1 : assessment.vf, 
          avi: !assessment.avi ? -1 : assessment.avi,
          avii: !assessment.avii ? -1 : assessment.avii, 
          vfe: assessment.vfe
        })
      })

      const studentAverage = assessmentsAverage.reduce((previous, assessmentAverage) => {
        return previous + assessmentAverage.average
      }, 0) / assessmentsAverage.length

      const isStudentRecovering = assessmentsAverage.some((item) => item?.isRecovering)    
      const studentAverageWithStatus = getGeralStudentAverageStatus({ average: studentAverage, isRecovering: isStudentRecovering })
      
      return {
        assessmentsAverage: {
          studentAverage,
          studentAverageWithStatus,
          isStudentRecovering
        },
        studentBirthday: student.birthday,
        studentName: student.username,
        studentId: student.civilId,
        studentPole: {
          id: student.poleId,
          name: student.pole,
        }
      }
    }))

    const assessmentAverageGroupedByPole = coursePoles.map(coursePole => {
      const studentsGroup = studentsWithAssessmentAverage.filter(item => item.studentPole.id.equals(coursePole.id)) as StudentWithAssessmentAverage[]
      const assessmentAverageByPole = studentsGroup
        .reduce((acc, item) => acc + item.assessmentsAverage.studentAverage, 0) / studentsGroup.length

      const isStudentRecovering = studentsGroup.some((item) => item?.assessmentsAverage.isStudentRecovering)    
      const studentAverageStatus = getGeralStudentAverageStatus({ average: assessmentAverageByPole, isRecovering: isStudentRecovering })

      return {
        poleAverage: {
          poleId: coursePole.id.toValue(),
          name: coursePole.name.value,
          average: Number(assessmentAverageByPole.toFixed(3)),
          studentAverageStatus
        }
      }
    })

    const assessmentsClassification = ranksStudentsByAveragePole(assessmentAverageGroupedByPole)

    return right({
      assessmentAverageGroupedByPole: assessmentsClassification,
      pages,
      totalItems
    })
  }
}