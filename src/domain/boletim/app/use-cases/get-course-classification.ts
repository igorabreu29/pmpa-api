import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { classifyStudentsByModuleFormule, classifyStudentsByPeriodFormule } from "../utils/generate-students-classification.ts";
import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";

interface GetCourseClassificationUseCaseRequest {
  courseId: string
  page: number
}

type GetCourseClassificationUseCaseResponse = Either<ResourceNotFoundError, {
  studentsWithAverage: StudentClassficationByPeriod[] | StudentClassficationByModule[]
}>

export class GetCourseClassificationUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
  ) {}

  async execute({ courseId, page }: GetCourseClassificationUseCaseRequest): Promise<GetCourseClassificationUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const { studentsCourse: students } = await this.studentsCoursesRepository.findManyByCourseIdWithCourseAndPole({ courseId, page, perPage: 30 })

    const studentsWithAverage = await Promise.all(students.map(async (student) => {
      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        courseFormule: course.formule,
        studentId: student.studentId.toValue(),
        courseId
      })

      if (studentAverage.isLeft()) return { message: studentAverage.value.message }
      
      return {
        studentAverage: studentAverage.value.grades,
        studentBirthday: student.birthday,
        studentCivilID: student.civilID,
      }
    }))

    if (course.formule === 'period') {
      const classifiedByPeriodCourseFormule = classifyStudentsByPeriodFormule(studentsWithAverage as StudentClassficationByPeriod[])
      return right({ studentsWithAverage: classifiedByPeriodCourseFormule })
    }

    const classifiedByModuleCourseFormule = classifyStudentsByModuleFormule(studentsWithAverage as StudentClassficationByModule[])

    return right({ studentsWithAverage: classifiedByModuleCourseFormule })
  }
}