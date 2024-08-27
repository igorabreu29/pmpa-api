import { Pole } from "@/domain/boletim/enterprise/entities/pole.ts";

export abstract class PolesRepository {
  abstract findById(id: string): Promise<Pole | null>
  abstract findByName(name: string): Promise<Pole | null>
  abstract findMany(): Promise<Pole[]>
  abstract create(pole: Pole): Promise<void>
  abstract createMany(poles: Pole[]): Promise<void>
}