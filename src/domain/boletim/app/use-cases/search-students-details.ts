import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ManagerPole } from "../../enterprise/entities/manager-pole.ts";
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts";
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";
import { ManagersPolesRepository } from "../repositories/managers-poles-repository.ts";
import { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";

interface SearchStudentsDetailsUseCaseRequest {
  managerId: string
  query: string
  page: number
}

type SearchStudentsDetailsUseCaseResponse = Either<Error[], {
  students: {
    studentsByPole: StudentCourseDetails[]
  }[]
}>

export class SearchStudentsDetailsUseCase {
  constructor (
    private managersCoursesRepository: ManagersCoursesRepository,
    private managersPolesRepository: ManagersPolesRepository,
    private studentsPolesRepository: StudentsPolesRepository
  ) {}

  async execute({ managerId, query, page }: SearchStudentsDetailsUseCaseRequest): Promise<SearchStudentsDetailsUseCaseResponse> {
    const { managerCourses } = await this.managersCoursesRepository.findManyByManagerIdWithCourse({ managerId, page, perPage: 20 })
    const managerPolesOrErrors = await Promise.all(managerCourses.map(async (managerCourse) => {
      const managerPole = await this.managersPolesRepository.findByManagerId({ managerId: managerCourse.managerCourseId.toValue() })
      if (!managerPole) return new ResourceNotFoundError('Manager Pole not found.')
      
      return managerPole
    }))

    const errors = managerPolesOrErrors.filter(managerPole => managerPole instanceof Error)
    if (errors.length) return left(errors.map(error => error))
    
    const managerPoles = managerPolesOrErrors as ManagerPole[]

    const students = await Promise.all(managerPoles.map(async (managerPole) => {
      const studentsByPole = await this.studentsPolesRepository.searchManyDetailsByPoleId({ poleId: managerPole.poleId.toValue(), query, page })
      return {
        studentsByPole
      }
    }))

    return right({
      students
    })
  }
}