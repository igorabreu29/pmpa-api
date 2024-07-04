import { ManagersRepository } from "@/domain/boletim/app/repositories/managers-repository.ts";
import { Manager } from "@/domain/boletim/enterprise/entities/manager.ts";

export class InMemoryManagersRepository implements ManagersRepository {
  public items: Manager[] = []

  async findByCPF(cpf: string): Promise<Manager | null> {
    const manager = this.items.find(item => item.cpf === cpf)
    return manager ?? null
  }

  async findByEmail(email: string): Promise<Manager | null> {
    const manager = this.items.find(item => item.email === email)
    return manager ?? null
  }

  async create(manager: Manager): Promise<void> {
    this.items.push(manager)
  }
}