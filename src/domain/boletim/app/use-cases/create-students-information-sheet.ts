import { left, right, type Either } from "@/core/either.ts";
import type { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import type { DisciplinesRepository } from "../repositories/disciplines-repository.ts";
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts";
import { generateAssessmentAverage } from "../utils/generate-assessment-average.ts";
import type { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts";
import type { Status } from "../utils/get-assessment-average-status.ts";
import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

interface CreateStudentsInformationSheetUseCaseRequest {
  courseId: string
}

type CreateStudentsInformationSheetUseCaseResponse = Either<ResourceNotFoundError, {
  studentsInformation: {
    studentCourseDetails: StudentCourseDetails
    courseDisciplineWithAssessment: ({
      vf: number;
      avi: number | null;
      avii: number | null;
      vfe: number | null;
      average: number;
      status: Status;
      isRecovering: boolean;
      disciplineId: UniqueEntityId;
      module: number;
      disciplineName: string;
    } | null)[]
  }[]
}>

export class CreateStudentsInformationSheetUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private studentCoursesRepository: StudentsCoursesRepository,
    private courseDisciplinesRepository: CoursesDisciplinesRepository,
    private assessmentsRepository: AssessmentsRepository,
  ) {}

  async execute({ courseId }: CreateStudentsInformationSheetUseCaseRequest): Promise<CreateStudentsInformationSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const { studentsCourse: studentCoursesDetails } = await this.studentCoursesRepository.findManyDetailsByCourseId({
      courseId: course.id.toValue(),
      perPage: 10
    })

    const studentsInformation = await Promise.all(studentCoursesDetails.map(async (studentCourseDetails) => {
      const courseDisciplines = await this.courseDisciplinesRepository.findManyByCourseIdWithDiscipliine({
        courseId: course.id.toValue()
      })

      const courseDisciplineWithAssessment = await Promise.all(courseDisciplines.map(async (courseDiscipline) => {
        const assessment = await this.assessmentsRepository.findByStudentAndDisciplineAndCourseId({
          courseId: course.id.toValue(),
          studentId: studentCourseDetails.studentId.toValue(),
          disciplineId: courseDiscipline.disciplineId.toValue()
        })
        if (!assessment) return null

        const studentCondition = generateAssessmentAverage({ 
          vf: !assessment.vf ? -1 : assessment.vf, 
          avi: !assessment.avi ? -1 : assessment.avi,
          avii: !assessment.avii ? -1 : assessment.avii, 
          vfe: assessment.vfe
        })
        
        return {
          disciplineId: courseDiscipline.disciplineId,
          module: courseDiscipline.module,
          disciplineName: courseDiscipline.disciplineName,
          ...studentCondition,
        }
      }))

      return {
        studentCourseDetails,
        courseDisciplineWithAssessment,
      }
    }))

    return right({
      studentsInformation
    })
  }
}