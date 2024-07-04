import { DomainEvents } from "@/core/events/domain-events.ts";
import { AssessmentsRepository, StudentAssessmentsByCourse, StudentAssessmentsByCourseAndPole } from "@/domain/boletim/app/repositories/assessments-repository.ts";
import { Assessment } from "@/domain/boletim/enterprise/entities/assessment.ts";

export class InMemoryAssessmentsRepository implements AssessmentsRepository {
  public items: Assessment[] = []

  async findByStudentIdAndCourseId({ studentId, studentCourseId }: StudentAssessmentsByCourse): Promise<Assessment | null> {
    const assessment = this.items.find(item => item.studentId.toValue() === studentId && item.courseId.toValue() === studentCourseId)
    return assessment ?? null
  }

  async findById({ id }: { id: string; }): Promise<Assessment | null> {
    const assessment = this.items.find(item => item.id.toValue() === id)
    return assessment ?? null
  }

  async findManyByStudentIdAndCourseId({ studentId, studentCourseId }: StudentAssessmentsByCourse): Promise<Assessment[]> {
    const assessments = this.items.filter(item => item.studentId.toValue() === studentId && item.courseId.toValue() === studentCourseId)
    return assessments
  }

  async findManyByStudentIdAndCourseIdAndPoleId({ studentId, courseId, poleId }: StudentAssessmentsByCourseAndPole): Promise<Assessment[]> {
    const assessments = this.items.filter(item => {
      return item.studentId.toValue() === studentId &&
      item.courseId.toValue() === courseId &&
      item.poleId.toValue() === poleId
    })
    return assessments
  }

  async countByUserIdAndCourseId({ userId, courseId }: { userId: string; courseId: string; }): Promise<number> {
    return 0
  }

  async create(assessment: Assessment): Promise<void> {
    this.items.push(assessment)

    DomainEvents.dispatchEventsForAggregate(assessment.id)
  }
  
  async createMany(assessments: Assessment[]): Promise<void> {
    assessments.forEach(assesment => {
      this.items.push(assesment)
    })
  }

  async update(assesment: Assessment): Promise<void> {
    const assesmentIndex = this.items.findIndex(item => item.id === assesment.id)
    this.items[assesmentIndex] = assesment

    DomainEvents.dispatchEventsForAggregate(assesment.id)
  }

  async delete(assesment: Assessment): Promise<void> {
    const assesmentIndex = this.items.findIndex(item => item.id === assesment.id)
    this.items.splice(assesmentIndex, 1)

    DomainEvents.dispatchEventsForAggregate(assesment.id)
  }
}