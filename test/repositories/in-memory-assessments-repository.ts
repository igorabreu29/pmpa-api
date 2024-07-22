import { DomainEvents } from "@/core/events/domain-events.ts";
import { AssessmentsRepository, StudentAssessmentsByCourse, StudentAssessmentsByCourseAndPole } from "@/domain/boletim/app/repositories/assessments-repository.ts";
import { Assessment } from "@/domain/boletim/enterprise/entities/assessment.ts";

export class InMemoryAssessmentsRepository implements AssessmentsRepository {
  public items: Assessment[] = []

  async findByStudentIdAndCourseId({ studentId, courseId }: StudentAssessmentsByCourse): Promise<Assessment | null> {
    const assessment = this.items.find(item => item.studentId.toValue() === studentId && item.courseId.toValue() === courseId)
    return assessment ?? null
  }

  async findById({ id }: { id: string; }): Promise<Assessment | null> {
    const assessment = this.items.find(item => item.id.toValue() === id)
    return assessment ?? null
  }

  async findManyByStudentIdAndCourseId({ studentId, courseId }: StudentAssessmentsByCourse): Promise<Assessment[]> {
    const assessments = this.items.filter(item => item.studentId.toValue() === studentId && item.courseId.toValue() === courseId)
    return assessments
  }

  async create(assessment: Assessment): Promise<void> {
    this.items.push(assessment)

    DomainEvents.dispatchEventsForAggregate(assessment.id)
  }
  
  async createMany(assessments: Assessment[]): Promise<void> {
    assessments.forEach(assessment => {
      this.items.push(assessment)
    })
  }

  async update(assessment: Assessment): Promise<void> {
    const assessmentIndex = this.items.findIndex(item => item.id.equals(assessment.id))
    this.items[assessmentIndex] = assessment

    DomainEvents.dispatchEventsForAggregate(assessment.id)
  }

  async delete(assessment: Assessment): Promise<void> {
    const assessmentIndex = this.items.findIndex(item => item.id === assessment.id)
    this.items.splice(assessmentIndex, 1)

    DomainEvents.dispatchEventsForAggregate(assessment.id)
  }
}