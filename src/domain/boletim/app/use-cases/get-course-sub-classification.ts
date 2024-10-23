import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { classificationByCourseFormula } from "../utils/generate-course-classification.ts";
import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";
import { Classification } from "../../enterprise/entities/classification.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts";

interface GetCourseSubClassificationUseCaseRequest {
  courseId: string
  disciplineModule: number
  page?: number
  hasBehavior?: boolean
}

type GetCourseSubClassificationUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  classifications: Classification[]
  students: StudentCourseDetails[]
  pages?: number
  totalItems?: number
}>

export class GetCourseSubClassificationUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
  ) {}

  async execute({ courseId, disciplineModule, page, hasBehavior = true }: GetCourseSubClassificationUseCaseRequest): Promise<GetCourseSubClassificationUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const { studentsCourse: students } = await this.studentsCoursesRepository.findManyDetailsByCourseId({ courseId, isEnabled: true })

    const studentsWithAverageOrError = await Promise.all(students.map(async (student) => {
      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        studentId: student.studentId.toValue(),
        courseId,
        isPeriod: course.isPeriod,
        hasBehavior,
        disciplineModule
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

    if (disciplineModule === 3) {
      const classificationsSortedSUB = classificationByCourseFormula['SUB'](classifications)
      return right({ classifications: classificationsSortedSUB, students })
    }

    const classificationsSortedCFP = classificationByCourseFormula['CFP'](classifications)
    return right({ classifications: classificationsSortedCFP, students })
  }
}