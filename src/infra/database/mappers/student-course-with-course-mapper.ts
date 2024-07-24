import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { StudentCourse } from '@/domain/boletim/enterprise/entities/student-course.ts';
import { StudentCourseWithCourse } from '@/domain/boletim/enterprise/entities/value-objects/student-course-with-course.ts';
import { Course, UserOnCourse } from '@prisma/client'

type PrismaStudentCourseWithCourse = UserOnCourse & {
  course: Course
}

export class PrismaStudentCourseWithCourseMapper {
  static toDomain(studentCourse: PrismaStudentCourseWithCourse): StudentCourseWithCourse {
    return StudentCourseWithCourse.create({
      courseId: new UniqueEntityId(studentCourse.courseId),
      studentId: new UniqueEntityId(studentCourse.userId),
      studentCourseId: new UniqueEntityId(studentCourse.id),
      course: studentCourse.course.name,
      courseImageUrl: studentCourse.course.imageUrl,
    })
  }
}