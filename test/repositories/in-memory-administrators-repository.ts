import { DomainEvents } from "@/core/events/domain-events.ts";
import { AdministratorsRepository } from "@/domain/boletim/app/repositories/administrators-repository.ts";
import { Administrator } from "@/domain/boletim/enterprise/entities/administrator.ts";

export class InMemoryAdministratorsRepository implements AdministratorsRepository {
  public items: Administrator[] = []

  async findById(id: string): Promise<Administrator | null> {
    const admin = this.items.find(item => item.id.toValue() === id)
    return admin ?? null
  }

  async findByCPF(cpf: string): Promise<Administrator | null> {
    const admin = this.items.find(item => item.cpf.value === cpf)
    return admin ?? null
  }

  async findByEmail(email: string): Promise<Administrator | null> {
    const admin = this.items.find(item => item.email.value === email)
    return admin ?? null
  }

  async create(admin: Administrator): Promise<void> {
    this.items.push(admin)

    DomainEvents.dispatchEventsForAggregate(admin.id)
  }

  async save(admin: Administrator): Promise<void> {
    const adminIndex = this.items.findIndex(item => item.equals(admin))
    this.items[adminIndex] = admin

    DomainEvents.dispatchEventsForAggregate(admin.id)
  }

  async delete(admin: Administrator): Promise<void> {
    const adminIndex = this.items.findIndex(item => item.equals(admin))
    this.items.splice(adminIndex, 1)

    DomainEvents.dispatchEventsForAggregate(admin.id)
  }
}