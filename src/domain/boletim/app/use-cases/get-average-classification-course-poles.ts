import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";
import type { CoursesPoleRepository } from "../repositories/courses-poles-repository.ts";
import { ranksStudentsByAveragePole, type PoleAverageClassification } from "../utils/classification/ranks-students-by-average-pole.ts";
import type { ClassificationsRepository } from "../repositories/classifications-repository.ts";

interface GetAverageClassificationCoursePolesUseCaseRequest {
  courseId: string
}

type GetAverageClassificationCoursePolesUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  studentsAverageGroupedByPole: PoleAverageClassification[]
}>

export class GetAverageClassificationCoursePolesUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private coursePolesRepository: CoursesPoleRepository,
    private classificationsRepository: ClassificationsRepository,
  ) {}

  async execute({ courseId }: GetAverageClassificationCoursePolesUseCaseRequest): Promise<GetAverageClassificationCoursePolesUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const coursePoles = await this.coursePolesRepository.findManyByCourseId({ courseId: course.id.toValue() })

    const { classifications } = await this.classificationsRepository.findManyByCourseId({ courseId: course.id.toValue() }) 

    const studentsAverageGroupedByPole = coursePoles.map(coursePole => {
      const studentsGroup = classifications.filter(item => item.poleId.equals(coursePole.id))

      const studentAverageByPole = studentsGroup
        .reduce((acc, item) => acc + Number(item.average), 0) / studentsGroup.length

      return {
        poleAverage: {
          poleId: coursePole.id.toValue(),
          name: coursePole.name.value,
          average: Number(studentAverageByPole.toFixed(3)),
        }
      }
    })

    const studentsAverageClassification = ranksStudentsByAveragePole(studentsAverageGroupedByPole)

    return right({
      studentsAverageGroupedByPole: studentsAverageClassification,
    })
  }
}