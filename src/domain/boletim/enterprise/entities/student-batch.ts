import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Student } from "./student.ts";
import { Batch, BatchProps } from "./batch.ts";
import { StudentCourse } from "./student-course.ts";
import { StudentPole } from "./student-pole.ts";
import { StudentBatchEvent } from "../events/student-batch-event.ts";

interface StudentType {
  student: Student
  studentCourse: StudentCourse
  studentPole: StudentPole
}

interface StudentBatchProps extends BatchProps {
  students: StudentType[]
}

export class StudentBatch extends Batch<StudentBatchProps> {
  get students() {
    return this.props.students
  }

  static create(props: StudentBatchProps, id?: UniqueEntityId) {
    const studentBatch = new StudentBatch(props, id)

    const isNewStudentBatch = !id
    if (isNewStudentBatch) {
      studentBatch.addDomainEvent(new StudentBatchEvent({
        studentBatch,
        reporterIp: studentBatch.userIp
      }))
    }

    return studentBatch
  }
}