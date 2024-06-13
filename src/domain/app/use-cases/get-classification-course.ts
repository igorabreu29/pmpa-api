import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Role } from "@/domain/enterprise/entities/user.ts";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { UsersRepository } from "../repositories/users-repository.ts";
import { classifyStudentsByModuleFormule, classifyStudentsByPeriodFormule } from "../utils/generate-students-classification.ts";
import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";

interface GetClassificationCourseUseCaseRequest {
  courseId: string
  role: Role
}

type GetClassificationCourseUseCaseResponse = Either<ResourceNotFoundError, {
  studentsWithAverage: StudentClassficationByPeriod[] | StudentClassficationByModule[]
}>

export class GetClassificationCourseUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private usersRepository: UsersRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
  ) {}

  async execute({ courseId, role }: GetClassificationCourseUseCaseRequest): Promise<GetClassificationCourseUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))
    
    const students = await this.usersRepository.findManyByCourseId({ courseId })

    const studentsWithAverage = await Promise.all(students.map(async (student) => {
      if (role === 'manager') {
        const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
          courseFormule: course.formule,
          studentId: student.id.toValue(),
          studentCourseId: course.id.toValue(),
          courseId: course.id.toValue(),
          userRole: role
        })

        return {
          studentAverage: studentAverage.value?.grades,
          studentBirthday: student.birthday
        }
      }

      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        courseFormule: course.formule,
        studentId: student.id.toValue(),
        studentCourseId: course.id.toValue(),
      })

      return {
        studentAverage: studentAverage.value?.grades,
        studentBirthday: student.birthday
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