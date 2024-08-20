import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ValueObject } from "@/core/entities/value-object.ts";

interface StudentWithCourseProps {
  studentId: UniqueEntityId
  username: string
  email: string
  cpf: string
  assignedAt: Date

  courseId: UniqueEntityId
  course: string
  imageUrl: string
}

export class StudentWithCourse extends ValueObject<StudentWithCourseProps> {
  get studentId() {
    return this.props.studentId
  }

  get username() {
    return this.props.username
  }
  
  get email() {
    return this.props.email
  }

  get cpf() {
    return this.props.cpf
  }

  get courseId() {
    return this.props.courseId
  }

  get course() {
    return this.props.course
  }

  get imageUrl() {
    return this.props.imageUrl
  }

  get assignedAt() {
    return this.props.assignedAt
  }

  static create(props: StudentWithCourseProps) {
    return new StudentWithCourse(props)
  }
}