import { CoursesPoleRepository } from "@/domain/boletim/app/repositories/courses-poles-repository.ts";
import { CoursePole } from "@/domain/boletim/enterprise/entities/course-pole.ts";
import { Pole } from "@/domain/boletim/enterprise/entities/pole.ts";
import { InMemoryPolesRepository } from "./in-memory-poles-repository.ts";

export class InMemoryCoursesPolesRepository implements CoursesPoleRepository {
  public items: CoursePole[] = []

  constructor (
    private polesRepository: InMemoryPolesRepository
  ) {}

  async findByCourseIdAndPoleId({ courseId, poleId }: { courseId: string; poleId: string; }): Promise<CoursePole | null> {
    const coursePole = this.items.find(item => item.courseId.toValue() === courseId && item.poleId.toValue() === poleId)
    return coursePole ?? null
  }

  async findManyByCourseId({ courseId }: { courseId: string; }): Promise<Pole[]> {
    const poles = this.items
      .filter(item => item.courseId.toValue() === courseId)
      .map(coursePole => {
        const pole = this.polesRepository.items.find(pole => pole.id.equals(coursePole.poleId))
        if (!pole) throw new Error(`Pole with ID: ${coursePole.poleId.toValue()} does not exist.`)

        const poleOrError = Pole.create({
          name: pole.name
        }, pole.id)

        if (poleOrError.isLeft()) throw new Error('Invalid pole')
        return poleOrError.value
      })

      return poles
  }

  async create(coursePole: CoursePole): Promise<void> {
    this.items.push(coursePole)
  }

  async createMany(coursesPoles: CoursePole[]): Promise<void> {
    coursesPoles.forEach(coursePole => {
      this.items.push(coursePole)
    })
  }

  async delete(coursePole: CoursePole): Promise<void> {
    const coursePoleIndex = this.items.findIndex(item => item.equals(coursePole))
    this.items.splice(coursePoleIndex, 1)
  }
}