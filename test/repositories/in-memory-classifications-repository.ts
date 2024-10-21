import type { ClassificationsRepository, FindByCourseAndStudentId, FindManyByCourseAndPoleIdRequest, FindManyByCourseIdRequest, FindManyByCourseIdResponse } from "@/domain/boletim/app/repositories/classifications-repository.ts";
import type { Classification } from "@/domain/boletim/enterprise/entities/classification.ts";

export class InMemoryClassificationsRepository implements ClassificationsRepository {
  public items: Classification[] = []

  async findByCourseAndStudentId({ courseId, studentId }: FindByCourseAndStudentId): Promise<Classification | null> {
    const classification = this.items.find(item => {
      return item.courseId.toValue() === courseId && item.studentId.toValue() === studentId
    })

    return classification ?? null
  }

  async findManyByCourseAndPoleId({ courseId, poleId, page }: FindManyByCourseAndPoleIdRequest): Promise<FindManyByCourseIdResponse> {
    const PER_PAGE = 100

    if (page) {
      const classifications = this.items
        .filter(item => item.courseId.toValue() === courseId)
        .slice((page - 1) * PER_PAGE, page * PER_PAGE)
        
      const pages = Math.ceil(this.items.length / PER_PAGE)
      const totalItems = this.items.length

      return {
        classifications,
        pages,
        totalItems
      }
    }

    const classifications = this.items.filter(item => item.courseId.toValue() === courseId)
    
    return {
      classifications
    }
  }

  async findManyByCourseId({ courseId, page }: FindManyByCourseIdRequest): Promise<FindManyByCourseIdResponse> {
    const PER_PAGE = 100

    if (page) {
      const classifications = this.items
        .filter(item => item.courseId.toValue() === courseId)
        .slice((page - 1) * PER_PAGE, page * PER_PAGE)
        
      const pages = Math.ceil(this.items.length / PER_PAGE)
      const totalItems = this.items.length

      return {
        classifications,
        pages,
        totalItems
      }
    }

    const classifications = this.items.filter(item => item.courseId.toValue() === courseId)
    
    return {
      classifications
    }
  }

  async createMany(classifications: Classification[]): Promise<void> {
    classifications.forEach(classification => {
      this.items.push(classification)
    })
  }

  async save(classification: Classification): Promise<void> {
    const classificationIndex = this.items.findIndex(item => {
      return item.id.equals(classification.id)
    })

    this.items[classificationIndex] = classification
  }

  async saveMany(classifications: Classification[]): Promise<void> {
    classifications.forEach(classification => {
      const classificationIndex = this.items.findIndex(item => {
        return item.id.equals(classification.id)
      })

      this.items[classificationIndex] = classification
    })
  }
}