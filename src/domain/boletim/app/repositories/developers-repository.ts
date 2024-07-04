import { Developer } from "../../enterprise/entities/developer.ts";

export abstract class DevelopersRepository {
  abstract findById(id: string): Promise<Developer | null>
  abstract findByCPF(cpf: string): Promise<Developer | null>
  abstract findByEmail(email: string): Promise<Developer | null>
  abstract create(developer: Developer): Promise<void>
}