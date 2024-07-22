import { Administrator } from "../../enterprise/entities/administrator.ts";

export abstract class AdministratorsRepository {
  abstract findById(id: string): Promise<Administrator | null>
  abstract findByCPF(cpf: string): Promise<Administrator | null>
  abstract findByEmail(email: string): Promise<Administrator | null>
  abstract create(admin: Administrator): Promise<void>
  abstract save(admin: Administrator): Promise<void>
  abstract delete(admin: Administrator): Promise<void>
}