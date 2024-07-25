import { Prisma, Behavior as PrismaBehavior } from '@prisma/client'
import { Behavior } from '@/domain/boletim/enterprise/entities/behavior.ts'
import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'

export class PrismaBehaviorsMapper {
  static toDomain(behavior: PrismaBehavior): Behavior {
    return Behavior.create({
      courseId: new UniqueEntityId(behavior.id),
      studentId: new UniqueEntityId(behavior.studentId),
      january: behavior.january ? Number(behavior.january) : null,
      february: behavior.february ? Number(behavior.february) : null,
      march: behavior.march ? Number(behavior.march) : null,
      april: behavior.april ? Number(behavior.april) : null,
      may: behavior.may ? Number(behavior.may) : null,
      jun: behavior.jun ? Number(behavior.jun) : null,
      july: behavior.july ? Number(behavior.july) : null,
      august: behavior.august ? Number(behavior.august) : null,
      september: behavior.september ? Number(behavior.september) : null,
      october: behavior.october ? Number(behavior.october) : null,
      november: behavior.november ? Number(behavior.november) : null,
      december: behavior.december ? Number(behavior.december) : null,
      currentYear: behavior.currentYear ?? new Date().getFullYear()
    })
  }

  static toPrisma(behavior: Behavior): Prisma.BehaviorUncheckedCreateInput {
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
      currentYear: behavior.currentYear
    }
  }
}