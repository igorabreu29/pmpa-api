import { Behavior } from "@/domain/boletim/enterprise/entities/behavior.ts";
import { Prisma } from '@prisma/client'

export class BehaviorPresenter {
  static toHTTP(behavior: Behavior): Prisma.BehaviorUncheckedCreateInput {
    return {
      id: behavior.id.toValue(),
      courseId: behavior.courseId.toValue(),
      studentId: behavior.studentId.toValue(),
      january: behavior.january,
      february: behavior.february,
      march: behavior.march,
      april: behavior.april,
      may: behavior.may,
      jun: behavior.jun,
      july: behavior.july,
      august: behavior.august,
      september: behavior.september,
      october: behavior.october,
      november: behavior.november,
      december: behavior.december,
      currentYear: behavior.currentYear,
    }
  }
}