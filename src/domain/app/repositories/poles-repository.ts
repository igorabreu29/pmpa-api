import { Pole } from "@/domain/enterprise/entities/pole.ts";

export abstract class PolesRepository {
  abstract findById(id: string): Promise<Pole | null>
  abstract findByName(name: string): Promise<Pole | null>
}