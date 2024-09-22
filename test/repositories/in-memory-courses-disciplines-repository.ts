import { CoursesDisciplinesRepository, type FindManyByCourseIdWithDiscipline } from "@/domain/boletim/app/repositories/courses-disciplines-repository.ts";
import { CourseDiscipline } from "@/domain/boletim/enterprise/entities/course-discipline.ts";
import type { InMemoryDisciplinesRepository } from "./in-memory-disciplines-repository.ts";
import { CourseWithDiscipline } from "@/domain/boletim/enterprise/entities/value-objects/course-with-discipline.ts";

export class InMemoryCoursesDisciplinesRepository implements CoursesDisciplinesRepository {
  public items: CourseDiscipline[] = []

  constructor(
    private disciplinesRepository: InMemoryDisciplinesRepository
  ) {}

  async findByCourseAndDisciplineId({ courseId, disciplineId }: { courseId: string; disciplineId: string; }): Promise<CourseDiscipline | null> {
    const courseDiscipline = this.items.find(item => {
      return item.courseId.toValue() === courseId && item.disciplineId.toValue() === disciplineId
    })

    return courseDiscipline ?? null
  }

  async findByCourseIdAndDisciplineIdWithDiscipline({ 
    courseId, 
    disciplineId 
  }: { 
    courseId: string
    disciplineId: string
  }): Promise<CourseWithDiscipline | null> {
    const courseDiscipline = this.items
      .find(item => item.courseId.toValue() === courseId && item.disciplineId.toValue() === disciplineId)
    if (!courseDiscipline) return null
    
    const discipline = this.disciplinesRepository.items.find(item => {
      return item.id.equals(courseDiscipline.disciplineId)
    })
    if (!discipline) throw new Error(`Discipline with ID ${courseDiscipline.disciplineId.toValue()} does not exist`)

    return CourseWithDiscipline.create({
      courseId: courseDiscipline.courseId,
      disciplineId: discipline.id,
      disciplineName: discipline.name.value,
      module: courseDiscipline.module,
      hours: courseDiscipline.hours,
    })
  }

  async findManyByCourseIdWithDiscipliine({ courseId, search }: FindManyByCourseIdWithDiscipline): Promise<CourseWithDiscipline[]> {
    const courseDisciplines = this.items
      .filter(item => item.courseId.toValue() === courseId)  
      .map(courseDiscipline => {
        const discipline = this.disciplinesRepository.items.find(item => item.id.equals(courseDiscipline.disciplineId))
        if (!discipline) throw new Error(`Discipline with ID ${courseDiscipline.disciplineId.toValue()} does not exist`)

        return CourseWithDiscipline.create({
          courseId: courseDiscipline.courseId,
          disciplineId: discipline.id,
          disciplineName: discipline.name.value,
          module: courseDiscipline.module,
          hours: courseDiscipline.hours
        })
      })
      .filter(courseWithDiscipline => {
        return courseWithDiscipline.disciplineName.toLowerCase().includes(search ? search.toLowerCase() : '')
      })

    return courseDisciplines
  }

  async create(courseDiscipline: CourseDiscipline): Promise<void> {
    this.items.push(courseDiscipline)
  }

  async createMany(coursesDisciplines: CourseDiscipline[]): Promise<void> {
    coursesDisciplines.forEach(courseDiscipline => {
      this.items.push(courseDiscipline)
    })
  }

  async delete(courseDiscipline: CourseDiscipline): Promise<void> {
    const courseDisciplineIndex = this.items.findIndex(item => item.equals(courseDiscipline))
  this.items.splice(courseDisciplineIndex, 1)
  }
}