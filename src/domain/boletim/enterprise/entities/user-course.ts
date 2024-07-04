import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

export interface UserCourseProps {
  userId: UniqueEntityId
  courseId: UniqueEntityId
}

export class UserCourse extends Entity<UserCourseProps> {
  get userId() {
    return this.props.userId
  }

  get courseId() {
    return this.props.courseId
  }

  static create(props: UserCourseProps, id?: UniqueEntityId) {
    return new UserCourse(props, id)
  }
}