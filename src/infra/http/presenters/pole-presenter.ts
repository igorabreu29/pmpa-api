import { Pole } from "@/domain/boletim/enterprise/entities/pole.ts";
import { Pole as PrismaPole } from '@prisma/client'

export class PolePresenter {
  static toHTTP(pole: Pole): PrismaPole {
    return {
      id: pole.id.toValue(),
      name: pole.name.value
    }
  }
}