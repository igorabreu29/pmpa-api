import { AssessmentsRepository, StudentAssessmentsByCourse } from "@/domain/app/repositories/assessments-repository.ts";
import { Assessment } from "@/domain/enterprise/entities/assessment.ts";

export class InMemoryAssessmentsRepository implements AssessmentsRepository {
  public items: Assessment[] = []

  async findByStudentIdAndCourseId({ courseId, studentId, studentCourseId, userRole }: StudentAssessmentsByCourse): Promise<Assessment | null> {
    if (userRole === 'manager') {
      const assessment = this.items.find(item => {
        return item.courseId.toValue() === courseId && 
        item.studentId.toValue() === studentId
      })

      return assessment ?? null
    }

    const assessment = this.items.find(item => item.studentId.toValue() === studentId && item.courseId.toValue() === studentCourseId)
    return assessment ?? null
  }

  async findById({ id }: { id: string; }): Promise<Assessment | null> {
    const assessment = this.items.find(item => item.id.toValue() === id)
    return assessment ?? null
  }

  async findManyByStudentIdAndCourseId({ studentId, courseId, userRole, studentCourseId }: StudentAssessmentsByCourse): Promise<Assessment[]> {
    if (userRole === 'manager') {
      const assessments = this.items.filter(item => {
        return item.studentId.toValue() === studentId && item.courseId.toValue() === courseId 
      })

      return assessments
    }

    const assessments = this.items.filter(item => item.studentId.toValue() === studentId && item.courseId.toValue() === studentCourseId)
    return assessments
  }

  async create(assesment: Assessment): Promise<void> {
    this.items.push(assesment)
  }
  
  async createMany(assesments: Assessment[]): Promise<void> {
    assesments.forEach(assesment => {
      this.items.push(assesment)
    })
  }

  async update(assesment: Assessment): Promise<void> {
    const assesmentIndex = this.items.findIndex(item => item.id === assesment.id)
    this.items[assesmentIndex] = assesment
  }

  async delete(assesment: Assessment): Promise<void> {
    const assesmentIndex = this.items.findIndex(item => item.id === assesment.id)
    this.items.splice(assesmentIndex, 1)
  }
}