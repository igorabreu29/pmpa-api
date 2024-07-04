import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Role, User } from "@/domain/boletim/enterprise/entities/user.ts";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { UsersRepository } from "../repositories/users-repository.ts";
import { classifyStudentsByModuleFormule, classifyStudentsByPeriodFormule } from "../utils/generate-students-classification.ts";
import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";
import { UserWithPole } from "@/domain/boletim/enterprise/entities/value-objects/user-with-pole.ts";

interface GetClassificationCourseUseCaseRequest {
  courseId: string
  poleId?: string
  role: Role
  page: number
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

  async execute({ courseId, poleId, role, page }: GetClassificationCourseUseCaseRequest): Promise<GetClassificationCourseUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    let students: UserWithPole[] = []

    if (role === 'manager' && poleId) {
      const { users } = await this.usersRepository.findManyByCourseIdAndPoleIdWithPole({
        courseId,
        poleId,
        page,
        perPage: 30,
        role: 'student'
      })

      students = users
    }

    const { users } = await this.usersRepository.findManyByCourseIdWithPole({ courseId, role: 'student', page, perPage: 30 })
    students = users

    const studentsWithAverage = await Promise.all(students.map(async (student) => {
      if (role === 'manager') {
        const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
          courseFormule: course.formule,
          studentId: student.userId.toValue(),
          courseId: course.id.toValue(),
        })

        if (studentAverage.isLeft()) return { message: studentAverage.value.message }

        return {
          studentAverage: studentAverage.value.grades,
          studentBirthday: student.birthday,
          studentCivilID: student.civilID,
        }
      }

      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        courseFormule: course.formule,
        studentId: student.userId.toValue(),
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