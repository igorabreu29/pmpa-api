import { left, right, type Either } from "@/core/either.ts";
import type { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts";
import { generateAssessmentAverage } from "../utils/generate-assessment-average.ts";
import { Sheeter } from "../files/sheeter.ts";

interface CreateStudentsInformationSheetUseCaseRequest {
  courseId: string
}

type CreateStudentsInformationSheetUseCaseResponse = Either<ResourceNotFoundError, {
  filename: string
}>

export class CreateStudentsInformationSheetUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private studentCoursesRepository: StudentsCoursesRepository,
    private courseDisciplinesRepository: CoursesDisciplinesRepository,
    private assessmentsRepository: AssessmentsRepository,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId }: CreateStudentsInformationSheetUseCaseRequest): Promise<CreateStudentsInformationSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

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
          username: studentCourseDetails.username,
          email: studentCourseDetails.email,
          cpf: studentCourseDetails.cpf,
          birthday: studentCourseDetails.birthday,
          civilId: studentCourseDetails.civilId,
          assignedAt: studentCourseDetails.assignedAt,
          militaryId: studentCourseDetails.militaryId,
          state: studentCourseDetails.state,
          county: studentCourseDetails.county,
          fatherName: studentCourseDetails.parent?.fatherName,
          motherName: studentCourseDetails.parent?.motherName,
          course: studentCourseDetails.course,
          pole: studentCourseDetails.pole,
          courseDisciplineWithAssessment: courseDisciplineWithAssessment.map(item => Number(item?.average))[0]
      }
    }))

    const { filename } = this.sheeter.write({ rows: studentsInformation, keys: [
      'NOME COMPLETO',
      'E-MAIL',
      'CPF',
      'DATA DE NASCIMENTO',
      'RG CIVIL',
      'DATA DE ADIÇÃO',
      'RG MILITAR',
      'ESTADO',
      'MUNICÍPIO',
      'NOME DO PAI',
      'NOME DA MÃE',
      'CURSO',
      'PÓLO',
    ], sheetName: `${course.name.value} - Informações dos estudantes.xlsx` })

    return right({
      filename
    })
  }
}