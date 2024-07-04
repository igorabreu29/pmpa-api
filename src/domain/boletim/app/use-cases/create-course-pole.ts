import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { PolesRepository } from "../repositories/poles-repository.ts";
import { CoursesPoleRepository } from "../repositories/courses-poles-repository.ts";
import { CoursePole } from "../../enterprise/entities/course-pole.ts";

interface CreateCoursePoleRequest {
  courseId: string
  poleId: string
}

type CreateCoursePoleResponse = Either<ResourceNotFoundError | ResourceAlreadyExistError, null>

export class CreateCoursePole {
  constructor (
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private coursesPolesRepository: CoursesPoleRepository
  ) {}

  async execute({
    courseId,
    poleId
  }: CreateCoursePoleRequest): Promise<CreateCoursePoleResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const pole = await this.polesRepository.findById(poleId)
    if (!pole) return left(new ResourceNotFoundError('Pole not found.'))

    const coursePoleAlreadyExist = await this.coursesPolesRepository.findByCourseIdAndPoleId({ courseId, poleId })
    if (coursePoleAlreadyExist) return left(new ResourceAlreadyExistError())

    const coursePole = CoursePole.create({
      courseId: course.id,
      poleId: pole.id,
      managerName: null
    })
    await this.coursesPolesRepository.create(coursePole)

    return right(null)
  }
}