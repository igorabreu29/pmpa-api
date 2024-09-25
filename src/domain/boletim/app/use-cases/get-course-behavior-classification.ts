import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import type { CoursesRepository } from "../repositories/courses-repository.ts"
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts"
import { left, right, type Either } from "@/core/either.ts"
import type { BehaviorsRepository } from "../repositories/behaviors-repository.ts"
import { generateBehaviorAverage } from "../utils/generate-behavior-average.ts"
import type { CoursesPoleRepository } from "../repositories/courses-poles-repository.ts"
import { ranksStudentsByAveragePole, type PoleAverageClassification, type StudentWithBehaviorAverage } from "../utils/classification/ranks-students-by-average-pole.ts"

interface GetCourseBehaviorClassificationUseCaseRequest {
  courseId: string
}

type GetCourseBehaviorClassificationUseCaseResponse = Either<ResourceNotFoundError, {
  behaviorAverageGroupedByPole: PoleAverageClassification[]
}>

export class GetCourseBehaviorClassificationUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private coursesPolesRepository: CoursesPoleRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
    private behaviorsRepository: BehaviorsRepository
  ) {}

  async execute({ courseId }: GetCourseBehaviorClassificationUseCaseRequest): Promise<GetCourseBehaviorClassificationUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const coursePoles = await this.coursesPolesRepository.findManyByCourseId({ courseId: course.id.toValue() })

    const { studentsCourse: students, pages, totalItems } = await this.studentsCoursesRepository.findManyDetailsByCourseId({ courseId })

    const studentsWithBehaviorAverage = await Promise.all(students.map(async student => {
      const behaviors = await this.behaviorsRepository.findManyByStudentIdAndCourseId({ studentId: student.studentId.toValue(), courseId })
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
      }))
      
      const behaviorAverage = generateBehaviorAverage({ behaviorMonths, isPeriod: course.isPeriod })

      return {
        behaviorAverage,
        studentBirthday: student.birthday,
        studentName: student.username,
        studentCivilID: student.civilId,
        studentPole: {
          id: student.poleId,
          name: student.pole,
        }
      }
    }))

    const behaviorAverageGroupedByPole = coursePoles.map(coursePole => {
      const studentsGroup = studentsWithBehaviorAverage.filter(item => item.studentPole.id.equals(coursePole.id))

      const averages = []
    
      for (const student of studentsGroup) {
        const average = student.behaviorAverage.behaviorAverageStatus.reduce((acc, item) => acc + item.behaviorAverage, 0)
        averages.push(average)
      }
      
      const behaviorAverageByPole = averages
        .reduce((acc, item) => acc + item, 0) / studentsGroup.length

      return {
        poleAverage: {
          poleId: coursePole.id.toValue(),
          name: coursePole.name.value,
          average: Number(behaviorAverageByPole.toFixed(3)),
        }
      }
    })

    const behaviorsClassification = ranksStudentsByAveragePole(behaviorAverageGroupedByPole)

    return right({
      behaviorAverageGroupedByPole: behaviorsClassification,
    })
  }
}