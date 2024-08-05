import type { ManagerCourseDetails } from "@/domain/boletim/enterprise/entities/value-objects/manager-course-details.ts";
import { 
  Prisma,
  Pole as PrismaPole,
 } from "@prisma/client";

type PrismaManagersDetails = Prisma.UserUncheckedUpdateInput & {
  pole: PrismaPole
  course: Prisma.CourseUncheckedUpdateInput
}

export class ManagerCourseDetailsPresenter {
  static toHTTP(managerCourseDetails: ManagerCourseDetails): PrismaManagersDetails {
    return {
      id: managerCourseDetails.managerId.toValue(),
      cpf: managerCourseDetails.cpf,
      email: managerCourseDetails.email,
      username: managerCourseDetails.username,
      course: {
        name: managerCourseDetails.course,
        id: managerCourseDetails.courseId.toValue()
      },
      pole: {
        id: managerCourseDetails.poleId.toValue(),
        name: managerCourseDetails.pole
      }
    }
  }
}