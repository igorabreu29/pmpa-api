import { Administrator } from "../../enterprise/entities/administrator.ts";

export interface SearchAdministratorsDetails {
  query: string
  page: number
}

export abstract class AdministratorsRepository {
  abstract findById(id: string): Promise<Administrator | null>
  abstract findByCPF(cpf: string): Promise<Administrator | null>
  abstract findByEmail(email: string): Promise<Administrator | null>
  abstract searchManyDetails({ query, page }: SearchAdministratorsDetails): Promise<Administrator[]>
  abstract create(admin: Administrator): Promise<void>
  abstract save(admin: Administrator): Promise<void>
  abstract delete(admin: Administrator): Promise<void>
}