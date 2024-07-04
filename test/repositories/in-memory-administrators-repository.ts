import { AdministratorsRepository } from "@/domain/boletim/app/repositories/administrators-repository.ts";
import { Administrator } from "@/domain/boletim/enterprise/entities/administrator.ts";

export class InMemoryAdministratorsRepository implements AdministratorsRepository {
  public items: Administrator[] = []

  async findByCPF(cpf: string): Promise<Administrator | null> {
    const admin = this.items.find(item => item.cpf === cpf)
    return admin ?? null
  }

  async findByEmail(email: string): Promise<Administrator | null> {
    const admin = this.items.find(item => item.email === email)
    return admin ?? null
  }

  async create(admin: Administrator): Promise<void> {
    this.items.push(admin)
  }
}