import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";
import type { PolesRepository } from "../repositories/poles-repository.ts";
import { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";
import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";
import { classificationByCourseFormula } from "../utils/generate-course-classification.ts";
import { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { Classification } from "../../enterprise/entities/classification.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts";

interface GetCourseSubClassificationByPoleUseCaseRequest {
  courseId: string
  disciplineModule: number
  page?: number
  managerId?: string
  poleId?: string
  hasBehavior?: boolean
}

type GetCourseSubClassificationByPoleUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  classifications: Classification[]
  students: StudentCourseDetails[]
  pages?: number
  totalItems?: number
}>

export class GetCourseSubClassificationByPoleUseCase {
  constructor ( 
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private managersCoursesRepository: ManagersCoursesRepository,
    private studentsPolesRepository: StudentsPolesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
  ) {}

  async execute({ disciplineModule, managerId, courseId, page, poleId, hasBehavior = true }: GetCourseSubClassificationByPoleUseCaseRequest): Promise<GetCourseSubClassificationByPoleUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    let poleIdAssigned: string = ''

    if (poleId) {
      const pole = await this.polesRepository.findById(poleId)
      if (!pole) return left(new ResourceNotFoundError('Polo não encontrado!'))

      poleIdAssigned = pole.id.toValue()
    }

    if (managerId) {
      const managerCourse = await this.managersCoursesRepository.findDetailsByManagerAndCourseId({ managerId, courseId: course.id.toValue() })
      if (!managerCourse) return left(new ResourceNotFoundError('Gerente não está presente no curso!'))

      poleIdAssigned = managerCourse.poleId.toValue()
    }

    const { studentsPole } = await this.studentsPolesRepository.findManyDetailsByPoleId({ poleId: poleIdAssigned })
    const students = studentsPole.filter(studentPole => studentPole.courseId.equals(course.id))

    const studentsWithAverageOrError = await Promise.all(students.map(async (student) => {
      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        studentId: student.studentId.toValue(),
        courseId,
        isPeriod: course.isPeriod,
        disciplineModule,
        hasBehavior
      })

      if (studentAverage.isLeft()) return studentAverage.value
      
      return {
        studentId: student.studentId.toValue(),
        studentCivilOrMilitaryId: student.militaryId ?? student.civilId,
        studentAverage: studentAverage.value.grades,
        studentBirthday: student.birthday,
        studentPole: student.pole,
        studentName: student.username
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